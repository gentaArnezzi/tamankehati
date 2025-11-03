# 🔗 Integrasi dengan Website Utama

Panduan untuk mengintegrasikan aplikasi Taman Kehati dengan website utama di server, sehingga bisa diakses dan di-link dari website utama.

---

## 📋 Skenario

**Website Utama:** (dasmap.co.id atau amilna.co.id)  
**Aplikasi Taman Kehati:** Akan di-link atau diakses dari website utama

**Opsi Integrasi:**
1. **Subdomain:** `tamankehati.dasmap.co.id` atau `tamankehati.amilna.co.id`
2. **Subdirectory/Path:** `dasmap.co.id/tamankehati/` atau `amilna.co.id/tamankehati/`
3. **Separate Domain:** Domain terpisah yang di-link dari website utama

---

## 🎯 Opsi 1: Subdomain (Recommended)

### Setup: `tamankehati.dasmap.co.id`

**Keuntungan:**
- ✅ URL professional dan clean
- ✅ Mudah di-remember
- ✅ Next.js routing tidak perlu konfigurasi khusus
- ✅ Bisa pakai SSL certificate terpisah

### Step 1: Setup DNS

**Di Domain Registrar (untuk dasmap.co.id):**

1. Login ke domain registrar
2. Go to DNS Management
3. Add A Record:
   ```
   Type: A
   Host: tamankehati
   Value: YOUR_SERVER_IP
   TTL: 3600
   ```

4. Wait for DNS propagation (5-60 minutes)

**Verify DNS:**
```bash
dig tamankehati.dasmap.co.id +short
# Should return YOUR_SERVER_IP
```

### Step 2: Setup Nginx di Server

**Di Server:**

```bash
sudo nano /etc/nginx/sites-available/tamankehati
```

**Isi:**
```nginx
# HTTP Server - Redirect to HTTPS (if SSL)
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;

    # If SSL is setup, redirect to HTTPS
    # return 301 https://$server_name$request_uri;
    
    # Temporary: Allow HTTP (remove after SSL setup)
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

# HTTPS Server (after SSL setup)
# server {
#     listen 443 ssl http2;
#     server_name tamankehati.dasmap.co.id;
#     
#     ssl_certificate /etc/letsencrypt/live/tamankehati.dasmap.co.id/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/tamankehati.dasmap.co.id/privkey.pem;
#     
#     # ... same location blocks as above
# }
```

**Enable:**
```bash
sudo ln -s /etc/nginx/sites-available/tamankehati /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 3: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d tamankehati.dasmap.co.id

# Certbot will auto-update Nginx config
```

### Step 4: Update Environment Variables

**Di server, update `.env`:**

```bash
cd ~/dasmap_prod/apps/tamankehati
nano .env
```

**Update:**
```bash
# Domain
DOMAIN=tamankehati.dasmap.co.id

# CORS - Include main website domain
CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id,https://tamankehati.dasmap.co.id

# Frontend API URL
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api
```

**Restart services:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml restart backend frontend
```

### Step 5: Link dari Website Utama

**Di website utama (dasmap.co.id), tambahkan link:**

**HTML:**
```html
<a href="https://tamankehati.dasmap.co.id">Taman Kehati</a>
```

**Atau di navigation menu:**
```html
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="https://tamankehati.dasmap.co.id">Taman Kehati</a>
</nav>
```

---

## 🎯 Opsi 2: Subdirectory/Path

### Setup: `dasmap.co.id/tamankehati/`

**Keuntungan:**
- ✅ Tidak perlu setup DNS
- ✅ URL tetap di domain utama
- ✅ SEO friendly (subdirectory)

**Kekurangan:**
- ⚠️ Next.js routing perlu konfigurasi khusus untuk base path
- ⚠️ Lebih kompleks setup

### Step 1: Update Next.js Config

**File:** `apps/frontend/next.config.js` (perlu di-build ulang)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/tamankehati',  // Add this
  assetPrefix: '/tamankehati',  // Add this
  // ... rest of config
}
```

**⚠️ Note:** Perlu rebuild images setelah update ini!

### Step 2: Setup Nginx di Server

**Di Nginx config untuk dasmap.co.id:**

```nginx
# Add to existing dasmap.co.id server block
location /tamankehati/ {
    rewrite ^/tamankehati/(.*)$ /$1 break;
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

location /tamankehati/api/ {
    rewrite ^/tamankehati/api/(.*)$ /api/$1 break;
    proxy_pass http://localhost:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Step 3: Update Environment Variables

```bash
# In .env
NEXT_PUBLIC_API_URL=https://dasmap.co.id/tamankehati/api
CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id
```

---

## 🎯 Opsi 3: Separate Domain (Alternative)

### Setup: Domain terpisah yang di-link

**Jika punya domain terpisah (misal: `tamankehati.com`):**

1. Setup seperti Opsi 1 (subdomain)
2. Link dari website utama:
   ```html
   <a href="https://tamankehati.com">Taman Kehati</a>
   ```

---

## 📊 Comparison

| Opsi | URL | Setup Complexity | Professional? | Recommended? |
|------|-----|------------------|---------------|--------------|
| **Subdomain** | `tamankehati.dasmap.co.id` | Medium | ✅ Yes | ✅ **Yes** |
| **Subdirectory** | `dasmap.co.id/tamankehati/` | High | ✅ Yes | ⚠️ If needed |
| **Separate Domain** | `tamankehati.com` | Medium | ✅ Yes | ✅ If available |

---

## 🔗 Link Integration Examples

### Di Website Utama (dasmap.co.id)

**1. Navigation Menu:**
```html
<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="https://tamankehati.dasmap.co.id" target="_blank">Taman Kehati</a></li>
  </ul>
</nav>
```

**2. Button/Link di Homepage:**
```html
<div class="feature-section">
  <h2>Konservasi Keanekaragaman Hayati</h2>
  <p>Jelajahi data dan informasi tentang taman kehati...</p>
  <a href="https://tamankehati.dasmap.co.id" class="btn">Kunjungi Taman Kehati</a>
</div>
```

**3. Footer Link:**
```html
<footer>
  <div class="links">
    <a href="https://tamankehati.dasmap.co.id">Taman Kehati</a>
    <a href="/privacy">Privacy Policy</a>
    <a href="/contact">Contact</a>
  </div>
</footer>
```

---

## 🔒 Security & CORS Configuration

### Update CORS untuk Allow Website Utama

**Di `.env`:**

```bash
# Include main website in CORS
CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id,https://tamankehati.dasmap.co.id,http://localhost:3000
```

**Backend akan allow requests dari website utama.**

---

## 📝 Step-by-Step Setup (Subdomain - Recommended)

### 1. DNS Setup
```bash
# Di domain registrar, add A record:
# tamankehati -> YOUR_SERVER_IP
```

### 2. Deploy Application
```bash
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

### 3. Setup Nginx
```bash
sudo nano /etc/nginx/sites-available/tamankehati
# Copy config dari deploy-package/nginx/server-nginx-example.conf
# Update dengan subdomain: tamankehati.dasmap.co.id

sudo ln -s /etc/nginx/sites-available/tamankehati /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Update .env
```bash
DOMAIN=tamankehati.dasmap.co.id
CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id,https://tamankehati.dasmap.co.id
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api
```

### 5. Setup SSL
```bash
sudo certbot --nginx -d tamankehati.dasmap.co.id
```

### 6. Add Link di Website Utama
```html
<a href="https://tamankehati.dasmap.co.id">Taman Kehati</a>
```

---

## ✅ Verification Checklist

- [ ] DNS A record pointing ke server IP
- [ ] Nginx config created dan enabled
- [ ] Docker containers running (port 3000 dan 8000)
- [ ] SSL certificate generated (optional but recommended)
- [ ] `.env` updated dengan domain dan CORS
- [ ] Services restarted
- [ ] Link added di website utama
- [ ] Test akses dari website utama
- [ ] Test CORS jika ada cross-origin requests

---

## 🚀 Quick Start

**Jika punya domain dasmap.co.id atau amilna.co.id:**

1. **Setup subdomain:** `tamankehati.dasmap.co.id` (atau `tamankehati.amilna.co.id`)
2. **Deploy:** `docker compose -f docker-compose.pull.no-nginx.yml up -d`
3. **Setup Nginx:** Copy config dari `deploy-package/nginx/server-nginx-example.conf`
4. **Update .env:** Set domain dan CORS
5. **Add link:** Di website utama, tambahkan link ke subdomain

**URL Final:** `https://tamankehati.dasmap.co.id`

---

**Last Updated:** 2025-11-04

