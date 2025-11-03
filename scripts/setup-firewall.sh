#!/bin/bash
# Taman Kehati - Firewall Setup Script
# Configures UFW firewall with secure defaults for production

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "=========================================="
echo "🔥 Taman Kehati - Firewall Setup"
echo "=========================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    log_error "This script must be run as root or with sudo"
    echo "Usage: sudo $0"
    exit 1
fi

# Check if UFW is installed
if ! command -v ufw &> /dev/null; then
    log "UFW not found. Installing..."
    apt-get update
    apt-get install -y ufw
fi

# Check current UFW status
if ufw status | grep -q "Status: active"; then
    log_warning "UFW is already active. Current rules:"
    ufw status numbered
    echo ""
    read -p "Continue with setup? This will modify existing rules. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Aborted by user"
        exit 0
    fi
fi

log "Setting up firewall rules..."

# Set default policies
log "Setting default policies (deny incoming, allow outgoing)..."
ufw default deny incoming
ufw default allow outgoing
log_success "Default policies set"

# Allow SSH (CRITICAL - must be first!)
log "Allowing SSH (port 22)..."
ufw allow 22/tcp
log_success "SSH access allowed"
log_warning "⚠️  Make sure you have SSH access from another terminal before proceeding!"
log_warning "⚠️  If you lose SSH access, you'll need physical access to the server"

# Allow HTTP
log "Allowing HTTP (port 80) for Nginx..."
ufw allow 80/tcp
log_success "HTTP access allowed"

# Allow HTTPS
log "Allowing HTTPS (port 443) for future SSL/TLS..."
ufw allow 443/tcp
log_success "HTTPS access allowed"

# Verify dangerous ports are NOT being opened
log "Verifying dangerous ports are closed..."
DANGEROUS_PORTS=(8000 3000 5432 6379)
for port in "${DANGEROUS_PORTS[@]}"; do
    if ufw status | grep -q "$port"; then
        log_error "Port $port is open! This is unsafe for production."
        log_warning "Port $port should only be accessible via Docker internal network"
    else
        log_success "Port $port is closed (safe)"
    fi
done

# Ask about direct backend/frontend access (for debugging only)
echo ""
read -p "Allow direct backend (8000) and frontend (3000) access? (NOT recommended for production) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_warning "⚠️  Opening ports 8000 and 3000 - NOT recommended for production!"
    ufw allow 8000/tcp
    ufw allow 3000/tcp
    log_success "Direct access ports opened (use SSH tunnel instead for better security)"
else
    log_success "Direct access ports kept closed (recommended)"
    log "Tip: Use SSH tunnel for debugging: ssh -L 8000:localhost:8000 user@server"
fi

# Enable firewall
echo ""
log "Enabling UFW firewall..."
ufw --force enable
log_success "Firewall enabled"

# Show status
echo ""
log "Firewall Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ufw status verbose
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
log_success "Firewall setup completed!"
echo ""
log "Summary:"
echo "  ✅ SSH (22) - Open"
echo "  ✅ HTTP (80) - Open"
echo "  ✅ HTTPS (443) - Open"
echo "  ❌ Backend (8000) - Closed (internal only)"
echo "  ❌ Frontend (3000) - Closed (internal only)"
echo "  ❌ PostgreSQL (5432) - Closed (internal only)"
echo "  ❌ Redis (6379) - Closed (internal only)"
echo ""
log "All services are accessible via Nginx reverse proxy on port 80"

