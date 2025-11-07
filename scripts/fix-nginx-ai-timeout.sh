#!/bin/bash
# Script untuk fix 504 Gateway Timeout pada AI endpoints di Nginx
# Usage: ./scripts/fix-nginx-ai-timeout.sh [nginx-config-path]

set -e

echo "=========================================="
echo "🔧 Fix 504 Gateway Timeout untuk AI Endpoints"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detect Nginx config path
if [ -n "$1" ]; then
    NGINX_CONFIG="$1"
else
    # Try to find Nginx config
    if [ -f "/etc/nginx/sites-available/default" ]; then
        NGINX_CONFIG="/etc/nginx/sites-available/default"
    elif [ -f "/etc/nginx/nginx.conf" ]; then
        NGINX_CONFIG="/etc/nginx/nginx.conf"
    elif [ -f "/etc/nginx/conf.d/default.conf" ]; then
        NGINX_CONFIG="/etc/nginx/conf.d/default.conf"
    else
        echo -e "${RED}❌ Nginx config tidak ditemukan!${NC}"
        echo ""
        echo "Usage: $0 [nginx-config-path]"
        echo ""
        echo "Contoh:"
        echo "  $0 /etc/nginx/sites-available/default"
        echo "  $0 /etc/nginx/conf.d/default.conf"
        exit 1
    fi
fi

echo "📝 Nginx config: $NGINX_CONFIG"
echo ""

# Check if file exists
if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${RED}❌ File tidak ditemukan: $NGINX_CONFIG${NC}"
    exit 1
fi

# Backup config
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
echo ""

# Check if AI location block already exists
if grep -q "location ~ \^/api/v1/ai/" "$NGINX_CONFIG"; then
    echo -e "${YELLOW}⚠️  AI location block sudah ada${NC}"
    echo "   Apakah Anda ingin update ulang? (y/n)"
    read -p "   " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Skipping update..."
        exit 0
    fi
    # Remove existing AI location block
    sed -i '/location ~ \^\/api\/v1\/ai\//,/^}/d' "$NGINX_CONFIG"
    echo -e "${GREEN}✅ Removed existing AI location block${NC}"
fi

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
    echo "   Masukkan backend proxy_pass (contoh: http://backend atau http://127.0.0.1:8000):"
    read -p "   " BACKEND_PROXY
fi

echo ""
echo "📝 Backend proxy: $BACKEND_PROXY"
echo ""

# Find server block and insert AI location block BEFORE general /api/ location
if grep -q "location /api/" "$NGINX_CONFIG"; then
    # Insert AI location block before general /api/ location
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
    
    # Insert before first "location /api/" line
    sed -i "/location \/api\//i\\$AI_BLOCK" "$NGINX_CONFIG"
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
    sed -i '/^}$/i\\'"$AI_BLOCK" "$NGINX_CONFIG"
    echo -e "${GREEN}✅ Added AI location block${NC}"
fi

echo ""
echo "=========================================="
echo "✅ Config updated!"
echo "=========================================="
echo ""

# Test Nginx config
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
    echo "   Restore backup: cp $BACKUP_FILE $NGINX_CONFIG"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Fix completed!"
echo "=========================================="
echo ""
echo "📋 Summary:"
echo "   - AI endpoints timeout: 200 detik (dari 60 detik)"
echo "   - Backend timeout: 120s (small) / 180s (large)"
echo "   - Frontend timeout: 190 detik"
echo ""
echo "🔍 To verify:"
echo "   sudo nginx -t"
echo "   sudo systemctl status nginx"
echo "   curl -I http://localhost/api/v1/ai/test-ollama"
echo ""
echo "📝 Backup file: $BACKUP_FILE"
echo ""




