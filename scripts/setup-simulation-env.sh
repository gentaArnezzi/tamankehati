#!/bin/bash
# Setup .env file for local simulation testing
# This script helps configure .env for production-like testing

set -e

SIMULATION_DIR="${1:-$HOME/tamankehati-simulation}"

if [ ! -d "$SIMULATION_DIR" ]; then
    echo "Error: Simulation directory not found: $SIMULATION_DIR"
    echo "Usage: $0 [simulation-directory]"
    exit 1
fi

cd "$SIMULATION_DIR"

# Check if .env already exists
if [ -f ".env" ]; then
    read -p ".env already exists. Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

# Copy template
cp env.production.example .env

# Generate SECRET_KEY
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || openssl rand -base64 32)

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | sed 's/addr://' || echo "localhost")

# Generate passwords
POSTGRES_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-20)
ADMIN_PASSWORD=$(openssl rand -base64 12 | tr -d "=+/" | cut -c1-16)

echo "=========================================="
echo "🔧 Setting up .env for simulation"
echo "=========================================="
echo ""

# Update .env file (macOS compatible sed)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS sed requires backup extension
    sed -i '' "s|SERVER_IP=YOUR_SERVER_IP|SERVER_IP=${LOCAL_IP}|g" .env
    sed -i '' "s|SECRET_KEY=GENERATE_NEW_SECRET_KEY_MINIMUM_32_CHARACTERS|SECRET_KEY=${SECRET_KEY}|g" .env
    sed -i '' "s|POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|g" .env
    sed -i '' "s|ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD|ADMIN_PASSWORD=${ADMIN_PASSWORD}|g" .env
    sed -i '' "s|CORS_ORIGINS=http://\${SERVER_IP}:3000,http://\${SERVER_IP}:80|CORS_ORIGINS=http://${LOCAL_IP}:3000,http://${LOCAL_IP}:80|g" .env
    sed -i '' "s|NEXT_PUBLIC_API_URL=http://\${SERVER_IP}:8000|NEXT_PUBLIC_API_URL=http://${LOCAL_IP}:8000|g" .env
else
    # Linux sed
    sed -i.bak "s|SERVER_IP=YOUR_SERVER_IP|SERVER_IP=${LOCAL_IP}|g" .env
    sed -i.bak "s|SECRET_KEY=GENERATE_NEW_SECRET_KEY_MINIMUM_32_CHARACTERS|SECRET_KEY=${SECRET_KEY}|g" .env
    sed -i.bak "s|POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|g" .env
    sed -i.bak "s|ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD|ADMIN_PASSWORD=${ADMIN_PASSWORD}|g" .env
    sed -i.bak "s|CORS_ORIGINS=http://\${SERVER_IP}:3000,http://\${SERVER_IP}:80|CORS_ORIGINS=http://${LOCAL_IP}:3000,http://${LOCAL_IP}:80|g" .env
    sed -i.bak "s|NEXT_PUBLIC_API_URL=http://\${SERVER_IP}:8000|NEXT_PUBLIC_API_URL=http://${LOCAL_IP}:8000|g" .env
    rm -f .env.bak
fi

echo "✅ .env file configured!"
echo ""
echo "Configuration:"
echo "  SERVER_IP: ${LOCAL_IP}"
echo "  SECRET_KEY: ${SECRET_KEY:0:20}..."
echo "  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}"
echo "  ADMIN_PASSWORD: ${ADMIN_PASSWORD}"
echo "  ADMIN_EMAIL: admin@kehati.org"
echo ""
echo "⚠️  IMPORTANT: Save these credentials securely!"
echo ""
echo "Next steps:"
echo "  1. Build images in original repo: cd /path/to/tamankehati_new && ./scripts/build-and-push-images.sh"
echo "  2. Update .env with DOCKER_USERNAME and IMAGE_TAG"
echo "  3. Pull and start: docker compose -f docker-compose.pull.yml pull && docker compose -f docker-compose.pull.yml up -d"
echo ""

