# 🐳 Docker Compose Setup Guide

## 📁 File Docker Compose

Ada **2 file** docker-compose untuk berbagai kebutuhan:

### 1. `docker-compose.yml` - **Development** (Local Development)

Untuk development lokal dengan hot-reload dan debugging.

**Services:**

- ✅ PostgreSQL (port 5433 - untuk avoid conflict dengan local postgres)
- ✅ Redis
- ✅ Backend API (port 8000)
- ✅ Frontend Next.js (port 3000)
- ✅ Migration tool (profile: tools)

**Usage:**

```bash
# Start semua services
docker-compose up -d

# Start dengan migration
docker-compose --profile tools up -d

# View logs
docker-compose logs -f backend

# Stop semua
docker-compose down
```

### 2. `docker-compose.prod.yml` - **Production** (Server Deployment)

Untuk production deployment dengan Nginx reverse proxy.

**Services:**

- ✅ PostgreSQL (internal, tidak exposed)
- ✅ Redis (internal, tidak exposed)
- ✅ Backend API (port 8000)
- ✅ Frontend Next.js (port 3000)
- ✅ Nginx Reverse Proxy (port 80)

**Usage:**

```bash
# Start production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production
docker-compose -f docker-compose.prod.yml down
```

---

## 🚀 Quick Start

### Development Setup

1. **Setup environment variables** (opsional, bisa pakai default):

```bash
# Copy .env.example jika ada
cp .env.example .env

# Edit jika perlu
nano .env
```

2. **Start services:**

```bash
docker-compose up -d
```

3. **Run migration:**

```bash
# Option 1: Menggunakan migrate service
docker-compose --profile tools up migrate

# Option 2: Manual dari backend container
docker-compose exec backend alembic upgrade head
```

4. **Check status:**

```bash
docker-compose ps
```

### Production Setup

1. **Setup environment variables:**

```bash
# Buat .env.prod atau set environment variables
export POSTGRES_PASSWORD=your_secure_password
export SECRET_KEY=your_secret_key
export NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8000
```

2. **Start production:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Run migration:**

```bash
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## 📊 Database Configuration

### Development (`docker-compose.yml`)

- **Database:** `kehati_db`
- **User:** `kehati_user`
- **Password:** `kehati_password`
- **Port:** `5433` (host) → `5432` (container)
- **Connection String:** `postgresql://kehati_user:kehati_password@localhost:5433/kehati_db`

### Production (`docker-compose.prod.yml`)

- **Database:** `${POSTGRES_DB:-kehati_db}` (default: `kehati_db`)
- **User:** `${POSTGRES_USER:-kehati_user}` (default: `kehati_user`)
- **Password:** `${POSTGRES_PASSWORD}` (Wajib di-set!)
- **Port:** Internal only (tidak exposed untuk security)

---

## 🔧 Common Commands

### Database Management

```bash
# Connect to database (development)
docker-compose exec postgres psql -U kehati_user -d kehati_db

# Connect to database (production)
docker-compose -f docker-compose.prod.yml exec postgres psql -U kehati_user -d kehati_db

# Backup database
docker-compose exec postgres pg_dump -U kehati_user kehati_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U kehati_user kehati_db < backup.sql
```

### Migration

```bash
# Run migration (development)
docker-compose exec backend alembic upgrade head

# Run migration (production)
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "description"

# Check migration status
docker-compose exec backend alembic current
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (HAPUS DATA!)
docker-compose down -v

# Remove unused images
docker system prune -a
```

---

## ⚠️ Important Notes

1. **Development:** Port PostgreSQL adalah `5433` untuk menghindari conflict dengan PostgreSQL lokal
2. **Production:** PostgreSQL tidak exposed ke luar untuk security (hanya accessible via Docker network)
3. **Passwords:** Pastikan ganti password default di production!
4. **Environment Variables:** Gunakan `.env` file untuk production (jangan commit ke git!)

---

## 🆘 Troubleshooting

### Database connection error?

```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U kehati_user
```

### Migration error?

```bash
# Check migration status
docker-compose exec backend alembic current

# View migration history
docker-compose exec backend alembic history

# Rollback migration
docker-compose exec backend alembic downgrade -1
```
