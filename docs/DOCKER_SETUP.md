# 🐳 Docker Setup Guide - Taman Kehati

Panduan lengkap untuk menjalankan aplikasi Taman Kehati menggunakan Docker.

---

## 📋 Prerequisites

- **Docker Desktop** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git**

---

## 🚀 Quick Start

### Development Environment

```bash
# 1. Clone repository
git clone <repository-url>
cd tamankehati_new

# 2. Copy environment file
cp env.example .env

# 3. Start all services
./docker-dev.sh start

# Atau menggunakan docker-compose langsung:
docker-compose up -d
```

**Services akan tersedia di:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5433
- Redis: localhost:6379

---

## 🛠️ Development Commands

```bash
# Start services
./docker-dev.sh start
# atau
docker-compose up -d

# Stop services
./docker-dev.sh stop
# atau
docker-compose down

# View logs
./docker-dev.sh logs
# atau
docker-compose logs -f

# View specific service logs
./docker-dev.sh logs backend
docker-compose logs -f backend

# Run database migrations
./docker-dev.sh migrate
# atau
docker-compose --profile tools run --rm migrate

# Restart services
./docker-dev.sh restart

# Check service status
./docker-dev.sh status
# atau
docker-compose ps

# Clean up (removes containers, volumes, and images)
./docker-dev.sh clean
```

---

## 🏭 Production Setup

### 1. Prepare Environment File

```bash
# Copy example and configure
cp env.example .env

# Edit .env with production values:
# - Set strong SECRET_KEY
# - Configure database credentials
# - Set CORS_ORIGINS to your domain
# - Set ENVIRONMENT=production
# - Set DEBUG=false
```

### 2. Build and Start Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Production Environment Variables

**Required:**
```bash
SECRET_KEY=your-super-secure-secret-key-minimum-32-characters
POSTGRES_PASSWORD=secure-database-password
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Optional but Recommended:**
```bash
FIREWALL_ENABLED=true
FIREWALL_MODE=blacklist
IP_BLACKLIST=malicious-ip-addresses
LOG_LEVEL=INFO
ENVIRONMENT=production
DEBUG=false
```

---

## 📁 Docker Structure

### Docker Compose Files

- **`docker-compose.yml`** - Development environment
  - Hot reload enabled
  - Volume mounts for live code changes
  - Development dependencies included

- **`docker-compose.prod.yml`** - Production environment
  - Optimized builds
  - No volume mounts (code baked into image)
  - Production dependencies only
  - Auto-runs migrations and init admin

### Dockerfiles

#### Backend (`apps/backend/Dockerfile`)
- **Base stage**: Common dependencies
- **Development stage**: With dev dependencies + hot reload
- **Production stage**: Optimized with gunicorn + multiple workers

#### Frontend (`apps/frontend/Dockerfile`)
- **Deps stage**: Install dependencies
- **Builder stage**: Build Next.js application
- **Runner stage**: Production server (standalone mode)
- **Development stage**: With hot reload

---

## 🔧 Configuration

### Backend Configuration

Environment variables di `docker-compose.yml`:
- Database connection via `DATABASE_URL`
- Redis connection via `REDIS_URL`
- CORS origins via `CORS_ORIGINS`
- Security settings (SECRET_KEY, ALGORITHM, etc.)

### Frontend Configuration

Environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NODE_ENV` - Node environment
- `NEXT_TELEMETRY_DISABLED` - Disable telemetry

---

## 📊 Services Overview

### PostgreSQL Database
- **Image**: `postgres:15-alpine`
- **Port**: `5433` (host) → `5432` (container)
- **Volume**: `postgres_data` (persistent storage)
- **Health Check**: Automatic

### Redis Cache
- **Image**: `redis:7-alpine`
- **Port**: `6379`
- **Volume**: `redis_data` (persistent storage)
- **Health Check**: Automatic

### Backend API
- **Port**: `8000`
- **Hot Reload**: Enabled in development
- **Workers**: 4 workers in production
- **Auto Migration**: Runs on production startup
- **Auto Init Admin**: Creates admin user on first start

### Frontend
- **Port**: `3000`
- **Hot Reload**: Enabled in development
- **Standalone Mode**: Production uses Next.js standalone output

---

## 🔍 Troubleshooting

### Services Tidak Start

```bash
# Check Docker is running
docker ps

# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend
docker-compose logs frontend
```

### Database Connection Issues

```bash
# Check PostgreSQL is healthy
docker-compose ps postgres

# Test connection
docker-compose exec backend python -c "from core.database.engine import engine; print('DB OK')"
```

### Port Already in Use

```bash
# Check what's using the port
lsof -i :8000
lsof -i :3000
lsof -i :5433

# Change ports in docker-compose.yml
ports:
  - "8001:8000"  # Use different host port
```

### Migration Issues

```bash
# Run migrations manually
docker-compose exec backend alembic upgrade head

# Check current migration status
docker-compose exec backend alembic current
```

### Permission Issues (Uploads)

```bash
# Fix uploads directory permissions
docker-compose exec backend chown -R app:app /app/uploads
docker-compose exec backend chmod -R 755 /app/uploads
```

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong `SECRET_KEY` (32+ characters)
- ✅ Use unique passwords for database
- ✅ Restrict `CORS_ORIGINS` in production

### 2. Firewall
- ✅ Enable firewall in production (`FIREWALL_ENABLED=true`)
- ✅ Configure IP blacklist/whitelist
- ✅ Keep bypass paths minimal

### 3. Container Security
- ✅ Run containers as non-root users
- ✅ Keep base images updated
- ✅ Scan images for vulnerabilities
- ✅ Use specific image tags (not `latest`)

### 4. Network Security
- ✅ Use Docker networks (services isolated)
- ✅ Expose only necessary ports
- ✅ Use reverse proxy (nginx/traefik) in production

---

## 📦 Volume Management

### Development
Volumes mounted for live editing:
- `./apps/backend:/app` - Backend code
- `./apps/frontend:/app` - Frontend code
- Excludes `node_modules` and `__pycache__`

### Production
Persistent volumes:
- `postgres_data` - Database data
- `redis_data` - Redis cache
- `backend_uploads` - Uploaded files

### Backup Volumes

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U kehati_user kehati_db > backup.sql

# Restore PostgreSQL
docker-compose exec -T postgres psql -U kehati_user kehati_db < backup.sql
```

---

## 🚀 Deployment

### Build Production Images

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml build frontend
```

### Push to Registry (Optional)

```bash
# Tag images
docker tag tamankehati_backend:latest your-registry/tamankehati-backend:latest
docker tag tamankehati_frontend:latest your-registry/tamankehati-frontend:latest

# Push images
docker push your-registry/tamankehati-backend:latest
docker push your-registry/tamankehati-frontend:latest
```

---

## 📝 Notes

1. **First Time Setup**: Admin user will be auto-created on first backend start
   - Default: `admin@kehati.org` / `admin123`
   - **⚠️ CHANGE PASSWORD IMMEDIATELY!**

2. **Database Migrations**: Automatically run on production startup

3. **Hot Reload**: 
   - Development: Changes reflect immediately
   - Production: Requires rebuild

4. **Uploads Directory**: 
   - Development: `./apps/backend/uploads` (ephemeral)
   - Production: Docker volume `backend_uploads` (persistent)

---

## 🎯 Next Steps

1. ✅ Configure `.env` file
2. ✅ Start services: `./docker-dev.sh start`
3. ✅ Access frontend: http://localhost:3000
4. ✅ Check API docs: http://localhost:8000/docs
5. ✅ Login with default admin credentials
6. ✅ **Change admin password immediately!**

---

**Selamat menggunakan Docker setup untuk Taman Kehati!** 🎉

