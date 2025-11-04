#!/bin/bash
# Verification Script for Taman Kehati Deployment
# This script checks if all services are running correctly

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server IP
SERVER_IP="${SERVER_IP:-38.47.93.167}"
PORT="${PORT:-8080}"

echo "=========================================="
echo "🔍 Taman Kehati Deployment Verification"
echo "=========================================="
echo ""
echo "Server: ${SERVER_IP}:${PORT}"
echo ""

ERRORS=0
WARNINGS=0

# Function to check HTTP endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking ${name}... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "${url}" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ] || [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $response)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check container
check_container() {
    local name=$1
    
    echo -n "Checking container ${name}... "
    
    if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
        status=$(docker ps --format '{{.Status}}' --filter "name=${name}")
        if echo "$status" | grep -q "healthy\|Up"; then
            echo -e "${GREEN}✅ Running${NC} ($status)"
            return 0
        else
            echo -e "${YELLOW}⚠️  Running but not healthy${NC} ($status)"
            WARNINGS=$((WARNINGS + 1))
            return 1
        fi
    else
        echo -e "${RED}❌ Not running${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Check Docker
echo "🔧 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker installed${NC}"
echo ""

# Check Containers
echo "🐳 Checking Containers..."
check_container "tamankehati-postgres-prod"
check_container "tamankehati-redis-prod"
check_container "tamankehati-backend-prod"
check_container "tamankehati-frontend-prod"
echo ""

# Check Health Endpoints
echo "🏥 Checking Health Endpoints..."
check_endpoint "Backend /health" "http://${SERVER_IP}:${PORT}/health"
check_endpoint "Backend /api/health" "http://${SERVER_IP}:${PORT}/api/health"
check_endpoint "Frontend" "http://${SERVER_IP}:${PORT}"
echo ""

# Check API Endpoints
echo "🌐 Checking API Endpoints..."
check_endpoint "Public Stats" "http://${SERVER_IP}:${PORT}/api/public/stats/"
check_endpoint "Public Parks" "http://${SERVER_IP}:${PORT}/api/public/parks?limit=1"
echo ""

# Check Database Connection
echo "🗄️  Checking Database..."
if docker exec tamankehati-postgres-prod pg_isready -U kehati_user -d kehati_db &>/dev/null; then
    echo -e "${GREEN}✅ Database accessible${NC}"
else
    echo -e "${RED}❌ Database not accessible${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check Redis Connection
echo "📦 Checking Redis..."
if docker exec tamankehati-redis-prod redis-cli ping &>/dev/null; then
    echo -e "${GREEN}✅ Redis accessible${NC}"
else
    echo -e "${RED}❌ Redis not accessible${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check Frontend API URL
echo "🔗 Checking Frontend API Configuration..."
if docker exec tamankehati-frontend-prod env | grep -q "NEXT_PUBLIC_API_URL"; then
    api_url=$(docker exec tamankehati-frontend-prod env | grep NEXT_PUBLIC_API_URL | cut -d'=' -f2)
    echo -e "${BLUE}ℹ️  NEXT_PUBLIC_API_URL: ${api_url}${NC}"
    
    if echo "$api_url" | grep -q "localhost:8000"; then
        echo -e "${RED}❌ WARNING: Frontend still using localhost:8000${NC}"
        echo -e "${YELLOW}   You need to rebuild frontend with correct NEXT_PUBLIC_API_URL${NC}"
        WARNINGS=$((WARNINGS + 1))
    elif echo "$api_url" | grep -q "${SERVER_IP}:${PORT}"; then
        echo -e "${GREEN}✅ Frontend API URL configured correctly${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend API URL: ${api_url}${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_API_URL not found in container${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Summary
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo -e "Errors: ${RED}${ERRORS}${NC}"
echo -e "Warnings: ${YELLOW}${WARNINGS}${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ All checks passed! Deployment is healthy.${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Deployment is working but has warnings.${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ Deployment has errors. Please check the issues above.${NC}"
    exit 1
fi
