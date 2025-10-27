#!/bin/bash

BASE_URL="http://localhost:8000"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Testing News Endpoint..."
echo ""

# Get Super Admin Token
echo "1. Getting Super Admin token..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@kehati.org","password":"password"}')

TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Failed to get token${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Got token: ${TOKEN:0:30}...${NC}"
echo ""

# Test GET /api/v1/news/
echo "2. Testing GET /api/v1/news/ ..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/news/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/news/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

echo "   Status: $STATUS"

if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ GET /api/v1/news/ → 200 OK${NC}"
    
    # Parse response
    TOTAL=$(echo "$RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "   Total news items: $TOTAL"
    
    # Show first 200 chars of response
    echo "   Response preview:"
    echo "$RESPONSE" | head -c 200
    echo "..."
else
    echo -e "${RED}✗ GET /api/v1/news/ → $STATUS${NC}"
    echo "   Response:"
    echo "$RESPONSE"
fi

echo ""

# Test GET /api/v1/news/public
echo "3. Testing GET /api/v1/news/public (no auth required)..."
PUBLIC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/news/public")

if [ "$PUBLIC_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ GET /api/v1/news/public → 200 OK${NC}"
else
    echo -e "${RED}✗ GET /api/v1/news/public → $PUBLIC_STATUS${NC}"
fi

echo ""
echo "Test complete!"
