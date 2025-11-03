# 🚀 Taman Kehati - Panduan Deployment ke Server VPS/Dedicated Server

## 📋 Daftar Isi

1. [Persiapan Server](#1-persiapan-server)
2. [Setup Environment](#2-setup-environment)
3. [Deployment dengan Docker Compose](#3-deployment-dengan-docker-compose)
4. [Konfigurasi Nginx](#4-konfigurasi-nginx)
5. [Setup SSL/HTTPS](#5-setup-sslhttps)
6. [Monitoring & Maintenance](#6-monitoring--maintenance)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Persiapan Server

### 1.1 Persyaratan Sistem

**Minimum Requirements:**

- **OS**: Ubuntu 20.04 LTS atau lebih baru (recommended: Ubuntu 22.04 LTS)
- **CPU**: 2 cores minimum
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 20GB minimum (50GB recommended untuk uploads)
- **Network**: Public IP address dengan akses internet

**Software yang Diperlukan:**

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- Firewall (UFW)

### 1.2 Setup Awal Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y \
    curl \
    wget \
    git \
    ufw \
    nano \
    htop

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Tambahkan user ke docker group (ganti 'ubuntu' dengan username Anda)
sudo usermod -aG docker ubuntu

# Verifikasi instalasi
docker --version
docker-compose --version

# Logout dan login lagi agar perubahan group berlaku
```

### 1.3 Konfigurasi Firewall

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (WAJIB - jangan lupa!)
sudo ufw allow 22/tcp

# Allow HTTP dan HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Optional: Allow direct backend access (port 8000)
# sudo ufw allow 8000/tcp

# Optional: Allow direct frontend access (port 3000)
# sudo ufw allow 3000/tcp

# Check firewall status
sudo ufw status
```

### 1.4 Buat Direktori Deployment

```bash
# Buat direktori untuk aplikasi
sudo mkdir -p /opt/tamankehati
sudo chown $USER:$USER /opt/tamankehati
cd /opt/tamankehati

# Clone repository (atau upload code)
git clone https://github.com/your-username/tamankehati.git .
# Atau jika sudah ada di server:
# git pull origin main
```

---

## 2. Setup Environment

### 2.1 Generate Secret Key

```bash
# Generate SECRET_KEY yang kuat
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy output untuk digunakan di .env
```

### 2.2 Buat File Environment

```bash
cd /opt/tamankehati

# Copy template environment
cp env.production.example .env

# Edit file .env
nano .env
```

### 2.3 Konfigurasi Environment Variables

Edit file `.env` dan sesuaikan nilai berikut:

```bash
# =============================================================================
# WAJIB DIISI - SERVER CONFIGURATION
# =============================================================================

# Ganti dengan IP server Anda
SERVER_IP=192.168.1.100  # atau IP publik server Anda

# =============================================================================
# WAJIB DIISI - DATABASE
# =============================================================================

# Ganti dengan password yang kuat!
POSTGRES_PASSWORD=YourStrongPassword123!

# =============================================================================
# WAJIB DIISI - SECURITY
# =============================================================================

# Gunakan secret key yang sudah di-generate
SECRET_KEY=your-generated-secret-key-here-minimum-32-characters

# =============================================================================
# WAJIB DIISI - CORS
# =============================================================================

# Sesuaikan dengan IP atau domain Anda
CORS_ORIGINS=http://YOUR_SERVER_IP:3000,http://YOUR_SERVER_IP:80

# =============================================================================
# WAJIB DIISI - FRONTEND
# =============================================================================

# Sesuaikan dengan IP atau domain Anda
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8000
# Atau jika menggunakan Nginx reverse proxy:
# NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP/api

# =============================================================================
# WAJIB DIISI - ADMIN
# =============================================================================

ADMIN_EMAIL=admin@kehati.org
ADMIN_PASSWORD=YourStrongAdminPassword123!

# =============================================================================
# PRODUCTION SETTINGS
# =============================================================================

ENVIRONMENT=production
DEBUG=false
FIREWALL_ENABLED=true
```

**Simpan file** (Ctrl+O, Enter, Ctrl+X di nano)

### 2.4 Verifikasi Konfigurasi

```bash
# Check bahwa .env file ada dan tidak kosong
cat .env | grep -v "^#" | grep -v "^$"
```

---

## 3. Deployment dengan Docker Compose

### 3.1 Build dan Start Services

```bash
cd /opt/tamankehati

# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start semua services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 3.2 Jalankan Database Migrations

```bash
# Tunggu beberapa detik untuk database siap
sleep 10

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Atau jika ingin run manual:
# docker-compose -f docker-compose.prod.yml exec backend python -m alembic upgrade head
```

### 3.3 Verifikasi Deployment

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check health endpoints
curl http://localhost:8000/health
curl http://localhost:3000

# Check semua containers running
docker-compose -f docker-compose.prod.yml ps
```

### 3.4 Akses Aplikasi

Setelah semua services running:

- **Backend API**: `http://YOUR_SERVER_IP:8000`
- **Frontend**: `http://YOUR_SERVER_IP:3000`
- **Health Check**: `http://YOUR_SERVER_IP:8000/health`

---

## 4. Konfigurasi Nginx

### 4.1 Install Nginx (jika belum ada)

```bash
sudo apt install -y nginx
```

### 4.2 Konfigurasi Nginx

File konfigurasi sudah ada di `deploy-package/nginx/conf.d/default.conf`.

**Atau buat manual:**

```bash
sudo nano /etc/nginx/sites-available/tamankehati
```

**Isi dengan konfigurasi berikut:**

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # atau domain Anda jika ada

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # Uploads static files
    location /uploads {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
    }
}
```

### 4.3 Enable Konfigurasi

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tamankehati /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 4.4 Update CORS di .env

Jika menggunakan Nginx, update `.env`:

```bash
# Update CORS untuk menggunakan Nginx
CORS_ORIGINS=http://YOUR_SERVER_IP,http://YOUR_SERVER_IP:80

# Update frontend API URL
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP/api
```

Lalu restart services:

```bash
docker-compose -f docker-compose.prod.yml restart backend frontend
```

---

## 5. Setup SSL/HTTPS

### 5.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Setup SSL dengan Let's Encrypt

**Jika menggunakan domain:**

```bash
# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot akan otomatis mengupdate konfigurasi Nginx
```

**Jika hanya menggunakan IP:**

Let's Encrypt memerlukan domain. Untuk production dengan IP saja, pertimbangkan:

- Gunakan domain (gratis dari Freenom, atau beli domain murah)
- Atau gunakan self-signed certificate (tidak recommended untuk production)

### 5.3 Auto-renewal Certificate

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot sudah setup auto-renewal via systemd timer
```

---

## 6. Monitoring & Maintenance

### 6.1 View Logs

```bash
# Semua logs
docker-compose -f docker-compose.prod.yml logs -f

# Logs spesifik service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### 6.2 Restart Services

```bash
# Restart semua
docker-compose -f docker-compose.prod.yml restart

# Restart service spesifik
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
```

### 6.3 Update Deployment

```bash
cd /opt/tamankehati

# Pull latest code
git pull origin main

# Rebuild images
docker-compose -f docker-compose.prod.yml build

# Restart services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations jika ada
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### 6.4 Backup Database

```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U kehati_user kehati_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Atau menggunakan script backup
./scripts/backup-database.sh
```

### 6.5 Monitoring Resources

```bash
# Check container resource usage
docker stats

# Check disk usage
df -h
du -sh /opt/tamankehati

# Check logs size
docker-compose -f docker-compose.prod.yml exec backend du -sh /app/logs
```

---

## 7. Troubleshooting

### 7.1 Services Tidak Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check environment variables
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE
```

### 7.2 Database Connection Error

```bash
# Check database container
docker-compose -f docker-compose.prod.yml ps postgres

# Test database connection
docker-compose -f docker-compose.prod.yml exec backend python -c "import psycopg2; print('OK')"

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

### 7.3 Frontend Tidak Bisa Connect ke Backend

```bash
# Check CORS configuration
docker-compose -f docker-compose.prod.yml exec backend env | grep CORS

# Check backend health
curl http://localhost:8000/health

# Check frontend environment
docker-compose -f docker-compose.prod.yml exec frontend env | grep NEXT_PUBLIC_API_URL
```

### 7.4 Port Already in Use

```bash
# Check port usage
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :3000

# Stop service yang menggunakan port
sudo systemctl stop nginx  # jika port 80 digunakan
```

### 7.5 Disk Space Full

```bash
# Clean Docker unused data
docker system prune -a

# Clean old logs
docker-compose -f docker-compose.prod.yml exec backend find /app/logs -name "*.log" -mtime +30 -delete

# Check uploads size
du -sh /opt/tamankehati/uploads
```

---

## 8. Quick Reference Commands

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U kehati_user kehati_db > backup.sql

# Access backend shell
docker-compose -f docker-compose.prod.yml exec backend bash

# Access database
docker-compose -f docker-compose.prod.yml exec postgres psql -U kehati_user -d kehati_db
```

---

## 9. Checklist Deployment

- [ ] Server disiapkan dengan OS Ubuntu 20.04+
- [ ] Docker dan Docker Compose terinstall
- [ ] Firewall dikonfigurasi (SSH, HTTP, HTTPS)
- [ ] Repository di-clone ke `/opt/tamankehati`
- [ ] File `.env` dibuat dan dikonfigurasi
- [ ] `SECRET_KEY` di-generate dan diset
- [ ] `POSTGRES_PASSWORD` diubah ke password kuat
- [ ] `ADMIN_PASSWORD` diubah ke password kuat
- [ ] `SERVER_IP` diupdate dengan IP server
- [ ] `CORS_ORIGINS` dikonfigurasi
- [ ] `NEXT_PUBLIC_API_URL` dikonfigurasi
- [ ] Services di-build dan di-start
- [ ] Database migrations dijalankan
- [ ] Health checks passing
- [ ] Nginx dikonfigurasi (opsional)
- [ ] SSL certificate di-setup (jika menggunakan domain)
- [ ] Backup database di-setup

---

## 10. Support & Dokumentasi

- **Docker Compose**: https://docs.docker.com/compose/
- **Nginx**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/

---

**Selamat! Aplikasi Anda sudah berjalan di production server! 🎉**
