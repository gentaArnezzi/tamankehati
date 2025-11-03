# 🏢 Multi-Tenant Deployment Guide

Panduan untuk deploy aplikasi Taman Kehati di server yang sudah ada aplikasi lain.

---

## 📋 Situasi Server Anda

**Server Structure:**
```
~/dasmap_prod/apps/
├── amilna.co.id/
├── dasmap.co.id/
├── goproject/
└── nginx/
```

**Aplikasi Taman Kehati akan di-deploy di path terpisah.**

---

## 🎯 Strategy: Isolated Deployment

### Prinsip:
1. ✅ **Path terpisah** - Aplikasi di folder sendiri
2. ✅ **Container names unik** - Tidak konflik dengan app lain
3. ✅ **Port management** - Pastikan tidak ada konflik port
4. ✅ **Nginx routing** - Route via subdomain atau path berbeda
5. ✅ **Docker network** - Network terpisah untuk isolasi

---

## 📁 Step 1: Pilih Lokasi Deployment

### Option A: Di bawah `~/dasmap_prod/apps/` (Recommended)

```bash
# Di server
cd ~/dasmap_prod/apps
mkdir tamankehati
cd tamankehati
```

**Path final:** `~/dasmap_prod/apps/tamankehati/`

### Option B: Di path terpisah (Alternative)

```bash
# Di server
sudo mkdir -p /opt/tamankehati
sudo chown $USER:$USER /opt/tamankehati
cd /opt/tamankehati
```

**Path final:** `/opt/tamankehati/`

---

## 📦 Step 2: Copy Deployment Files

### Di Local Machine:

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new

# Copy package ke server
scp deployment-package.tar.gz ubuntu@server-ip:/tmp/
```

### Di Server:

```bash
# SSH ke server
ssh ubuntu@server-ip

# Navigate ke lokasi deployment (pilih salah satu)
cd ~/dasmap_prod/apps
mkdir tamankehati
cd tamankehati

# Extract package
tar -xzf /tmp/deployment-package.tar.gz
```

---

## 🔧 Step 3: Update Docker Compose untuk Multi-Tenant

**File:** `docker-compose.pull.yml`

### Update Container Names (unik):

```yaml
# Ganti semua container_name untuk avoid conflict
services:
  postgres:
    container_name: tamankehati-postgres-prod  # ← Already unique
    # ...

  redis:
    container_name: tamankehati-redis-prod  # ← Already unique
    # ...

  backend:
    container_name: tamankehati-backend-prod  # ← Already unique
    # ...

  frontend:
    container_name: tamankehati-frontend-prod  # ← Already unique
    # ...

  ollama:
    container_name: tamankehati-ollama-prod  # ← Already unique
    # ...

  nginx:
    container_name: tamankehati-nginx-prod  # ← Already unique
    # ...
```

**✅ Container names sudah unik, tidak perlu diubah!**

### Update Network Name (isolated):

```yaml
networks:
  tamankehati-network:  # ← Already unique, tidak akan konflik
    driver: bridge
```

**✅ Network name sudah unik, tidak perlu diubah!**

### Check Port Conflicts:

**Ports yang digunakan:**
- `8000` - Backend API
- `3000` - Frontend Next.js
- `80` - Nginx (mungkin konflik dengan app lain!)
- `5432` - PostgreSQL (internal, tidak exposed)
- `6379` - Redis (internal, tidak exposed)
- `11434` - Ollama (internal, tidak exposed)

**⚠️ PENTING: Port 80 mungkin sudah digunakan oleh Nginx di server!**

---

## 🌐 Step 4: Setup Nginx Routing

### Option A: Subdomain (Recommended)

Jika Anda punya domain, setup subdomain:
- `tamankehati.yourdomain.com` → Aplikasi Taman Kehati
- `dasmap.co.id` → Aplikasi dasmap (existing)
- `amilna.co.id` → Aplikasi amilna (existing)

**Nginx config di server (bukan di container):**

```bash
# Di server
sudo nano /etc/nginx/sites-available/tamankehati
```

**Isi:**
```nginx
server {
    listen 80;
    server_name tamankehati.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;  # Frontend container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8000;  # Backend container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable:**
```bash
sudo ln -s /etc/nginx/sites-available/tamankehati /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option B: Path-based Routing

Jika tidak punya subdomain, bisa pakai path:
- `http://yourdomain.com/tamankehati/` → Aplikasi Taman Kehati

**Nginx config:**
```nginx
location /tamankehati/ {
    proxy_pass http://localhost:3000/;
    proxy_set_header Host $host;
    # ... other headers
}
```

**⚠️ Note:** Path-based routing lebih kompleks untuk Next.js, subdomain lebih recommended.

### Option C: Port-based Access

Akses langsung via port (tidak melalui Nginx utama):
- `http://server-ip:3000` → Frontend
- `http://server-ip:8000` → Backend API

**Tidak perlu setup Nginx routing, tapi kurang professional.**

---

## 🔒 Step 5: Update Docker Compose Ports

**Jika Nginx di server sudah menggunakan port 80:**

### Option 1: Non-Expose Nginx Container (Recommended)

**Update `docker-compose.pull.yml`:**

```yaml
nginx:
  # ...
  # JANGAN expose port 80, karena sudah digunakan Nginx di server
  # ports:
  #   - "80:80"  # ← Comment out atau hapus
  # ...
```

**Akses via:**
- Frontend: `http://localhost:3000` (via Nginx di server)
- Backend: `http://localhost:8000` (via Nginx di server)

### Option 2: Gunakan Port Berbeda

**Update `docker-compose.pull.yml`:**

```yaml
nginx:
  # ...
  ports:
    - "8080:80"  # ← Gunakan port 8080 instead
  # ...
```

**Akses via:** `http://server-ip:8080`

---

## 📝 Step 6: Setup Environment Variables

**Di server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Copy template
cp env.production.example .env

# Edit
nano .env
```

**Update values:**

```bash
# Server IP
SERVER_IP=YOUR_SERVER_IP

# Docker Registry
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=arnezzi
IMAGE_TAG=v1.0.0

# Domain (jika menggunakan subdomain)
DOMAIN=tamankehati.yourdomain.com

# CORS - Sesuaikan dengan domain/subdomain
CORS_ORIGINS=http://${SERVER_IP}:3000,http://${SERVER_IP}:80,https://${DOMAIN}

# Frontend API URL
NEXT_PUBLIC_API_URL=http://${SERVER_IP}:8000
# Atau jika menggunakan subdomain:
# NEXT_PUBLIC_API_URL=https://${DOMAIN}/api

# Database (akan isolated di Docker network)
POSTGRES_DB=tamankehati_db
POSTGRES_USER=tamankehati_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE

# Security
SECRET_KEY=GENERATE_NEW_SECRET_KEY
ADMIN_EMAIL=admin@kehati.org
ADMIN_PASSWORD=STRONG_ADMIN_PASSWORD
```

---

## 🚀 Step 7: Deploy

**Di server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Pull images
docker compose -f docker-compose.pull.yml pull

# Start services
docker compose -f docker-compose.pull.yml up -d

# Check status
docker compose -f docker-compose.pull.yml ps

# View logs
docker compose -f docker-compose.pull.yml logs -f
```

---

## 🔍 Step 8: Verify No Conflicts

### Check Ports:

```bash
# Check if ports are in use
sudo netstat -tulpn | grep -E "3000|8000|80"

# Or
sudo ss -tulpn | grep -E "3000|8000|80"
```

**Jika port konflik, gunakan port berbeda atau non-expose Nginx container.**

### Check Container Names:

```bash
# List all containers
docker ps -a

# Verify no conflicts
docker ps -a | grep -E "tamankehati|dasmap|amilna"
```

**Container names harus unik!**

### Check Networks:

```bash
# List all networks
docker network ls

# Verify tamankehati network exists
docker network inspect tamankehati-network
```

---

## 📊 Summary Checklist

### Pre-Deployment:
- [ ] Pilih lokasi deployment (`~/dasmap_prod/apps/tamankehati` atau `/opt/tamankehati`)
- [ ] Copy deployment package ke server
- [ ] Extract package
- [ ] Check port conflicts (80, 3000, 8000)
- [ ] Setup Nginx routing (subdomain atau path)

### Configuration:
- [ ] Update `.env` dengan konfigurasi server
- [ ] Verify container names unik (sudah unik ✅)
- [ ] Verify network name unik (sudah unik ✅)
- [ ] Update port mapping jika ada konflik

### Deployment:
- [ ] Pull Docker images
- [ ] Start services
- [ ] Verify no conflicts dengan app lain
- [ ] Test akses aplikasi

### Post-Deployment:
- [ ] Verify aplikasi accessible
- [ ] Test login
- [ ] Test fitur utama
- [ ] Setup monitoring

---

## 🎯 Recommended Setup untuk Server Anda

**Berdasarkan struktur server Anda:**

### 1. Lokasi Deployment:
```bash
~/dasmap_prod/apps/tamankehati/
```

### 2. Nginx Routing:
**Jika punya domain:**
- Setup subdomain: `tamankehati.yourdomain.com`
- Nginx di server route ke `localhost:3000` dan `localhost:8000`

**Jika tidak punya domain:**
- Akses langsung via port: `http://server-ip:3000` dan `http://server-ip:8000`

### 3. Port Management:
- **Port 80:** Mungkin sudah digunakan Nginx di server → **JANGAN expose Nginx container**
- **Port 3000:** Frontend (expose)
- **Port 8000:** Backend (expose)
- Nginx di server akan route ke port ini

### 4. Docker Compose:
- Container names sudah unik ✅
- Network sudah unik ✅
- **Non-expose Nginx container** (gunakan Nginx di server)

---

## ⚠️ Important Notes

1. **Port 80 Conflict:**
   - Jika Nginx di server sudah menggunakan port 80, **JANGAN expose Nginx container**
   - Gunakan Nginx di server untuk route ke containers

2. **Docker Compose Isolation:**
   - Container names sudah unik (tamankehati-*)
   - Network sudah unik (tamankehati-network)
   - Tidak akan konflik dengan app lain

3. **Database Isolation:**
   - Database di Docker network terpisah
   - Tidak akan konflik dengan database lain

4. **Resource Management:**
   - Monitor resource usage (CPU, RAM)
   - Server punya multiple apps, pastikan resources cukup

---

## 🚀 Quick Start Command

```bash
# Di server
cd ~/dasmap_prod/apps
mkdir tamankehati
cd tamankehati

# Extract package (yang sudah di-copy dari local)
tar -xzf /tmp/deployment-package.tar.gz

# Setup .env
cp env.production.example .env
nano .env  # Edit dengan konfigurasi

# Deploy
docker compose -f docker-compose.pull.yml pull
docker compose -f docker-compose.pull.yml up -d

# Verify
docker compose -f docker-compose.pull.yml ps
```

---

**Last Updated:** 2025-11-04

