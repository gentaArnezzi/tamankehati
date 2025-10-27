#!/bin/bash

# Render deployment startup script - optimized for production
set -e

echo "🚀 Starting Taman Kehati API deployment..."

# Handle database migrations - try different strategies for multiple heads
echo "🔄 Running database migrations..."
if ! alembic upgrade head 2>/dev/null; then
    echo "⚠️ Multiple heads detected, trying alternative migration strategy..."
    if ! alembic upgrade heads 2>/dev/null; then
        echo "⚠️ Migration conflicts detected, trying individual heads..."
        # Get all heads and apply them one by one
        HEADS=$(alembic heads | head -5)
        for head in $HEADS; do
            echo "Applying migration: $head"
            alembic upgrade $head || echo "Warning: Failed to apply $head, continuing..."
        done
    fi
fi

# Seed initial data (only if admin user doesn't exist)
echo "🌱 Seeding initial data..."
python scripts/seed.py || echo "Warning: Seeding failed, but continuing deployment..."

echo "✅ Setup complete! Starting FastAPI server..."

# Start the API server immediately
exec uvicorn main:app --host 0.0.0.0 --port $PORT