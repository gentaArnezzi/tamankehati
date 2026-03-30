#!/bin/bash
# Build and start the production stack on the KKH server.

set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

if [ ! -f ".env" ]; then
    echo ".env not found. Copy env.production.example to .env first."
    exit 1
fi

log "Building production images with ${COMPOSE_FILE}"
docker compose -f "${COMPOSE_FILE}" build backend frontend

log "Starting production stack"
docker compose -f "${COMPOSE_FILE}" up -d

log "Current container status"
docker compose -f "${COMPOSE_FILE}" ps

if [ -x "./scripts/verify-deployment.sh" ]; then
    log "Running deployment verification"
    ./scripts/verify-deployment.sh
fi

log "Deployment flow completed"
