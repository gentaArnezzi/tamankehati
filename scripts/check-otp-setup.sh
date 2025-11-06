#!/bin/bash
# Check OTP Setup Status
# This script verifies if OTP is properly configured

echo "🔍 Checking OTP Setup Status"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Database Migration
echo "1️⃣  Checking Database Migration..."
cd apps/backend 2>/dev/null || { echo "❌ apps/backend directory not found"; exit 1; }

if command -v alembic &> /dev/null; then
    CURRENT_REV=$(alembic current 2>/dev/null | grep -oP '\(head\)|\([a-f0-9]+\)' | head -1)
    if [ -n "$CURRENT_REV" ]; then
        echo -e "${GREEN}✅ Alembic migration system found${NC}"
        echo "   Current revision: $CURRENT_REV"
        
        # Check if OTP migration exists
        if grep -q "add_otp_table" migrations/versions/*.py 2>/dev/null; then
            echo -e "${GREEN}✅ OTP migration file found${NC}"
        else
            echo -e "${YELLOW}⚠️  OTP migration file not found${NC}"
            echo "   Run: alembic revision -m 'add_otp_table'"
        fi
    else
        echo -e "${YELLOW}⚠️  No active migration found${NC}"
        echo "   Run: alembic upgrade head"
    fi
else
    echo -e "${RED}❌ Alembic not found${NC}"
    echo "   Install: pip install alembic"
fi

echo ""

# Check 2: Environment Variables
echo "2️⃣  Checking Environment Variables..."
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
    
    # Check SMTP config
    if grep -q "SMTP_HOST" "$ENV_FILE"; then
        SMTP_HOST=$(grep "^SMTP_HOST=" "$ENV_FILE" | cut -d'=' -f2)
        SMTP_USER=$(grep "^SMTP_USER=" "$ENV_FILE" | cut -d'=' -f2)
        SMTP_PASSWORD=$(grep "^SMTP_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2)
        
        if [ -n "$SMTP_HOST" ] && [ -n "$SMTP_USER" ] && [ -n "$SMTP_PASSWORD" ]; then
            echo -e "${GREEN}✅ SMTP configuration found${NC}"
            echo "   Host: $SMTP_HOST"
            echo "   User: $SMTP_USER"
        else
            echo -e "${YELLOW}⚠️  SMTP configuration incomplete${NC}"
            echo "   Run: bash scripts/setup-otp-env.sh"
        fi
    else
        echo -e "${RED}❌ SMTP configuration not found${NC}"
        echo "   Run: bash scripts/setup-otp-env.sh"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Create apps/backend/.env file"
fi

echo ""

# Check 3: Python Files
echo "3️⃣  Checking Python Files..."
cd ../..

if [ -f "apps/backend/users/models_otp.py" ]; then
    echo -e "${GREEN}✅ OTP model found${NC}"
else
    echo -e "${RED}❌ OTP model not found${NC}"
fi

if [ -f "apps/backend/users/services/otp_service.py" ]; then
    echo -e "${GREEN}✅ OTP service found${NC}"
else
    echo -e "${RED}❌ OTP service not found${NC}"
fi

if [ -f "apps/backend/users/services/email_service.py" ]; then
    echo -e "${GREEN}✅ Email service found${NC}"
else
    echo -e "${RED}❌ Email service not found${NC}"
fi

echo ""

# Check 4: Frontend Files
echo "4️⃣  Checking Frontend Files..."
if [ -f "apps/frontend/src/app/login/page.tsx" ]; then
    if grep -q "requiresOTP" "apps/frontend/src/app/login/page.tsx"; then
        echo -e "${GREEN}✅ Frontend OTP integration found${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend OTP integration may be incomplete${NC}"
    fi
else
    echo -e "${RED}❌ Login page not found${NC}"
fi

echo ""

# Summary
echo "============================"
echo "📋 Summary:"
echo ""
echo "Next steps:"
echo "1. Run database migration:"
echo "   cd apps/backend && alembic upgrade head"
echo ""
echo "2. Configure SMTP (if not done):"
echo "   bash scripts/setup-otp-env.sh"
echo ""
echo "3. Test SMTP connection:"
echo "   python scripts/test-smtp.py"
echo ""
echo "4. Test OTP flow:"
echo "   - Start backend: cd apps/backend && uvicorn main:app --reload"
echo "   - Start frontend: cd apps/frontend && npm run dev"
echo "   - Open: http://localhost:3000/login"
echo ""

