#!/bin/bash
# Script untuk update optimasi performance Ollama di docker-compose server
# Usage: ./scripts/update-ollama-performance.sh

set -e

echo "=========================================="
echo "🚀 Update Ollama Performance Optimization"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

COMPOSE_FILE="docker-compose.pull.no-nginx.yml"

# Cek file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ File $COMPOSE_FILE tidak ditemukan!${NC}"
    exit 1
fi

# Backup file
BACKUP_FILE="${COMPOSE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$COMPOSE_FILE" "$BACKUP_FILE"
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
echo ""

# Cek apakah sudah ada optimasi
if grep -q "OLLAMA_NUM_PARALLEL" "$COMPOSE_FILE"; then
    echo -e "${YELLOW}⚠️  Optimasi performance sudah ada di file${NC}"
    echo "   Apakah Anda ingin update ulang? (y/n)"
    read -p "   " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Skipping update..."
        exit 0
    fi
fi

echo "📝 Updating Ollama service configuration..."
echo ""

# Update environment variables untuk Ollama service
# Cari section ollama dan tambahkan environment variables untuk performance

# Method 1: Gunakan sed untuk insert setelah OLLAMA_MODEL
if grep -q "OLLAMA_MODEL:" "$COMPOSE_FILE"; then
    # Cek apakah sudah ada OLLAMA_NUM_PARALLEL
    if ! grep -q "OLLAMA_NUM_PARALLEL" "$COMPOSE_FILE"; then
        # Insert setelah OLLAMA_MODEL line
        sed -i '/OLLAMA_MODEL:.*/a\      # Performance optimization for server\n      OLLAMA_NUM_PARALLEL: 1  # Limit concurrent requests (1 = faster per request)\n      OLLAMA_MAX_LOADED_MODELS: 1  # Keep only 1 model loaded (faster)\n      OLLAMA_KEEP_ALIVE: 10m  # Keep model in memory for 10 minutes (faster subsequent requests)\n      OLLAMA_NUM_THREAD: 4  # Use 4 CPU threads (match cpus: 4.0)' "$COMPOSE_FILE"
        echo -e "${GREEN}✅ Added performance optimization environment variables${NC}"
    else
        echo -e "${YELLOW}⚠️  Performance optimization already exists${NC}"
    fi
else
    echo -e "${RED}❌ OLLAMA_MODEL not found in $COMPOSE_FILE${NC}"
    echo "   Please check the file structure"
    exit 1
fi

# Update healthcheck jika masih menggunakan curl
if grep -q 'curl.*11434' "$COMPOSE_FILE"; then
    echo ""
    echo "🔧 Fixing healthcheck (replacing curl with ollama list)..."
    sed -i 's|test: \["CMD-SHELL", "curl -f http://localhost:11434/api/tags > /dev/null 2>&1"\]|test: ["CMD-SHELL", "ollama list || exit 1"]|g' "$COMPOSE_FILE"
    sed -i 's|test: \["CMD", "curl", "-f", "http://localhost:11434/api/tags"\]|test: ["CMD-SHELL", "ollama list || exit 1"]|g' "$COMPOSE_FILE"
    echo -e "${GREEN}✅ Healthcheck fixed${NC}"
fi

# Update start_period jika kurang dari 120s
if grep -q "start_period:" "$COMPOSE_FILE"; then
    CURRENT_START_PERIOD=$(grep -A 1 "healthcheck:" "$COMPOSE_FILE" | grep "start_period:" | sed 's/.*start_period: *\([0-9]*\).*/\1/' || echo "")
    if [ -n "$CURRENT_START_PERIOD" ] && [ "$CURRENT_START_PERIOD" -lt 120 ]; then
        echo ""
        echo "🔧 Updating start_period to 120s..."
        sed -i 's/start_period: [0-9]*s/start_period: 120s/g' "$COMPOSE_FILE"
        echo -e "${GREEN}✅ start_period updated to 120s${NC}"
    fi
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Update completed!${NC}"
echo "=========================================="
echo ""
echo "📋 Changes made:"
echo "   1. Added OLLAMA_NUM_PARALLEL: 1"
echo "   2. Added OLLAMA_MAX_LOADED_MODELS: 1"
echo "   3. Added OLLAMA_KEEP_ALIVE: 10m"
echo "   4. Added OLLAMA_NUM_THREAD: 4"
echo "   5. Fixed healthcheck (if needed)"
echo "   6. Updated start_period to 120s (if needed)"
echo ""
echo "📝 Next steps:"
echo "   1. Review changes: diff $BACKUP_FILE $COMPOSE_FILE"
echo "   2. Restart Ollama: docker compose -f $COMPOSE_FILE up -d ollama"
echo "   3. Check status: docker ps | grep ollama"
echo "   4. Check logs: docker logs tamankehati-ollama-prod --tail 50"
echo ""
echo "🔍 To verify optimization:"
echo "   docker exec tamankehati-ollama-prod env | grep OLLAMA"
echo ""




