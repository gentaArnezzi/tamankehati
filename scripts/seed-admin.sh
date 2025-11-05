#!/bin/bash
# Script to seed super admin user
# This script generates bcrypt hash and inserts admin user

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔐 Seed Super Admin User"
echo "========================"
echo ""

# Default values
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@kehati.org}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

echo "Email: $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"
echo ""

# Check if admin already exists
echo "🔍 Checking if admin already exists..."
EXISTING=$(docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -t -c "SELECT COUNT(*) FROM users WHERE role = 'super_admin';" 2>/dev/null | xargs)

if [ "$EXISTING" != "0" ]; then
    echo -e "${YELLOW}⚠️  Super admin already exists!${NC}"
    echo "Existing admin users:"
    docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "SELECT id, email, role FROM users WHERE role = 'super_admin';"
    echo ""
    read -p "Do you want to create another admin? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 0
    fi
fi

# Generate bcrypt hash using Python
echo "🔐 Generating password hash..."
HASH=$(docker exec tamankehati-backend-prod python3 -c "
import bcrypt
password = '$ADMIN_PASSWORD'
password_bytes = password.encode('utf-8')
if len(password_bytes) > 72:
    password_bytes = password_bytes[:72]
hash_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
print(hash_bytes.decode('utf-8'))
" 2>/dev/null)

if [ -z "$HASH" ]; then
    echo -e "${RED}❌ Failed to generate password hash${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Password hash generated${NC}"
echo ""

# Insert admin user
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

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Super admin created successfully!${NC}"
    echo ""
    echo "Login credentials:"
    echo "  Email: $ADMIN_EMAIL"
    echo "  Password: $ADMIN_PASSWORD"
    echo ""
    echo -e "${YELLOW}⚠️  Please change password after first login!${NC}"
else
    echo -e "${RED}❌ Failed to create admin user${NC}"
    exit 1
fi

# Verify
echo ""
echo "🔍 Verifying admin user..."
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "SELECT id, email, role, display_name, is_active, created_at FROM users WHERE role = 'super_admin';"

