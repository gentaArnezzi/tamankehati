#!/bin/bash
# PostgreSQL Database Backup Script for Production
# Creates automated backups with retention policy

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/kehati_db_backup_${TIMESTAMP}.sql.gz"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
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

# Check if running in Docker or on host
if [ -f /.dockerenv ] || [ -n "$DOCKER_CONTAINER" ]; then
    # Running inside Docker container
    DB_HOST="${POSTGRES_HOST:-postgres}"
    DB_NAME="${POSTGRES_DB:-kehati_db}"
    DB_USER="${POSTGRES_USER:-kehati_user}"
    DB_PASSWORD="${POSTGRES_PASSWORD:-kehati_password}"
    
    log "Running backup from Docker container"
    log "Connecting to database: ${DB_HOST}:5432/${DB_NAME}"
    
    # Use PGPASSWORD environment variable
    export PGPASSWORD="${DB_PASSWORD}"
    
    # Create backup using pg_dump from container
    if pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" \
        --no-owner --no-acl --clean --if-exists | gzip > "${BACKUP_FILE}"; then
        log_success "Database backup created: ${BACKUP_FILE}"
    else
        log_error "Failed to create database backup"
        exit 1
    fi
    
    unset PGPASSWORD
else
    # Running on host system
    log "Running backup from host system"
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if postgres container is running
    if ! docker ps | grep -q kehati-postgres-prod; then
        log_error "PostgreSQL container 'kehati-postgres-prod' is not running"
        exit 1
    fi
    
    # Load environment variables from .env file if exists
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi
    
    DB_NAME="${POSTGRES_DB:-kehati_db}"
    DB_USER="${POSTGRES_USER:-kehati_user}"
    DB_PASSWORD="${POSTGRES_PASSWORD:-kehati_password}"
    
    # Create backup directory if it doesn't exist
    mkdir -p "${BACKUP_DIR}"
    
    # Create backup using Docker exec
    log "Creating backup from container: kehati-postgres-prod"
    if docker exec kehati-postgres-prod pg_dump -U "${DB_USER}" -d "${DB_NAME}" \
        --no-owner --no-acl --clean --if-exists | gzip > "${BACKUP_FILE}"; then
        log_success "Database backup created: ${BACKUP_FILE}"
    else
        log_error "Failed to create database backup"
        exit 1
    fi
fi

# Get backup file size
if [ -f "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log_success "Backup size: ${BACKUP_SIZE}"
else
    log_error "Backup file was not created"
    exit 1
fi

# Clean up old backups (retention policy)
log "🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "kehati_db_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
CLEANED_COUNT=$(find "${BACKUP_DIR}" -name "kehati_db_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} | wc -l)
if [ "$CLEANED_COUNT" -gt 0 ]; then
    log "Removed $CLEANED_COUNT old backup(s)"
else
    log "No old backups to remove"
fi

# List current backups
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "kehati_db_backup_*.sql.gz" -type f | wc -l)
log "📦 Total backups: ${BACKUP_COUNT}"

log_success "Backup completed successfully!"
echo ""
echo "Backup file: ${BACKUP_FILE}"
echo "Backup directory: ${BACKUP_DIR}"
echo "Retention: ${RETENTION_DAYS} days"
echo ""

