#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000"

echo "======================================"
echo "  BACKEND API ENDPOINT TESTING"
echo "======================================"
echo ""

# Login and get tokens
echo "1. AUTHENTICATION"
echo "=================="

echo -n "Super Admin Login... "
SUPER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kehati.org","password":"password"}')
TOKEN_SUPER=$(echo $SUPER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)
if [ ! -z "$TOKEN_SUPER" ]; then
  echo -e "${GREEN}✓ SUCCESS${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "Regional Admin Login (Kaltim)... "
REGIONAL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"kaltim.admin@kehati.org","password":"password"}')
TOKEN_REGIONAL=$(echo $REGIONAL_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)
if [ ! -z "$TOKEN_REGIONAL" ]; then
  echo -e "${GREEN}✓ SUCCESS${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

echo ""
echo "2. DASHBOARD ENDPOINTS"
echo "======================"

echo -n "Super Admin Dashboard... "
DASH_SUPER=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/dashboard/" \
  -H "Authorization: Bearer $TOKEN_SUPER")
HTTP_CODE=$(echo "$DASH_SUPER" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo -n "Regional Admin Dashboard... "
DASH_REGIONAL=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/dashboard/" \
  -H "Authorization: Bearer $TOKEN_REGIONAL")
HTTP_CODE=$(echo "$DASH_REGIONAL" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo ""
echo "3. PARKS (TAMAN) ENDPOINTS"
echo "=========================="

echo -n "List Parks (Super Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/crud/parks/" \
  -H "Authorization: Bearer $TOKEN_SUPER")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo -n "List Parks (Regional Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/crud/parks/" \
  -H "Authorization: Bearer $TOKEN_REGIONAL")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo -n "Create Park (Regional Admin)... "
CREATE_PARK=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/crud/parks/" \
  -H "Authorization: Bearer $TOKEN_REGIONAL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Park API Audit",
    "region_id": 1,
    "area_ha": 250.5,
    "description": "Test park for API audit"
  }')
HTTP_CODE=$(echo "$CREATE_PARK" | tail -n1)
PARK_ID=$(echo "$CREATE_PARK" | head -n -1 | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
if [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✓ 201 CREATED (ID: $PARK_ID)${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

if [ ! -z "$PARK_ID" ]; then
  echo -n "Get Park by ID... "
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/crud/parks/$PARK_ID" \
    -H "Authorization: Bearer $TOKEN_REGIONAL")
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ 200 OK${NC}"
  else
    echo -e "${RED}✗ $HTTP_CODE${NC}"
  fi

  echo -n "Update Park... "
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/v1/crud/parks/$PARK_ID" \
    -H "Authorization: Bearer $TOKEN_REGIONAL" \
    -H "Content-Type: application/json" \
    -d '{"name": "Test Park API Audit (Updated)", "area_ha": 300.0}')
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ 200 OK${NC}"
  else
    echo -e "${RED}✗ $HTTP_CODE${NC}"
  fi
fi

echo ""
echo "4. FLORA ENDPOINTS"
echo "=================="

echo -n "List Flora (Super Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/flora/?limit=10" \
  -H "Authorization: Bearer $TOKEN_SUPER")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo -n "List Flora (Regional Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/flora/?limit=10" \
  -H "Authorization: Bearer $TOKEN_REGIONAL")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo ""
echo "5. FAUNA ENDPOINTS"
echo "=================="

echo -n "List Fauna (Super Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/fauna/?limit=10" \
  -H "Authorization: Bearer $TOKEN_SUPER")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo -n "List Fauna (Regional Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/fauna/?limit=10" \
  -H "Authorization: Bearer $TOKEN_REGIONAL")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo ""
echo "6. ACTIVITIES ENDPOINTS"
echo "======================="

echo -n "List Activities (Super Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/activities/?limit=10" \
  -H "Authorization: Bearer $TOKEN_SUPER")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo -n "List Activities (Regional Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/activities/?limit=10" \
  -H "Authorization: Bearer $TOKEN_REGIONAL")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo ""
echo "7. ARTICLES ENDPOINTS"
echo "====================="

echo -n "List Articles (Super Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/articles/?limit=10" \
  -H "Authorization: Bearer $TOKEN_SUPER")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo -n "List Articles (Regional Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/articles/?limit=10" \
  -H "Authorization: Bearer $TOKEN_REGIONAL")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo ""
echo "8. GALLERIES ENDPOINTS"
echo "======================"

echo -n "List Galleries (Super Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/galleries/?limit=10" \
  -H "Authorization: Bearer $TOKEN_SUPER")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo -n "List Galleries (Regional Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/galleries/?limit=10" \
  -H "Authorization: Bearer $TOKEN_REGIONAL")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo ""
echo "9. APPROVALS ENDPOINT"
echo "====================="

echo -n "List Approvals (Super Admin)... "
APPROVALS=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/approvals/?limit=50" \
  -H "Authorization: Bearer $TOKEN_SUPER")
HTTP_CODE=$(echo "$APPROVALS" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  TOTAL=$(echo "$APPROVALS" | head -n -1 | python3 -c "import sys, json; print(json.load(sys.stdin).get('total', 0))" 2>/dev/null)
  TAMAN_COUNT=$(echo "$APPROVALS" | head -n -1 | python3 -c "import sys, json; print(json.load(sys.stdin).get('counts', {}).get('taman', 0))" 2>/dev/null)
  echo -e "${GREEN}✓ 200 OK (Total: $TOTAL, Taman: $TAMAN_COUNT)${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo -n "List Approvals (Regional Admin)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/approvals/?limit=50" \
  -H "Authorization: Bearer $TOKEN_REGIONAL")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo ""
echo "10. REGIONS ENDPOINTS"
echo "====================="

echo -n "List Regions (Public)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/public/stats/regions")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo -n "Get Region by Code (KALTIM)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/public/stats/regions/KALTIM")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 200 OK${NC}"
else
  echo -e "${RED}✗ $HTTP_CODE${NC}"
fi

echo ""
echo "======================================"
echo "  TESTING COMPLETE"
echo "======================================"

