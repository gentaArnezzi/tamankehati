#!/bin/bash

# Taman Kehati - Reset Script
# This script resets the development environment to a clean state

set -e  # Exit on any error

echo "🔄 Resetting Taman Kehati Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Confirm reset
read -p "Are you sure you want to reset the database? This will delete all data. (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Reset cancelled."
    exit 0
fi

# Database reset
print_status "Resetting database..."

# Drop database if it exists
if psql -h localhost -p 5432 -U kehati_user -lqt | cut -d \| -f 1 | grep -qw kehati; then
    print_status "Dropping existing database..."
    dropdb -h localhost -p 5432 -U kehati_user kehati
fi

# Create fresh database
print_status "Creating fresh database..."
createdb -h localhost -p 5432 -U kehati_user kehati

# Backend reset
print_status "Resetting backend..."

cd apps/backend

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    print_error "Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Run database migrations
print_status "Running database migrations..."
alembic upgrade head

# Seed initial data
print_status "Seeding initial data..."
python scripts/seed_minimal.py

# Clean uploads directory
print_status "Cleaning uploads directory..."
if [ -d "uploads" ]; then
    rm -rf uploads/*
    print_success "Uploads directory cleaned"
fi

print_success "Backend reset completed"

# Frontend reset (optional)
read -p "Do you want to reset frontend dependencies? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Resetting frontend..."
    
    cd ../frontend
    
    # Remove node_modules and package-lock.json
    if [ -d "node_modules" ]; then
        print_status "Removing node_modules..."
        rm -rf node_modules
    fi
    
    if [ -f "package-lock.json" ]; then
        print_status "Removing package-lock.json..."
        rm package-lock.json
    fi
    
    # Reinstall dependencies
    print_status "Reinstalling dependencies..."
    npm install
    
    print_success "Frontend reset completed"
fi

print_success "🎉 Reset completed successfully!"
echo ""
echo "The development environment has been reset to a clean state."
echo ""
echo "Next steps:"
echo "1. Start the development servers:"
echo "   Backend:  cd apps/backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
echo "   Frontend: cd apps/frontend && npm run dev"
echo ""
print_success "Ready to go! 🚀"
