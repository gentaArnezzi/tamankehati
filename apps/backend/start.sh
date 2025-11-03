#!/bin/bash
# Production startup script for backend
# Runs migrations and initializes admin before starting server

set -e

echo "=========================================="
echo "🚀 Starting Taman Kehati Backend..."
echo "=========================================="

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Wait for database to be ready (simple retry with delay)
log "⏳ Waiting for database connection..."
DB_URL="${DATABASE_URL_SYNC:-postgresql://kehati_user:kehati_password@postgres:5432/kehati_db}"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if python3 -c "
import sys
from psycopg2 import connect
from os import getenv
try:
    db_url = getenv('DATABASE_URL_SYNC', 'postgresql://kehati_user:kehati_password@postgres:5432/kehati_db')
    conn = connect(db_url, connect_timeout=2)
    conn.close()
    sys.exit(0)
except Exception as e:
    sys.exit(1)
" 2>/dev/null; then
        log "✅ Database connection successful!"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        log "❌ ERROR: Failed to connect to database after $MAX_ATTEMPTS attempts"
        log "   Check database configuration and ensure postgres service is running"
        exit 1
    fi
    log "   Attempt $ATTEMPT/$MAX_ATTEMPTS: Database not ready, waiting 2 seconds..."
    sleep 2
done

log "✅ Database is ready!"

# Run migrations
log "📦 Running database migrations..."
if alembic upgrade head 2>&1; then
    log "✅ Database migrations completed successfully"
else
    MIGRATION_ERROR=$?
    log "⚠️  WARNING: Migration failed with exit code $MIGRATION_ERROR"
    log "   This might be normal if migrations were already applied"
    log "   Continuing with server start..."
fi

# Initialize admin user
log "👤 Initializing admin user..."
if python3 init_admin.py 2>&1; then
    log "✅ Admin user initialization completed"
else
    ADMIN_ERROR=$?
    log "⚠️  WARNING: Admin initialization failed with exit code $ADMIN_ERROR"
    log "   This might be normal if admin user already exists"
    log "   Continuing with server start..."
fi

# Start server
log "🎯 Starting backend server..."
log "=========================================="
exec "$@"
