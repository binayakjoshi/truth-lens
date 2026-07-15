FROM python:3.11-slim-bookworm AS base

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /workspace

RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 && rm -rf /var/lib/apt/lists/*

# Shared preprocessing package (path dependency from inference/pyproject.toml)
COPY preprocessing/pyproject.toml preprocessing/uv.lock preprocessing/
COPY preprocessing/src/ preprocessing/src/

# Inference service — src must exist before editable install
COPY inference/pyproject.toml inference/uv.lock inference/
COPY inference/src/ inference/src/
WORKDIR /workspace/inference
RUN uv sync --frozen --no-dev && rm -rf /root/.cache/*

COPY inference/models/ models/

EXPOSE 8000

FROM base AS development
RUN uv sync --frozen --group dev && rm -rf /root/.cache/*
CMD ["uv", "run", "uvicorn", "truthlens.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "src", "--reload-dir", "/workspace/preprocessing/src"]

FROM base AS production
CMD [".venv/bin/uvicorn", "truthlens.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
