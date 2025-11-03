# Local Production Deployment Testing Guide

Panduan lengkap untuk test deployment production secara lokal sebelum deploy ke server Ubuntu.

## Overview

Workflow ini mensimulasikan deployment seperti di server Ubuntu:
1. ✅ Fresh clone dari GitHub
2. ✅ Build Docker images di local
3. ✅ Push images ke Docker registry
4. ✅ Pull images di simulation folder (tanpa source code)
5. ✅ Test aplikasi seperti di production

## Prerequisites

1. **Docker Desktop** installed dan running
2. **Docker Hub account** (gratis di https://hub.docker.com)
3. **Git** untuk clone repository

## Step 1: Persiapan

### 1.1 Commit dan Push Changes

```bash
cd /path/to/tamankehati_new

# Check git status
git status

# Commit semua changes (jika ada)
git add .
git commit -m "Prepare for production deployment testing"

# Push ke GitHub
git push origin main
```

### 1.2 Setup Docker Hub Account

1. Buat account di https://hub.docker.com (jika belum punya)
2. Login via terminal:
   ```bash
   docker login
   ```
3. Catat username Docker Hub Anda

## Step 2: Build Images Locally

### 2.1 Setup Environment Variables

```bash
cd /path/to/tamankehati_new

# Set Docker Hub username (WAJIB)
export DOCKER_USERNAME=your-dockerhub-username

# Set image tag version (semantic versioning recommended)
export IMAGE_TAG=v1.0.0
# atau
export IMAGE_TAG=latest

# Optional: Use custom registry instead of Docker Hub
# export DOCKER_REGISTRY=registry.example.com
```

### 2.2 Build and Push Images

```bash
# Build dan push images
./scripts/build-and-push-images.sh
```

Script ini akan:
- ✅ Build backend image dari `apps/backend/Dockerfile`
- ✅ Build frontend image dari `apps/frontend/Dockerfile`
- ✅ Tag images dengan format: `docker.io/yourusername/tamankehati-backend:v1.0.0`
- ✅ Push images ke Docker Hub

**Waktu build:** ~10-15 menit untuk pertama kali

### 2.3 Verify Images Pushed

```bash
# Test pull images
docker pull docker.io/${DOCKER_USERNAME}/tamankehati-backend:${IMAGE_TAG}
docker pull docker.io/${DOCKER_USERNAME}/tamankehati-frontend:${IMAGE_TAG}
```

Jika berhasil, images sudah tersedia di registry.

## Step 3: Simulasi Deployment (Fresh Clone)

### 3.1 Clone Repository untuk Simulasi

```bash
# Buat folder simulasi
mkdir -p ~/tamankehati-simulation
cd ~/tamankehati-simulation

# Clone repository
git clone https://github.com/yourusername/tamankehati.git .
```

### 3.2 Setup Environment Configuration

```bash
cd ~/tamankehati-simulation

# Copy template
cp env.production.example .env

# Edit .env dengan nano atau editor lain
nano .env
```

**Konfigurasi penting di .env:**

```bash
# Docker Registry Configuration
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=your-dockerhub-username
IMAGE_TAG=v1.0.0

# Server IP (gunakan localhost atau IP local Anda)
SERVER_IP=localhost
# atau
SERVER_IP=192.168.0.218  # IP local Anda

# Generate SECRET_KEY
# Run: python3 -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-generated-secret-key-here

# Database Password
POSTGRES_PASSWORD=strong-password-here

# Admin Credentials
ADMIN_EMAIL=admin@kehati.org
ADMIN_PASSWORD=strong-admin-password

# CORS Configuration
CORS_ORIGINS=http://${SERVER_IP}:3000,http://${SERVER_IP}:80

# API URL
NEXT_PUBLIC_API_URL=http://${SERVER_IP}:8000

# Environment
ENVIRONMENT=production
DEBUG=false
```

**Atau gunakan script helper:**

```bash
cd /path/to/tamankehati_new
./scripts/setup-simulation-env.sh ~/tamankehati-simulation
```

Script ini akan otomatis:
- Generate SECRET_KEY
- Detect local IP
- Generate passwords
- Update .env file

### 3.3 Pull Images dari Registry

```bash
cd ~/tamankehati-simulation

# Pull images (server tidak perlu build, hanya pull)
docker compose -f docker-compose.pull.yml pull
```

Ini akan download images dari Docker Hub.

### 3.4 Start Services

```bash
# Start semua services
docker compose -f docker-compose.pull.yml up -d

# Check status
docker compose -f docker-compose.pull.yml ps

# View logs
docker compose -f docker-compose.pull.yml logs -f
```

## Step 4: Verification

### 4.1 Health Checks

```bash
cd ~/tamankehati-simulation

# Run verification script
chmod +x scripts/verify-deployment.sh
./scripts/verify-deployment.sh
```

Script akan check:
- ✅ PostgreSQL running
- ✅ Redis running
- ✅ Backend health endpoint
- ✅ Frontend accessibility
- ✅ Nginx (jika enabled)

### 4.2 Manual Verification

```bash
# Check backend
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000

# Check via Nginx
curl http://localhost/health
curl http://localhost
```

## Step 5: Testing

### 5.1 Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Via Nginx**: http://localhost

### 5.2 Functional Testing Checklist

- [ ] **Login/Logout**
  - Login dengan admin credentials
  - Verify token stored
  - Logout berfungsi

- [ ] **Dashboard**
  - Dashboard load dengan benar
  - Statistics display
  - Navigation works

- [ ] **CRUD Operations**
  - Create Flora (upload gambar)
  - Create Fauna (upload gambar)
  - Create Taman (Parks)
  - Edit items
  - Delete items

- [ ] **Image Upload**
  - Upload gambar flora
  - Upload gambar fauna
  - Upload gambar taman
  - Verify images muncul (tidak ada localhost:8000 error)

- [ ] **Approval Workflow**
  - Submit item untuk approval
  - Approve item
  - Reject item

- [ ] **Public Pages**
  - Homepage load
  - Flora explore page
  - Fauna explore page
  - Taman detail page
  - Artikel pages

- [ ] **Bug Fixes Verification**
  - ✅ No localhost:8000 errors in console
  - ✅ Buttons tidak terlalu panjang di desktop
  - ✅ Buttons konsisten warna hitam
  - ✅ Images load dengan benar

### 5.3 Browser Testing

Test di berbagai browser:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 5.4 Responsive Testing

- [ ] Mobile view (iPhone/Android)
- [ ] Tablet view
- [ ] Desktop view

### 5.5 Console Check

Buka browser DevTools (F12):
- [ ] No red errors
- [ ] No localhost:8000 warnings
- [ ] Network requests status 200
- [ ] No CORS errors

## Step 6: Update Deployment

Jika ada perubahan dan ingin test lagi:

### 6.1 Build New Version

```bash
cd /path/to/tamankehati_new

# Update version
export IMAGE_TAG=v1.0.1

# Build and push
./scripts/build-and-push-images.sh
```

### 6.2 Update Simulation

```bash
cd ~/tamankehati-simulation

# Update .env
# IMAGE_TAG=v1.0.1

# Pull new images
docker compose -f docker-compose.pull.yml pull

# Restart services
docker compose -f docker-compose.pull.yml up -d
```

## Troubleshooting

### Images Not Found

```bash
# Verify Docker login
docker login

# Check if images exist
docker pull docker.io/yourusername/tamankehati-backend:v1.0.0

# Check Docker Hub web interface
```

### Build Failed

```bash
# Check Docker logs
docker compose -f docker-compose.prod.yml build --no-cache

# Check for errors
docker compose -f docker-compose.prod.yml logs
```

### Services Not Starting

```bash
# Check logs
docker compose -f docker-compose.pull.yml logs -f backend
docker compose -f docker-compose.pull.yml logs -f frontend

# Check environment variables
docker compose -f docker-compose.pull.yml config
```

### Database Connection Failed

```bash
# Check PostgreSQL
docker compose -f docker-compose.pull.yml exec postgres psql -U kehati_user -d kehati_db -c "SELECT 1;"

# Check DATABASE_URL in .env
grep DATABASE_URL .env
```

## Cleanup

Setelah testing selesai:

```bash
cd ~/tamankehati-simulation

# Stop services
docker compose -f docker-compose.pull.yml down

# Remove volumes (optional - ini akan hapus data)
docker compose -f docker-compose.pull.yml down -v

# Remove folder (optional)
cd ~
rm -rf tamankehati-simulation
```

## Next Steps

Setelah local testing berhasil:

1. ✅ Deploy ke server Ubuntu (mengikuti guide di `ubuntu-server-deployment.md`)
2. ✅ Setup monitoring
3. ✅ Setup automated backups
4. ✅ Document deployment process

## Files Created

- `docker-compose.pull.yml` - Docker Compose untuk pull-only deployment
- `scripts/build-and-push-images.sh` - Script untuk build dan push images
- `scripts/setup-simulation-env.sh` - Script untuk setup .env otomatis
- `docs/deployment/local-build-deployment.md` - Detailed deployment guide

## Important Notes

1. **Docker Hub Free Tier**: 
   - 1 private repository gratis
   - Unlimited public repositories
   - Rate limits: 200 pulls per 6 hours untuk anonymous

2. **Image Tags**:
   - Jangan gunakan `latest` untuk production
   - Gunakan semantic versioning: v1.0.0, v1.0.1, etc.
   - Tag images dengan commit hash untuk traceability

3. **Security**:
   - Jangan commit .env file
   - Rotate SECRET_KEY secara berkala
   - Use strong passwords
   - Keep images updated

4. **Cost Optimization**:
   - Remove old images dari registry
   - Use multi-stage builds untuk smaller images
   - Monitor image sizes

