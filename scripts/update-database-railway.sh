#!/bin/bash

# Update database connection to Railway PostgreSQL
# This script updates .env file with Railway database connection

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 UPDATE DATABASE TO RAILWAY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Navigate to backend directory
cd apps/backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found in apps/backend/"
    echo "Please run setup-local-env.sh first"
    exit 1
fi

# Backup existing .env
echo "📝 Creating backup..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Railway PostgreSQL connection string
RAILWAY_DB_URL="postgresql://postgres:lOKsDZMrpcPvKhagEEBaqMtAVBXjhkGT@trolley.proxy.rlwy.net:44861/railway"
RAILWAY_DB_URL_ASYNC="postgresql+asyncpg://postgres:lOKsDZMrpcPvKhagEEBaqMtAVBXjhkGT@trolley.proxy.rlwy.net:44861/railway"

# Update DATABASE_URL (async)
if grep -q '^DATABASE_URL=' .env; then
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"${RAILWAY_DB_URL_ASYNC}\"|" .env
    echo "✅ Updated DATABASE_URL (async)"
else
    echo "DATABASE_URL=\"${RAILWAY_DB_URL_ASYNC}\"" >> .env
    echo "✅ Added DATABASE_URL (async)"
fi

# Update DATABASE_URL_SYNC
if grep -q '^DATABASE_URL_SYNC=' .env; then
    sed -i.bak2 "s|^DATABASE_URL_SYNC=.*|DATABASE_URL_SYNC=\"${RAILWAY_DB_URL}\"|" .env
    echo "✅ Updated DATABASE_URL_SYNC"
else
    echo "DATABASE_URL_SYNC=\"${RAILWAY_DB_URL}\"" >> .env
    echo "✅ Added DATABASE_URL_SYNC"
fi

# Clean up backup files
rm -f .env.bak .env.bak2

echo ""
echo "✅ Database connection updated to Railway PostgreSQL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Verify .env file:"
echo "   grep DATABASE_URL apps/backend/.env"
echo ""
echo "2. Test database connection:"
echo "   cd apps/backend"
echo "   python -c \"from core.database.engine import engine; print('Connection OK')\""
echo ""
echo "3. Run migrations if needed:"
echo "   alembic upgrade head"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

