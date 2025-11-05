# 👤 Seed Super Admin User

Guide untuk create super admin user langsung di PostgreSQL.

---

## 🔧 Method 1: Using Script (Recommended)

**Jalankan script ini di server:**

```bash
# Copy script ke server
scp scripts/seed-admin.sh ubuntu@38.47.93.167:~/seed-admin.sh

# Atau create langsung di server
cat > ~/seed-admin.sh << 'EOF'
#!/bin/bash
# Script untuk seed admin (copy dari scripts/seed-admin.sh)
EOF

# Run script
chmod +x ~/seed-admin.sh
~/seed-admin.sh
```

**Atau dengan custom email/password:**

```bash
ADMIN_EMAIL="admin@tamankehati.id" ADMIN_PASSWORD="your_strong_password" ~/seed-admin.sh
```

---

## 🔧 Method 2: Direct SQL (Quick)

**Generate password hash dulu:**
```bash
# Generate bcrypt hash untuk password "admin123"
docker exec tamankehati-backend-prod python3 -c "
import bcrypt
password = 'admin123'
password_bytes = password.encode('utf-8')
if len(password_bytes) > 72:
    password_bytes = password_bytes[:72]
hash_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
print(hash_bytes.decode('utf-8'))
"
```

**Copy hash yang dihasilkan, lalu insert ke database:**

```bash
# Insert admin user
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db << 'EOF'
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
    'admin@kehati.org',
    'PASTE_HASH_HERE',  -- Replace with hash from above
    'super_admin',
    'Super Administrator',
    'System Administrator',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
EOF
```

---

## 🔧 Method 3: One-liner Command

**All-in-one command:**

```bash
# Generate hash dan insert dalam satu command
docker exec tamankehati-backend-prod python3 -c "
import bcrypt
password = 'admin123'
password_bytes = password.encode('utf-8')
if len(password_bytes) > 72:
    password_bytes = password_bytes[:72]
hash_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
hash_str = hash_bytes.decode('utf-8')
print('Hash:', hash_str)
" | grep Hash | cut -d' ' -f2 | xargs -I {} docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "
INSERT INTO users (email, hashed_password, role, display_name, full_name, is_active, created_at, updated_at)
VALUES ('admin@kehati.org', '{}', 'super_admin', 'Super Administrator', 'System Administrator', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
"
```

**Simpler version:**

```bash
# Generate hash
HASH=$(docker exec tamankehati-backend-prod python3 -c "
import bcrypt
print(bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode('utf-8'))
")

# Insert admin
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "
INSERT INTO users (email, hashed_password, role, display_name, full_name, is_active, created_at, updated_at)
VALUES ('admin@kehati.org', '$HASH', 'super_admin', 'Super Administrator', 'System Administrator', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
"
```

---

## 🔧 Method 4: Using Python Script

**Create Python script:**

```bash
cat > /tmp/create_admin.py << 'PYTHON'
import bcrypt
import psycopg2
import os
from datetime import datetime

# Database connection
DB_URL = os.getenv('DATABASE_URL_SYNC', 'postgresql://kehati_user:YOUR_PASSWORD@postgres:5432/kehati_db')

# Admin credentials
ADMIN_EMAIL = 'admin@kehati.org'
ADMIN_PASSWORD = 'admin123'

# Generate hash
password_bytes = ADMIN_PASSWORD.encode('utf-8')
if len(password_bytes) > 72:
    password_bytes = password_bytes[:72]
hash_str = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

# Insert to database
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("""
    INSERT INTO users (
        email, hashed_password, role, display_name, full_name, is_active, created_at, updated_at
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, role;
""", (
    ADMIN_EMAIL, hash_str, 'super_admin', 'Super Administrator', 
    'System Administrator', True, datetime.now(), datetime.now()
))

result = cur.fetchone()
if result:
    print(f"✅ Admin created: ID={result[0]}, Email={result[1]}")
else:
    print("⚠️  Admin already exists or insert failed")

conn.commit()
cur.close()
conn.close()
PYTHON

# Run script
docker exec -i tamankehati-backend-prod python3 < /tmp/create_admin.py
```

---

## ✅ Verify Admin Created

```bash
# Check admin user
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "
SELECT id, email, role, display_name, is_active, created_at 
FROM users 
WHERE role = 'super_admin';
"
```

---

## 🔐 Custom Password

**Untuk custom password, ganti di script:**

```bash
# Method 1: Environment variable
ADMIN_EMAIL="admin@tamankehati.id" ADMIN_PASSWORD="your_password" ./scripts/seed-admin.sh

# Method 2: Direct SQL dengan custom hash
HASH=$(docker exec tamankehati-backend-prod python3 -c "
import bcrypt
print(bcrypt.hashpw(b'your_password', bcrypt.gensalt()).decode('utf-8'))
")

docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "
INSERT INTO users (email, hashed_password, role, display_name, full_name, is_active, created_at, updated_at)
VALUES ('admin@tamankehati.id', '$HASH', 'super_admin', 'Super Administrator', 'System Administrator', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
"
```

---

## 🔄 Update Existing Admin

**Jika admin sudah ada tapi password salah:**

```bash
# Generate new hash
HASH=$(docker exec tamankehati-backend-prod python3 -c "
import bcrypt
print(bcrypt.hashpw(b'new_password', bcrypt.gensalt()).decode('utf-8'))
")

# Update password
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "
UPDATE users 
SET hashed_password = '$HASH', updated_at = NOW()
WHERE email = 'admin@kehati.org' AND role = 'super_admin';
"
```

---

## 📝 Quick Reference

**Default credentials:**
- Email: `admin@kehati.org`
- Password: `admin123`

**⚠️ Important:** Change password after first login!

**One-liner untuk create admin:**
```bash
HASH=$(docker exec tamankehati-backend-prod python3 -c "import bcrypt; print(bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode('utf-8'))") && docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "INSERT INTO users (email, hashed_password, role, display_name, full_name, is_active, created_at, updated_at) VALUES ('admin@kehati.org', '$HASH', 'super_admin', 'Super Administrator', 'System Administrator', true, NOW(), NOW()) ON CONFLICT (email) DO NOTHING;"
```

---

**Last Updated:** 2025-11-05

