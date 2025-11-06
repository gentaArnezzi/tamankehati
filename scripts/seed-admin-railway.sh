#!/bin/bash

# Seed Super Admin User for Railway PostgreSQL
# This script runs the Python seed script

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 SEED SUPER ADMIN USER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if virtual environment exists
if [ -d "apps/backend/venv" ]; then
    echo "📦 Activating virtual environment..."
    source apps/backend/venv/bin/activate
elif [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  Virtual environment not found. Using system Python..."
fi

# Check if .env exists
if [ ! -f "apps/backend/.env" ]; then
    echo "❌ .env file not found in apps/backend/"
    echo "Please run setup-local-env.sh first or create .env manually"
    exit 1
fi

# Run seed script
echo "🌱 Running seed script..."
echo ""

cd apps/backend
python3 ../scripts/seed-admin-railway.py

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Done!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

