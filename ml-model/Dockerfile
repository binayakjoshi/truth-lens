FROM python:3.11-slim-bookworm AS base

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock ./
COPY src/ src/
RUN uv sync --frozen --no-dev && rm -rf /root/.cache/*

EXPOSE 8000

FROM base AS development
RUN uv sync --frozen --group dev && rm -rf /root/.cache/*
CMD ["uv", "run", "uvicorn", "truthlens.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM base AS production
CMD [".venv/bin/uvicorn", "truthlens.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
