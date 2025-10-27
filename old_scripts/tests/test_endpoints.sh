#!/bin/bash

# Comprehensive Endpoint Testing Script
# Tests all API endpoints after database schema changes

BASE_URL="http://localhost:8000"
API_PREFIX="/api/v1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
PASSED=0
FAILED=0

# Test credentials
EMAIL="admin@kehati.com"
PASSWORD="admin123"

echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║                   🧪 COMPREHENSIVE ENDPOINT TESTING                          ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Base URL: ${BASE_URL}${NC}"
echo -e "${BOLD}Timestamp: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local path=$2
    local name=$3
    local auth_required=${4:-true}
    
    TOTAL=$((TOTAL + 1))
    
    local url="${BASE_URL}${API_PREFIX}${path}"
    local status_code
    
    if [ "$auth_required" = "true" ] && [ -n "$TOKEN" ]; then
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "$url" 2>/dev/null)
    else
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            "$url" 2>/dev/null)
    fi
    
    if [ "$status_code" -eq 200 ] || [ "$status_code" -eq 201 ]; then
        echo -e "${GREEN}✅${NC} $method $(printf '%-50s' "$path") → ${GREEN}$status_code${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌${NC} $method $(printf '%-50s' "$path") → ${RED}$status_code${NC}"
        FAILED=$((FAILED + 1))
    fi
}

# Function to print category
print_category() {
    echo ""
    echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${BLUE}  $1${NC}"
    echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. LOGIN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${BLUE}━━━ Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" 2>/dev/null)

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    echo -e "   Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo -e "   Response: $LOGIN_RESPONSE"
    echo -e "\n${YELLOW}⚠️  Cannot proceed without authentication${NC}"
    exit 1
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. AUTHENTICATION ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "1. AUTHENTICATION ENDPOINTS"

test_endpoint "GET" "/auth/me" "Get Current User"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. USER MANAGEMENT ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "2. USER MANAGEMENT ENDPOINTS"

test_endpoint "GET" "/users" "List Users"
test_endpoint "GET" "/users/me/debug" "Debug Current User"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. DASHBOARD ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "3. DASHBOARD ENDPOINTS"

test_endpoint "GET" "/dashboard" "Dashboard Overview"
test_endpoint "GET" "/dashboard/test" "Dashboard Test"
test_endpoint "GET" "/dashboard/overview-simple" "Dashboard Overview Simple"
test_endpoint "GET" "/dashboard/comprehensive-simple" "Dashboard Comprehensive"
test_endpoint "GET" "/dashboard/activity" "Dashboard Activity"
test_endpoint "GET" "/dashboard/approvals" "Dashboard Approvals"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. PARKS ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "4. PARKS ENDPOINTS"

test_endpoint "GET" "/parks" "List Parks"
test_endpoint "GET" "/parks?status=approved" "List Approved Parks"
test_endpoint "GET" "/parks?status=draft" "List Draft Parks"
test_endpoint "GET" "/parks?status=in_review" "List In Review Parks"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. FLORA ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "5. FLORA ENDPOINTS"

test_endpoint "GET" "/flora" "List Flora"
test_endpoint "GET" "/flora?status=approved" "List Approved Flora"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 7. FAUNA ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "6. FAUNA ENDPOINTS"

test_endpoint "GET" "/fauna" "List Fauna"
test_endpoint "GET" "/fauna?status=approved" "List Approved Fauna"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 8. ACTIVITIES ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "7. ACTIVITIES ENDPOINTS"

test_endpoint "GET" "/activities" "List Activities"
test_endpoint "GET" "/activities?status=approved" "List Approved Activities"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 9. ARTICLES ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "8. ARTICLES ENDPOINTS"

test_endpoint "GET" "/articles" "List Articles"
test_endpoint "GET" "/articles?status=approved" "List Approved Articles"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 10. NEWS ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "9. NEWS ENDPOINTS"

test_endpoint "GET" "/news" "List News (Admin)"
test_endpoint "GET" "/news/public" "List News (Public)" false

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 11. ANNOUNCEMENTS ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "10. ANNOUNCEMENTS ENDPOINTS"

test_endpoint "GET" "/announcements" "List Announcements"
test_endpoint "GET" "/announcements?status=active" "List Active Announcements"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 12. GALLERIES ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "11. GALLERIES ENDPOINTS"

test_endpoint "GET" "/galleries" "List Galleries"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 13. APPROVALS ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_category "12. APPROVALS ENDPOINTS"

test_endpoint "GET" "/approvals" "List Pending Approvals"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SUMMARY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}TEST SUMMARY${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Total Tests:  ${BOLD}$TOTAL${NC}"
echo -e "Passed:       ${GREEN}$PASSED${NC}"
echo -e "Failed:       ${RED}$FAILED${NC}"

if [ $TOTAL -gt 0 ]; then
    PASS_RATE=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc)
    echo -e "Pass Rate:    ${BOLD}$PASS_RATE%${NC}"
fi

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✅ ALL TESTS PASSED${NC}"
else
    echo -e "${YELLOW}${BOLD}⚠️  $FAILED TEST(S) FAILED${NC}"
fi

echo ""


