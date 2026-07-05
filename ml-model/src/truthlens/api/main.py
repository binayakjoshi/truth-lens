import base64
import io

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms

from truthlens.model.classifier import TruthLensClassifier
from truthlens.preprocessing.pipeline import run_pipeline

# 1. Initialize FastAPI app
app = FastAPI(
    title="TruthLens ML Inference Engine",
    description="Microservice for handling EfficientNet-B0 classifications and Grad-CAM generation",
    version="1.0.0",
)

# Enable CORS for communication from the NestJS backend core service
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

# 3. Production Inference Preprocessing Transform Pipeline (224x224)
preprocess = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


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


# 5. Core Analysis Endpoint Routes
@app.post("/api/v1/predict")
async def predict_image(file: UploadFile = File(...)):
    # Validate payload file formats extension type constraints
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(
            status_code=400, detail="Invalid media asset format. Must be JPEG or PNG."
        )

    try:
        # Read incoming binary buffer payload stream
        contents = await file.read()
        orig_image = Image.open(io.BytesIO(contents)).convert("RGB")
        w, h = orig_image.size

        # Advanced preprocessing (USM → CLAHE → High-Pass)
        img_np = np.array(orig_image)
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        enhanced = run_pipeline(img_bgr)
        enhanced_rgb = cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB)
        enhanced_pil = Image.fromarray(enhanced_rgb)

        # Transform enhanced image to normalized 224x224 tensor on device
        input_tensor = preprocess(enhanced_pil).unsqueeze(0).to(device)

        # Process single-pass model execution pipeline with Grad-CAM computation
        predicted_class_idx, probabilities, heatmap = process_inference_with_gradcam(
            input_tensor
        )

        # --- Generate Raw Heatmap (no overlay — frontend blends with stored original) ---
        heatmap_resized = cv2.resize(heatmap, (w, h))
        heatmap_uint8 = np.uint8(255 * heatmap_resized)
        color_heatmap = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        color_heatmap = cv2.cvtColor(color_heatmap, cv2.COLOR_BGR2RGB)

        pil_heatmap = Image.fromarray(color_heatmap)
        buffered = io.BytesIO()
        pil_heatmap.save(buffered, format="JPEG")
        base64_heatmap_string = base64.b64encode(buffered.getvalue()).decode("utf-8")

        # Map labels based on directory classification setups (Fake=0, Real=1)
        labels_map = {0: "AI-Generated", 1: "Real"}

        return {
            "status": "success",
            "prediction": labels_map[predicted_class_idx],
            "confidence_scores": {
                "real": float(probabilities[1]),
                "ai_generated": float(probabilities[0]),
            },
            "heatmap_base64": f"data:image/jpeg;base64,{base64_heatmap_string}",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference execution engine processing fault: {str(e)}",
        )


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "truthlens-ml-backend"}
