# 🗄️ Database Access Guide

Guide untuk mengakses dan melihat database Taman Kehati.

---

## 📋 Database Information

**Database Name:** `kehati_db`  
**Username:** `kehati_user`  
**Password:** (dari `.env` file, `POSTGRES_PASSWORD`)  
**Host:** `postgres` (dari dalam container) atau `localhost` (dari host)  
**Port:** `5432`

---

## 🔧 Method 1: Access via Docker Exec (Recommended)

### Connect ke Database

```bash
# Connect ke PostgreSQL container
docker exec -it tamankehati-postgres-prod psql -U kehati_user -d kehati_db
```

### Basic Commands

Setelah connected, gunakan SQL commands:

```sql
-- List all tables
\dt

-- Describe table structure
\d table_name

-- List all databases
\l

-- Exit
\q
```

### View Data

```sql
-- Count records in each table
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'flora', COUNT(*) FROM flora
UNION ALL
SELECT 'fauna', COUNT(*) FROM fauna
UNION ALL
SELECT 'taman', COUNT(*) FROM taman
UNION ALL
SELECT 'articles', COUNT(*) FROM articles;

-- View users
SELECT id, email, name, role, created_at FROM users LIMIT 10;

-- View taman
SELECT id, name, status, created_at FROM taman LIMIT 10;

-- View flora
SELECT id, nama_lokal, nama_ilmiah, status_iucn FROM flora LIMIT 10;

-- View fauna
SELECT id, nama_lokal, nama_ilmiah, status_iucn FROM fauna LIMIT 10;
```

---

## 🔧 Method 2: Direct SQL Commands

### Run Single Command

```bash
# List all tables
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\dt"

# Count records
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "SELECT COUNT(*) FROM users;"

# View users
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "SELECT id, email, name, role FROM users LIMIT 5;"
```

### Run Multiple Commands (Script)

```bash
# Create script file
cat > /tmp/db_query.sql << 'EOF'
-- List all tables
\dt

-- Count records
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'flora', COUNT(*) FROM flora
UNION ALL
SELECT 'fauna', COUNT(*) FROM fauna
UNION ALL
SELECT 'taman', COUNT(*) FROM taman;

-- Show recent users
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
EOF

# Run script
docker exec -i tamankehati-postgres-prod psql -U kehati_user -d kehati_db < /tmp/db_query.sql
```

---

## 🔧 Method 3: Using pgAdmin or GUI Tool

### Connect from Host Machine

**Connection Details:**
- **Host:** `38.47.93.167` (server IP)
- **Port:** `5432`
- **Database:** `kehati_db`
- **Username:** `kehati_user`
- **Password:** (dari `.env` file)

**Note:** Port 5432 harus exposed di docker-compose atau forward via SSH tunnel.

### SSH Tunnel (Recommended)

```bash
# Create SSH tunnel
ssh -L 5432:localhost:5432 ubuntu@38.47.93.167

# Then connect from local machine:
# Host: localhost
# Port: 5432
# Database: kehati_db
# Username: kehati_user
# Password: (dari .env)
```

---

## 📊 Useful Queries

### Database Overview

```sql
-- List all tables with row counts
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = t.tablename) as table_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Database Size

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('kehati_db'));

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View Recent Data

```sql
-- Recent users
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Recent flora
SELECT id, nama_lokal, nama_ilmiah, status_iucn, created_at 
FROM flora 
ORDER BY created_at DESC 
LIMIT 10;

-- Recent fauna
SELECT id, nama_lokal, nama_ilmiah, status_iucn, created_at 
FROM fauna 
ORDER BY created_at DESC 
LIMIT 10;

-- Recent taman
SELECT id, name, status, created_at 
FROM taman 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Migrations

```sql
-- View alembic version (migrations)
SELECT * FROM alembic_version;
```

---

## 💾 Backup & Export

### Backup Database

```bash
# Full backup
docker exec tamankehati-postgres-prod pg_dump -U kehati_user kehati_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup to server directory
docker exec tamankehati-postgres-prod pg_dump -U kehati_user kehati_db > ~/dasmap_prod/apps/tamankehati/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
docker exec tamankehati-postgres-prod pg_dump -U kehati_user kehati_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Export Specific Table

```bash
# Export users table
docker exec tamankehati-postgres-prod pg_dump -U kehati_user -d kehati_db -t users > users_backup.sql

# Export as CSV
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "COPY users TO STDOUT WITH CSV HEADER" > users.csv
```

### Restore Database

```bash
# Restore from backup
docker exec -i tamankehati-postgres-prod psql -U kehati_user -d kehati_db < backup_file.sql
```

---

## 🔍 Quick Database Check Script

```bash
#!/bin/bash
# Quick database check

echo "📊 Database Overview"
echo "===================="
echo ""

# List tables
echo "📋 Tables:"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\dt"

echo ""
echo "📊 Record Counts:"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'flora', COUNT(*) FROM flora
UNION ALL
SELECT 'fauna', COUNT(*) FROM fauna
UNION ALL
SELECT 'taman', COUNT(*) FROM taman
UNION ALL
SELECT 'articles', COUNT(*) FROM articles;
"

echo ""
echo "💾 Database Size:"
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "SELECT pg_size_pretty(pg_database_size('kehati_db'));"
```

---

## 🛠️ Common Tasks

### Reset Database (⚠️ WARNING: Deletes all data!)

```bash
# Drop and recreate database
docker exec tamankehati-postgres-prod psql -U kehati_user -d postgres -c "DROP DATABASE kehati_db;"
docker exec tamankehati-postgres-prod psql -U kehati_user -d postgres -c "CREATE DATABASE kehati_db;"

# Run migrations
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic upgrade head
```

### Check Database Connection from Backend

```bash
# Test connection
docker exec tamankehati-backend-prod python -c "
from sqlalchemy import create_engine
from core.config.env import get_settings
settings = get_settings()
engine = create_engine(str(settings.database_url))
with engine.connect() as conn:
    result = conn.execute('SELECT 1')
    print('✅ Database connection OK')
"
```

### View Database Logs

```bash
# PostgreSQL logs
docker logs tamankehati-postgres-prod --tail=50

# Backend database logs
docker logs tamankehati-backend-prod --tail=50 | grep -i database
```

---

## 📝 Quick Reference

### Connect to Database

```bash
docker exec -it tamankehati-postgres-prod psql -U kehati_user -d kehati_db
```

### List Tables

```sql
\dt
```

### View Table Structure

```sql
\d table_name
```

### Exit psql

```sql
\q
```

### Run SQL File

```bash
docker exec -i tamankehati-postgres-prod psql -U kehati_user -d kehati_db < script.sql
```

---

## 🔐 Security Notes

1. **Never expose port 5432 publicly** - Use SSH tunnel
2. **Use strong passwords** - Check `.env` file
3. **Regular backups** - Schedule automated backups
4. **Limit access** - Only authorized users should access database

---

**Last Updated:** 2025-11-05

