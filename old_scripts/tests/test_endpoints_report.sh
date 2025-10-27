#!/bin/bash

# Test All API Endpoints
# =====================

BASE_URL="http://localhost:8000"
CURL="/usr/bin/curl"

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                      🧪 TESTING ALL API ENDPOINTS                         ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Login and get token
echo "🔐 Step 1: Authenticating..."
LOGIN_RESPONSE=$($CURL -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kehati.org","password":"password"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    exit 1
fi

echo "✅ Login successful"
echo "   User: $(echo $LOGIN_RESPONSE | grep -o '"name":"[^"]*' | cut -d'"' -f4)"
echo "   Role: $(echo $LOGIN_RESPONSE | grep -o '"role":"[^"]*' | cut -d'"' -f4)"
echo ""

# Stats
TOTAL=0
PASSED=0
FAILED=0

# Test function
test_api() {
    local METHOD=$1
    local PATH=$2
    local NAME=$3
    local NEEDS_AUTH=${4:-yes}
    
    TOTAL=$((TOTAL + 1))
    
    if [ "$NEEDS_AUTH" = "yes" ]; then
        STATUS=$($CURL -s -o /dev/null -w "%{http_code}" -X $METHOD "$BASE_URL$PATH" \
            -H "Authorization: Bearer $TOKEN")
    else
        STATUS=$($CURL -s -o /dev/null -w "%{http_code}" -X $METHOD "$BASE_URL$PATH")
    fi
    
    if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 300 ]; then
        echo "✅ [$STATUS] $METHOD $PATH"
        PASSED=$((PASSED + 1))
    elif [ "$STATUS" -eq 404 ]; then
        echo "⚠️  [$STATUS] $METHOD $PATH (Not Found)"
        FAILED=$((FAILED + 1))
    else
        echo "❌ [$STATUS] $METHOD $PATH"
        FAILED=$((FAILED + 1))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 1. AUTHENTICATION & USER ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/auth/me" "Get Current User"
test_api "GET" "/api/v1/users" "List All Users"
test_api "GET" "/api/v1/users/me" "Get My Profile"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 2. DASHBOARD ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/dashboard" "Dashboard Main"
test_api "GET" "/api/v1/dashboard/test" "Dashboard Test"
test_api "GET" "/api/v1/dashboard/overview-simple" "Dashboard Overview Simple"
test_api "GET" "/api/v1/dashboard/comprehensive-simple" "Dashboard Comprehensive"
test_api "GET" "/api/v1/dashboard/activity" "Dashboard Activity"
test_api "GET" "/api/v1/dashboard/approvals" "Dashboard Approvals"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏞️  3. PARKS ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/parks" "List Parks (Admin)"
test_api "GET" "/api/v1/parks?status=approved" "List Approved Parks"
test_api "GET" "/api/v1/parks?status=draft" "List Draft Parks"
test_api "GET" "/api/public/parks" "List Parks (Public)" "no"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌿 4. FLORA ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/flora" "List Flora (Admin)"
test_api "GET" "/api/v1/flora?status=approved" "List Approved Flora"
test_api "GET" "/api/public/flora" "List Flora (Public)" "no"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦁 5. FAUNA ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/fauna" "List Fauna (Admin)"
test_api "GET" "/api/v1/fauna?status=approved" "List Approved Fauna"
test_api "GET" "/api/public/fauna" "List Fauna (Public)" "no"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 6. ACTIVITIES ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/activities" "List Activities (Admin)"
test_api "GET" "/api/v1/activities?status=approved" "List Approved Activities"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 7. ARTICLES ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/articles" "List Articles (Admin)"
test_api "GET" "/api/v1/articles?status=approved" "List Approved Articles"
test_api "GET" "/api/public/artikel" "List Articles (Public)" "no"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📰 8. NEWS ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/news" "List News (Admin)"
test_api "GET" "/api/v1/news/public" "List News (Public)" "no"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📢 9. ANNOUNCEMENTS ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/announcements" "List Announcements (Admin)"
test_api "GET" "/api/v1/announcements?status=active" "List Active Announcements"
test_api "GET" "/api/public/announcements" "List Announcements (Public)" "no"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖼️  10. GALLERIES ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/galleries" "List Galleries (Admin)"
test_api "GET" "/api/public/galeri" "List Galleries (Public)" "no"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 11. APPROVALS ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/approvals" "List Pending Approvals"
test_api "GET" "/api/v1/approvals?entity_type=flora" "List Flora Approvals"
test_api "GET" "/api/v1/approvals?entity_type=fauna" "List Fauna Approvals"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔔 12. NOTIFICATIONS ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/notifications" "List Notifications"
test_api "GET" "/api/v1/notifications/unread" "List Unread Notifications"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 13. SEARCH ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/search?q=flora" "Search (Admin)"
test_api "GET" "/api/public/search?q=flora" "Search (Public)" "no"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  14. SYSTEM SETTINGS ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/system-settings" "List System Settings"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 15. ANALYTICS ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/analytics" "Analytics Root"
test_api "GET" "/api/v1/analytics/dashboard" "Analytics Dashboard"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌏 16. INDONESIA REGIONS ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/indonesia/provinces" "List Provinces"
test_api "GET" "/api/v1/indonesia/regencies" "List Regencies"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 17. PUBLIC STATS ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/public/stats" "Public Stats" "no"
test_api "GET" "/api/public/stats/biodiversity" "Biodiversity Stats" "no"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 18. AI CHATBOT ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/api/v1/ai/chat/sessions" "List Chat Sessions"
test_api "GET" "/api/public/chat/health" "Chatbot Health" "no"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏥 19. HEALTH & INFO ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_api "GET" "/health" "Health Check" "no"
test_api "GET" "/healthz" "Health Check Alt" "no"
test_api "GET" "/" "Root Info" "no"
echo ""

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                           📊 TEST SUMMARY                                 ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Total Tests:   $TOTAL"
echo "  ✅ Passed:      $PASSED"
echo "  ❌ Failed:      $FAILED"
echo ""

PASS_RATE=$(( PASSED * 100 / TOTAL ))
echo "  Pass Rate:     $PASS_RATE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "  🎉 ALL TESTS PASSED!"
else
    echo "  ⚠️  SOME TESTS FAILED - Review the output above"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"

