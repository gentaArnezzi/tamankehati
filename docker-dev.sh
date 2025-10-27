#!/bin/bash

# Taman Kehati Docker Development Script
# Usage: ./docker-dev.sh [command]

set -e

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
}

# Function to setup environment
setup_env() {
    print_status "Setting up environment files..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your configuration"
    else
        print_status ".env file already exists"
    fi
    
    if [ ! -f apps/backend/.env ]; then
        cp env.example apps/backend/.env
        print_success "Created apps/backend/.env file"
    fi
    
    if [ ! -f apps/frontend/.env.local ]; then
        echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > apps/frontend/.env.local
        print_success "Created apps/frontend/.env.local file"
    fi
}

# Function to build and start services
start_dev() {
    print_status "Starting development environment..."
    
    check_docker
    setup_env
    
    # Build and start services
    docker-compose up --build -d
    
    print_success "Development environment started!"
    print_status "Services available at:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:8000"
    echo "  - API Docs: http://localhost:8000/docs"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
}

# Function to run database migrations
migrate() {
    print_status "Running database migrations..."
    
    docker-compose --profile tools run --rm migrate
    
    print_success "Database migrations completed!"
}

# Function to stop services
stop_dev() {
    print_status "Stopping development environment..."
    
    docker-compose down
    
    print_success "Development environment stopped!"
}

# Function to view logs
logs() {
    if [ -n "$1" ]; then
        docker-compose logs -f "$1"
    else
        docker-compose logs -f
    fi
}

# Function to clean up
clean() {
    print_status "Cleaning up Docker resources..."
    
    docker-compose down -v
    docker system prune -f
    
    print_success "Cleanup completed!"
}

# Function to restart services
restart() {
    print_status "Restarting services..."
    
    docker-compose restart
    
    print_success "Services restarted!"
}

# Function to show status
status() {
    print_status "Service status:"
    docker-compose ps
}

# Function to show help
show_help() {
    echo "Taman Kehati Docker Development Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start development environment"
    echo "  stop      Stop development environment"
    echo "  restart   Restart services"
    echo "  migrate   Run database migrations"
    echo "  logs      View logs (optionally specify service name)"
    echo "  status    Show service status"
    echo "  clean     Clean up Docker resources"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs backend"
    echo "  $0 migrate"
}

# Main script logic
case "${1:-start}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart
        ;;
    migrate)
        migrate
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
