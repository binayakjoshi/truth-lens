import base64
import io
import os
from typing import Annotated

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from dotenv import load_dotenv
from facenet_pytorch import MTCNN
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from PIL import Image
from torchvision import transforms
from truthlens.model.classifier import TruthLensClassifier
from truthlens.preprocessing.pipeline import run_pipeline

# Load variables from a local .env file (if present) into os.environ.
# In production, real env vars set by the platform/orchestrator take
# precedence — this is purely a local-dev convenience.
load_dotenv()

app = FastAPI(
    title="TruthLens ML Inference Engine",
    description="Microservice for EfficientNet-B0 classifications and Grad-CAM generation (single + bulk)",
    version="1.0.0",
)


def custom_openapi():
    """
    Patch file-upload schemas so Swagger UI shows a real file picker.
    FastAPI 0.136+ emits OpenAPI 3.1 contentMediaType, which Swagger often
    renders as a plain text field for array-of-files bodies.
    """
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    for schema in openapi_schema.get("components", {}).get("schemas", {}).values():
        for prop in schema.get("properties", {}).values():
            if prop.get("type") == "string" and prop.get("contentMediaType"):
                prop["format"] = "binary"
                prop.pop("contentMediaType", None)
            items = prop.get("items")
            if (
                isinstance(items, dict)
                and items.get("type") == "string"
                and items.get("contentMediaType")
            ):
                items["format"] = "binary"
                items.pop("contentMediaType", None)

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

# CORS origins are environment-driven so dev/staging/prod can each point at
# their own frontend without touching code. Comma-separated list, e.g.
#   BACKEND_API_URL="http://localhost:3000,https://app.truthlens.io"
# Falls back to localhost defaults if the env var isn't set, so local dev
# still works out of the box.
_default_cors_origins = "http://localhost:3000,http://127.0.0.1:3000"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("BACKEND_API_URL", _default_cors_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def block_postman(request, call_next):
    # CORS is browser-only — Postman ignores it. NestJS has no Origin header,
    # so Origin checks would also kill backend -> ML calls. Block Postman's UA instead.
    user_agent = request.headers.get("user-agent", "").lower()
    if "postman" in user_agent:
        return JSONResponse(
            status_code=403,
            content={"detail": "Access denied."},
        )
    return await call_next(request)


# 2. Device & Model Loading
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Inference device: {device}")

model = TruthLensClassifier().to(device)

try:
    weights_path = "models/truthlens_efficientnet_b0.pth"
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model.eval()
    print(f"TruthLens model weights loaded onto {device}.")
except Exception as e:
    print(
        f"Model weight file missing or incompatible: {e}. Running with uninitialized weights."
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


def make_response(success: bool, message: str, status: int, **fields):
    return JSONResponse(
        status_code=status,
        content={
            "success": success,
            "message": message,
            "status": status,
            **fields,
        },
    )


ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/jpg"}
MAX_BULK_IMAGES = 15
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB
LABELS_MAP = {0: "AI-Generated", 1: "Real"}

# If the winning class's probability is below this, the model isn't
# confident enough to commit to a verdict — report "Uncertain" instead.
# Configurable via env so it can be tuned per-deployment without a redeploy.
CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.65"))

# Host/port the service binds to. Defaults keep local dev working as before
# (127.0.0.1:8000), but production deployments (Docker, ECS, etc.) typically
# need HOST=0.0.0.0 to accept connections from outside the container, and
# PORT is often assigned dynamically by the platform.
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))


def pil_to_base64_png(pil_img: Image.Image) -> str:
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def build_heatmap_rgba(orig_shape, heatmap, bbox, alpha_scale=200):
    """
    Produce an RGBA heatmap image the same H×W as the original image.
    Transparent everywhere except inside the face bbox, where alpha is
    proportional to activation strength.
    """
    H, W = orig_shape[:2]
    x1, y1, x2, y2 = bbox
    bw, bh = x2 - x1, y2 - y1

    # Normalize heatmap to 0-255 and resize to bbox size
    hm = np.clip(heatmap, 0, 1)
    hm_resized = cv2.resize(hm, (bw, bh))
    hm_uint8 = np.uint8(255 * hm_resized)

    # Apply colormap -> BGR
    colored_bgr = cv2.applyColorMap(hm_uint8, cv2.COLORMAP_JET)
    colored_rgb = cv2.cvtColor(colored_bgr, cv2.COLOR_BGR2RGB)

    # Alpha channel scaled by activation intensity (not flat opacity)
    alpha_channel = (hm_resized * alpha_scale).astype(np.uint8)

    # Build full-canvas RGBA, transparent by default
    canvas = np.zeros((H, W, 4), dtype=np.uint8)
    canvas[y1:y2, x1:x2, 0:3] = colored_rgb
    canvas[y1:y2, x1:x2, 3] = alpha_channel

    return Image.fromarray(canvas, mode="RGBA")


def analyze_image_bytes(contents: bytes) -> dict:
    """
    Run the full face-detect → preprocess → classify → Grad-CAM pipeline
    on raw image bytes. Returns either:
      {"ok": True, "data": {...}}
      {"ok": False, "message": str, "status": int}
    """
    try:
        try:
            orig_image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            return {
                "ok": False,
                "message": "Could not read image file. The file may be corrupted or not a valid image.",
                "status": 400,
            }

        orig_bgr = cv2.cvtColor(np.array(orig_image), cv2.COLOR_RGB2BGR)

        try:
            x1, y1, x2, y2 = get_face_bbox(orig_image)
        except Exception:
            return {
                "ok": False,
                "message": "No face detected in the uploaded image.",
                "status": 422,
            }

        face = orig_image.crop((x1, y1, x2, y2))

        img_bgr = cv2.cvtColor(np.array(face), cv2.COLOR_RGB2BGR)
        enhanced = run_pipeline(img_bgr)
        enhanced_rgb = cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB)
        enhanced_pil = Image.fromarray(enhanced_rgb)

        input_tensor = preprocess(enhanced_pil).unsqueeze(0).to(device)

        predicted_class_idx, probabilities, heatmap = process_inference_with_gradcam(
            input_tensor
        )

        # Only commit to a Real / AI-Generated verdict if the model is
        # confident enough; otherwise flag it as Uncertain. Raw scores are
        # still returned either way so callers can display the exact split.
        top_confidence = float(probabilities[predicted_class_idx])
        if top_confidence < CONFIDENCE_THRESHOLD:
            prediction_label = "Uncertain"
        else:
            prediction_label = LABELS_MAP[predicted_class_idx]

        heatmap_rgba = build_heatmap_rgba(orig_bgr.shape, heatmap, (x1, y1, x2, y2))
        heatmap_b64 = pil_to_base64_png(heatmap_rgba)
        original_image_b64 = pil_to_base64_jpeg(
            orig_image
        )  # unchanged, still opaque JPEG is fine

        return {
            "ok": True,
            "data": {
                "prediction": prediction_label,
                "confidenceScores": {
                    "real": float(probabilities[1]),
                    "aiGenerated": float(probabilities[0]),
                },
                "boundingBox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                "heatmapBase64": f"data:image/png;base64,{heatmap_b64}",
                "originalImageBase64": f"data:image/jpeg;base64,{original_image_b64}",
            },
        }
    except Exception as e:
        return {
            "ok": False,
            "message": f"Inference execution engine processing fault: {str(e)}",
            "status": 500,
        }


# 5. Core Analysis Endpoint Routes
@app.post("/api/v1/predict")
async def predict_image(
    file: Annotated[UploadFile, File(description="JPEG or PNG image (max 5 MB)")],
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        return make_response(
            success=False,
            message="Invalid media asset format. Must be JPEG or PNG.",
            status=400,
        )

    contents = await file.read()
    if len(contents) > MAX_IMAGE_BYTES:
        return make_response(
            success=False,
            message="Image exceeds the 5 MB size limit.",
            status=400,
        )

    result = analyze_image_bytes(contents)
    if not result["ok"]:
        return make_response(
            success=False,
            message=result["message"],
            status=result["status"],
        )

    return make_response(
        success=True,
        message="Result returned successfully",
        status=200,
        data=result["data"],
    )


@app.post("/api/v1/bulk-upload")
async def bulk_upload(
    files: Annotated[
        list[UploadFile],
        File(
            description="Up to 15 JPEG/PNG images (max 5 MB each). Hold Ctrl to select multiple."
        ),
    ],
):
    """
    Accept multiple images (max 15, each <= 5 MB), run inference on each,
    and return an array of per-image results.
    """
    if not files:
        return make_response(
            success=False,
            message="At least one image is required.",
            status=400,
        )

    if len(files) > MAX_BULK_IMAGES:
        return make_response(
            success=False,
            message=f"Too many images. Maximum of {MAX_BULK_IMAGES} allowed per request.",
            status=400,
        )

    results = []
    succeeded = 0
    failed = 0

    for index, file in enumerate(files):
        entry: dict = {
            "index": index,
            # "filename": file.filename,
            "success": False,
            "message": None,
        }

        if file.content_type not in ALLOWED_CONTENT_TYPES:
            entry["message"] = "Invalid media asset format. Must be JPEG or PNG."
            failed += 1
            results.append(entry)
            continue

        contents = await file.read()
        if len(contents) > MAX_IMAGE_BYTES:
            entry["message"] = "Image exceeds the 5 MB size limit."
            failed += 1
            results.append(entry)
            continue

        result = analyze_image_bytes(contents)
        if not result["ok"]:
            entry["message"] = result["message"]
            failed += 1
            results.append(entry)
            continue

        entry["success"] = True
        # entry["message"] = "Result returned successfully"
        entry.update(result["data"])
        succeeded += 1
        results.append(entry)

    return make_response(
        success=True,
        message="Bulk analysis completed",
        status=200,
        total=len(results),
        succeeded=succeeded,
        failed=failed,
        results=results,
    )


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "truthlens-ml-backend"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT)
