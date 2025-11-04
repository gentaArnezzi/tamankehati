#!/bin/bash
# Check Port Availability Before Deployment
# Run this script on the server to check if ports 3000 and 8000 are available

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }
log_error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"; }

echo "=========================================="
echo "🔍 Port Availability Check"
echo "=========================================="
echo ""

# Check if running on server
if ! command -v ss &> /dev/null && ! command -v netstat &> /dev/null; then
    log_error "Neither 'ss' nor 'netstat' command found"
    log "Please install net-tools: sudo apt-get install net-tools"
    exit 1
fi

# Function to check port
check_port() {
    local port=$1
    local service=$2
    
    log "Checking port $port ($service)..."
    
    # Try ss first (more modern)
    if command -v ss &> /dev/null; then
        RESULT=$(sudo ss -tulpn 2>/dev/null | grep ":$port " || true)
    else
        RESULT=$(sudo netstat -tulpn 2>/dev/null | grep ":$port " || true)
    fi
    
    if [ -n "$RESULT" ]; then
        log_error "Port $port is IN USE!"
        echo "$RESULT"
        return 1
    else
        log_success "Port $port is AVAILABLE"
        return 0
    fi
}

# Check important ports
PORT_3000_USED=false
PORT_8000_USED=false

check_port 3000 "Frontend" || PORT_3000_USED=true
echo ""

check_port 8000 "Backend" || PORT_8000_USED=true
echo ""

# Check other ports (for reference)
log "Checking other ports (for reference)..."
check_port 5432 "PostgreSQL" || true
echo ""

check_port 6379 "Redis" || true
echo ""

# Summary
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo ""

if [ "$PORT_3000_USED" = true ] || [ "$PORT_8000_USED" = true ]; then
    log_warning "⚠️  Port conflicts detected!"
    echo ""
    
    if [ "$PORT_3000_USED" = true ]; then
        log_error "Port 3000 is in use - Frontend will need different port"
        echo "   Solution: Set FRONTEND_PORT=3001 (or other available port) in .env"
    fi
    
    if [ "$PORT_8000_USED" = true ]; then
        log_error "Port 8000 is in use - Backend will need different port"
        echo "   Solution: Set BACKEND_PORT=8001 (or other available port) in .env"
    fi
    
    echo ""
    log "To fix:"
    echo "  1. Edit ~/dasmap_prod/apps/tamankehati/.env"
    echo "  2. Add/update:"
    if [ "$PORT_3000_USED" = true ]; then
        echo "     FRONTEND_PORT=3001  # or any available port"
    fi
    if [ "$PORT_8000_USED" = true ]; then
        echo "     BACKEND_PORT=8001  # or any available port"
    fi
    echo "  3. Update Nginx config with new ports"
    echo "  4. Restart containers"
    echo ""
    exit 1
else
    log_success "✅ All required ports are available!"
    echo ""
    log "Ports that will be used:"
    echo "  - Port 3000: Frontend (Next.js)"
    echo "  - Port 8000: Backend (FastAPI)"
    echo ""
    log_success "Ready to deploy!"
    exit 0
fi

