#!/bin/bash

# 🚂 Taman Kehati Railway Deployment Script
# Author: AI Assistant
# Description: Automated deployment to Railway.app

set -e

echo "🚀 Starting Taman Kehati deployment to Railway..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Please login to Railway first:${NC}"
    railway login
fi

echo -e "${BLUE}📋 Deployment Steps:${NC}"
echo "1. ✅ Code pushed to GitHub"
echo "2. 🔧 Railway configuration files created"
echo "3. 🚀 Ready to deploy!"

echo ""
echo -e "${GREEN}🎯 Next Steps:${NC}"
echo "1. Go to https://railway.app"
echo "2. Click 'New Project' → 'Deploy from GitHub repo'"
echo "3. Select 'tamankehati' repository"
echo "4. Railway will auto-detect the services"
echo ""
echo -e "${BLUE}📝 Manual Configuration:${NC}"
echo ""
echo -e "${YELLOW}Backend Service:${NC}"
echo "• Root Directory: apps/backend"
echo "• Build Command: pip install -r requirements.txt"
echo "• Start Command: uvicorn main:app --host 0.0.0.0 --port \$PORT"
echo "• Environment Variables:"
echo "  - SECRET_KEY: (generate random string)"
echo "  - CORS_ORIGINS: *"
echo "  - ENVIRONMENT: production"
echo ""
echo -e "${YELLOW}Frontend Service:${NC}"
echo "• Root Directory: apps/frontend"
echo "• Build Command: npm install && npm run build"
echo "• Start Command: npm start"
echo "• Environment Variables:"
echo "  - NEXT_PUBLIC_API_URL: (your backend URL)"
echo "  - NODE_ENV: production"
echo ""
echo -e "${YELLOW}Database:${NC}"
echo "• Add PostgreSQL database"
echo "• Railway will auto-inject DATABASE_URL"
echo ""
echo -e "${GREEN}✨ After deployment, run migrations:${NC}"
echo "railway run --service backend python -m alembic upgrade head"
echo ""
echo -e "${BLUE}🔗 Your app will be available at:${NC}"
echo "• Frontend: https://your-project-name.up.railway.app"
echo "• Backend API: https://your-backend-name.up.railway.app"
echo ""
echo -e "${GREEN}🎉 Happy Deploying!${NC}"
