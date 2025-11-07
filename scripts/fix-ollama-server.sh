#!/bin/bash
# Script untuk fix Ollama connection di server
# Usage: ./scripts/fix-ollama-server.sh

set -e

echo "=========================================="
echo "🔧 Fix Ollama Connection di Server"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 0. Cek dan fix healthcheck di docker-compose
echo "0️⃣  Checking healthcheck configuration..."
if grep -q 'curl.*11434' docker-compose.pull.no-nginx.yml 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Healthcheck menggunakan curl (tidak tersedia di Ollama container)${NC}"
    echo "   Fixing healthcheck..."
    # Backup
    cp docker-compose.pull.no-nginx.yml docker-compose.pull.no-nginx.yml.backup.$(date +%Y%m%d_%H%M%S)
    # Fix healthcheck
    sed -i 's|test: \["CMD-SHELL", "curl -f http://localhost:11434/api/tags > /dev/null 2>&1"\]|test: ["CMD-SHELL", "ollama list || exit 1"]|g' docker-compose.pull.no-nginx.yml
    echo -e "${GREEN}✅ Healthcheck fixed!${NC}"
    echo "   Restarting Ollama with new healthcheck..."
    docker compose -f docker-compose.pull.no-nginx.yml up -d ollama
    echo "   Waiting 10 seconds for Ollama to restart..."
    sleep 10
else
    echo -e "${GREEN}✅ Healthcheck configuration OK${NC}"
fi

# 1. Cek container Ollama running
echo ""
echo "1️⃣  Checking Ollama container..."
if docker ps | grep -q "tamankehati-ollama-prod"; then
    STATUS=$(docker ps --format "{{.Status}}" --filter "name=tamankehati-ollama-prod")
    if echo "$STATUS" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Ollama container is running and healthy${NC}"
    elif echo "$STATUS" | grep -q "unhealthy"; then
        echo -e "${YELLOW}⚠️  Ollama container is running but unhealthy${NC}"
        echo "   This might be due to healthcheck. Checking logs..."
        docker logs tamankehati-ollama-prod --tail 20
    else
        echo -e "${GREEN}✅ Ollama container is running${NC}"
    fi
else
    echo -e "${RED}❌ Ollama container is NOT running!${NC}"
    echo "   Starting Ollama container..."
    docker compose -f docker-compose.pull.no-nginx.yml up -d ollama
    echo "   Waiting 10 seconds for Ollama to start..."
    sleep 10
fi

# 2. Cek network connectivity
echo ""
echo "2️⃣  Testing network connectivity..."
echo "   Testing from backend container to Ollama..."

# Test dengan service name (recommended)
if docker exec tamankehati-backend-prod curl -s --max-time 5 http://ollama:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connection to http://ollama:11434 (service name) works!${NC}"
    RECOMMENDED_URL="http://ollama:11434"
elif docker exec tamankehati-backend-prod curl -s --max-time 5 http://tamankehati-ollama-prod:11434/api/tags > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Connection to http://tamankehati-ollama-prod:11434 (container name) works${NC}"
    echo -e "${YELLOW}   But service name (ollama) is recommended${NC}"
    RECOMMENDED_URL="http://tamankehati-ollama-prod:11434"
else
    echo -e "${RED}❌ Cannot connect to Ollama from backend container!${NC}"
    echo "   Checking Ollama container logs..."
    docker logs tamankehati-ollama-prod --tail 20
    exit 1
fi

# 3. Cek current OLLAMA_URL di .env
echo ""
echo "3️⃣  Checking current OLLAMA_URL in .env..."
if [ -f .env ]; then
    CURRENT_URL=$(grep "^OLLAMA_URL=" .env | cut -d'=' -f2 | tr -d '"' || echo "")
    if [ -z "$CURRENT_URL" ]; then
        echo -e "${YELLOW}⚠️  OLLAMA_URL not found in .env${NC}"
    else
        echo "   Current OLLAMA_URL: $CURRENT_URL"
    fi
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# 4. Update .env jika perlu
echo ""
echo "4️⃣  Updating .env if needed..."
if [ "$CURRENT_URL" != "$RECOMMENDED_URL" ]; then
    echo -e "${YELLOW}⚠️  OLLAMA_URL mismatch!${NC}"
    echo "   Current: $CURRENT_URL"
    echo "   Recommended: $RECOMMENDED_URL"
    echo ""
    read -p "Update .env to use $RECOMMENDED_URL? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Backup .env
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo "   Backed up .env to .env.backup.*"
        
        # Update OLLAMA_URL
        if grep -q "^OLLAMA_URL=" .env; then
            sed -i "s|^OLLAMA_URL=.*|OLLAMA_URL=$RECOMMENDED_URL|" .env
        else
            echo "OLLAMA_URL=$RECOMMENDED_URL" >> .env
        fi
        echo -e "${GREEN}✅ Updated OLLAMA_URL in .env${NC}"
    else
        echo "   Skipping .env update"
    fi
else
    echo -e "${GREEN}✅ OLLAMA_URL already correct: $CURRENT_URL${NC}"
fi

# 5. Restart backend untuk load environment variable baru
echo ""
echo "5️⃣  Restarting backend container..."
read -p "Restart backend to load new OLLAMA_URL? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose -f docker-compose.pull.no-nginx.yml restart backend
    echo "   Waiting 5 seconds for backend to restart..."
    sleep 5
    echo -e "${GREEN}✅ Backend restarted${NC}"
else
    echo "   Skipping restart (you may need to restart manually)"
fi

# 6. Final test
echo ""
echo "6️⃣  Final connection test..."
echo "   Testing from backend container..."
if docker exec tamankehati-backend-prod curl -s --max-time 5 http://ollama:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connection successful!${NC}"
    echo ""
    echo "   Testing API endpoint..."
    if curl -s --max-time 5 http://localhost:8000/api/v1/ai/test-ollama > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API endpoint responding!${NC}"
    else
        echo -e "${YELLOW}⚠️  API endpoint not responding (may need more time)${NC}"
    fi
else
    echo -e "${RED}❌ Connection failed!${NC}"
    echo "   Please check:"
    echo "   1. Ollama container is running: docker ps | grep ollama"
    echo "   2. Both containers are on same network: docker network inspect tamankehati-network"
    echo "   3. Ollama logs: docker logs tamankehati-ollama-prod --tail 50"
fi

echo ""
echo "=========================================="
echo "✅ Fix script completed!"
echo "=========================================="
echo ""
echo "📝 Summary:"
echo "   - Ollama URL: $RECOMMENDED_URL"
echo "   - Service name: ollama (recommended)"
echo "   - Container name: tamankehati-ollama-prod (alternative)"
echo ""
echo "🔍 To test manually:"
echo "   docker exec tamankehati-backend-prod curl -s http://ollama:11434/api/tags"
echo "   curl http://localhost:8000/api/v1/ai/test-ollama"
echo ""

