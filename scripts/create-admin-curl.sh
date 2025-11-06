#!/bin/bash

# Create Super Admin using curl
# Make sure backend server is running on http://localhost:8000

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 CREATE SUPER ADMIN VIA API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Default values
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@kehati.org}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password}"
API_URL="${API_URL:-http://localhost:8000}"

echo "📡 API URL: $API_URL"
echo "📧 Email: $ADMIN_EMAIL"
echo "🔑 Password: $ADMIN_PASSWORD"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running..."
if ! curl -s -f "$API_URL/health" > /dev/null 2>&1; then
    echo "❌ Backend server is not running at $API_URL"
    echo ""
    echo "Please start the backend server first:"
    echo "  cd apps/backend"
    echo "  python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
    echo ""
    exit 1
fi

echo "✅ Backend server is running"
echo ""

# Create admin
echo "📝 Creating super admin..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/setup/create-admin" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"display_name\": \"Super Administrator\"
  }")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract response body (all lines except last)
BODY=$(echo "$RESPONSE" | sed '$d')

echo ""
if [ "$HTTP_CODE" = "200" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Super Admin Created Successfully!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo "Login credentials:"
    echo "  Email:    $ADMIN_EMAIL"
    echo "  Password: $ADMIN_PASSWORD"
    echo ""
    echo "⚠️  PLEASE CHANGE PASSWORD AFTER FIRST LOGIN!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
elif [ "$HTTP_CODE" = "400" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  Super Admin Already Exists"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo "This endpoint only works if no super admin exists yet."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ Error creating admin (HTTP $HTTP_CODE)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi

