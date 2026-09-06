# TruthLens

Explainable deepfake detection. Every verdict ships with a **Grad-CAM
heatmap** over the exact regions that drove the decision — so a result is
something you can check, not just accept.
---

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Architecture](#architecture)
- [Stack](#stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Model training](#model-training)
- [Testing](#testing)
- [Linting & code quality](#linting--code-quality)
- [Dataset & credits](#dataset--credits)

---

## Features

- **Single-Image Analysis** — upload one face, get a verdict in seconds, no
  batching required.
- **Bulk Analysis** — analyze up to 10 images in one pass, with per-file
  results and a clear breakdown of anything that failed.
- **Grad-CAM Heatmaps** — every result ships with a heatmap over the regions
  that drove the decision, with an opacity slider to compare against the
  original image.
- **Confidence Breakdown** — a real/fake confidence split rather than a bare
  label; cases the model finds ambiguous are flagged as uncertain instead of
  forced either way.
- **Detection Log** — every analysis is timestamped and given an ID, so a
  result can be referenced or revisited later.
- **No Account Needed** — run an anonymous analysis with no sign-up, or sign
  in (including via Google) to keep a history tied to your account.

---

## How it works

Four steps from a single photo to a verdict you can inspect:

1. **Upload a face image** — JPG or PNG, analyzed directly, or up to 10 at
   once through bulk analysis.
2. **Locate & enhance** — the face region is isolated, then run through
   **CLAHE**, **unsharp masking**, and a **high-pass filter** — the
   enhancement stack that surfaces the fine-grained blending artifacts most
   deepfakes leave behind.
3. **Classify & trace with Grad-CAM** — a convolutional network scores the
   image as real or fake; Grad-CAM records exactly which pixels drove that
   decision, not just the final number.
4. **Read the verdict** — a real/fake confidence split plus a heatmap that
   can be faded in and out over the original image.

---

## Architecture


```
┌────────────┐       ┌───────────────┐      ┌─────────────────────┐
│  Next.js   │◄────► │   NestJS      │◄────►│  FastAPI            │
│  frontend  │       │   backend     │      │  inference service  │
└────────────┘       │ (auth, users, │      │  (preprocessing +   │
                     │   analysis    │      │   model + Grad-CAM) │
                     │   log, rate   │      └─────────────────────┘
                     │   limiting)   │
                     └──────┬────────┘
                            │
                ┌───────────┼───────────┐
                ▼                       ▼
          ┌────────────┐          ┌─────────────┐
          │ PostgreSQL │          │   Redis     │
          │ (users,    │          │ (caching,   │
          │  analysis  │          │  OTP        │
          │  history)  │          │  records,   │
          └────────────┘          │  rate       │
                                  │  limiting)  │
                                  └─────────────┘
```

- **NestJS backend** owns auth (email/OTP verification via Gmail, Google
  OAuth, refresh tokens), user accounts + stats, the analysis log, and rate
  limiting — then proxies image analysis requests to the FastAPI inference
  service.
- **FastAPI inference service** (`ml-model/inference`) is a separate Python
  process purely for running the model: face isolation, the
  CLAHE/unsharp-mask/high-pass enhancement stack (`ml-model/preprocessing`),
  classification, and Grad-CAM generation.
- **Training** happens offline, outside the request path, on FaceForensics++
  — see [Model training](#model-training).

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, MUI |
| Backend (API, auth, business logic) | NestJS, TypeORM |
| Inference service | FastAPI (Python) |
| Model training | Python |
| Database | PostgreSQL |
| Cache / OTP / rate limiting | Redis |
| Dev environment | Docker / Podman |
| Testing | Jest (backend, frontend), Pytest (ml-model) |


---

## Project structure

```
truthlens/
├── docker-compose.yml
├── README.md
├── backend/                        # NestJS app
│   ├── config/                       # db.config.ts, auth strategy config
│   ├── src/
│   │   ├── analysis/                   # analysis controller/service, DTOs, history entity
│   │   ├── auth/                       # login, OTP verification, Google OAuth, guards, email template
│   │   ├── common/                     # shared decorators, guards, filters, interceptors, utils
│   │   ├── database/migrations/        # TypeORM migrations
│   │   ├── email/                      # OTP email templates + service
│   │   ├── otp/                        # OTP service
│   │   ├── redis/                      # Redis service
│   │   ├── users/                      # user accounts, user stats, password reset
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── test/                         # Jest e2e tests (app.e2e-spec.ts)
├── frontend/                        # Next.js app
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── api/                    # Next.js route handlers (analysis, auth, users) proxying to backend
│       │   ├── (auth)/                  # login, signup, forgot/reset password, verify-otp, verify-reset pages
│       │   └── (site)/
│       │       ├── (public)/             # analysis, feature, how-it-works pages
│       │       └── (protected)/          # bulk-analysis, history (+ history/[id]) pages
│       ├── components/
│       │   ├── analysis/                 # report-card, verdict-pill, confidence-ring, image-frame, report-tag
│       │   ├── auth/                     # continue-with-google
│       │   ├── custom-elements/          # image-upload, multi-image-upload, input, modal, link-button
│       │   ├── dashboard/                # stat-card, confidence-meter, case-log, verdict-badge, timestamp
│       │   ├── history/                  # heat-map-overlay-card, history-card, pagination, sort/view toggle
│       │   ├── navigation/               # nav-bar
│       │   ├── ui/                       # heat-signature, loading, theme-toggle, toast
│       │   └── users/                    # user-menu, logout-modal
│       ├── context/                    # theme-context, user-context
│       ├── hooks/                      # use-form, use-toast
│       ├── lib/                        # analysis-report, analysis-utils, custom-fetch, dashboard, validators
│       └── types/
└── ml-model/
    ├── inference/                    # FastAPI inference service
    │   ├── models/                     # trained weights (truthlens_efficientnet_b0*.pth)
    │   └── src/truthlens/api/main.py
    ├── preprocessing/                # face isolation + enhancement stack + classifier (installable package)
    │   ├── src/truthlens/
    │   │   ├── model/classifier.py
    │   │   └── preprocessing/          # contrast.py (CLAHE), frequency.py, sharpen.py, pipeline.py
    │   └── tests/                      # Pytest (test_classifier.py, test_preprocessing.py)
    └── training/                     # offline model training on FaceForensics++
        ├── dataset_scripts/            # clean.py, extract.py, face.py, training.py
        ├── ffpp_splits/                 # train/val/test split JSONs
        ├── scripts/                     # train.py, finetune.py, evaluate.py, split_dataset.py
        └── evaluation_report.txt
```

---

## Getting started

### Prerequisites

- Docker + Docker Compose (or Podman + `podman-compose`)
- Node.js (frontend + NestJS backend)
- Python + [`uv`](https://github.com/astral-sh/uv) or `pip` (`ml-model/inference`, `ml-model/preprocessing`, `ml-model/training`)
- Access to the FaceForensics++ dataset (see [below](#dataset--credits)) if
  you intend to retrain the model

### 1. Clone and configure

```bash
git clone <repo-url>
cd truthlens
cp backend/.env.example backend/.env
cp ml-model/inference/.env.example ml-model/inference/.env
cp frontend/.env.example frontend/.env.local
```

### 2. Start the stack

```bash
docker compose up --build
```

Expected services: `frontend`, `backend` (NestJS), `inference` (FastAPI),
`db` (Postgres), `redis`.

### 3. Frontend only (if running services individually)

```bash
cd frontend
npm install
npm run dev
```

---

## Environment variables

**`backend/.env` (NestJS)**

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Runtime environment (`development` / `production`) |
| `DB_HOST` | Postgres host (`db` in Docker) |
| `DB_PORT` | Postgres port |
| `DB_NAME` | Postgres database name |
| `POSTGRES_USERNAME` | Postgres superuser/init username (used by the DB container) |
| `POSTGRES_PASSWORD` | Postgres superuser/init password (used by the DB container) |
| `DB_USERNAME` | App DB username used by the backend to connect |
| `DB_PASSWORD` | App DB password used by the backend to connect |
| `JWT_SECRET` | Access/refresh token signing secret |
| `GMAIL_APP_PASSWORD` | Gmail app password used to send OTP emails |
| `GMAIL_USER` | Gmail account used as the OTP email sender |
| `REDIS_HOST` | Redis host (`redis` in Docker) |
| `REDIS_PORT` | Redis port |
| `OTP_HASH_SECRET` | Secret used to hash/verify OTP codes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL (e.g. `http://localhost:5000/auth/google/callback`) |
| `FRONTEND_API_URL` | Base URL of the frontend (used for redirects/CORS) |
| `ML_MODEL_API_URL` | Base URL of the FastAPI inference service |

**`frontend/.env.local`**

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Runtime environment (`development` / `production`) |
| `BACKEND_API_URL` | Server-side base URL of the NestJS backend (e.g. `http://backend:5000`) |
| `PROXY_API_URL` | Base URL the frontend's own API routes proxy through (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_BACKEND_API_URL` | Client-side base URL of the NestJS backend (e.g. `http://localhost:5000`) |
| `NEXT_PUBLIC_IMAGE_API_URL` | Base URL used to resolve/display images served by the backend (e.g. `http://backend:5000`) |

**`ml-model/inference/.env` (FastAPI)**


| Variable | Purpose |
|---|---|
| `CONFIDENCE_THRESHOLD` | confiendence threshold for prediction |
| `MAX_BULK_IMAGES` | Cap on images per bulk-analysis request (currently 10) |

---

## Model training

Training is a separate, offline Python workflow — not part of the request
path of either the NestJS backend or the FastAPI inference service.

```bash
cd ml-model/training
uv sync   # or: pip install -r requirements.txt
uv run python scripts/train.py --config config.yaml
```

Related scripts:
- `scripts/split_dataset.py` — builds the train/val/test splits under `ffpp_splits/`
- `scripts/finetune.py` — fine-tunes an existing checkpoint
- `scripts/evaluate.py` — produces `evaluation_report.txt`
- `dataset_scripts/` — dataset extraction/cleaning/face-isolation helpers used ahead of training

The trained model produces:
- A classification head (real / fake, with confidence)
- Grad-CAM support — the same convolutional feature maps used for
  classification are used to generate the attention heatmap layered over the
  original image at inference time.

Trained weights are copied into `ml-model/inference/models/` for the FastAPI
service to load — they are not meant to be re-derived at request time.

⚠️ Trained weights derived from FaceForensics++ inherit that dataset's usage
restrictions — see [below](#dataset--credits) before distributing or
deploying a model trained on it.

---

## Testing

- **Backend & frontend (TypeScript)** — [Jest](https://jestjs.io/):
  - Backend unit specs live alongside the code (`*.service.spec.ts` in
    `auth`, `analysis`, `users`, `email`, `otp`, `redis`), plus end-to-end
    specs in `backend/test/` (`app.e2e-spec.ts`, `jest-e2e.json`).
  - Run from `backend/`:
    ```bash
    npm run test        # unit specs
    npm run test:e2e    # e2e specs
    ```
- **ML model (Python)** — [Pytest](https://docs.pytest.org/):
  - Specs live in `ml-model/preprocessing/tests/` (`test_classifier.py`,
    `test_preprocessing.py`).
  - Run from `ml-model/preprocessing/`:
    ```bash
    uv run pytest   # or: pytest
    ```

---


## Dataset & credits

This project's model is trained on **[FaceForensics++](https://github.com/ondyari/FaceForensics)**,
created by the Visual Computing Group at the Technical University of Munich
and collaborators. All credit for the dataset itself goes to its original
authors:

> Andreas Rössler, Davide Cozzolino, Luisa Verdoliva, Christian Riess, Justus
> Thies, Matthias Nießner. **"FaceForensics++: Learning to Detect Manipulated
> Facial Images."** ICCV 2019.

**Important — this is a restricted-access research dataset, not an
open dataset:**
- Access requires **signing FaceForensics++'s own usage agreement** directly
  with the dataset's authors/maintainers — it is not bundled with, or
  redistributed by, this repository.
- The dataset's terms restrict usage to **non-commercial research
  purposes** and typically prohibit redistributing the raw data or the
  original videos.
- The `ffpp_splits/` and any raw dataset files are intentionally **not
  committed** to this repo — you must obtain your own access and place the
  dataset accordingly.
- If you plan to use TruthLens (or a model trained on FaceForensics++
  specifically) for anything beyond research/personal use, **review the
  FaceForensics++ terms of use yourself** — this README is not a substitute
  for reading their actual license/agreement, and this project takes no
  position on what uses are permitted beyond quoting the requirement above.
