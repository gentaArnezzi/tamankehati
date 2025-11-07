#!/bin/bash
# Script lengkap untuk fix AI lambat & 504 Gateway Timeout di server
# Usage: ./scripts/fix-ai-complete.sh [nginx-config-path]

set -e

echo "=========================================="
echo "🚀 Complete AI Fix: Performance + Timeout"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# PART 1: Fix Ollama Performance Optimization
# =============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PART 1: Optimasi Performance Ollama${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

COMPOSE_FILE="docker-compose.pull.no-nginx.yml"

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ File $COMPOSE_FILE tidak ditemukan!${NC}"
    echo "   Pastikan Anda berada di directory yang benar"
    exit 1
fi

echo "📝 Checking $COMPOSE_FILE..."

# Backup file
BACKUP_COMPOSE="${COMPOSE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$COMPOSE_FILE" "$BACKUP_COMPOSE"
echo -e "${GREEN}✅ Backup created: $BACKUP_COMPOSE${NC}"

# Check if optimization already exists
if grep -q "OLLAMA_NUM_PARALLEL" "$COMPOSE_FILE"; then
    echo -e "${YELLOW}⚠️  Optimasi performance sudah ada${NC}"
    echo "   Apakah Anda ingin update ulang? (y/n)"
    read -p "   " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Skipping Ollama optimization..."
        SKIP_OLLAMA=true
    else
        SKIP_OLLAMA=false
    fi
else
    SKIP_OLLAMA=false
fi

if [ "$SKIP_OLLAMA" = false ]; then
    echo "📝 Updating Ollama performance optimization..."
    
    # Find OLLAMA_MODEL line and add optimization after it
    if grep -q "OLLAMA_MODEL:" "$COMPOSE_FILE"; then
        # Check if we need to add after OLLAMA_MODEL or replace existing
        if ! grep -q "OLLAMA_NUM_PARALLEL" "$COMPOSE_FILE"; then
            # Insert optimization after OLLAMA_MODEL line
            sed -i '/OLLAMA_MODEL:.*/a\      # Performance optimization for server\n      OLLAMA_NUM_PARALLEL: 1  # Limit concurrent requests (1 = faster per request)\n      OLLAMA_MAX_LOADED_MODELS: 1  # Keep only 1 model loaded (faster)\n      OLLAMA_KEEP_ALIVE: 10m  # Keep model in memory for 10 minutes (faster subsequent requests)\n      OLLAMA_NUM_THREAD: 4  # Use 4 CPU threads (match cpus: 4.0)' "$COMPOSE_FILE"
            echo -e "${GREEN}✅ Added Ollama performance optimization${NC}"
        fi
    else
        echo -e "${RED}❌ OLLAMA_MODEL not found in $COMPOSE_FILE${NC}"
        exit 1
    fi
    
    echo ""
    echo "🔄 Restarting Ollama container..."
    docker compose -f "$COMPOSE_FILE" up -d ollama
    echo "   Waiting 10 seconds for Ollama to restart..."
    sleep 10
    
    echo ""
    echo "🔍 Verifying optimization..."
    if docker exec tamankehati-ollama-prod env 2>/dev/null | grep -q "OLLAMA_NUM_PARALLEL=1"; then
        echo -e "${GREEN}✅ Ollama optimization verified!${NC}"
    else
        echo -e "${YELLOW}⚠️  Ollama optimization may not be applied yet (container may need restart)${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Part 1 completed!${NC}"
echo ""

# =============================================================================
# PART 2: Fix Nginx Timeout
# =============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PART 2: Fix Nginx Timeout untuk AI Endpoints${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Detect Nginx config path
if [ -n "$1" ]; then
    NGINX_CONFIG="$1"
else
    # Try to find Nginx config
    if [ -f "/etc/nginx/sites-available/default" ]; then
        NGINX_CONFIG="/etc/nginx/sites-available/default"
    elif [ -f "~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf" ]; then
        NGINX_CONFIG="~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf"
    elif [ -f "/etc/nginx/conf.d/default.conf" ]; then
        NGINX_CONFIG="/etc/nginx/conf.d/default.conf"
    else
        echo -e "${YELLOW}⚠️  Nginx config tidak terdeteksi otomatis${NC}"
        echo ""
        echo "Masukkan path Nginx config:"
        read -p "   " NGINX_CONFIG
    fi
fi

# Expand ~ if present
NGINX_CONFIG="${NGINX_CONFIG/#\~/$HOME}"

echo "📝 Nginx config: $NGINX_CONFIG"
echo ""

# Check if file exists
if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${YELLOW}⚠️  File tidak ditemukan: $NGINX_CONFIG${NC}"
    echo "   Apakah Anda ingin skip Nginx fix? (y/n)"
    read -p "   " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   Skipping Nginx fix..."
        SKIP_NGINX=true
    else
        echo -e "${RED}❌ Exiting...${NC}"
        exit 1
    fi
else
    SKIP_NGINX=false
fi

if [ "$SKIP_NGINX" = false ]; then
    # Backup config
    BACKUP_NGINX="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    sudo cp "$NGINX_CONFIG" "$BACKUP_NGINX"
    echo -e "${GREEN}✅ Backup created: $BACKUP_NGINX${NC}"
    echo ""
    
    # Check if AI location block already exists
    if grep -q "location ~ \^/api/v1/ai/" "$NGINX_CONFIG"; then
        echo -e "${YELLOW}⚠️  AI location block sudah ada${NC}"
        echo "   Apakah Anda ingin update ulang? (y/n)"
        read -p "   " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "   Skipping Nginx update..."
            SKIP_NGINX=true
        else
            # Remove existing AI location block
            sudo sed -i '/location ~ \^\/api\/v1\/ai\//,/^}/d' "$NGINX_CONFIG"
            echo -e "${GREEN}✅ Removed existing AI location block${NC}"
        fi
    fi
    
    if [ "$SKIP_NGINX" = false ]; then
        # Detect backend proxy_pass
        BACKEND_PROXY=""
        if grep -q "proxy_pass http://backend" "$NGINX_CONFIG"; then
            BACKEND_PROXY="http://backend"
        elif grep -q "proxy_pass http://tamankehati-backend-prod" "$NGINX_CONFIG"; then
            BACKEND_PROXY="http://tamankehati-backend-prod:8000"
        elif grep -q "proxy_pass http://127.0.0.1:8000" "$NGINX_CONFIG"; then
            BACKEND_PROXY="http://127.0.0.1:8000"
        elif grep -q "proxy_pass http://localhost:8000" "$NGINX_CONFIG"; then
            BACKEND_PROXY="http://localhost:8000"
        else
            echo -e "${YELLOW}⚠️  Backend proxy_pass tidak terdeteksi${NC}"
            echo "   Masukkan backend proxy_pass (contoh: http://localhost:8000):"
            read -p "   " BACKEND_PROXY
        fi
        
        echo ""
        echo "📝 Backend proxy: $BACKEND_PROXY"
        echo ""
        
        # Find server block and insert AI location block BEFORE general /api/ location
        if grep -q "location /api/" "$NGINX_CONFIG"; then
            # Insert AI location block before first "location /api/" line
            AI_BLOCK="    # AI endpoints with extended timeout (fix 504 Gateway Timeout)
    # ⚠️ PENTING: Letakkan SEBELUM location /api/ yang umum (lebih spesifik)
    location ~ ^/api/v1/ai/ {
        proxy_pass $BACKEND_PROXY;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Extended timeouts for AI generation (backend: 120s-180s)
        proxy_connect_timeout 200s;
        proxy_send_timeout 200s;
        proxy_read_timeout 200s;  # PENTING: harus lebih lama dari backend timeout
        
        # Buffers
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 16 8k;
        proxy_busy_buffers_size 16k;
    }
    
"
            
            # Insert before first "location /api/" line
            sudo sed -i "/location \/api\//i\\$AI_BLOCK" "$NGINX_CONFIG"
            echo -e "${GREEN}✅ Added AI location block with extended timeout${NC}"
        else
            echo -e "${YELLOW}⚠️  location /api/ tidak ditemukan${NC}"
            echo "   Menambahkan AI location block di akhir server block..."
            
            # Find server block closing brace and insert before it
            AI_BLOCK="    # AI endpoints with extended timeout (fix 504 Gateway Timeout)
    location ~ ^/api/v1/ai/ {
        proxy_pass $BACKEND_PROXY;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Extended timeouts for AI generation (backend: 120s-180s)
        proxy_connect_timeout 200s;
        proxy_send_timeout 200s;
        proxy_read_timeout 200s;  # PENTING: harus lebih lama dari backend timeout
        
        # Buffers
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 16 8k;
        proxy_busy_buffers_size 16k;
    }
    
"
            
            # Insert before last closing brace of server block
            sudo sed -i '/^}$/i\\'"$AI_BLOCK" "$NGINX_CONFIG"
            echo -e "${GREEN}✅ Added AI location block${NC}"
        fi
        
        echo ""
        echo "🧪 Testing Nginx configuration..."
        if sudo nginx -t 2>/dev/null; then
            echo -e "${GREEN}✅ Nginx config valid!${NC}"
            echo ""
            echo "🔄 Reload Nginx? (y/n)"
            read -p "   " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                sudo systemctl reload nginx
                echo -e "${GREEN}✅ Nginx reloaded!${NC}"
            else
                echo "   Reload manually: sudo systemctl reload nginx"
            fi
        else
            echo -e "${RED}❌ Nginx config invalid!${NC}"
            echo "   Please check the config manually"
            echo "   Restore backup: sudo cp $BACKUP_NGINX $NGINX_CONFIG"
            exit 1
        fi
    fi
fi

echo ""
echo -e "${GREEN}✅ Part 2 completed!${NC}"
echo ""

# =============================================================================
# Summary
# =============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Complete AI Fix Finished!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Summary:"
echo ""
echo "✅ Part 1: Ollama Performance Optimization"
echo "   - OLLAMA_NUM_PARALLEL: 1"
echo "   - OLLAMA_MAX_LOADED_MODELS: 1"
echo "   - OLLAMA_KEEP_ALIVE: 10m"
echo "   - OLLAMA_NUM_THREAD: 4"
echo "   - Expected: AI generation 60-90s → 15-30s (50-70% faster)"
echo ""
if [ "$SKIP_NGINX" = false ]; then
    echo "✅ Part 2: Nginx Timeout Fix"
    echo "   - AI endpoints timeout: 200 detik (dari 60 detik)"
    echo "   - Backend timeout: 120s (small) / 180s (large)"
    echo "   - Expected: No more 504 Gateway Timeout"
    echo ""
fi
echo "📝 Backup files:"
echo "   - Docker Compose: $BACKUP_COMPOSE"
if [ "$SKIP_NGINX" = false ]; then
    echo "   - Nginx Config: $BACKUP_NGINX"
fi
echo ""
echo "🔍 To verify:"
echo "   # Check Ollama optimization"
echo "   docker exec tamankehati-ollama-prod env | grep OLLAMA"
echo ""
if [ "$SKIP_NGINX" = false ]; then
    echo "   # Check Nginx config"
    echo "   sudo nginx -t"
    echo "   sudo grep -A 20 'location ~ \^/api/v1/ai/' $NGINX_CONFIG"
    echo ""
fi
echo "   # Test AI endpoint"
echo "   curl -I http://localhost/api/v1/ai/test-ollama"
echo ""
echo "🎯 Expected Result:"
echo "   - AI generation: 15-30 detik (dari 60-90 detik)"
echo "   - No 504 Gateway Timeout"
echo "   - Better user experience"
echo ""

