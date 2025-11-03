# 🌐 Nginx & Port Management untuk Multi-Tenant Server

Panduan mengatur Nginx dan port untuk aplikasi Taman Kehati di server yang sudah ada aplikasi lain.

---

## 📋 Situasi Server Anda

**Server sudah punya:**
- Nginx di server (kemungkinan di port 80)
- Aplikasi lain (dasmap.co.id, amilna.co.id, goproject)
- Nginx routing untuk aplikasi yang sudah ada

**Pertanyaan:** Apakah web Taman Kehati pakai port yang sama?

**Jawaban:** Ada beberapa opsi, tergantung setup yang Anda inginkan.

---

## 🎯 Opsi 1: Pakai Nginx di Server (Recommended)

### Cara Kerja:
- **Port 80** → Nginx di server (yang sudah ada)
- Nginx di server route ke containers:
  - `tamankehati.domain.com` → `localhost:3000` (Frontend container)
  - `tamankehati.domain.com/api/` → `localhost:8000` (Backend container)
- **Tidak perlu expose port 80 di container**

### Keuntungan:
- ✅ Port 80 tetap untuk Nginx di server
- ✅ Tidak konflik dengan aplikasi lain
- ✅ Bisa pakai subdomain (tamankehati.domain.com)
- ✅ Professional setup

### Setup:

**1. Gunakan Docker Compose tanpa Nginx container:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

**2. Setup Nginx config di server:**
```bash
sudo nano /etc/nginx/sites-available/tamankehati
```

**Isi:**
```nginx
server {
    listen 80;
    server_name tamankehati.yourdomain.com;  # atau IP

    # Frontend
    location / {
        proxy_pass http://localhost:3000;  # Frontend container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;  # Backend container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**3. Enable config:**
```bash
sudo ln -s /etc/nginx/sites-available/tamankehati /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Akses:**
- Via subdomain: `http://tamankehati.yourdomain.com`
- Via IP: `http://YOUR_SERVER_IP` (jika configure di server_name)

---

## 🎯 Opsi 2: Port Berbeda (Simple)

### Cara Kerja:
- **Port 80** → Tetap untuk aplikasi lain (dasmap.co.id, amilna.co.id)
- **Port 3000** → Frontend Taman Kehati (direct access)
- **Port 8000** → Backend Taman Kehati (direct access)
- **Tidak perlu setup Nginx routing**

### Keuntungan:
- ✅ Simple, tidak perlu setup Nginx
- ✅ Tidak konflik dengan aplikasi lain
- ✅ Langsung akses via port

### Kekurangan:
- ❌ Kurang professional (harus pakai port di URL)
- ❌ URL: `http://server-ip:3000` (tidak cantik)

### Setup:

**1. Gunakan Docker Compose tanpa Nginx container:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

**2. Akses langsung:**
- Frontend: `http://YOUR_SERVER_IP:3000`
- Backend: `http://YOUR_SERVER_IP:8000`

**Tidak perlu setup Nginx!**

---

## 🎯 Opsi 3: Path-based Routing (Alternative)

### Cara Kerja:
- **Port 80** → Nginx di server
- Nginx route berdasarkan path:
  - `/dasmap/` → Aplikasi dasmap
  - `/amilna/` → Aplikasi amilna
  - `/tamankehati/` → Aplikasi Taman Kehati

### Keuntungan:
- ✅ Port 80 tetap digunakan
- ✅ Tidak perlu subdomain

### Kekurangan:
- ❌ URL kurang cantik: `http://domain.com/tamankehati/`
- ❌ Next.js routing mungkin perlu konfigurasi khusus

### Setup:

**Nginx config:**
```nginx
location /tamankehati/ {
    rewrite ^/tamankehati/(.*)$ /$1 break;
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    # ... headers
}

location /tamankehati/api/ {
    rewrite ^/tamankehati/api/(.*)$ /api/$1 break;
    proxy_pass http://localhost:8000;
    # ... headers
}
```

---

## 📊 Comparison Table

| Opsi | Port 80 | Port 3000 | Port 8000 | URL | Professional? |
|------|---------|-----------|----------|-----|---------------|
| **Opsi 1: Nginx di Server** | ✅ Nginx di server | ✅ Container | ✅ Container | `http://tamankehati.domain.com` | ✅ Yes |
| **Opsi 2: Port Berbeda** | ✅ App lain | ✅ Container | ✅ Container | `http://server-ip:3000` | ❌ No |
| **Opsi 3: Path-based** | ✅ Nginx di server | ✅ Container | ✅ Container | `http://domain.com/tamankehati/` | ⚠️ Medium |

---

## 🎯 Recommendation untuk Server Anda

**Berdasarkan struktur server Anda:**

### Jika Punya Domain:
→ **Opsi 1: Pakai Nginx di Server dengan Subdomain**
- Setup subdomain: `tamankehati.yourdomain.com`
- Nginx di server route ke containers
- Professional dan tidak konflik

### Jika Tidak Punya Domain:
→ **Opsi 2: Port Berbeda (Simple)**
- Akses langsung: `http://server-ip:3000`
- Tidak perlu setup Nginx routing
- Simple dan cepat

---

## 🔍 Check Port Status

**Sebelum deploy, check port yang sudah digunakan:**

```bash
# Di server
sudo netstat -tulpn | grep -E ":80|:3000|:8000"

# Atau
sudo ss -tulpn | grep -E ":80|:3000|:8000"
```

**Output example:**
```
tcp  0  0  0.0.0.0:80          LISTEN  1234/nginx
tcp  0  0  0.0.0.0:3000        LISTEN  - (belum digunakan)
tcp  0  0  0.0.0.0:8000        LISTEN  - (belum digunakan)
```

**Jika port 80 sudah digunakan oleh Nginx:**
→ Gunakan **Opsi 1** (Nginx di server route ke containers)

**Jika port 3000 dan 8000 kosong:**
→ Bisa pakai **Opsi 2** (direct access via port)

---

## 📝 Quick Decision Guide

### Pilih Opsi 1 jika:
- ✅ Punya domain atau subdomain
- ✅ Ingin URL professional (tamankehati.domain.com)
- ✅ Port 80 sudah digunakan Nginx di server
- ✅ Ingin setup yang proper

### Pilih Opsi 2 jika:
- ❌ Tidak punya domain
- ✅ Ingin setup cepat dan simple
- ✅ Oke dengan URL `http://server-ip:3000`
- ✅ Port 3000 dan 8000 kosong

### Pilih Opsi 3 jika:
- ✅ Punya domain tapi tidak mau subdomain
- ✅ Oke dengan path-based routing
- ✅ Port 80 sudah digunakan

---

## 🚀 Quick Setup Commands

### Opsi 1: Nginx di Server (Recommended)

```bash
# 1. Deploy containers (tanpa Nginx container)
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml up -d

# 2. Setup Nginx config di server
sudo nano /etc/nginx/sites-available/tamankehati
# Copy config dari deploy-package/nginx/server-nginx-example.conf

# 3. Enable
sudo ln -s /etc/nginx/sites-available/tamankehati /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Opsi 2: Port Berbeda (Simple)

```bash
# 1. Deploy containers (tanpa Nginx container)
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml up -d

# 2. Akses langsung
# Frontend: http://server-ip:3000
# Backend: http://server-ip:8000
```

---

## ✅ Summary

**Jawaban untuk pertanyaan Anda:**

**"Apakah web saya pakai port yang sama dengan web yang sudah ada?"**

**Tergantung pilihan Anda:**

1. **Jika pakai Opsi 1 (Nginx di server):**
   - ✅ Port 80 tetap untuk Nginx di server
   - ✅ Nginx route ke containers di port 3000 dan 8000
   - ✅ URL: `http://tamankehati.domain.com` (professional)

2. **Jika pakai Opsi 2 (Port berbeda):**
   - ✅ Port 80 tetap untuk aplikasi lain
   - ✅ Port 3000 dan 8000 untuk aplikasi Taman Kehati
   - ✅ URL: `http://server-ip:3000` (simple)

**Kesimpulan:** Port 80 bisa tetap untuk aplikasi lain, aplikasi Taman Kehati bisa pakai port 3000/8000 atau di-route via Nginx di server.

---

**Last Updated:** 2025-11-04

