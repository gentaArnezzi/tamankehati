# 🗄️ Multi-Tenant Database Setup

Guide untuk memahami setup database di server yang punya multiple applications.

---

## 📊 Current Database Setup

**Server memiliki 2 PostgreSQL containers:**

1. **`tamankehati-postgres-prod`** - Database untuk Taman Kehati
   - Port: Internal only (tidak expose)
   - Network: `tamankehati-network`
   - Database: `kehati_db`
   - User: `kehati_user`

2. **`dasmap_prod-db-1-1`** - Database untuk aplikasi Dasmap (existing)
   - Port: `0.0.0.0:5432->5432/tcp` (exposed to host)
   - Network: `go-net` (172.27.0.0/16)
   - Database: `www-data` (atau sesuai konfigurasi dasmap)
   - User: `www-data`

---

## ✅ Verification Checklist

### 1. Taman Kehati Backend Uses Correct Database

**Check DATABASE_URL:**
```bash
docker exec tamankehati-backend-prod env | grep DATABASE_URL
```

**Expected:**
```
DATABASE_URL=postgresql+asyncpg://kehati_user:password@postgres:5432/kehati_db
```

**Key points:**
- ✅ Uses `postgres:5432` (Docker service name, not localhost)
- ✅ Database: `kehati_db`
- ✅ User: `kehati_user`
- ❌ Should NOT use `localhost:5432` (will connect to dasmap database!)

### 2. Database Isolation

**Taman Kehati database is isolated:**
```bash
# Check Taman Kehati can only access its own database
docker exec tamankehati-postgres-prod psql -U kehati_user -d postgres -c "\l"
# Should only show: kehati_db (and system databases)
```

**Dasmap database is separate:**
```bash
# Check dasmap database (if needed)
docker exec dasmap_prod-db-1-1 psql -U www-data -l
# Should show dasmap databases, not kehati_db
```

### 3. Network Isolation

**Taman Kehati uses its own network:**
```bash
docker network inspect tamankehati_tamankehati-network | grep -A 5 postgres
```

**Dasmap uses different network:**
```bash
docker network inspect dasmap_prod_go-net | grep -A 5 db
```

---

## 🔍 Verify Database Connection

### Test 1: Backend Connection

```bash
# Check what database backend is using
docker exec tamankehati-backend-prod python3 -c "
import os
db_url = os.getenv('DATABASE_URL', '')
print('DATABASE_URL:', db_url)
if 'postgres:5432' in db_url and 'kehati_db' in db_url:
    print('✅ Correct - using Taman Kehati database')
elif 'localhost:5432' in db_url:
    print('⚠️  WARNING - Using localhost might connect to dasmap database!')
else:
    print('⚠️  Unknown connection')
"
```

### Test 2: Database Tables

```bash
# Check Taman Kehati tables
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\dt"

# Should show Taman Kehati tables:
# - users
# - flora
# - fauna
# - taman
# - articles
# - etc.
```

### Test 3: Connection from Backend

```bash
# Test backend can connect to database
docker exec tamankehati-backend-prod python3 -c "
from sqlalchemy import create_engine
import os
db_url = os.getenv('DATABASE_URL')
engine = create_engine(db_url.replace('+asyncpg', ''))
with engine.connect() as conn:
    result = conn.execute('SELECT current_database(), current_user')
    row = result.fetchone()
    print(f'Database: {row[0]}, User: {row[1]}')
"
```

---

## 🐛 Common Issues

### Issue 1: Backend Using localhost:5432 (Wrong!)

**Symptom:** Backend connects to dasmap database instead of Taman Kehati

**Check:**
```bash
docker exec tamankehati-backend-prod env | grep DATABASE_URL
# Shows: postgresql+asyncpg://...@localhost:5432/...
```

**Fix:**
```bash
cd ~/dasmap_prod/apps/tamankehati
nano .env

# Change from:
# DATABASE_URL=postgresql+asyncpg://...@localhost:5432/...

# To:
DATABASE_URL=postgresql+asyncpg://kehati_user:password@postgres:5432/kehati_db

# Restart backend
docker compose -f docker-compose.pull.no-nginx.yml restart backend
```

### Issue 2: Port Conflict

**Symptom:** Cannot start Taman Kehati postgres

**Check:**
```bash
sudo lsof -i :5432
```

**Solution:**
- Taman Kehati postgres tidak perlu expose port (internal only)
- Pastikan docker-compose tidak expose port 5432 untuk Taman Kehati
- Dasmap database boleh expose port (untuk aplikasi lain)

### Issue 3: Database Not Isolated

**Symptom:** Taman Kehati bisa akses dasmap database atau sebaliknya

**Check:**
```bash
# From Taman Kehati postgres, try to access dasmap database
docker exec tamankehati-postgres-prod psql -U kehati_user -d postgres -c "\l"
# Should only show kehati_db
```

**Solution:**
- Verify users are different (kehati_user vs www-data)
- Verify networks are separate
- Verify passwords are different

---

## ✅ Verification Script

**Jalankan script ini untuk verify semua:**

```bash
cat > /tmp/verify-db-setup.sh << 'EOF'
#!/bin/bash
echo "🔍 Database Setup Verification"
echo "==============================="
echo ""

echo "📦 PostgreSQL Containers:"
docker ps | grep postgres
echo ""

echo "🔗 Backend DATABASE_URL:"
DB_URL=$(docker exec tamankehati-backend-prod env | grep DATABASE_URL | cut -d'=' -f2)
echo "DATABASE_URL: $DB_URL"
echo ""

if echo "$DB_URL" | grep -q "postgres:5432"; then
    echo "✅ Using Docker service name (correct)"
elif echo "$DB_URL" | grep -q "localhost:5432"; then
    echo "⚠️  WARNING: Using localhost - might connect to dasmap database!"
else
    echo "⚠️  Unknown connection format"
fi

if echo "$DB_URL" | grep -q "kehati_db"; then
    echo "✅ Using kehati_db database (correct)"
else
    echo "⚠️  Not using kehati_db database"
fi

echo ""
echo "📊 Database Connection Test:"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "SELECT current_database(), current_user;" 2>/dev/null && echo "✅ Can connect to Taman Kehati database" || echo "❌ Cannot connect"

echo ""
echo "📋 Taman Kehati Tables:"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\dt" 2>/dev/null | head -10 || echo "❌ Cannot list tables"
EOF

chmod +x /tmp/verify-db-setup.sh
/tmp/verify-db-setup.sh
```

---

## 📝 Summary

**Current Setup (Correct):**
- ✅ `tamankehati-postgres-prod` - Taman Kehati database (internal, no port expose)
- ✅ `dasmap_prod-db-1-1` - Dasmap database (port 5432 exposed)
- ✅ Backend should use `postgres:5432` (Docker service name)
- ✅ Databases isolated (different networks, users, passwords)

**Key Points:**
- Backend harus menggunakan `postgres:5432` (service name), BUKAN `localhost:5432`
- Jika menggunakan `localhost:5432`, akan connect ke dasmap database (wrong!)
- Database terisolasi dengan benar (different containers, networks)

---

## 🔧 Quick Fix if Wrong

**If backend using wrong database:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Edit .env
nano .env

# Ensure correct DATABASE_URL:
DATABASE_URL=postgresql+asyncpg://kehati_user:YOUR_PASSWORD@postgres:5432/kehati_db
DATABASE_URL_SYNC=postgresql://kehati_user:YOUR_PASSWORD@postgres:5432/kehati_db

# Restart backend
docker compose -f docker-compose.pull.no-nginx.yml restart backend

# Verify
docker exec tamankehati-backend-prod env | grep DATABASE_URL
```

---

**Last Updated:** 2025-11-05

