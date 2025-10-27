#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000/api/v1"
TOKEN=""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           🧪 API ENDPOINTS TESTING                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Login first
echo -e "${BLUE}━━━ Authenticating...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kehati.org","password":"password"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
else
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "Token: ${TOKEN:0:20}..."
fi

# Function to test endpoint
test_endpoint() {
    local METHOD=$1
    local PATH=$2
    local NAME=$3
    local AUTH=${4:-true}
    
    echo ""
    echo -e "${YELLOW}Testing: ${NAME}${NC}"
    
    if [ "$AUTH" = "true" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD "$BASE_URL$PATH" \
          -H "Authorization: Bearer $TOKEN")
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD "$BASE_URL$PATH")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        echo -e "${GREEN}✅${NC} $METHOD $PATH → ${GREEN}$HTTP_CODE${NC}"
        # echo "Response: ${BODY:0:100}..."
    else
        echo -e "${RED}❌${NC} $METHOD $PATH → ${RED}$HTTP_CODE${NC}"
        echo "Error: ${BODY:0:200}"
    fi
}

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}1. AUTHENTICATION ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/auth/me" "Get Current User"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}2. USER MANAGEMENT ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/users" "List Users"
test_endpoint "GET" "/users/me" "Get Current User Profile"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}3. DASHBOARD ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/dashboard" "Dashboard Overview"
test_endpoint "GET" "/dashboard/test" "Dashboard Test"
test_endpoint "GET" "/dashboard/overview-simple" "Dashboard Overview Simple"
test_endpoint "GET" "/dashboard/comprehensive-simple" "Dashboard Comprehensive"
test_endpoint "GET" "/dashboard/activity" "Dashboard Activity"
test_endpoint "GET" "/dashboard/approvals" "Dashboard Approvals"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}4. PARKS ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/parks" "List All Parks"
test_endpoint "GET" "/parks?status=approved" "List Approved Parks"
test_endpoint "GET" "/parks?status=draft" "List Draft Parks"
test_endpoint "GET" "/parks?status=in_review" "List In Review Parks"
test_endpoint "GET" "/parks/public" "List Public Parks" false

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}5. FLORA ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/flora" "List All Flora"
test_endpoint "GET" "/flora?status=approved" "List Approved Flora"
test_endpoint "GET" "/flora/public" "List Public Flora" false

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}6. FAUNA ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/fauna" "List All Fauna"
test_endpoint "GET" "/fauna?status=approved" "List Approved Fauna"
test_endpoint "GET" "/fauna/public" "List Public Fauna" false

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}7. ACTIVITIES ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/activities" "List All Activities"
test_endpoint "GET" "/activities?status=approved" "List Approved Activities"
test_endpoint "GET" "/activities/public" "List Public Activities" false

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}8. ARTICLES ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/articles" "List All Articles"
test_endpoint "GET" "/articles?status=approved" "List Approved Articles"
test_endpoint "GET" "/articles/public" "List Public Articles" false

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}9. NEWS ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/news" "List News (Admin)"
test_endpoint "GET" "/news/public" "List News (Public)" false

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}10. ANNOUNCEMENTS ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/announcements" "List All Announcements"
test_endpoint "GET" "/announcements?status=active" "List Active Announcements"
test_endpoint "GET" "/announcements/public" "List Public Announcements" false

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}11. GALLERIES ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/galleries" "List All Galleries"
test_endpoint "GET" "/galleries/public" "List Public Galleries" false

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}12. APPROVALS ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/approvals" "List Pending Approvals"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}13. NOTIFICATIONS ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/notifications" "List Notifications"
test_endpoint "GET" "/notifications/unread" "List Unread Notifications"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}14. STATISTICS ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "GET" "/statistics" "Get Statistics"
test_endpoint "GET" "/statistics/overview" "Get Statistics Overview"

echo ""
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✅ API ENDPOINTS TESTING COMPLETE                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

