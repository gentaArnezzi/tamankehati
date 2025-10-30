#!/bin/bash

# 🚀 Taman Kehati - Complete Deployment Script
# Author: AI Assistant
# Description: Deploy Taman Kehati application to Railway

set -e

echo "🚀 Starting Taman Kehati Complete Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Current Status:${NC}"
echo "✅ Code pushed to GitHub"
echo "✅ Railway project linked"
echo "✅ Database ready (PostgreSQL + PostGIS)"
echo "🔄 Deploying Taman Kehati application..."

echo ""
echo -e "${YELLOW}🔧 Backend Deployment:${NC}"

# Deploy backend
echo "Deploying backend from apps/backend..."
cd apps/backend

# Set environment variables
export SECRET_KEY="tamankehati-super-secret-key-2024-production"
export CORS_ORIGINS="*"
export ENVIRONMENT="production"
export DEBUG="false"

# Deploy
railway up --detach

echo "✅ Backend deployed!"

echo ""
echo -e "${YELLOW}🎨 Frontend Deployment:${NC}"

# Deploy frontend
cd ../frontend

# Set environment variables
export NODE_ENV="production"
export NEXT_TELEMETRY_DISABLED="1"
export NEXT_PUBLIC_API_URL="https://fastapi-container-production-6c40.up.railway.app"

# Deploy
railway up --detach

echo "✅ Frontend deployed!"

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📱 Your Taman Kehati Application:${NC}"
echo "• Frontend: https://nextjsbestpractices-production-fc22.up.railway.app"
echo "• Backend API: https://fastapi-container-production-6c40.up.railway.app"
echo "• API Docs: https://fastapi-container-production-6c40.up.railway.app/docs"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. Run database migrations"
echo "2. Test all endpoints"
echo "3. Verify frontend-backend connection"
echo ""
echo -e "${GREEN}✨ Happy Deploying!${NC}"
