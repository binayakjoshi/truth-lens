FROM python:3.11-slim-bookworm AS base

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 && rm -rf /var/lib/apt/lists/*

# Sibling of /usr/src/app so path dep ../preprocessing resolves correctly
COPY --from=preprocessing pyproject.toml uv.lock /usr/src/preprocessing/
COPY --from=preprocessing src/ /usr/src/preprocessing/src/

COPY pyproject.toml uv.lock ./
COPY src/ ./src/
RUN uv sync --frozen --no-dev && rm -rf /root/.cache/*

COPY models/ ./models/

EXPOSE 8000

FROM base AS development
RUN uv sync --frozen --group dev && rm -rf /root/.cache/*
# Absolute reload dirs so both mounts are watched reliably (uv run + Docker bind mounts)
CMD ["uv", "run", "uvicorn", "truthlens.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "/usr/src/app/src", "--reload-dir", "/usr/src/preprocessing/src"]

FROM base AS production
CMD [".venv/bin/uvicorn", "truthlens.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
