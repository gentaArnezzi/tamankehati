#!/bin/bash
# Build and Push Docker Images to Registry
# This script builds production images locally and pushes them to Docker registry
# Server will only pull these images, not build them

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }
log_error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"; }

# Configuration
DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io}"
DOCKER_USERNAME="${DOCKER_USERNAME:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
PUSH_TO_REGISTRY="${PUSH_TO_REGISTRY:-true}"

# Validate configuration
if [ -z "$DOCKER_USERNAME" ] && [ "$PUSH_TO_REGISTRY" = "true" ]; then
    log_error "DOCKER_USERNAME is required when PUSH_TO_REGISTRY=true"
    log "Set DOCKER_USERNAME environment variable:"
    log "  export DOCKER_USERNAME=your-dockerhub-username"
    log ""
    log "Or use custom registry:"
    log "  export DOCKER_REGISTRY=registry.example.com"
    log "  export DOCKER_USERNAME=your-username"
    exit 1
fi

# Construct image names
BACKEND_IMAGE="${DOCKER_REGISTRY}/${DOCKER_USERNAME}/tamankehati-backend:${IMAGE_TAG}"
FRONTEND_IMAGE="${DOCKER_REGISTRY}/${DOCKER_USERNAME}/tamankehati-frontend:${IMAGE_TAG}"

echo "=========================================="
echo "🐳 Build and Push Docker Images"
echo "=========================================="
echo ""
log "Configuration:"
log "  Registry: ${DOCKER_REGISTRY}"
log "  Username: ${DOCKER_USERNAME}"
log "  Tag: ${IMAGE_TAG}"
log "  Push: ${PUSH_TO_REGISTRY}"
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

# Login to registry if pushing
if [ "$PUSH_TO_REGISTRY" = "true" ]; then
    log "Checking Docker login status..."
    # Check if credentials exist in config file
    HAS_AUTH=false
    if [ -f "$HOME/.docker/config.json" ]; then
        if grep -q "auths" "$HOME/.docker/config.json" && grep -q "auth" "$HOME/.docker/config.json"; then
            HAS_AUTH=true
        fi
    fi
    
    # Try to verify login by testing registry access
    if [ "$HAS_AUTH" = "true" ]; then
        log_success "Docker credentials found"
        log "Verifying login by testing registry access..."
        # Test with a simple pull (won't actually download if not logged in, just checks auth)
        if docker pull hello-world:latest > /dev/null 2>&1; then
            log_success "Docker registry access verified"
        else
            log_warning "Credentials found but registry access may be limited"
            log "Continuing with build - will verify during push..."
        fi
    else
        log_warning "Docker credentials not found"
        log "Please login first:"
        if [ "$DOCKER_REGISTRY" = "docker.io" ]; then
            log "  docker login"
        else
            log "  docker login ${DOCKER_REGISTRY}"
        fi
        read -p "Do you want to login now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [ "$DOCKER_REGISTRY" = "docker.io" ]; then
                docker login
            else
                docker login "${DOCKER_REGISTRY}"
            fi
        else
            log_warning "Proceeding without explicit login - will attempt push (may fail if not authenticated)"
            log "You can set PUSH_TO_REGISTRY=false to skip push and only build locally"
        fi
    fi
fi

# Build Backend Image
log "Building backend image..."
log "  Image: ${BACKEND_IMAGE}"
docker build \
    -f apps/backend/Dockerfile \
    -t "${BACKEND_IMAGE}" \
    --target production \
    apps/backend

if [ $? -eq 0 ]; then
    log_success "Backend image built successfully"
else
    log_error "Backend image build failed"
    exit 1
fi

# Build Frontend Image
log "Building frontend image..."
log "  Image: ${FRONTEND_IMAGE}"
docker build \
    -f apps/frontend/Dockerfile \
    -t "${FRONTEND_IMAGE}" \
    --target runner \
    apps/frontend

if [ $? -eq 0 ]; then
    log_success "Frontend image built successfully"
else
    log_error "Frontend image build failed"
    exit 1
fi

# Push images to registry
if [ "$PUSH_TO_REGISTRY" = "true" ]; then
    log "Pushing images to registry..."
    
    log "Pushing backend image..."
    docker push "${BACKEND_IMAGE}"
    if [ $? -eq 0 ]; then
        log_success "Backend image pushed successfully"
    else
        log_error "Backend image push failed"
        exit 1
    fi
    
    log "Pushing frontend image..."
    docker push "${FRONTEND_IMAGE}"
    if [ $? -eq 0 ]; then
        log_success "Frontend image pushed successfully"
    else
        log_error "Frontend image push failed"
        exit 1
    fi
else
    log_warning "Skipping push (PUSH_TO_REGISTRY=false)"
    log "Images are built locally with tags:"
    log "  ${BACKEND_IMAGE}"
    log "  ${FRONTEND_IMAGE}"
fi

echo ""
echo "=========================================="
log_success "Build and push completed!"
echo "=========================================="
echo ""
log "Image tags:"
log "  Backend:  ${BACKEND_IMAGE}"
log "  Frontend: ${FRONTEND_IMAGE}"
echo ""
log "To use these images on server:"
log "  1. Set environment variables in .env:"
log "     DOCKER_REGISTRY=${DOCKER_REGISTRY}"
log "     DOCKER_USERNAME=${DOCKER_USERNAME}"
log "     IMAGE_TAG=${IMAGE_TAG}"
log ""
log "  2. Use docker-compose.pull.yml on server:"
log "     docker compose -f docker-compose.pull.yml pull"
log "     docker compose -f docker-compose.pull.yml up -d"
echo ""

