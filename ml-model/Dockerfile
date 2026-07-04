FROM python:3.11-slim-bookworm AS base

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY src/ src/
RUN uv sync --frozen --no-dev

EXPOSE 8000

FROM base AS development
RUN uv sync --frozen --group dev
CMD ["uv", "run", "uvicorn", "truthlens.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM base AS production
CMD ["uv", "run", "uvicorn", "truthlens.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
