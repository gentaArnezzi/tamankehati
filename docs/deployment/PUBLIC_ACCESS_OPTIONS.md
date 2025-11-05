# 🌐 Opsi Public Access untuk Taman Kehati

Karena port 80 sudah dipakai website lain, berikut opsi untuk public access Taman Kehati.

---

## 📋 Situasi Saat Ini

**Server setup:**
- Port 80: Website lain (dasmap.co.id atau aplikasi lain)
- Port 8080: Taman Kehati (Frontend + Backend)
- Nginx: Running di `dasmap_prod-go-1` container

**Current access:**
- Website lain: `http://38.47.93.167` (port 80)
- Taman Kehati: `http://38.47.93.167:8080` (port 8080)

---

## 🎯 Opsi Public Access

### Opsi 1: Tetap Pakai IP:Port (Current) ⚡

**URL:**
- Frontend: `http://38.47.93.167:8080`
- API: `http://38.47.93.167:8080/api`

**Keuntungan:**
- ✅ Sudah jalan sekarang
- ✅ Tidak perlu setup DNS
- ✅ Simple dan cepat

**Kekurangan:**
- ⚠️ URL kurang professional (ada port number)
- ⚠️ Tidak bisa pakai SSL standard
- ⚠️ User harus ingat port number

**Security:**
- Tambahkan rate limiting (lihat `QUICK_SECURITY_FIX.md`)
- Hide API docs dari public

---

### Opsi 2: Subdomain dengan Port 80 (Recommended) ⭐

**Setup Nginx di server untuk route berdasarkan domain.**

**URL:**
- Frontend: `http://tamankehati.dasmap.co.id` (port 80, standard)
- API: `http://tamankehati.dasmap.co.id/api`

**Keuntungan:**
- ✅ Professional URL (tanpa port)
- ✅ Tidak konflik dengan website lain
- ✅ Bisa pakai SSL nanti
- ✅ User-friendly

**Setup Steps:**

**1. Setup DNS A Record:**
```
Type: A
Host: tamankehati
Value: 38.47.93.167
TTL: 3600
```

**2. Update Nginx Config di Server:**

**Edit config di `dasmap_prod-go-1` container:**

```bash
# Di server
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Update config:**
```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

server {
    listen 80;
    server_name tamankehati.dasmap.co.id;  # Hanya subdomain, bukan IP
    
    # Frontend
    location / {
        limit_req zone=general_limit burst=20 nodelay;
        
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
    
    # API dengan rate limiting
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Uploads
    location /uploads/ {
        limit_req zone=general_limit burst=10 nodelay;
        
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Docs - Restricted
    location /docs {
        allow 127.0.0.1;
        allow 172.27.0.0/16;
        deny all;
        
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
        access_log off;
    }
}
```

**3. Test & Reload Nginx:**
```bash
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

**4. Wait DNS Propagation (5-60 menit), lalu test:**
```bash
# Test DNS
dig tamankehati.dasmap.co.id +short
# Should return: 38.47.93.167

# Test website
curl http://tamankehati.dasmap.co.id | head -20
```

**5. Update Frontend API URL:**

**Rebuild frontend dengan domain:**
```bash
# Update GitHub Secret: NEXT_PUBLIC_API_URL
# Set ke: https://tamankehati.dasmap.co.id/api

# Atau rebuild manual:
docker build -t arnezzi/tamankehati-frontend:v1.0.6 \
  --build-arg NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api \
  ./apps/frontend
```

**6. Setup SSL (Optional but Recommended):**
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate (inside container atau mount volume)
# Note: Certbot biasanya perlu akses ke Nginx config di host
# Mungkin perlu setup SSL di host level, bukan container level
```

---

### Opsi 3: Subdomain dengan Port 8080

**Pakai subdomain tapi tetap akses via port 8080.**

**URL:**
- Frontend: `http://tamankehati.dasmap.co.id:8080`
- API: `http://tamankehati.dasmap.co.id:8080/api`

**Keuntungan:**
- ✅ Professional domain name
- ✅ Tidak perlu update Nginx routing di port 80
- ✅ Simple setup

**Kekurangan:**
- ⚠️ Masih perlu port number
- ⚠️ SSL kurang standard untuk port 8080

**Setup:**
1. Setup DNS A record (sama seperti Opsi 2)
2. Update Nginx config di port 8080 dengan `server_name tamankehati.dasmap.co.id`
3. Update frontend API URL

---

### Opsi 4: Path-based Routing (Tidak Recommended)

**Route via path: `/tamankehati/`**

**URL:**
- Frontend: `http://38.47.93.167/tamankehati/`
- API: `http://38.47.93.167/tamankehati/api/`

**Kekurangan:**
- ⚠️ Next.js perlu base path configuration
- ⚠️ URL kurang professional
- ⚠️ Kompleks untuk setup

**Tidak recommended untuk production.**

---

## 🔒 Security untuk Semua Opsi

**Untuk semua opsi, tambahkan security measures:**

1. **Rate Limiting** - Limit API requests
2. **Hide API Docs** - Restrict `/docs` dan `/openapi.json`
3. **CORS Configuration** - Update `CORS_ORIGINS` di backend
4. **SSL/HTTPS** - Setup SSL untuk production

**Lihat:** `QUICK_SECURITY_FIX.md` untuk detail.

---

## 📊 Comparison

| Opsi | URL | Professional | SSL | Setup Complexity |
|------|-----|--------------|-----|-------------------|
| **Opsi 1** | `IP:8080` | ❌ | ⚠️ | ✅ Simple |
| **Opsi 2** | `domain.com` | ✅ | ✅ | ⚠️ Medium |
| **Opsi 3** | `domain.com:8080` | ⚠️ | ⚠️ | ✅ Simple |
| **Opsi 4** | `domain.com/path/` | ❌ | ✅ | ❌ Complex |

---

## 🎯 Recommended Approach

**Untuk Production:**
- **Opsi 2** (Subdomain dengan Port 80) ⭐
- Professional URL
- Bisa SSL
- Tidak konflik dengan website lain

**Untuk Development/Testing:**
- **Opsi 1** (IP:Port 8080)
- Quick dan simple
- Tidak perlu setup DNS

**Quick Security Fix:**
- Tambahkan rate limiting ke config yang ada
- Hide API docs dari public
- Reload Nginx

---

## 📝 Quick Reference

**Current Setup (IP:Port):**
```bash
# Access
http://38.47.93.167:8080          # Frontend
http://38.47.93.167:8080/api      # API

# Config location
~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**With Domain (Recommended):**
```bash
# Access
http://tamankehati.dasmap.co.id          # Frontend
http://tamankehati.dasmap.co.id/api      # API

# Config location (same)
~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf

# Update:
# - DNS A record
# - server_name di Nginx config
# - NEXT_PUBLIC_API_URL di frontend
```

---

## ✅ Next Steps

**Sekarang:**
1. ✅ Tambahkan security (rate limiting, hide docs)
2. ✅ Tetap pakai IP:8080 untuk testing

**Nanti (Production):**
1. Setup DNS A record
2. Update Nginx config dengan domain
3. Update frontend API URL
4. Setup SSL

---

**Last Updated:** 2025-11-05

