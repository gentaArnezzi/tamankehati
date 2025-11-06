#!/bin/bash

# Run Alembic migrations to Supabase database
# This script runs migrations from the backend directory

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 RUNNING DATABASE MIGRATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Navigate to backend directory first
cd apps/backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found in apps/backend/"
    echo "Please run ./scripts/setup-local-env.sh first"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL_SYNC" .env || grep -q "\[YOUR-PASSWORD\]" .env; then
    echo "❌ DATABASE_URL_SYNC not configured in .env!"
    echo "Please update apps/backend/.env file with your Supabase password"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies if needed
if [ ! -f "venv/bin/alembic" ]; then
    echo "📦 Installing dependencies..."
    pip install -q -r requirements.txt
fi

# Check current migration status
echo ""
echo "📊 Current migration status:"
alembic current || echo "No migrations applied yet"

echo ""
echo "📜 Migration history:"
alembic history --verbose | head -20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "Do you want to run migrations? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted."
    exit 0
fi

echo ""
echo "🚀 Running migrations..."
alembic upgrade head

echo ""
echo "✅ Migrations completed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Final migration status:"
alembic current

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

