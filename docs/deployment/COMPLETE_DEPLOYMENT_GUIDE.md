# 🚀 Complete Deployment Guide - Taman Kehati

## Overview
Guide lengkap untuk deploy Taman Kehati ke Ubuntu server dengan frontend, backend, dan database.

## Prerequisites
- Ubuntu server dengan Docker dan Docker Compose terinstall
- Docker Hub account (untuk push/pull images)
- Access ke server via SSH

## Server IP
**IP Address:** `38.47.93.167`
**Port:** `8080` (via Nginx)

---

## Step 1: Build dan Push Images

### 1.1 Build Images di Local

```bash
# Set environment variables
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=v1.0.5
export NEXT_PUBLIC_API_URL=http://38.47.93.167:8080

# Build dan push
cd /path/to/tamankehati_new
./scripts/build-and-push-images.sh
```

### 1.2 Verify Images di Docker Hub

```bash
# Check images
docker images | grep tamankehati
```

---

## Step 2: Setup di Server

### 2.1 SSH ke Server

```bash
ssh ubuntu@38.47.93.167
```

### 2.2 Create Directory Structure

```bash
# Masuk ke dasmap_prod
cd ~/dasmap_prod/apps/tamankehati

# Pastikan struktur folder:
# ~/dasmap_prod/apps/tamankehati/
#   ├── docker-compose.pull.no-nginx.yml
#   ├── .env
#   ├── backups/
#   └── deploy-package/
```

### 2.3 Create .env File

```bash
# Copy dari example
cp env.production.example .env

# Edit .env
nano .env
```

**Update values di .env:**
```bash
SERVER_IP=38.47.93.167
NEXT_PUBLIC_API_URL=http://38.47.93.167:8080
CORS_ORIGINS=http://38.47.93.167:3000,http://38.47.93.167:80,http://38.47.93.167:8080

# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy hasilnya ke SECRET_KEY

# Update passwords
POSTGRES_PASSWORD=your_strong_password_here
ADMIN_PASSWORD=your_admin_password_here

# Docker registry
DOCKER_USERNAME=arnezzi
IMAGE_TAG=v1.0.5
```

---

## Step 3: Setup Nginx Config

### 3.1 Copy Nginx Config

```bash
# Copy config ke nginx sites-enabled
cd ~/dasmap_prod/apps/nginx/sites-enabled
cp ~/dasmap_prod/apps/tamankehati/deploy-package/nginx/tamankehati-container-go-port.conf tamankehati.conf
```

### 3.2 Test dan Reload Nginx

```bash
# Test config
docker exec -it dasmap_prod-go-1 nginx -t

# Reload Nginx
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## Step 4: Pull dan Start Services

### 4.1 Pull Images

```bash
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml pull
```

### 4.2 Start Services

```bash
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

### 4.3 Check Status

```bash
docker compose -f docker-compose.pull.no-nginx.yml ps
```

Semua services harus `Up (healthy)`.

---

## Step 5: Run Database Migrations

```bash
# Run migrations
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic upgrade head
```

---

## Step 6: Verify Deployment

### 6.1 Health Checks

```bash
# Backend health
curl http://38.47.93.167:8080/health
curl http://38.47.93.167:8080/api/health

# Frontend health
curl http://38.47.93.167:8080

# Backend API
curl http://38.47.93.167:8080/api/public/stats/
```

### 6.2 Check Logs

```bash
# Backend logs
docker compose -f docker-compose.pull.no-nginx.yml logs backend --tail=50

# Frontend logs
docker compose -f docker-compose.pull.no-nginx.yml logs frontend --tail=50

# Database logs
docker compose -f docker-compose.pull.no-nginx.yml logs postgres --tail=50
```

### 6.3 Check Container Status

```bash
docker ps | grep tamankehati
```

Semua container harus running:
- `tamankehati-postgres-prod` - Healthy
- `tamankehati-redis-prod` - Healthy
- `tamankehati-backend-prod` - Healthy
- `tamankehati-frontend-prod` - Healthy
- `tamankehati-ollama-prod` - Running (optional)

---

## Step 7: Test Frontend

### 7.1 Open Browser

Buka: `http://38.47.93.167:8080`

### 7.2 Check Browser Console

- Tidak ada `ERR_CONNECTION_REFUSED`
- Tidak ada error `localhost:8000`
- Semua API calls ke `http://38.47.93.167:8080`

### 7.3 Test Features

- Homepage loads
- Public pages (Flora, Fauna, Taman) load
- Login works
- Dashboard loads

---

## Troubleshooting

### Problem: Frontend masih ERR_CONNECTION_REFUSED

**Solution:**
1. Check NEXT_PUBLIC_API_URL di image:
   ```bash
   docker exec tamankehati-frontend-prod env | grep NEXT_PUBLIC_API_URL
   ```
2. Rebuild frontend dengan API URL yang benar
3. Pull image baru
4. Restart frontend

### Problem: Backend tidak bisa connect ke database

**Solution:**
1. Check database container:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml ps postgres
   ```
2. Check DATABASE_URL di .env
3. Check network connectivity:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml exec backend ping postgres
   ```

### Problem: Nginx 405 Method Not Allowed

**Solution:**
1. Check Nginx config:
   ```bash
   docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf
   ```
2. Pastikan `/api/health` proxy ke backend `/health`
3. Reload Nginx

### Problem: Sharp missing error

**Solution:**
1. Rebuild frontend image (sudah fixed di Dockerfile)
2. Pull image baru
3. Restart frontend

---

## Maintenance

### Update Images

```bash
# Pull latest images
docker compose -f docker-compose.pull.no-nginx.yml pull

# Restart services
docker compose -f docker-compose.pull.no-nginx.yml up -d

# Run migrations if needed
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic upgrade head
```

### Backup Database

```bash
# Automatic backup (via cron)
# Or manual backup:
docker compose -f docker-compose.pull.no-nginx.yml exec postgres pg_dump -U kehati_user kehati_db > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

### View Logs

```bash
# All services
docker compose -f docker-compose.pull.no-nginx.yml logs -f

# Specific service
docker compose -f docker-compose.pull.no-nginx.yml logs -f backend
```

---

## Quick Reference

### Service Ports
- Frontend: `3000` (internal), `8080` (via Nginx)
- Backend: `8000` (internal), `8080/api/*` (via Nginx)
- Database: `5432` (internal only)
- Redis: `6379` (internal only)

### Important Files
- `.env` - Environment variables
- `docker-compose.pull.no-nginx.yml` - Docker Compose config
- `deploy-package/nginx/tamankehati-container-go-port.conf` - Nginx config

### Key Commands
```bash
# Start
docker compose -f docker-compose.pull.no-nginx.yml up -d

# Stop
docker compose -f docker-compose.pull.no-nginx.yml down

# Restart
docker compose -f docker-compose.pull.no-nginx.yml restart

# Logs
docker compose -f docker-compose.pull.no-nginx.yml logs -f

# Status
docker compose -f docker-compose.pull.no-nginx.yml ps
```

---

## Success Checklist

- ✅ Images built dan pushed ke Docker Hub
- ✅ .env file configured dengan benar
- ✅ Nginx config updated dan reloaded
- ✅ All services running dan healthy
- ✅ Database migrations run
- ✅ Frontend accessible di http://38.47.93.167:8080
- ✅ Backend API accessible di http://38.47.93.167:8080/api/*
- ✅ No ERR_CONNECTION_REFUSED errors
- ✅ Login works
- ✅ Dashboard loads

---

## Support

Jika ada masalah, check:
1. Logs: `docker compose logs -f`
2. Container status: `docker ps`
3. Network: `docker network inspect`
4. Nginx config: `docker exec dasmap_prod-go-1 nginx -t`

