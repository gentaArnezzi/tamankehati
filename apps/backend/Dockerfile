# Multi-stage build for Python FastAPI backend
FROM python:3.12-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create and set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt requirements-dev.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Development stage
FROM base as development

# Install development dependencies
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Development command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM base as production

# Copy application code
COPY . .

# Make start script executable
RUN chmod +x start.sh

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app \
    && mkdir -p /app/uploads && chown -R app:app /app/uploads
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production command (using gunicorn for better production performance)
# Use start.sh for automatic migration and admin init
ENTRYPOINT ["./start.sh"]
CMD ["gunicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--timeout", "120"]
