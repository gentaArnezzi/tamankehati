# 🔍 Database Audit - Check Multiple Databases

Guide untuk check dan audit database di server yang mungkin punya beberapa database.

---

## 🔍 Step 1: Check All PostgreSQL Containers

**Di server, jalankan:**
```bash
# List semua PostgreSQL containers
docker ps | grep postgres

# Check semua containers yang running
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
```

**Expected output:**
- `tamankehati-postgres-prod` - Database untuk Taman Kehati
- `dasmap_prod-db-1-1` - Database untuk aplikasi dasmap (existing)

---

## 🔍 Step 2: Check Database Connections

### Check Taman Kehati Database

```bash
# Check Taman Kehati database
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\l"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\dt"
```

### Check Dasmap Database (Existing)

```bash
# Check dasmap database (jika ada)
docker exec dasmap_prod-db-1-1 psql -U postgres -l
```

---

## 🔍 Step 3: Check Backend Database Connection

**Check apa yang backend Taman Kehati gunakan:**
```bash
# Check environment variables di backend
docker exec tamankehati-backend-prod env | grep DATABASE

# Check database connection dari backend
docker exec tamankehati-backend-prod python3 -c "
import os
print('DATABASE_URL:', os.getenv('DATABASE_URL'))
print('DATABASE_URL_SYNC:', os.getenv('DATABASE_URL_SYNC'))
"
```

---

## 🔍 Step 4: Check .env File

```bash
cd ~/dasmap_prod/apps/tamankehati
cat .env | grep -i database
```

**Check apakah ada konflik:**
- `DATABASE_URL` harus point ke `postgres:5432` (Docker service name)
- Bukan `localhost:5432` atau IP lain
- Bukan point ke `dasmap_prod-db-1-1`

---

## 🔍 Step 5: Check Port Conflicts

```bash
# Check port 5432 usage
sudo lsof -i :5432

# Check semua PostgreSQL ports
docker ps | grep postgres
```

**Potential issues:**
- Jika `dasmap_prod-db-1-1` expose port 5432, bisa conflict
- Taman Kehati postgres seharusnya tidak expose port (internal only)

---

## 🔍 Step 6: Verify Database Isolation

**Check apakah Taman Kehati menggunakan database yang benar:**

```bash
# Connect ke Taman Kehati database
docker exec -it tamankehati-postgres-prod psql -U kehati_user -d kehati_db

# Check tables
\dt

# Check current database
SELECT current_database();

# List all databases in this PostgreSQL instance
\l

# Exit
\q
```

**Expected:**
- Database name: `kehati_db`
- User: `kehati_user`
- Tables: `users`, `flora`, `fauna`, `taman`, dll

---

## 🐛 Common Issues

### Issue 1: Backend Using Wrong Database

**Symptom:** Backend connects ke database yang salah

**Check:**
```bash
# Check backend DATABASE_URL
docker exec tamankehati-backend-prod env | grep DATABASE_URL

# Should show:
# DATABASE_URL=postgresql+asyncpg://kehati_user:password@postgres:5432/kehati_db
```

**Fix:**
- Update `.env` dengan `DATABASE_URL` yang benar
- Restart backend

### Issue 2: Multiple PostgreSQL Containers

**Symptom:** Ada beberapa PostgreSQL containers running

**Check:**
```bash
docker ps | grep postgres
```

**Solution:**
- Pastikan Taman Kehati menggunakan `tamankehati-postgres-prod`
- Pastikan DATABASE_URL menggunakan `postgres` (service name), bukan `localhost`

### Issue 3: Port Conflict

**Symptom:** Port 5432 already in use

**Check:**
```bash
sudo lsof -i :5432
```

**Solution:**
- Taman Kehati postgres tidak perlu expose port (internal only)
- Pastikan docker-compose tidak expose port 5432 untuk Taman Kehati

---

## 📊 Database Comparison Script

**Jalankan script ini untuk compare databases:**

```bash
cat > /tmp/check-databases.sh << 'EOF'
#!/bin/bash
echo "🔍 Database Audit"
echo "================"
echo ""

echo "📦 PostgreSQL Containers:"
docker ps | grep postgres
echo ""

echo "📊 Taman Kehati Database:"
echo "Container: tamankehati-postgres-prod"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\l" 2>/dev/null | grep kehati_db || echo "❌ Cannot connect"
echo ""

echo "📊 Taman Kehati Tables:"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\dt" 2>/dev/null | head -20 || echo "❌ Cannot list tables"
echo ""

echo "🔗 Backend Connection:"
docker exec tamankehati-backend-prod env | grep DATABASE_URL || echo "❌ DATABASE_URL not set"
echo ""

echo "📝 .env Configuration:"
cd ~/dasmap_prod/apps/tamankehati 2>/dev/null && cat .env | grep -i database || echo "❌ .env not found"
EOF

chmod +x /tmp/check-databases.sh
/tmp/check-databases.sh
```

---

## ✅ Verification

**Check apakah semua benar:**

1. **Taman Kehati punya database sendiri:**
   ```bash
   docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "SELECT current_database();"
   # Should show: kehati_db
   ```

2. **Backend connects ke database yang benar:**
   ```bash
   docker exec tamankehati-backend-prod env | grep DATABASE_URL
   # Should show: postgresql+asyncpg://kehati_user:...@postgres:5432/kehati_db
   ```

3. **Database isolated:**
   - Taman Kehati database tidak bisa diakses dari dasmap
   - Dasmap database tidak bisa diakses dari Taman Kehati

---

## 🔧 Fix Database Issues

### If Backend Using Wrong Database

```bash
cd ~/dasmap_prod/apps/tamankehati

# Edit .env
nano .env

# Ensure:
DATABASE_URL=postgresql+asyncpg://kehati_user:password@postgres:5432/kehati_db
DATABASE_URL_SYNC=postgresql://kehati_user:password@postgres:5432/kehati_db

# Restart backend
docker compose -f docker-compose.pull.no-nginx.yml restart backend
```

### If Database Not Created

```bash
# Create database if not exists
docker exec tamankehati-postgres-prod psql -U kehati_user -d postgres -c "CREATE DATABASE kehati_db;" 2>/dev/null || echo "Database already exists"

# Run migrations
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic upgrade head
```

---

## 📝 Summary

**Expected setup:**
- ✅ `tamankehati-postgres-prod` - Database untuk Taman Kehati (internal, no port expose)
- ✅ `dasmap_prod-db-1-1` - Database untuk dasmap (existing, port 5432 exposed)
- ✅ Backend connects ke `postgres:5432` (Docker service name)
- ✅ Database isolated (tidak saling akses)

**If multiple databases detected:**
- Check which one backend is using
- Verify isolation
- Ensure correct connection strings

---

**Last Updated:** 2025-11-05

