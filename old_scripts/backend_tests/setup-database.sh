#!/bin/bash

echo "Setting up PostgreSQL database for Taman Kehati..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "You can start it with: brew services start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database
echo "Creating database 'kehati'..."
createdb -h localhost -p 5432 -U postgres kehati

# Create user
echo "Creating user 'kehati_user'..."
psql -h localhost -p 5432 -U postgres -c "CREATE USER kehati_user WITH PASSWORD 'kehati_pass';"

# Grant permissions
echo "Setting up permissions..."
psql -h localhost -p 5432 -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE kehati TO kehati_user;"

# Test connection
echo "Testing connection..."
psql -h localhost -p 5432 -U kehati_user -d kehati -c "SELECT version();"

echo "✅ Database setup complete!"
echo "Connection string: postgresql+psycopg://kehati_user:kehati_pass@localhost:5432/kehati"
