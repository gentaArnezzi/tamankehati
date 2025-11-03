# 🚀 Quick Start - Deployment ke Server

## ⚡ Deployment Cepat (15 Menit)

### Prerequisites

- Server Ubuntu 20.04+ dengan akses SSH
- IP address atau domain
- Akses root atau sudo

---

## 📋 Step-by-Step Deployment

### 1. Login ke Server

```bash
ssh user@your-server-ip
```

### 2. Setup Awal

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Tambahkan user ke docker group
sudo usermod -aG docker $USER
newgrp docker  # Refresh group tanpa logout

# Install Git
sudo apt install -y git
```

### 3. Clone Repository

```bash
# Buat direktori
sudo mkdir -p /opt/tamankehati
sudo chown $USER:$USER /opt/tamankehati
cd /opt/tamankehati

# Clone repository
git clone https://github.com/your-username/tamankehati.git .
# Atau jika sudah ada:
# git pull origin main
```

### 4. Setup Environment

```bash
cd /opt/tamankehati

# Copy template
cp env.production.example .env

# Generate SECRET_KEY
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
echo "SECRET_KEY=$SECRET_KEY" >> .env

# Edit .env dengan editor
nano .env
```

**WAJIB Edit di `.env`:**
- `SERVER_IP` = IP server Anda
- `POSTGRES_PASSWORD` = Password database yang kuat
- `ADMIN_PASSWORD` = Password admin yang kuat
- `CORS_ORIGINS` = `http://YOUR_SERVER_IP:3000,http://YOUR_SERVER_IP:80`
- `NEXT_PUBLIC_API_URL` = `http://YOUR_SERVER_IP:8000`

### 5. Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 6. Deploy

```bash
cd /opt/tamankehati

# Build dan start
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Tunggu beberapa detik
sleep 15

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 7. Verifikasi

```bash
# Check health
curl http://localhost:8000/health

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 8. Akses Aplikasi

- **Backend**: `http://YOUR_SERVER_IP:8000`
- **Frontend**: `http://YOUR_SERVER_IP:3000`
- **Health**: `http://YOUR_SERVER_IP:8000/health`

---

## 🔧 Setup Nginx (Opsional - Recommended)

### Install Nginx

```bash
sudo apt install -y nginx
```

### Buat Konfigurasi

```bash
sudo nano /etc/nginx/sites-available/tamankehati
```

**Paste konfigurasi berikut:**

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # atau domain Anda

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
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### Enable dan Restart

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tamankehati /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Update .env untuk Nginx

```bash
# Update NEXT_PUBLIC_API_URL
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP/api

# Restart frontend
docker-compose -f docker-compose.prod.yml restart frontend
```

---

## 🔐 Setup SSL/HTTPS (Jika Ada Domain)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 📊 Monitoring

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps

# Check resources
docker stats
```

---

## 🔄 Update Deployment

```bash
cd /opt/tamankehati

# Pull latest code
git pull origin main

# Rebuild
docker-compose -f docker-compose.prod.yml build

# Restart
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## 🆘 Troubleshooting

### Services Tidak Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check environment
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE
```

### Database Connection Error

```bash
# Check database
docker-compose -f docker-compose.prod.yml ps postgres
docker-compose -f docker-compose.prod.yml logs postgres
```

### Frontend Tidak Connect Backend

```bash
# Check CORS
docker-compose -f docker-compose.prod.yml exec backend env | grep CORS

# Check backend health
curl http://localhost:8000/health
```

---

## ✅ Checklist

- [ ] Docker terinstall
- [ ] Docker Compose terinstall
- [ ] Repository di-clone
- [ ] File `.env` dikonfigurasi
- [ ] SECRET_KEY di-generate
- [ ] Password database diubah
- [ ] Password admin diubah
- [ ] SERVER_IP diupdate
- [ ] Services di-build dan di-start
- [ ] Migrations dijalankan
- [ ] Health checks passing
- [ ] Aplikasi dapat diakses

---

**Selesai! Aplikasi Anda sudah berjalan di production! 🎉**

