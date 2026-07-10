import base64
import io

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from facenet_pytorch import MTCNN
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms
from fastapi.responses import JSONResponse
from truthlens.model.classifier import TruthLensClassifier
from truthlens.preprocessing.pipeline import run_pipeline

app = FastAPI(
    title="TruthLens ML Inference Engine",
    description="Microservice for handling EfficientNet-B0 classifications and Grad-CAM generation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Adjust this to your explicit NestJS service URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Device & Model Loading
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🚀 Inference device: {device}")

model = TruthLensClassifier().to(device)

try:
    weights_path = "models/truthlens_efficientnet_b0.pth"
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model.eval()
    print(f"✅ TruthLens model weights loaded onto {device}.")
except Exception as e:
    print(
        f"⚠️ Model weight file missing or incompatible: {e}. Running with uninitialized weights."
    )

# Face detector — model was trained on tightly cropped faces
mtcnn = MTCNN(keep_all=False, device=device)

# 3. Production Inference Preprocessing Transform Pipeline (224x224)
preprocess = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

# Heatmap overlay tuning: opacity at peak activation, and the activation
# floor below which a pixel is treated as ~0 (so low-relevance regions
# like hair/background aren't tinted at all)
HEATMAP_MAX_ALPHA = 0.6
HEATMAP_MIN_ACTIVATION = 0.2


# 4. Optimized Combined Inference & Grad-CAM Sub-Routine
def process_inference_with_gradcam(input_tensor):
    """
    Executes a single forward pass with gradients enabled to extract both
    the class probabilities and the Grad-CAM activation heatmaps efficiently.
    """
    model.zero_grad()

    # Enable gradients explicitly to build the computation graph for backpropagation
    with torch.set_grad_enabled(True):
        output = model(input_tensor)
        probabilities = F.softmax(output, dim=1).detach().cpu().numpy()[0]
        predicted_class_idx = int(np.argmax(probabilities))

        # Target score calculation based on highest scoring prediction (0=Fake, 1=Real)
        target_score = output[0][predicted_class_idx]
        target_score.backward()

    # Pull features and gradients from class registration hooks
    gradients = model.get_gradients()
    activations = model.get_activations()

    # Global Average Pooling over the gradient maps channel dimensions
    pooled_gradients = torch.mean(gradients, dim=[0, 2, 3])

    # Weight spatial feature activation maps by their corresponding pooled gradients channel values
    for i in range(activations.size(1)):
        activations[:, i, :, :] *= pooled_gradients[i]

    # Compute the mean channel-wise activation to generate a 2D intensity profile map
    heatmap = torch.mean(activations, dim=1).squeeze()
    heatmap = np.maximum(heatmap.detach().cpu().numpy(), 0)  # Apply ReLU equivalents

    # Normalize mapping array to 0.0 - 1.0 bounds
    if np.max(heatmap) != 0:
        heatmap /= np.max(heatmap)

    return predicted_class_idx, probabilities, heatmap


def get_face_bbox(orig_image: Image.Image) -> tuple[int, int, int, int]:
    """
    Runs MTCNN detection on the original PIL image and returns a bounding
    box (x1, y1, x2, y2) clipped to the image bounds. Raises HTTPException
    if no face is found or the resulting box is degenerate.
    """
    orig_w, orig_h = orig_image.size
    boxes, _ = mtcnn.detect(orig_image)
    if boxes is None or len(boxes) == 0:
        raise HTTPException(status_code=400, detail="No face detected in image.")

    box = boxes[0]
    # Clip to image bounds — MTCNN can return coords slightly outside the frame
    # for faces near the edge, which would break array slicing/pasting later.
    x1 = max(0, int(box[0]))
    y1 = max(0, int(box[1]))
    x2 = min(orig_w, int(box[2]))
    y2 = min(orig_h, int(box[3]))

    if x2 - x1 <= 0 or y2 - y1 <= 0:
        raise HTTPException(status_code=400, detail="Invalid face bounding box.")

    return x1, y1, x2, y2


def build_heatmap_overlay(
    orig_bgr: np.ndarray,
    heatmap: np.ndarray,
    bbox: tuple[int, int, int, int],
    max_alpha: float = HEATMAP_MAX_ALPHA,
    min_activation: float = HEATMAP_MIN_ACTIVATION,
) -> np.ndarray:
    """
    Resizes the raw Grad-CAM heatmap to the face crop's size, colorizes it,
    and blends it into a copy of the full original image using PER-PIXEL
    alpha proportional to heatmap intensity. Low-activation regions (e.g.
    hair, background caught inside the box, forehead the model ignored)
    are left close to the original image instead of being uniformly
    tinted, and the box edges fade rather than cutting off hard.

    max_alpha: opacity applied at the hottest point of the heatmap
    min_activation: heatmap values below this are treated as ~0 opacity
    """
    x1, y1, x2, y2 = bbox
    fw, fh = x2 - x1, y2 - y1

    heatmap_resized = cv2.resize(heatmap, (fw, fh), interpolation=cv2.INTER_CUBIC)

    # Soften the crop-box edges: blur the heatmap itself so the transition
    # from "hot" to "cold" near the boundary isn't a hard rectangular line
    heatmap_resized = cv2.GaussianBlur(
        heatmap_resized, (0, 0), sigmaX=max(fw, fh) * 0.01
    )

    # Suppress low-activation noise so background/skin isn't lightly tinted
    heatmap_clipped = np.clip(
        (heatmap_resized - min_activation) / (1 - min_activation), 0, 1
    )

    heatmap_uint8 = np.uint8(255 * np.clip(heatmap_resized, 0, 1))
    color_heatmap = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET).astype(
        np.float32
    )  # BGR

    # Per-pixel alpha, shaped (fh, fw, 1) so it broadcasts across BGR channels
    alpha_map = (heatmap_clipped * max_alpha)[:, :, None]

    overlay = orig_bgr.copy()
    face_region = overlay[y1:y2, x1:x2].astype(np.float32)
    blended_region = face_region * (1 - alpha_map) + color_heatmap * alpha_map
    overlay[y1:y2, x1:x2] = blended_region.astype(np.uint8)

    return overlay


def pil_to_base64_jpeg(image: Image.Image) -> str:
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


def make_response(success: bool, message: str, status: int, data=None):
    return JSONResponse(
        status_code=status,
        content={
            "success": success,
            "message": message,
            "status": status,
            "data": data,
        },
    )


# 5. Core Analysis Endpoint Routes
@app.post("/api/v1/predict")
async def predict_image(file: UploadFile = File(...)):
    # Validate payload file formats extension type constraints
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        return make_response(
            success=False,
            message="Invalid media asset format. Must be JPEG or PNG.",
            status=400,
        )

    try:
        # Read incoming binary buffer payload stream
        contents = await file.read()

        try:
            orig_image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            return make_response(
                success=False,
                message="Could not read image file. The file may be corrupted or not a valid image.",
                status=400,
            )

        orig_bgr = cv2.cvtColor(np.array(orig_image), cv2.COLOR_RGB2BGR)

        # Detect face — model was trained on tightly cropped faces
        try:
            x1, y1, x2, y2 = get_face_bbox(orig_image)
        except Exception:
            return make_response(
                success=False,
                message="No face detected in the uploaded image.",
                status=422,
            )

        face = orig_image.crop((x1, y1, x2, y2))

        # Advanced preprocessing (USM → CLAHE → High-Pass) on cropped face
        img_bgr = cv2.cvtColor(np.array(face), cv2.COLOR_RGB2BGR)
        enhanced = run_pipeline(img_bgr)
        enhanced_rgb = cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB)
        enhanced_pil = Image.fromarray(enhanced_rgb)

        # Transform enhanced image to normalized 224x224 tensor on device
        input_tensor = preprocess(enhanced_pil).unsqueeze(0).to(device)

        # Process single-pass model execution pipeline with Grad-CAM computation
        predicted_class_idx, probabilities, heatmap = process_inference_with_gradcam(
            input_tensor
        )

        # --- Build heatmap overlay positioned on the full original image ---
        overlay_bgr = build_heatmap_overlay(orig_bgr, heatmap, (x1, y1, x2, y2))
        overlay_rgb = cv2.cvtColor(overlay_bgr, cv2.COLOR_BGR2RGB)
        pil_overlay = Image.fromarray(overlay_rgb)
        heatmap_b64 = pil_to_base64_jpeg(pil_overlay)
        original_image_b64 = pil_to_base64_jpeg(orig_image)

        # Map labels based on directory classification setups (Fake=0, Real=1)
        labels_map = {0: "AI-Generated", 1: "Real"}

        return make_response(
            success=True,
            message="Result returned successfully",
            status=200,
            data={
                "prediction": labels_map[predicted_class_idx],
                "confidenceScores": {
                    "real": float(probabilities[1]),
                    "aiGenerated": float(probabilities[0]),
                },
                "boundingBox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                "heatmapBase64": f"data:image/jpeg;base64,{heatmap_b64}",
                "originalImageBase64": f"data:image/jpeg;base64,{original_image_b64}",
            },
        )

    except Exception as e:
        return make_response(
            success=False,
            message=f"Inference execution engine processing fault: {str(e)}",
            status=500,
        )


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "truthlens-ml-backend"}
