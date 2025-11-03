#!/bin/bash
# Quick Start Deployment Script - Step by Step Guide
# This script helps you through the deployment process

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "🚀 Taman Kehati - Deployment Quick Start"
echo "=========================================="
echo ""

# Step 1: Set Environment Variables
echo "Step 1.2.1: Setting up environment variables..."
echo ""
read -p "Enter your Docker Hub username [arnezzi]: " DOCKER_USERNAME
DOCKER_USERNAME=${DOCKER_USERNAME:-arnezzi}

read -p "Enter image tag version [v1.0.0]: " IMAGE_TAG
IMAGE_TAG=${IMAGE_TAG:-v1.0.0}

echo ""
echo "Configuration:"
echo "  Docker Hub Username: $DOCKER_USERNAME"
echo "  Image Tag: $IMAGE_TAG"
echo ""

# Export variables
export DOCKER_USERNAME=$DOCKER_USERNAME
export IMAGE_TAG=$IMAGE_TAG

# Save to .env.deploy for reference
cat > .env.deploy << EOF
DOCKER_USERNAME=$DOCKER_USERNAME
IMAGE_TAG=$IMAGE_TAG
EOF

echo "✅ Environment variables set!"
echo ""

# Step 2: Verify Docker Login
echo "Step 1.2.2: Verifying Docker Hub login..."
if docker info 2>&1 | grep -q "Username"; then
    echo "✅ Docker is logged in"
else
    echo "⚠️  Docker login not detected. Please run: docker login"
    read -p "Press Enter after you've logged in..." 
fi

# Step 3: Build and Push
echo ""
echo "Step 1.2.3: Ready to build and push images..."
echo ""
read -p "Do you want to proceed with build and push? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting build process..."
    echo "This may take 10-15 minutes..."
    echo ""
    
    ./scripts/build-and-push-images.sh
    
    echo ""
    echo "✅ Build and push completed!"
    echo ""
    echo "Next steps:"
    echo "  1. Copy these values to server .env file:"
    echo "     DOCKER_USERNAME=$DOCKER_USERNAME"
    echo "     IMAGE_TAG=$IMAGE_TAG"
    echo ""
    echo "  2. Continue with server preparation (Phase 2)"
else
    echo "Build cancelled. Run this script again when ready."
fi

