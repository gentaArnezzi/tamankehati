# 🚀 Quick Integration Guide: Link dari Website Utama

Panduan cepat untuk mengintegrasikan aplikasi Taman Kehati dengan website utama.

---

## 🎯 Setup Subdomain (Recommended)

### 1. DNS Setup

**Di Domain Registrar (untuk dasmap.co.id atau amilna.co.id):**

```
Add A Record:
Type: A
Host: tamankehati
Value: YOUR_SERVER_IP
TTL: 3600
```

**Result:** `tamankehati.dasmap.co.id` → Points to server IP

### 2. Deploy Application

```bash
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

### 3. Setup Nginx Config

```bash
sudo nano /etc/nginx/sites-available/tamankehati
```

**Copy config dari:** `deploy-package/nginx/server-nginx-example.conf`

**Update dengan subdomain Anda:**
```nginx
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;  # ← Ganti ini
    # ... rest of config
}
```

**Enable:**
```bash
sudo ln -s /etc/nginx/sites-available/tamankehati /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Update .env

```bash
cd ~/dasmap_prod/apps/tamankehati
nano .env
```

**Update:**
```bash
DOMAIN=tamankehati.dasmap.co.id
CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id,https://tamankehati.dasmap.co.id
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api
```

**Restart:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml restart backend frontend
```

### 5. Setup SSL (Optional)

```bash
sudo certbot --nginx -d tamankehati.dasmap.co.id
```

### 6. Add Link di Website Utama

**Di dasmap.co.id atau amilna.co.id, tambahkan:**

```html
<!-- Navigation -->
<a href="https://tamankehati.dasmap.co.id">Taman Kehati</a>

<!-- Button -->
<a href="https://tamankehati.dasmap.co.id" class="btn">Kunjungi Taman Kehati</a>

<!-- Footer -->
<a href="https://tamankehati.dasmap.co.id">Taman Kehati</a>
```

---

## ✅ Result

**URL:** `https://tamankehati.dasmap.co.id` (atau subdomain yang Anda pilih)

**Akses:** Bisa diakses dari website utama via link atau langsung via subdomain.

---

**Dokumentasi lengkap:** `docs/deployment/INTEGRATION_WITH_MAIN_WEBSITE.md`

