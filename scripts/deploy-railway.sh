#!/bin/bash

# 🚂 Railway Deployment Script for Taman Kehati Backend
# Usage: ./scripts/deploy-railway.sh

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║              🚂 RAILWAY DEPLOYMENT AUTOMATION                        ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if logged in
echo -e "${BLUE}🔍 Checking Railway authentication...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Railway${NC}"
    echo -e "${YELLOW}Please run: railway login${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Logged in to Railway${NC}"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../apps/backend" || exit 1
echo -e "${BLUE}📁 Working directory: $(pwd)${NC}"
echo ""

# Check if project exists
echo -e "${BLUE}🔍 Checking for existing Railway project...${NC}"
if [ ! -f ".railway.json" ]; then
    echo -e "${YELLOW}⚠️  No Railway project found. Initializing new project...${NC}"
    railway init
    echo ""
fi
echo -e "${GREEN}✅ Railway project configured${NC}"
echo ""

# Add PostgreSQL if not exists
echo -e "${BLUE}🗄️  Checking PostgreSQL database...${NC}"
echo -e "${YELLOW}Adding PostgreSQL database (if not exists)...${NC}"
railway add --database postgres 2>/dev/null || echo -e "${GREEN}✅ PostgreSQL already exists${NC}"
echo ""

# Generate secret key
echo -e "${BLUE}🔐 Generating SECRET_KEY...${NC}"
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
echo -e "${GREEN}✅ Secret key generated${NC}"
echo ""

# Set environment variables
echo -e "${BLUE}⚙️  Setting environment variables...${NC}"

railway variables set SECRET_KEY="$SECRET_KEY"
echo -e "${GREEN}  ✓ SECRET_KEY${NC}"

railway variables set CORS_ORIGINS="*"
echo -e "${GREEN}  ✓ CORS_ORIGINS${NC}"

railway variables set OLLAMA_BASE_URL="http://localhost:11434"
echo -e "${GREEN}  ✓ OLLAMA_BASE_URL${NC}"

railway variables set PYTHON_VERSION="3.10"
echo -e "${GREEN}  ✓ PYTHON_VERSION${NC}"

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Deploy
echo -e "${BLUE}🚀 Deploying to Railway...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"
echo ""

railway up --detach

echo ""
echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo ""

# Wait for deployment
echo -e "${BLUE}⏳ Waiting for deployment to complete...${NC}"
sleep 10

# Get deployment URL
echo ""
echo -e "${BLUE}🌐 Getting deployment URL...${NC}"
RAILWAY_URL=$(railway domain 2>/dev/null || echo "Not yet assigned")
echo -e "${GREEN}Backend URL: ${RAILWAY_URL}${NC}"
echo ""

# Run migrations
echo -e "${BLUE}📊 Running database migrations...${NC}"
railway run alembic upgrade head
echo -e "${GREEN}✅ Migrations completed${NC}"
echo ""

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║                    🎉 DEPLOYMENT COMPLETE!                           ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}📝 Next Steps:${NC}"
echo ""
echo "1. Check deployment status:"
echo -e "   ${BLUE}railway status${NC}"
echo ""
echo "2. View logs:"
echo -e "   ${BLUE}railway logs${NC}"
echo ""
echo "3. Open Railway dashboard:"
echo -e "   ${BLUE}railway open${NC}"
echo ""
echo "4. Get your backend URL:"
echo -e "   ${BLUE}railway domain${NC}"
echo ""
echo "5. Update frontend .env.local with backend URL:"
echo -e "   ${YELLOW}NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app${NC}"
echo ""
echo -e "${GREEN}✨ Happy deploying!${NC}"
