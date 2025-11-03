#!/bin/bash
# Production Deployment Verification Script
# Checks all services health after deployment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="${SERVER_IP:-localhost}"
NGINX_PORT="${NGINX_PORT:-80}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

# Function to log
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not installed"
    exit 1
fi

echo "=========================================="
echo "🔍 Taman Kehati - Deployment Verification"
echo "=========================================="
echo ""

# Check Docker Compose file
log "Checking Docker Compose configuration..."
if [ ! -f "docker-compose.prod.yml" ]; then
    log_error "docker-compose.prod.yml not found"
    exit 1
fi
log_success "Docker Compose file found"

# Check running containers
log "Checking running containers..."
CONTAINERS=(
    "kehati-postgres-prod:PostgreSQL"
    "kehati-redis-prod:Redis"
    "kehati-backend-prod:Backend"
    "kehati-frontend-prod:Frontend"
    "kehati-nginx-prod:Nginx"
)

ALL_RUNNING=true
for container_info in "${CONTAINERS[@]}"; do
    IFS=':' read -r container_name service_name <<< "$container_info"
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        STATUS=$(docker ps --format '{{.Status}}' --filter "name=^${container_name}$")
        log_success "${service_name} (${container_name}) is running - ${STATUS}"
    else
        log_error "${service_name} (${container_name}) is NOT running"
        ALL_RUNNING=false
    fi
done

if [ "$ALL_RUNNING" = false ]; then
    log_error "Some containers are not running. Please check logs:"
    echo "  docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

echo ""
log "Checking service health endpoints..."

# Check PostgreSQL
log "Checking PostgreSQL..."
if docker exec kehati-postgres-prod pg_isready -U kehati_user -d kehati_db &>/dev/null; then
    log_success "PostgreSQL is healthy"
else
    log_error "PostgreSQL health check failed"
fi

# Check Redis
log "Checking Redis..."
if docker exec kehati-redis-prod redis-cli ping | grep -q PONG; then
    log_success "Redis is healthy"
else
    log_error "Redis health check failed"
fi

# Check Backend
log "Checking Backend API..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "http://${SERVER_IP}:${BACKEND_PORT}/health" || echo "000")
if [ "$BACKEND_HEALTH" = "200" ]; then
    log_success "Backend API is healthy (http://${SERVER_IP}:${BACKEND_PORT}/health)"
else
    log_warning "Backend API health check failed (HTTP $BACKEND_HEALTH)"
    log "   Try: curl http://${SERVER_IP}:${BACKEND_PORT}/health"
fi

# Check Frontend
log "Checking Frontend..."
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "http://${SERVER_IP}:${FRONTEND_PORT}" || echo "000")
if [ "$FRONTEND_HEALTH" = "200" ] || [ "$FRONTEND_HEALTH" = "304" ]; then
    log_success "Frontend is healthy (http://${SERVER_IP}:${FRONTEND_PORT})"
else
    log_warning "Frontend health check failed (HTTP $FRONTEND_HEALTH)"
    log "   Try: curl http://${SERVER_IP}:${FRONTEND_PORT}"
fi

# Check Nginx (if running)
log "Checking Nginx..."
NGINX_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "http://${SERVER_IP}:${NGINX_PORT}/health" || echo "000")
if [ "$NGINX_HEALTH" = "200" ]; then
    log_success "Nginx is healthy (http://${SERVER_IP}:${NGINX_PORT}/health)"
else
    log_warning "Nginx health check failed (HTTP $NGINX_HEALTH)"
    log "   Try: curl http://${SERVER_IP}:${NGINX_PORT}/health"
fi

echo ""
log "Checking volumes..."
VOLUMES=(
    "postgres_data:PostgreSQL data"
    "redis_data:Redis data"
    "backend_uploads:Backend uploads"
)

for volume_info in "${VOLUMES[@]}"; do
    IFS=':' read -r volume_name volume_desc <<< "$volume_info"
    if docker volume ls --format '{{.Name}}' | grep -q "^${volume_name}$"; then
        log_success "${volume_desc} volume exists"
    else
        log_warning "${volume_desc} volume not found (will be created on first run)"
    fi
done

echo ""
log "Checking network..."
if docker network ls --format '{{.Name}}' | grep -q "kehati-network"; then
    log_success "Docker network 'kehati-network' exists"
else
    log_warning "Docker network 'kehati-network' not found (will be created on first run)"
fi

echo ""
log "Checking environment variables..."
ENV_VARS=(
    "SECRET_KEY"
    "POSTGRES_PASSWORD"
    "NEXT_PUBLIC_API_URL"
    "CORS_ORIGINS"
)

if [ -f .env ]; then
    for var in "${ENV_VARS[@]}"; do
        if grep -q "^${var}=" .env && ! grep -q "^${var}=.*CHANGE\|^${var}=.*YOUR\|^${var}=.*localhost:8000" .env; then
            log_success "${var} is configured"
        else
            log_warning "${var} may need to be updated in .env file"
        fi
    done
else
    log_warning ".env file not found - environment variables may be using defaults"
fi

echo ""
echo "=========================================="
log_success "Verification complete!"
echo "=========================================="
echo ""
echo "Access URLs:"
echo "  Frontend (direct): http://${SERVER_IP}:${FRONTEND_PORT}"
echo "  Frontend (via Nginx): http://${SERVER_IP}:${NGINX_PORT}"
echo "  Backend API: http://${SERVER_IP}:${BACKEND_PORT}"
echo "  Backend API (via Nginx): http://${SERVER_IP}:${NGINX_PORT}/api"
echo "  API Docs: http://${SERVER_IP}:${BACKEND_PORT}/docs"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Check status: docker-compose -f docker-compose.prod.yml ps"
echo "  Restart services: docker-compose -f docker-compose.prod.yml restart"
echo ""

