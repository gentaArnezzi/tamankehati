#!/bin/bash

# Test approval endpoint
# Replace YOUR_TOKEN with actual JWT token from localStorage

echo "Testing /api/v1/approvals/ endpoint..."
echo ""

# Get token from user
echo "Please provide your JWT token (from browser localStorage):"
read -r TOKEN

echo ""
echo "Making request to http://localhost:8000/api/v1/approvals/?limit=200"
echo ""

curl -v \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "http://localhost:8000/api/v1/approvals/?limit=200"

echo ""
echo ""
echo "Done!"


