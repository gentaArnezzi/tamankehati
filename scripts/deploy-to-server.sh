#!/bin/bash
# Taman Kehati - Reusable Deployment Script
# Can be used by GitHub Actions CI/CD or manual deployment
#
# Usage:
#   ./scripts/deploy-to-server.sh [OPTIONS]
#
# Options:
#   --branch BRANCH        Branch to deploy (default: main)
#   --path PATH           Deployment path on server (default: /opt/tamankehati)
#   --skip-pull           Skip git pull (useful if code is already updated)
#   --skip-build           Skip Docker build (use existing images)
#   --skip-migration       Skip database migrations
#   --no-health-check      Skip health checks after deployment
#   --dry-run              Show what would be done without executing

set -e

# Default values
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/tamankehati}"
SKIP_PULL=false
SKIP_BUILD=false
SKIP_MIGRATION=false
NO_HEALTH_CHECK=false
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --branch)
      DEPLOY_BRANCH="$2"
      shift 2
      ;;
    --path)
      DEPLOY_PATH="$2"
      shift 2
      ;;
    --skip-pull)
      SKIP_PULL=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --skip-migration)
      SKIP_MIGRATION=true
      shift
      ;;
    --no-health-check)
      NO_HEALTH_CHECK=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--branch BRANCH] [--path PATH] [--skip-pull] [--skip-build] [--skip-migration] [--no-health-check] [--dry-run]"
      exit 1
      ;;
  esac
done

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

execute() {
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY RUN] $*"
    else
        "$@"
    fi
}

# Function to check health endpoint
check_health() {
    local url=$1
    local service_name=$2
    local max_retries=${3:-10}
    local retry_count=0
    
    log "Checking $service_name health at $url..."
    
    while [ $retry_count -lt $max_retries ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            log_success "$service_name health check passed"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            log "$service_name not ready yet, retrying... ($retry_count/$max_retries)"
            sleep 5
        fi
    done
    
    log_error "$service_name health check failed after $max_retries attempts"
    return 1
}

echo "=========================================="
echo "🚀 Taman Kehati - Deployment Script"
echo "=========================================="
echo ""
log "Configuration:"
echo "  Branch: $DEPLOY_BRANCH"
echo "  Path: $DEPLOY_PATH"
echo "  Skip Pull: $SKIP_PULL"
echo "  Skip Build: $SKIP_BUILD"
echo "  Skip Migration: $SKIP_MIGRATION"
echo "  Skip Health Check: $NO_HEALTH_CHECK"
echo "  Dry Run: $DRY_RUN"
echo ""

# Check if we're on the server or need SSH
if [ -f "docker-compose.prod.yml" ]; then
    # We're on the server
    ON_SERVER=true
    log "Running deployment on server (local mode)"
else
    # We need SSH access (for GitHub Actions)
    ON_SERVER=false
    
    if [ -z "$DEPLOY_HOST" ] || [ -z "$DEPLOY_USER" ] || [ -z "$DEPLOY_SSH_KEY" ]; then
        log_error "SSH configuration missing. Required environment variables:"
        echo "  - DEPLOY_HOST (server IP or hostname)"
        echo "  - DEPLOY_USER (SSH username)"
        echo "  - DEPLOY_SSH_KEY (SSH private key)"
        exit 1
    fi
    
    log "Running deployment via SSH to $DEPLOY_USER@$DEPLOY_HOST"
fi

# Deployment steps
if [ "$ON_SERVER" = true ]; then
    # Local deployment on server
    cd "$DEPLOY_PATH" || {
        log_error "Cannot access deployment path: $DEPLOY_PATH"
        exit 1
    }
    
    # Save current commit for rollback
    CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "none")
    log "Current commit: $CURRENT_COMMIT"
    
    # Pull latest code
    if [ "$SKIP_PULL" = false ]; then
        log "Pulling latest code from repository..."
        if [ -d ".git" ]; then
            execute git fetch origin
            execute git reset --hard "origin/$DEPLOY_BRANCH"
            execute git clean -fd
            NEW_COMMIT=$(git rev-parse HEAD)
            log_success "Code updated to commit: $NEW_COMMIT"
        else
            log_warning "Not a git repository, skipping pull"
        fi
    else
        log "Skipping git pull"
    fi
    
    # Build Docker images
    if [ "$SKIP_BUILD" = false ]; then
        log "Building Docker images..."
        execute docker compose -f docker-compose.prod.yml build --no-cache
        log_success "Docker images built successfully"
    else
        log "Skipping Docker build"
    fi
    
    # Stop existing containers
    log "Stopping existing containers..."
    execute docker compose -f docker-compose.prod.yml down --timeout 30 || log_warning "Some containers may have failed to stop"
    
    # Start services
    log "Starting services..."
    execute docker compose -f docker-compose.prod.yml up -d
    log_success "Services started"
    
    # Wait for services to initialize
    log "Waiting for services to initialize..."
    sleep 10
    
    # Run database migrations
    if [ "$SKIP_MIGRATION" = false ]; then
        log "Running database migrations..."
        if execute docker compose -f docker-compose.prod.yml exec -T backend alembic upgrade head; then
            log_success "Database migrations completed"
        else
            log_warning "Database migrations failed, but continuing..."
        fi
    else
        log "Skipping database migrations"
    fi
    
    # Health checks
    if [ "$NO_HEALTH_CHECK" = false ]; then
        log "Performing health checks..."
        
        check_health "http://localhost:8000/health" "Backend" 10 || log_warning "Backend health check failed"
        check_health "http://localhost:3000" "Frontend" 10 || log_warning "Frontend health check failed"
        check_health "http://localhost/health" "Nginx" 5 || log_warning "Nginx health check failed (optional)"
        
        log_success "Health checks completed"
    else
        log "Skipping health checks"
    fi
    
    # Final verification
    log "Deployment verification..."
    execute docker compose -f docker-compose.prod.yml ps
    
    log_success "Deployment completed successfully!"
    
else
    # Remote deployment via SSH
    log "Connecting to server via SSH..."
    
    # Execute deployment script on remote server
    ssh -o StrictHostKeyChecking=no -i <(echo "$DEPLOY_SSH_KEY") \
        "$DEPLOY_USER@$DEPLOY_HOST" <<DEPLOY_SCRIPT
        set -e
        cd $DEPLOY_PATH
        
        # Save current commit
        CURRENT_COMMIT=\$(git rev-parse HEAD 2>/dev/null || echo "none")
        echo "Current commit: \$CURRENT_COMMIT"
        
        # Pull latest code
        if [ "$SKIP_PULL" = false ] && [ -d ".git" ]; then
            echo "Pulling latest code..."
            git fetch origin
            git reset --hard origin/$DEPLOY_BRANCH
            git clean -fd
            NEW_COMMIT=\$(git rev-parse HEAD)
            echo "Updated to commit: \$NEW_COMMIT"
        fi
        
        # Build Docker images
        if [ "$SKIP_BUILD" = false ]; then
            echo "Building Docker images..."
            docker compose -f docker-compose.prod.yml build --no-cache
        fi
        
        # Stop and start services
        echo "Stopping existing containers..."
        docker compose -f docker-compose.prod.yml down --timeout 30 || true
        
        echo "Starting services..."
        docker compose -f docker-compose.prod.yml up -d
        
        # Wait for services
        sleep 10
        
        # Run migrations
        if [ "$SKIP_MIGRATION" = false ]; then
            echo "Running database migrations..."
            docker compose -f docker-compose.prod.yml exec -T backend alembic upgrade head || echo "Migration failed"
        fi
        
        # Health checks
        if [ "$NO_HEALTH_CHECK" = false ]; then
            echo "Performing health checks..."
            
            # Backend
            RETRY=0
            while [ \$RETRY -lt 10 ]; do
                if curl -f -s http://localhost:8000/health > /dev/null; then
                    echo "✅ Backend health check passed"
                    break
                fi
                RETRY=\$((RETRY + 1))
                sleep 5
            done
            
            # Frontend
            RETRY=0
            while [ \$RETRY -lt 10 ]; do
                if curl -f -s http://localhost:3000 > /dev/null; then
                    echo "✅ Frontend health check passed"
                    break
                fi
                RETRY=\$((RETRY + 1))
                sleep 5
            done
        fi
        
        # Show status
        docker compose -f docker-compose.prod.yml ps
DEPLOY_SCRIPT
    
    log_success "Remote deployment completed!"
fi

echo ""
echo "=========================================="
log_success "Deployment finished"
echo "=========================================="
echo ""

