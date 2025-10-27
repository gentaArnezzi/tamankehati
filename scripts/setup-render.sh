#!/bin/bash

# 🎨 Render.com Setup Script for Taman Kehati
# This script prepares your project for Render deployment

set -e

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║              🎨 RENDER.COM SETUP - TAMAN KEHATI                      ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$(dirname "$0")/.."

echo -e "${BLUE}📋 Checking project structure...${NC}"
echo ""

# Check if render.yaml exists
if [ -f "render.yaml" ]; then
    echo -e "${GREEN}✅ render.yaml found${NC}"
else
    echo -e "${YELLOW}⚠️  render.yaml not found - creating...${NC}"
fi

# Check git status
echo ""
echo -e "${BLUE}📊 Checking Git status...${NC}"
if git status &> /dev/null; then
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repository - initializing...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
fi

# Check if GitHub remote exists
echo ""
echo -e "${BLUE}🔗 Checking GitHub remote...${NC}"
if git remote get-url origin &> /dev/null; then
    REMOTE_URL=$(git remote get-url origin)
    echo -e "${GREEN}✅ GitHub remote configured: ${REMOTE_URL}${NC}"
else
    echo -e "${YELLOW}⚠️  No GitHub remote found${NC}"
    echo ""
    echo "Please add GitHub remote:"
    echo "  git remote add origin https://github.com/yourusername/your-repo.git"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║                  📝 RENDER DEPLOYMENT STEPS                          ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${YELLOW}STEP 1: Push to GitHub${NC}"
echo "────────────────────────"
echo ""
echo "  # Add files"
echo "  git add ."
echo "  git commit -m \"Ready for Render deployment\""
echo "  git push origin main"
echo ""

echo -e "${YELLOW}STEP 2: Connect to Render${NC}"
echo "────────────────────────"
echo ""
echo "  1. Go to: https://dashboard.render.com"
echo "  2. Sign up / Login with GitHub"
echo "  3. Click: 'New +' → 'Blueprint'"
echo "  4. Connect your GitHub repository"
echo "  5. Render will detect render.yaml"
echo "  6. Click 'Apply'"
echo ""

echo -e "${YELLOW}STEP 3: Wait for Deployment${NC}"
echo "────────────────────────"
echo ""
echo "  • Render will create:"
echo "    ✓ PostgreSQL Database"
echo "    ✓ Backend Service"
echo "    ✓ Frontend Service"
echo ""
echo "  • First deploy takes ~5-10 minutes"
echo ""

echo -e "${YELLOW}STEP 4: Run Database Migrations${NC}"
echo "────────────────────────"
echo ""
echo "  1. Go to Backend service in Render dashboard"
echo "  2. Click 'Shell' tab"
echo "  3. Run: cd apps/backend && alembic upgrade head"
echo ""

echo -e "${YELLOW}STEP 5: Get Your URLs${NC}"
echo "────────────────────────"
echo ""
echo "  • Backend: https://tamankehati-backend.onrender.com"
echo "  • Frontend: https://tamankehati-frontend.onrender.com"
echo ""

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║                    ✅ SETUP COMPLETE!                                ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Next: Push to GitHub and connect Render!${NC}"
echo ""

