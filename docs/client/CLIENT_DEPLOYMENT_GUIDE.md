# 📦 Client Deployment Guide - Taman Kehati

Panduan lengkap untuk deployment aplikasi Taman Kehati menggunakan Docker di server client.

---

## 📋 Prerequisites

Sebelum memulai deployment, pastikan server memiliki:

- **Docker** version 20.10 atau lebih baru
- **Docker Compose** version 2.0 atau lebih baru
- **Git** untuk clone repository
- **Minimum 4GB RAM** (disarankan 8GB+)
- **Minimum 20GB disk space**
- **Akses root atau sudo** untuk install Docker (jika belum terinstall)

### Cara Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Clone Repository

```bash
# Clone repository ke server
git clone <repository-url>
cd tamankehati_new
```

### Step 2: Setup Environment Variables

```bash
# Copy environment template
cp env.example .env

# Edit environment file dengan text editor
nano .env
# atau
vi .env
```

#### ⚠️ WAJIB DIUBAH:

1. **SECRET_KEY** - Generate random string minimal 32 karakter:
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   Copy hasilnya dan paste ke `SECRET_KEY` di file `.env`

2. **POSTGRES_PASSWORD** - Buat password yang kuat untuk database

3. **CORS_ORIGINS** - Ganti dengan domain production Anda:
   ```
   CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
   ```

4. **NEXT_PUBLIC_API_URL** - Ganti dengan URL backend production:
   ```
   NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
   # atau jika backend di server yang sama:
   NEXT_PUBLIC_API_URL="http://backend:8000"
   ```

5. **ENVIRONMENT** - Set ke production:
   ```
   ENVIRONMENT="production"
   DEBUG="false"
   ```

#### Optional Configuration:

- **ADMIN_EMAIL** - Email untuk admin user pertama (default: admin@kehati.org)
- **ADMIN_PASSWORD** - Password untuk admin user pertama (default: admin123)
- **FIREWALL_ENABLED** - Enable firewall untuk security tambahan
- **LOG_LEVEL** - Set ke INFO atau WARNING untuk production

### Step 3: Build Docker Images

```bash
# Build semua images (butuh waktu beberapa menit pertama kali)
docker-compose -f docker-compose.prod.yml build

# Atau build specific service
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml build frontend
```

### Step 4: Start Services

```bash
# Start semua services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 5: Verify Deployment

1. **Check Backend Health:**
   ```bash
   curl http://localhost:8000/health
   # Expected: {"status":"ok"}
   ```

2. **Check Frontend:**
   ```bash
   curl http://localhost:3000
   # Should return HTML
   ```

3. **Access Application:**
   - Frontend: http://your-server-ip:3000
   - Backend API: http://your-server-ip:8000
   - API Docs: http://your-server-ip:8000/docs

4. **Login dengan Admin:**
   - Email: `admin@kehati.org` (atau sesuai ADMIN_EMAIL yang di-set)
   - Password: `admin123` (atau sesuai ADMIN_PASSWORD yang di-set)
   - **⚠️ PENTING: Ubah password segera setelah login pertama!**

---

## 🔧 Post-Deployment Configuration

### 1. Setup Reverse Proxy (Nginx)

Untuk production, disarankan menggunakan Nginx sebagai reverse proxy:

```nginx
# /etc/nginx/sites-available/tamankehati

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/tamankehati /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### 3. Update Environment Variables untuk SSL

Setelah SSL setup, update `.env`:
```
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

Restart services:
```bash
docker-compose -f docker-compose.prod.yml restart
```

---

## 🔍 Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Check Service Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Stop Services

```bash
docker-compose -f docker-compose.prod.yml stop
```

### Start Services

```bash
docker-compose -f docker-compose.prod.yml start
```

---

## 🔐 Security Best Practices

### 1. Change Default Passwords

- ✅ Admin user password (setelah login pertama)
- ✅ Database password (POSTGRES_PASSWORD)
- ✅ SECRET_KEY (generate yang baru)

### 2. Enable Firewall

Edit `.env`:
```
FIREWALL_ENABLED="true"
FIREWALL_MODE="blacklist"
IP_BLACKLIST="malicious-ip-addresses"
```

### 3. Regular Backups

**Database Backup:**
```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U kehati_user kehati_db > backup_$(date +%Y%m%d).sql
```

**Restore Database:**
```bash
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U kehati_user kehati_db < backup_20250101.sql
```

### 4. Update Docker Images

```bash
# Pull latest base images
docker-compose -f docker-compose.prod.yml pull

# Rebuild dengan updates
docker-compose -f docker-compose.prod.yml build --no-cache

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🐛 Troubleshooting

### Service Tidak Start

```bash
# Check logs untuk error
docker-compose -f docker-compose.prod.yml logs backend

# Check apakah port sudah digunakan
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000

# Kill process yang menggunakan port
sudo kill -9 <PID>
```

### Database Connection Error

```bash
# Check database container
docker-compose -f docker-compose.prod.yml ps postgres

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test connection manually
docker-compose -f docker-compose.prod.yml exec backend python -c "from core.database.engine import engine; print('OK')"
```

### Migration Error

```bash
# Check current migration status
docker-compose -f docker-compose.prod.yml exec backend alembic current

# Manual migration
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Check migration history
docker-compose -f docker-compose.prod.yml exec backend alembic history
```

### Frontend Tidak Connect ke Backend

1. Check `NEXT_PUBLIC_API_URL` di `.env`
2. Check CORS settings di backend
3. Check apakah backend accessible:
   ```bash
   curl http://localhost:8000/health
   ```

### Out of Memory

```bash
# Check memory usage
docker stats

# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory

# Or optimize by reducing workers
# Edit docker-compose.prod.yml: change --workers 4 to --workers 2
```

---

## 📝 Important Notes

1. **First Time Setup:**
   - Admin user akan otomatis dibuat saat pertama kali backend start
   - Default credentials: `admin@kehati.org` / `admin123`
   - **⚠️ WAJIB ganti password setelah login pertama!**

2. **Database Migrations:**
   - Migrations otomatis dijalankan saat backend start
   - Tidak perlu manual migration (kecuali ada error)

3. **File Uploads:**
   - Uploaded files disimpan di Docker volume `backend_uploads`
   - Backed up bersama dengan database backup

4. **Ports:**
   - Default ports: 8000 (backend), 3000 (frontend), 5432 (postgres), 6379 (redis)
   - Bisa diubah di `.env` jika ada konflik

5. **Updates:**
   - Pull latest code: `git pull`
   - Rebuild: `docker-compose -f docker-compose.prod.yml build`
   - Restart: `docker-compose -f docker-compose.prod.yml restart`

---

## 📞 Support

Jika mengalami masalah:

1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Check service status: `docker-compose -f docker-compose.prod.yml ps`
3. Review troubleshooting section di atas
4. Contact development team dengan detail error

---

**Selamat menggunakan Taman Kehati!** 🎉

