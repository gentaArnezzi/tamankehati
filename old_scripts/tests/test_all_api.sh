#!/bin/bash

# Comprehensive API Endpoint Test
# Tests all major endpoints using curl

BASE_URL="http://localhost:8000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
PASSED=0
FAILED=0

# Print header
print_header() {
    echo ""
    echo -e "${BLUE}======================================================================${NC}"
    echo -e "${BLUE}                    $1${NC}"
    echo -e "${BLUE}======================================================================${NC}"
    echo ""
}

# Test endpoint
test_endpoint() {
    local method=$1
    local path=$2
    local expected_status=$3
    local description=$4
    local headers=$5
    local data=$6
    
    ((TOTAL++))
    
    # Build curl command
    local cmd="curl -s -o /dev/null -w '%{http_code}' -X $method"
    
    if [ ! -z "$headers" ]; then
        cmd="$cmd $headers"
    fi
    
    if [ ! -z "$data" ]; then
        cmd="$cmd -d '$data'"
    fi
    
    cmd="$cmd $BASE_URL$path"
    
    # Execute curl
    local status=$(eval $cmd 2>/dev/null)
    
    # Check result
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $method $path → $status $description"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $method $path → $status (expected $expected_status) $description"
        ((FAILED++))
    fi
}

# Get auth tokens
get_auth_tokens() {
    print_header "AUTHENTICATION"
    
    # Super Admin Login
    local response=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@kehati.org","password":"password"}')
    
    if echo "$response" | grep -q "access_token"; then
        SUPER_ADMIN_TOKEN=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓${NC} Super Admin Login → Got token: ${SUPER_ADMIN_TOKEN:0:30}..."
    else
        echo -e "${RED}✗${NC} Super Admin Login → Failed"
    fi
    
    # Regional Admin Login
    response=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"santana@kehati.org","password":"password"}')
    
    if echo "$response" | grep -q "access_token"; then
        REGIONAL_ADMIN_TOKEN=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓${NC} Regional Admin Login → Got token: ${REGIONAL_ADMIN_TOKEN:0:30}..."
    else
        echo -e "${RED}✗${NC} Regional Admin Login → Failed"
    fi
}

# Test public endpoints
test_public_endpoints() {
    print_header "PUBLIC ENDPOINTS"
    
    test_endpoint "GET" "/" 200 "(Root)"
    test_endpoint "GET" "/health" 200 "(Health check)"
    test_endpoint "GET" "/api/v1/regions/" 200 "(List regions)"
}

# Test authenticated endpoints
test_authenticated_endpoints() {
    print_header "SUPER ADMIN ENDPOINTS"
    
    if [ -z "$SUPER_ADMIN_TOKEN" ]; then
        echo -e "${YELLOW}⚠${NC} Skipping - no auth token"
        return
    fi
    
    local auth="-H 'Authorization: Bearer $SUPER_ADMIN_TOKEN' -H 'Content-Type: application/json'"
    
    test_endpoint "GET" "/api/v1/dashboard/stats" 200 "(Dashboard stats)" "$auth"
    test_endpoint "GET" "/api/v1/analytics/dashboard" 200 "(Analytics)" "$auth"
    test_endpoint "GET" "/api/v1/users/" 200 "(List users)" "$auth"
    test_endpoint "GET" "/api/v1/users/me" 200 "(Current user)" "$auth"
    test_endpoint "GET" "/api/v1/parks/" 200 "(List parks)" "$auth"
    test_endpoint "GET" "/api/v1/flora/" 200 "(List flora)" "$auth"
    test_endpoint "GET" "/api/v1/fauna/" 200 "(List fauna)" "$auth"
    test_endpoint "GET" "/api/v1/activities/" 200 "(List activities)" "$auth"
    test_endpoint "GET" "/api/v1/announcements/" 200 "(List announcements)" "$auth"
    test_endpoint "GET" "/api/v1/articles/" 200 "(List articles)" "$auth"
    test_endpoint "GET" "/api/v1/news/" 200 "(List news)" "$auth"
    test_endpoint "GET" "/api/v1/galleries/" 200 "(List galleries)" "$auth"
    test_endpoint "GET" "/api/v1/approvals/" 200 "(List approvals)" "$auth"
}

# Test regional admin endpoints
test_regional_admin_endpoints() {
    print_header "REGIONAL ADMIN ENDPOINTS"
    
    if [ -z "$REGIONAL_ADMIN_TOKEN" ]; then
        echo -e "${YELLOW}⚠${NC} Skipping - no auth token"
        return
    fi
    
    local auth="-H 'Authorization: Bearer $REGIONAL_ADMIN_TOKEN' -H 'Content-Type: application/json'"
    
    test_endpoint "GET" "/api/v1/dashboard/stats" 200 "(Dashboard)" "$auth"
    test_endpoint "GET" "/api/v1/parks/?submitted_by=me" 200 "(My parks)" "$auth"
    test_endpoint "GET" "/api/v1/flora/?submitted_by=me" 200 "(My flora)" "$auth"
    test_endpoint "GET" "/api/v1/fauna/?submitted_by=me" 200 "(My fauna)" "$auth"
    test_endpoint "GET" "/api/v1/activities/?submitted_by=me" 200 "(My activities)" "$auth"
    test_endpoint "GET" "/api/v1/announcements/" 200 "(Announcements)" "$auth"
    test_endpoint "GET" "/api/v1/announcements/?status_filter=published" 200 "(Published announcements)" "$auth"
}

# Test workflow endpoints
test_workflow_endpoints() {
    print_header "WORKFLOW ENDPOINTS"
    
    if [ -z "$SUPER_ADMIN_TOKEN" ]; then
        echo -e "${YELLOW}⚠${NC} Skipping - no auth token"
        return
    fi
    
    local auth="-H 'Authorization: Bearer $SUPER_ADMIN_TOKEN' -H 'Content-Type: application/json'"
    
    # Check approval queue
    local response=$(curl -s -X GET "$BASE_URL/api/v1/approvals/?entity_type=taman" \
        -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
        -H "Content-Type: application/json")
    
    if echo "$response" | grep -q '"counts"'; then
        local taman_count=$(echo "$response" | grep -o '"taman":[0-9]*' | cut -d':' -f2)
        echo -e "${GREEN}✓${NC} GET /api/v1/approvals/?entity_type=taman → 200 (Found $taman_count parks pending approval)"
        ((TOTAL++))
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} GET /api/v1/approvals/?entity_type=taman → Failed to parse response"
        ((TOTAL++))
        ((FAILED++))
    fi
}

# Print summary
print_summary() {
    print_header "TEST SUMMARY"
    
    echo -e "Total Tests:  ${BLUE}$TOTAL${NC}"
    echo -e "Passed:       ${GREEN}$PASSED${NC}"
    echo -e "Failed:       ${RED}$FAILED${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    else
        echo -e "${YELLOW}⚠ SOME TESTS FAILED${NC}"
    fi
    
    echo -e "${BLUE}======================================================================${NC}"
    echo ""
}

# Main
main() {
    print_header "🧪 COMPREHENSIVE API ENDPOINT TEST"
    echo "Backend URL: $BASE_URL"
    
    # Get auth tokens
    get_auth_tokens
    
    # Run tests
    test_public_endpoints
    test_authenticated_endpoints
    test_regional_admin_endpoints
    test_workflow_endpoints
    
    # Print summary
    print_summary
}

# Run
main


