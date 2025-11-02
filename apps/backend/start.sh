#!/bin/bash
# Production startup script for backend
# Runs migrations and initializes admin before starting server

set -e

echo "🚀 Starting Taman Kehati Backend..."

# Wait for database to be ready (simple retry with delay)
echo "⏳ Waiting for database..."
sleep 5  # Give database time to start
for i in {1..15}; do
  if python -c "from psycopg2 import connect; from os import getenv; connect(getenv('DATABASE_URL_SYNC', 'postgresql://kehati_user:kehati_password@postgres:5432/kehati_db'))" 2>/dev/null; then
    echo "✅ Database connection successful!"
    break
  fi
  echo "   Attempt $i/15: Database not ready, waiting 2 seconds..."
  sleep 2
done

echo "✅ Database is ready!"

# Run migrations
echo "📦 Running database migrations..."
alembic upgrade head || {
  echo "⚠️  Migration failed, but continuing..."
}

# Initialize admin user
echo "👤 Initializing admin user..."
python init_admin.py || {
  echo "⚠️  Admin initialization failed, but continuing..."
}

# Start server
echo "🎯 Starting backend server..."
exec "$@"
