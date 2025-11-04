#!/bin/bash
# Prepare Minimal Files for Server Deployment
# This script creates a deployment package with only necessary files

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }
log_error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"; }

# Configuration
DEPLOYMENT_DIR="${DEPLOYMENT_DIR:-./deployment-package}"
SERVER_USER="${SERVER_USER:-}"
SERVER_IP="${SERVER_IP:-}"
SERVER_PATH="${SERVER_PATH:-/opt/tamankehati}"

echo "=========================================="
echo "📦 Prepare Server Deployment Package"
echo "=========================================="
echo ""

# Create deployment directory
log "Creating deployment package directory..."
rm -rf "$DEPLOYMENT_DIR"
mkdir -p "$DEPLOYMENT_DIR"

# Copy essential files
log "Copying essential files..."

# 1. Docker Compose files
cp docker-compose.pull.yml "$DEPLOYMENT_DIR/"
log_success "✓ docker-compose.pull.yml"

# IMPORTANT: docker-compose.pull.no-nginx.yml (for server with existing Nginx)
if [ -f "docker-compose.pull.no-nginx.yml" ]; then
    cp docker-compose.pull.no-nginx.yml "$DEPLOYMENT_DIR/"
    log_success "✓ docker-compose.pull.no-nginx.yml"
fi

# 2. Environment template
cp env.production.example "$DEPLOYMENT_DIR/"
log_success "✓ env.production.example"

# 3. Nginx configuration
mkdir -p "$DEPLOYMENT_DIR/deploy-package/nginx"
cp -r deploy-package/nginx/* "$DEPLOYMENT_DIR/deploy-package/nginx/"
log_success "✓ deploy-package/nginx/"

# IMPORTANT: Nginx config for server (not container)
if [ -f "deploy-package/nginx/server-nginx-example.conf" ]; then
    cp deploy-package/nginx/server-nginx-example.conf "$DEPLOYMENT_DIR/deploy-package/nginx/"
    log_success "✓ deploy-package/nginx/server-nginx-example.conf"
fi

# 4. Deployment scripts (optional but useful)
mkdir -p "$DEPLOYMENT_DIR/scripts"
if [ -f "scripts/verify-deployment.sh" ]; then
    cp scripts/verify-deployment.sh "$DEPLOYMENT_DIR/scripts/"
    log_success "✓ scripts/verify-deployment.sh"
fi
if [ -f "scripts/backup-database.sh" ]; then
    cp scripts/backup-database.sh "$DEPLOYMENT_DIR/scripts/"
    log_success "✓ scripts/backup-database.sh"
fi

# 5. Create README for deployment
cat > "$DEPLOYMENT_DIR/README.md" << 'EOF'
# Server Deployment Package

This package contains minimal files needed for production deployment.

## Files Included

- `docker-compose.pull.yml` - Docker Compose configuration for pulling images (with Nginx container)
- `docker-compose.pull.no-nginx.yml` - Docker Compose configuration WITHOUT Nginx container (for server with existing Nginx)
- `env.production.example` - Environment variables template
- `deploy-package/nginx/` - Nginx reverse proxy configuration
- `deploy-package/nginx/server-nginx-example.conf` - Nginx config template for server (not container)
- `scripts/` - Deployment helper scripts (optional)

## Quick Start

1. Copy this entire folder to your server
2. Rename `env.production.example` to `.env`
3. Edit `.env` with your server configuration
4. Run: `docker compose -f docker-compose.pull.no-nginx.yml pull` (if server has existing Nginx)
5. Run: `docker compose -f docker-compose.pull.no-nginx.yml up -d`
6. Setup Nginx routing di server (see server-nginx-example.conf)

## Detailed Instructions

See: `docs/deployment/DEPLOYMENT_STEP_BY_STEP.md`
EOF
log_success "✓ README.md"

# Create deployment archive
log "Creating deployment archive..."
tar -czf deployment-package.tar.gz -C "$DEPLOYMENT_DIR" .
log_success "✓ deployment-package.tar.gz created"

# Show package contents
echo ""
log "Package contents:"
ls -lh "$DEPLOYMENT_DIR"
echo ""
log "Archive size:"
ls -lh deployment-package.tar.gz

echo ""
log_success "Deployment package prepared!"
echo ""
log "Next steps:"
echo "  1. Copy package to server:"
if [ -n "$SERVER_USER" ] && [ -n "$SERVER_IP" ]; then
    echo "     scp -r $DEPLOYMENT_DIR $SERVER_USER@$SERVER_IP:$SERVER_PATH"
    echo "     # OR"
    echo "     scp deployment-package.tar.gz $SERVER_USER@$SERVER_IP:$SERVER_PATH/"
else
    echo "     scp -r $DEPLOYMENT_DIR user@server-ip:/opt/tamankehati"
    echo "     # OR"
    echo "     scp deployment-package.tar.gz user@server-ip:/opt/tamankehati/"
fi
echo ""
echo "  2. On server, extract (if using tar.gz):"
echo "     cd /opt/tamankehati"
echo "     tar -xzf deployment-package.tar.gz"
echo ""
echo "  3. Setup .env:"
echo "     cp env.production.example .env"
echo "     nano .env"
echo ""
echo "  4. Start services:"
echo "     docker compose -f docker-compose.pull.yml pull"
echo "     docker compose -f docker-compose.pull.yml up -d"
echo ""

