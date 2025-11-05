# 🔍 Database Comparison: Server vs Railway

Guide untuk membandingkan dan sync database antara server dan Railway.

---

## 📊 Current Situation

**Server Database:** `tamankehati-postgres-prod` (fresh/new database)
**Railway Database:** Production database dengan data lama

**Kemungkinan perbedaan:**
1. Schema berbeda (tabel/kolom berbeda)
2. Data berbeda (jumlah atau isi data)
3. Migration version berbeda

---

## 🔍 Step 1: Check Current Database State

### 1.1 Check Alembic Version

**Di server:**
```bash
# Check current migration version
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "SELECT * FROM alembic_version;" 2>/dev/null

# Or from backend
docker exec tamankehati-backend-prod alembic current
```

### 1.2 List All Tables

**Di server:**
```bash
# List all tables
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\dt"

# List all tables with details
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
"
```

### 1.3 Check Data Count

```bash
# Count records per table
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'flora', COUNT(*) FROM flora
UNION ALL
SELECT 'fauna', COUNT(*) FROM fauna
UNION ALL
SELECT 'parks', COUNT(*) FROM parks
UNION ALL
SELECT 'taman', COUNT(*) FROM taman
UNION ALL
SELECT 'articles', COUNT(*) FROM articles
UNION ALL
SELECT 'news', COUNT(*) FROM news
UNION ALL
SELECT 'announcements', COUNT(*) FROM announcements
UNION ALL
SELECT 'galleries', COUNT(*) FROM galleries
UNION ALL
SELECT 'activities', COUNT(*) FROM activities;
"
```

---

## 🔍 Step 2: Compare with Railway

### Option A: Export from Railway

**If you have access to Railway database:**

```bash
# Export schema from Railway
pg_dump -h railway.host -U railway_user -d railway_db --schema-only > railway_schema.sql

# Export data from Railway
pg_dump -h railway.host -U railway_user -d railway_db --data-only > railway_data.sql

# Compare schemas
diff railway_schema.sql server_schema.sql
```

### Option B: Check Migration Files

**Check what migrations should be applied:**
```bash
# List all migration files
ls -la apps/backend/migrations/versions/

# Check migration history
docker exec tamankehati-backend-prod alembic history
```

---

## 🔧 Step 3: Sync Database

### Option 1: Run All Migrations (Recommended)

**Ensure all migrations are applied:**
```bash
# Run migrations
docker exec tamankehati-backend-prod alembic upgrade head

# Check current version
docker exec tamankehati-backend-prod alembic current
```

### Option 2: Import Data from Railway

**If you want to import data from Railway:**

```bash
# Export from Railway
pg_dump -h railway.host -U railway_user -d railway_db > railway_backup.sql

# Import to server (⚠️ WARNING: This will replace current data!)
docker exec -i tamankehati-postgres-prod psql -U kehati_user -d kehati_db < railway_backup.sql
```

**⚠️ IMPORTANT:** Backup server database first!

### Option 3: Selective Data Import

**Import only specific tables:**

```bash
# Export specific table from Railway
pg_dump -h railway.host -U railway_user -d railway_db -t users > users_backup.sql

# Import to server
docker exec -i tamankehati-postgres-prod psql -U kehati_user -d kehati_db < users_backup.sql
```

---

## 📊 Step 4: Compare Schema

### Check Table Structure

**Compare specific table structure:**

```bash
# Server - Users table structure
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\d users" > server_users_structure.txt

# Railway - Users table structure (if you have access)
# psql -h railway.host -U railway_user -d railway_db -c "\d users" > railway_users_structure.txt

# Compare
diff server_users_structure.txt railway_users_structure.txt
```

### Check Column Differences

```bash
# List all columns in all tables
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
"
```

---

## 🔄 Step 5: Migration Strategy

### If Schema is Different

**Check what migrations are missing:**
```bash
# Check migration history
docker exec tamankehati-backend-prod alembic history

# Check current version
docker exec tamankehati-backend-prod alembic current

# Check what migrations need to be applied
docker exec tamankehati-backend-prod alembic heads
```

**Apply missing migrations:**
```bash
# Upgrade to latest
docker exec tamankehati-backend-prod alembic upgrade head
```

### If Data is Different

**Options:**
1. **Keep server data** (fresh start)
2. **Import from Railway** (if you need old data)
3. **Merge data** (complex, manual process)

---

## 📝 Database Comparison Script

**Jalankan script ini untuk compare:**

```bash
cat > /tmp/compare-database.sh << 'EOF'
#!/bin/bash
echo "🔍 Database Comparison - Server vs Expected"
echo "==========================================="
echo ""

echo "📊 Current Migration Version:"
docker exec tamankehati-backend-prod alembic current 2>/dev/null || echo "❌ Cannot check"
echo ""

echo "📋 All Tables:"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\dt"
echo ""

echo "📊 Table Counts:"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns,
    (SELECT COUNT(*) FROM information_schema.constraints WHERE table_name = t.table_name) as constraints
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
" 2>/dev/null || echo "❌ Cannot query"
echo ""

echo "📈 Data Counts:"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'flora', COUNT(*) FROM flora
UNION ALL
SELECT 'fauna', COUNT(*) FROM fauna
UNION ALL
SELECT 'parks', COUNT(*) FROM parks
UNION ALL
SELECT 'taman', COUNT(*) FROM taman
UNION ALL
SELECT 'articles', COUNT(*) FROM articles
UNION ALL
SELECT 'news', COUNT(*) FROM news
UNION ALL
SELECT 'announcements', COUNT(*) FROM announcements
UNION ALL
SELECT 'galleries', COUNT(*) FROM galleries
UNION ALL
SELECT 'activities', COUNT(*) FROM activities;
" 2>/dev/null || echo "❌ Cannot count"
EOF

chmod +x /tmp/compare-database.sh
/tmp/compare-database.sh
```

---

## 🔧 Common Differences

### Difference 1: Table Names

**Railway might use:**
- `parks` table

**Server might use:**
- `taman` table (Indonesian name)

**Check:**
```bash
# Check if both exist
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\dt" | grep -E "parks|taman"
```

### Difference 2: Missing Tables

**If tables are missing:**
```bash
# Run migrations
docker exec tamankehati-backend-prod alembic upgrade head
```

### Difference 3: Different Columns

**If columns are different:**
```bash
# Check specific table
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\d flora"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\d fauna"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\d parks"
```

---

## 📋 Expected Tables (from Migration)

**Based on migration file, should have:**
- `users`
- `parks` (or `taman`)
- `flora`
- `fauna`
- `articles`
- `news`
- `announcements`
- `galleries`
- `activities`
- `notifications`
- `audit_logs`
- `system_settings`
- `regions`
- `search_query_logs`
- `announcement_reads`
- `announcement_comments`
- `announcement_reactions`
- `alembic_version`

---

## ✅ Verification Steps

1. **Check migration version:**
   ```bash
   docker exec tamankehati-backend-prod alembic current
   ```

2. **List all tables:**
   ```bash
   docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\dt"
   ```

3. **Check table structures:**
   ```bash
   docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\d users"
   docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\d flora"
   ```

4. **Compare with Railway** (if you have access)

---

**Last Updated:** 2025-11-05

