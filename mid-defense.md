
# TruthLens — Mid-Defense Report (Press Ctrl + shift + v to view in slide mode)

## ABSTRACT

TruthLens is a deepfake detection platform that combines an EfficientNet-B0 classifier with a three-stage preprocessing pipeline (unsharp masking, CLAHE equalization, and frequency-domain high-pass boosting) to identify AI-generated facial images. The system is deployed as a full-stack web application with a NestJS backend, Next.js frontend, and FastAPI-based ML inference service, all containerized under Docker Compose. The trained model achieves **82.67% accuracy** and **0.9104 ROC-AUC** on a validation set of 1,846 FaceForensics++ samples, with Grad-CAM explainability integrated into every prediction. The platform supports authenticated user history, anonymous usage limits, Google OAuth, and hot-reload development for all three services.

---

## 1. INTRODUCTION

### 1.1 Problem Statement

The proliferation of generative AI (GANs, diffusion models) has made it trivial to produce photorealistic fake facial images. Existing detection tools are either academic prototypes with no web interface, or commercial black-boxes that offer no explainability. There is a need for an open, accessible platform that not only detects deepfakes but also shows _why_ a prediction was made via visual heatmaps.

### 1.2 Objectives

- Build a deepfake classifier using transfer learning on EfficientNet-B0 (ImageNet pretrained).
- Implement a multi-stage preprocessing pipeline to amplify GAN/facial artifacts before inference.
- Integrate Grad-CAM explainability to highlight manipulated regions.
- Package everything as a containerized 4-service stack (frontend, backend, ML, database) with hot-reload development.
- Provide user accounts with analysis history, anonymous usage for walk-in users, and OAuth login.

### 1.3 Scope and Limitations

- **Scope**: Face-focused deepfake detection; single-image analysis only (no video).
- **Dataset**: Trained on FaceForensics++ (C23) — covers 6 manipulation methods (DeepFakes, Face2Face, FaceSwap, FaceShifter, FaceSwap, NeuralTextures).
- **Limitation**: Dataset skews toward GAN-based forgeries; newer diffusion-model outputs may exhibit different artifacts.
- **Limitation**: Grad-CAM resolution is tied to the final conv layer of EfficientNet-B0 (7×7 spatial map).

### 1.4 Significance of Study

TruthLens provides a **reproducible, open-source** baseline for end-to-end deepfake detection with built-in explainability. It bridges the gap between research-grade classifiers and usable web applications, and its modular architecture allows swapping in improved models or preprocessing pipelines without altering the rest of the stack.

---

## 2. LITERATURE REVIEW

_Content unchanged from proposal; section is consistent across all defense stages._ Key references cover:

- **Transfer learning** for synthetic image detection (EfficientNet, ResNet, Xception).
- **Lightweight architectures** suitable for real-time deployment.
- **Explainability** (Grad-CAM, saliency maps) integrated into forensic classifiers.
- **Cross-model generalization** and artifact pattern recognition in frequency/color domains.

---

## 3. PROPOSED METHODOLOGY

### 3.1 Agile Software Development

The project followed an iterative approach across **10 sprints** (commits on `main` and `feat/model-training`):

| Sprint | Focus | Status |
|---|---|---|
| 1–2 | Project scaffolding: NestJS + Next.js + FastAPI skeletons, Docker Compose orchestration | Done |
| 3 | ML training pipeline: dataset extraction, MTCNN face cropping, quality filtering | Done |
| 4 | Preprocessing pipeline: unsharp masking, CLAHE, frequency boosting | Done |
| 5 | Model training + evaluation: EfficientNet-B0, transfer learning, fine-tuning | Done |
| 6 | Docker optimization: multi-stage builds, Alpine images, named volumes | Done |
| 7 | Frontend: analysis upload page, result display with Grad-CAM heatmap | Done |
| 8 | Authentication: JWT, OTP verification, Google OAuth, refresh tokens | Done |
| 9 | Analysis history: per-user records, pagination, sorting | Done |
| 10 | Anonymous usage limits, visitor tracking, guard implementation | Done |
| **11** | **Model improvements (planned): expanded dataset, hyperparameter search** | **To Do** |
| **12** | **Performance testing, edge cases, production hardening** | **To Do** |

### 3.2 Software Specification

| Component | Technology | Version / Detail |
|---|---|---|
| **Frontend** | Next.js (App Router) + MUI 9 + React 19 | Port 3000, TypeScript |
| **Backend** | NestJS 11 + Express + TypeORM | Port 5000, 8 DB migrations |
| **ML Service** | FastAPI + PyTorch 2.2 + TorchVision 0.17 | Port 8000, 16MB model |
| **Database** | PostgreSQL 15 (Alpine) | Port 5432, 4 entities |
| **Containerization** | Docker Compose + multi-stage Dockerfiles | 4 services, named volumes |
| **CI** | GitHub Actions | PR: lint + format + build + test |

#### 3.2.1 Machine Learning Integration

The ML pipeline is a standalone FastAPI service (`/api/v1/predict`) called by the Next.js BFF proxy. On each request:

1. **Face detection** — MTCNN (confidence ≥ 0.85), single best face
2. **Preprocessing** — Unsharp masking (r=1.5, amt=1.5) → CLAHE (clip=2.0, grid=8×8) → Laplacian high-pass boost (strength=0.5)
3. **Classification** — EfficientNet-B0 → 2-class logits (Fake / Real)
4. **Explainability** — Grad-CAM heatmap overlaid on the preprocessed image

---

## 4. UML DIAGRAMS

### 4.1 Use-Case Diagram

Two actor types:
- **Anonymous User** — upload image, view result (5 req/day limit)
- **Authenticated User** — upload, view result, view history, manage account (Google OAuth or email+OTP)

### 4.2 Activity Diagram

Upload → Face detected? → [No] → 400 error / [Yes] → Preprocess → Classify → Generate Grad-CAM → Return result & heatmap

### 4.3 ML Pipeline

Raw Image → MTCNN Face Crop → Unsharp Mask → CLAHE → High-Pass Boost → Resize 224×224 → Normalize → EfficientNet-B0 → Softmax → [Fake/Real, Confidence, Heatmap]

### 4.4 Data Flow Diagram

```
Browser → Next.js (BFF) → FastAPI (/predict) → MTCNN + Preprocessing → Model → Response
                         → NestJS (auth, history) → PostgreSQL
```

---

## 5. PERFORMANCE ANALYSIS AND VALIDATION

### 5.1 Performance Metrics

Evaluated on **1,846 hold-out images** (961 fake, 885 real) from FaceForensics++:

| Metric | Value |
|---|---|
| **Accuracy** | **82.67%** |
| **ROC-AUC** | **0.9104** |
| **F1 (Fake)** | **0.84** |
| **F1 (Real)** | **0.81** |
| Model size | **16 MB** (EfficientNet-B0) |
| Inference time | <500ms on CPU, ~50ms on GPU |

**Confusion Matrix**:

| | Predicted Fake | Predicted Real |
|---|---|---|
| Actual Fake | **837** (TN) | 124 (FP) |
| Actual Real | 196 (FN) | **689** (TP) |

The model is **slightly better at detecting fakes than verifying real images** (87% recall vs 78%), which is the preferred bias for a deepfake detection tool — better to flag a real image for manual review than to miss a fake.

### 5.2 Validation Scheme

- **Train/valid split**: 80/20 (7,384 train, 1,846 valid)
- **Data augmentation**: RandomHorizontalFlip, RandomRotation(15°), ColorJitter
- **Class weighting** in fine-tuning: Real = 1.5× weight to address class imbalance
- **Training strategy**: 10 epochs frozen backbone → 10 epochs full fine-tuning with CosineAnnealingLR
- **Grad-CAM validation**: Visual inspection confirms heatmaps activate around facial boundaries, blending lines, and texture inconsistencies

---

## 6. PROJECT OUTPUT (What Works)

| Feature | Status | Details |
|---|---|---|
| ML Model training & evaluation | Done | 82.67% acc, 0.91 AUC, 16MB model |
| Face detection (MTCNN) | Done | Confidence threshold 0.85, single face |
| Preprocessing pipeline (USM → CLAHE → HPF) | Done | Chained transforms per inference |
| Grad-CAM explainability | Done | Registered on `features[-1]` conv layer |
| Docker image optimization | Done | Multi-stage, Alpine, named volumes, ~50% size reduction |
| Image upload & analysis | Done | Drag-and-drop, 5MB limit, preview |
| Grad-CAM heatmap overlay display | Done | Returned as base64 in API response |
| User authentication (JWT) | Done | 15-min access + 7-day refresh tokens |
| OTP email verification | Done | 6-digit, 5-min expiry, Nodemailer |
| Google OAuth | Done | Passport.js + Google strategy |
| Forgot / reset password | Done | OTP-gated flow |
| Anonymous usage limits | Done | 5/day visitor cookie, 15/day IP |
| Analysis history (authenticated) | Done | Paginated, sortable, per-user |
| Next.js BFF proxy layer | Done | 12 proxy routes |
| CI pipeline (GitHub Actions) | Done | Lint + format + build + test per PR |
| Dark/light theme | Done | MUI theming with cookie persistence |
| **Model fine-tuning / hyperparameter sweep** | **Planned** | Grid search over LR, batch size, augmentation |
| **Performance edge-case testing** | **Planned** | Large images, concurrent uploads, adversarial inputs |
| **Production deployment config** | **Planned** | Domain, SSL, reverse proxy, CDN |

---

## 7. PROJECT TIMELINE

### 7.1 Gantt Chart (High-Level)

```
Month         | Oct | Nov | Dec | Jan | Feb | Mar | Apr | May | Jun |
Scaffolding   | ███ |     |     |     |     |     |     |     |     |
ML Pipeline   |     | ███ | ███ |     |     |     |     |     |     |
Training/Eval |     |     | ███ | ███ |     |     |     |     |     |
Frontend      |     |     |     | ███ | ███ |     |     |     |     |
Backend/Auth  |     |     |     |     | ███ | ███ |     |     |     |
History/Polish|     |     |     |     |     | ███ | ███ |     |     |
**Mid-Defense**|     |     |     |     |     |     |     |**X** |     |
Model Tuning  |     |     |     |     |     |     |     | ███ | ███ |
Testing/Docs  |     |     |     |     |     |     |     | ███ | ███ |
Final Defense |     |     |     |     |     |     |     |     | **X**|
```

### 7.2 Task Status Summary

**Done (10 sprints, ~30 commits):**
- [x] Full-stack project setup with Docker Compose
- [x] Face detection + face cropping pipeline (MTCNN)
- [x] Preprocessing: USM, CLAHE, frequency boosting
- [x] EfficientNet-B0 transfer learning (82.67% accuracy)
- [x] Grad-CAM explainability
- [x] User authentication (JWT, OTP, Google OAuth)
- [x] Analysis history with pagination
- [x] Anonymous usage rate-limiting
- [x] CI pipeline (GitHub Actions)
- [x] Docker optimization (multi-stage, Alpine)

**To Do:**
- [ ] Hyperparameter tuning / expanded dataset training
- [ ] Edge-case testing (non-facial images, corrupted uploads, concurrency)
- [ ] Production deployment configuration (Nginx, SSL, domain)
- [ ] Final report writing
