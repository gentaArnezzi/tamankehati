#!/bin/bash
#
# Quick Backend API Endpoint Test Script
# Usage: ./test_endpoints.sh
#

BASE_URL="${API_URL:-http://localhost:8000}"

echo "========================================================"
echo "   🧪 Backend API Quick Test"
echo "========================================================"
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test function
test_get() {
    local name="$1"
    local endpoint="$2"
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    if [ "$http_code" = "200" ]; then
        echo -e "  ${GREEN}✅${NC} $name [$http_code]"
    else
        echo -e "  ${RED}❌${NC} $name [$http_code]"
    fi
}

echo "=== Health Checks ==="
test_get "Health" "/health"
test_get "Healthz" "/healthz"
echo ""

echo "=== Public API ==="
test_get "Parks List" "/api/public/parks/"
test_get "Park Detail (ID 33)" "/api/public/parks/33"
test_get "Flora" "/api/public/flora/"
test_get "Fauna" "/api/public/fauna/"
test_get "Stats" "/api/public/stats/"
test_get "Artikel" "/api/public/artikel/"
test_get "Galeri" "/api/public/galeri/"
echo ""

echo "=== Specific Park Data (ID 33) ==="
curl -s "$BASE_URL/api/public/parks/33" | python3 -c "
import sys, json
try:
    park = json.load(sys.stdin)
    print(f'  Name: {park.get(\"name\")}')
    print(f'  Status: {park.get(\"status\")}')
    print(f'  Pengelola: {park.get(\"pengelola\") or \"NULL\"}')
    print(f'  SK: {park.get(\"sk_penetapan\") or \"NULL\"}')
    print(f'  Ekoregion: {park.get(\"tipe_ekoregion\") or \"NULL\"}')
except:
    print('  ❌ Error parsing response')
" 2>/dev/null || echo "  ❌ Failed to fetch"
echo ""

echo "========================================================"
echo "   ✅ Test Complete"
echo "========================================================"

