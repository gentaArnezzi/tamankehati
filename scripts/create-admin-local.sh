#!/bin/bash

# Create super admin user for local development
# This script uses the init_admin.py script to create admin user

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👤 CREATE SUPER ADMIN USER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Navigate to backend directory
cd apps/backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please create venv first:"
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Please setup .env file first using:"
    echo "  ./scripts/setup-local-env.sh"
    exit 1
fi

# Get admin credentials
echo ""
echo "📝 Enter admin credentials:"
read -p "Email [admin@kehati.org]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@kehati.org}

read -sp "Password [admin123]: " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
echo ""

# Set environment variables
export ADMIN_EMAIL
export ADMIN_PASSWORD

# Run init_admin.py
echo ""
echo "🚀 Creating super admin user..."
python init_admin.py

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Done!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

