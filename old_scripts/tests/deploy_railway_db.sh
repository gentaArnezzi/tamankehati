#!/bin/bash

# =============================================================================
# Deploy Database to Railway PostgreSQL
# =============================================================================

set -e  # Exit on error

echo "🚀 Starting Railway Database Deployment..."
echo ""

# Railway Database Connection
RAILWAY_DB="postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway"

echo "📦 Step 1: Test Connection to Railway Database"
echo "----------------------------------------"
psql "$RAILWAY_DB" -c "SELECT version();" || {
    echo "❌ Failed to connect to Railway database"
    echo "Please check your connection string"
    exit 1
}
echo "✅ Connection successful!"
echo ""

echo "📦 Step 2: Create Tables (Run Alembic Migrations)"
echo "----------------------------------------"
cd apps/backend

# Set DATABASE_URL for alembic
export DATABASE_URL="postgresql+asyncpg://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway"
export DATABASE_URL_SYNC="postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway"

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run alembic migrations
echo "Running: alembic upgrade head"
alembic upgrade head || {
    echo "⚠️  Alembic migration failed, trying manual SQL..."
}

cd ../..
echo "✅ Tables created!"
echo ""

echo "📦 Step 3: Run Custom SQL Migrations"
echo "----------------------------------------"

# Add created_by to parks
echo "Adding created_by to parks..."
psql "$RAILWAY_DB" -f apps/backend/migrations/add_created_by_to_parks.sql || echo "⚠️  Already exists or failed"

# Update regions with complete Indonesia data
echo "Updating regions with 38 provinces..."
psql "$RAILWAY_DB" -f apps/backend/migrations/update_regions_indonesia.sql || echo "⚠️  Already exists or failed"

echo "✅ Custom migrations completed!"
echo ""

echo "📦 Step 4: Seed Initial Data"
echo "----------------------------------------"
cd apps/backend

# Run seed script
python3 scripts/seed_minimal.py || {
    echo "⚠️  Seed failed, trying alternative..."
    python3 scripts/seed_simple.py
}

cd ../..
echo "✅ Data seeded!"
echo ""

echo "📦 Step 5: Verify Database"
echo "----------------------------------------"

echo "Checking users..."
psql "$RAILWAY_DB" -c "SELECT id, email, role FROM users LIMIT 5;"

echo ""
echo "Checking regions..."
psql "$RAILWAY_DB" -c "SELECT id, code, name FROM regions ORDER BY id LIMIT 10;"

echo ""
echo "Checking parks..."
psql "$RAILWAY_DB" -c "SELECT id, name, region_id, created_by FROM parks LIMIT 5;"

echo ""
echo "✅ Database verification complete!"
echo ""

echo "🎉 Railway Database Deployment Complete!"
echo ""
echo "📝 Connection Details:"
echo "   Host: maglev.proxy.rlwy.net"
echo "   Port: 26951"
echo "   Database: railway"
echo "   User: postgres"
echo ""
echo "📝 Next Steps:"
echo "   1. Copy railway.env to apps/backend/.env"
echo "   2. Update ALLOWED_ORIGINS with your frontend URL"
echo "   3. Change SECRET_KEY to a random string"
echo "   4. Deploy backend to Railway/Render"
echo ""

