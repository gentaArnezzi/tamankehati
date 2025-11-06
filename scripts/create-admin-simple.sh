#!/bin/bash

# Simple curl command to create super admin
# Usage: ./scripts/create-admin-simple.sh

curl -X POST http://localhost:8000/api/v1/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kehati.org",
    "password": "password",
    "display_name": "Super Administrator"
  }' | python3 -m json.tool

