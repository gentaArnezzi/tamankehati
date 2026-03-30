#!/bin/bash
# Restore uploaded files into the backend uploads volume.

set -euo pipefail

SOURCE_DIR="${1:-}"
BACKEND_CONTAINER="${BACKEND_CONTAINER:-}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

if [ -z "${SOURCE_DIR}" ]; then
    echo "Usage: ./scripts/restore-uploads.sh /path/to/uploads-directory"
    exit 1
fi

if [ ! -d "${SOURCE_DIR}" ]; then
    echo "Uploads directory not found: ${SOURCE_DIR}"
    exit 1
fi

if [ -z "${BACKEND_CONTAINER}" ]; then
    if docker ps --format '{{.Names}}' | grep -q '^kehati-backend-prod$'; then
        BACKEND_CONTAINER="kehati-backend-prod"
    elif docker ps --format '{{.Names}}' | grep -q '^tamankehati-backend-prod$'; then
        BACKEND_CONTAINER="tamankehati-backend-prod"
    else
        echo "Backend container not found."
        exit 1
    fi
fi

log "Syncing uploads from ${SOURCE_DIR} into ${BACKEND_CONTAINER}:/app/uploads"
tar -C "${SOURCE_DIR}" -cf - . | docker exec -i "${BACKEND_CONTAINER}" tar -C /app/uploads -xf -
docker exec "${BACKEND_CONTAINER}" sh -lc 'chown -R app:app /app/uploads'

log "Uploads restore completed"
