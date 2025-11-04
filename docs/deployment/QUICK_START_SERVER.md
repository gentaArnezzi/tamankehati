# 🚀 Quick Start: Deploy ke Server

Panduan cepat untuk deploy aplikasi Taman Kehati ke server Ubuntu yang sudah ada aplikasi lain.

---

## 📋 Prerequisites

- ✅ Docker images sudah di-build dan di-push ke Docker Hub
- ✅ Deployment package sudah disiapkan (`deployment-package.tar.gz`)
- ✅ Akses SSH ke server
- ✅ Server IP address

---

## 🎯 Step 1: Copy Files ke Server

### Di Local Machine:

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new

# Copy package ke server
scp deployment-package.tar.gz ubuntu@YOUR_SERVER_IP:/tmp/
```

**Ganti `YOUR_SERVER_IP` dengan IP server Anda.**

---

## 🎯 Step 2: Setup di Server

### SSH ke Server:

```bash
ssh ubuntu@YOUR_SERVER_IP
```

### Create Directory dan Extract:

```bash
# Navigate ke apps folder
cd ~/dasmap_prod/apps

# Create folder untuk Taman Kehati
mkdir tamankehati
cd tamankehati

# Extract package
tar -xzf /tmp/deployment-package.tar.gz

# Verify files
ls -la
```

**Expected files:**
```
docker-compose.pull.no-nginx.yml
env.production.example
deploy-package/
scripts/
```

---

## 🎯 Step 3: Setup Environment Variables

```bash
# Copy template
cp env.production.example .env

# Edit
nano .env
```

**Update values (ganti dengan nilai Anda):**

```bash
# Server IP
SERVER_IP=YOUR_SERVER_IP

# Docker Registry
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=arnezzi
IMAGE_TAG=v1.0.0

# Domain (jika pakai subdomain)
DOMAIN=tamankehati.dasmap.co.id

# CORS
CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id,https://tamankehati.dasmap.co.id

# Frontend API URL
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api

# Database
POSTGRES_DB=tamankehati_db
POSTGRES_USER=tamankehati_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE

# Security
SECRET_KEY=GENERATE_NEW_SECRET_KEY
ADMIN_EMAIL=admin@kehati.org
ADMIN_PASSWORD=STRONG_ADMIN_PASSWORD
```

**Generate SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🎯 Step 4: Deploy Containers

```bash
# Pull images
docker compose -f docker-compose.pull.no-nginx.yml pull

# Start services
docker compose -f docker-compose.pull.no-nginx.yml up -d

# Check status
docker compose -f docker-compose.pull.no-nginx.yml ps

# View logs
docker compose -f docker-compose.pull.no-nginx.yml logs -f
```

**Wait for all containers to be healthy (30-60 seconds).**

---

## 🎯 Step 5: Setup Nginx Routing

```bash
# Navigate ke Nginx config folder
cd ~/dasmap_prod/apps/nginx/sites-enabled

# Create config file
sudo nano tamankehati.conf
```

**Copy config (atau dari file yang sudah ada):**

```nginx
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;  # Ganti dengan subdomain Anda

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /docs {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Reload Nginx:**
```bash
# Restart service go untuk reload Nginx
cd ~/dasmap_prod
docker compose restart go
```

---

## 🎯 Step 6: Verify

```bash
# Test containers
curl http://localhost:3000
curl http://localhost:8000/health

# Test via Nginx (jika DNS sudah setup)
curl http://tamankehati.dasmap.co.id
curl http://tamankehati.dasmap.co.id/api/health

# Check containers
docker compose -f docker-compose.pull.no-nginx.yml ps
```

---

## ✅ Done!

**Aplikasi Taman Kehati sudah deployed!**

**Akses:**
- Frontend: `http://tamankehati.dasmap.co.id` (jika DNS setup)
- Backend API: `http://tamankehati.dasmap.co.id/api`
- API Docs: `http://tamankehati.dasmap.co.id/docs`

---

## 📚 Next Steps

1. **Setup DNS** (jika belum): Add A record untuk subdomain
2. **Setup SSL** (optional): `sudo certbot --nginx -d tamankehati.dasmap.co.id`
3. **Add link** di website utama

**Dokumentasi lengkap:** `docs/deployment/INTEGRATION_EXISTING_DOCKER_COMPOSE.md`

