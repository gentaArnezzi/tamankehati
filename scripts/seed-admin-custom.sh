#!/bin/bash
# Script to seed super admin user with custom credentials
# Usage: ADMIN_EMAIL=admin@kehati.org ADMIN_PASSWORD="7p#VbX9u@LmQ2zTf" ./scripts/seed-admin-custom.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔐 Seed Super Admin User"
echo "========================"
echo ""

# Credentials
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@kehati.org}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

echo "Email: $ADMIN_EMAIL"
echo "Password: ${ADMIN_PASSWORD:0:3}***"  # Show only first 3 chars for security
echo ""

# Check if admin already exists
echo "🔍 Checking if admin already exists..."
EXISTING=$(docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -t -c "SELECT COUNT(*) FROM users WHERE email = '$ADMIN_EMAIL';" 2>/dev/null | xargs)

if [ "$EXISTING" != "0" ]; then
    echo -e "${YELLOW}⚠️  User with email $ADMIN_EMAIL already exists!${NC}"
    echo "Existing user:"
    docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "SELECT id, email, role FROM users WHERE email = '$ADMIN_EMAIL';"
    echo ""
    read -p "Do you want to update password? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 0
    fi
    UPDATE_MODE=true
else
    UPDATE_MODE=false
fi

# Generate bcrypt hash using Python
echo "🔐 Generating password hash..."
HASH=$(docker exec tamankehati-backend-prod python3 -c "
import bcrypt
import sys

password = '$ADMIN_PASSWORD'
password_bytes = password.encode('utf-8')

# Bcrypt has a 72-byte limit
if len(password_bytes) > 72:
    password_bytes = password_bytes[:72]

try:
    hash_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    print(hash_bytes.decode('utf-8'))
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
" 2>/dev/null)

if [ -z "$HASH" ]; then
    echo -e "${RED}❌ Failed to generate password hash${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Password hash generated${NC}"
echo ""

# Insert or update admin user
if [ "$UPDATE_MODE" = true ]; then
    echo "🔄 Updating admin user password..."
    docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db << EOF
UPDATE users 
SET 
    hashed_password = '$HASH',
    role = 'super_admin',
    is_active = true,
    updated_at = NOW()
WHERE email = '$ADMIN_EMAIL';
EOF
    echo -e "${GREEN}✅ Admin password updated successfully!${NC}"
else
    echo "📝 Inserting admin user..."
    docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db << EOF
INSERT INTO users (
    email,
    hashed_password,
    role,
    display_name,
    full_name,
    is_active,
    created_at,
    updated_at
) VALUES (
    '$ADMIN_EMAIL',
    '$HASH',
    'super_admin',
    'Super Administrator',
    'System Administrator',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    hashed_password = '$HASH',
    is_active = true,
    updated_at = NOW();
EOF
    echo -e "${GREEN}✅ Super admin created successfully!${NC}"
fi

echo ""
echo "Login credentials:"
echo "  Email: $ADMIN_EMAIL"
echo "  Password: $ADMIN_PASSWORD"
echo ""

# Verify
echo "🔍 Verifying admin user..."
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "SELECT id, email, role, display_name, is_active, created_at FROM users WHERE email = '$ADMIN_EMAIL';"

echo ""
echo -e "${GREEN}✅ Done!${NC}"

