FROM python:3.11-slim-bookworm AS base

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /workspace

RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 && rm -rf /var/lib/apt/lists/*

# Shared preprocessing package (Compose additional context: preprocessing)
COPY --from=preprocessing pyproject.toml uv.lock /workspace/preprocessing/
COPY --from=preprocessing src/ /workspace/preprocessing/src/

# Inference service — context is ml-model/inference
COPY pyproject.toml uv.lock /workspace/inference/
COPY src/ /workspace/inference/src/
WORKDIR /workspace/inference
RUN uv sync --frozen --no-dev && rm -rf /root/.cache/*

COPY models/ models/

EXPOSE 8000

FROM base AS development
RUN uv sync --frozen --group dev && rm -rf /root/.cache/*
CMD ["uv", "run", "uvicorn", "truthlens.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "src", "--reload-dir", "/workspace/preprocessing/src"]

FROM base AS production
CMD [".venv/bin/uvicorn", "truthlens.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
