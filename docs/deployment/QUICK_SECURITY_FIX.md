# 🔒 Quick Security Fix untuk API

Guide cepat untuk menambahkan security ke Nginx config yang sudah ada.

---

## 🎯 Problem

**Saat ini:**
- `http://38.47.93.167:8080/api` bisa diakses semua orang
- Tidak ada rate limiting
- API docs (`/docs`) accessible dari public
- Tidak ada protection untuk abuse

---

## ✅ Solution: Add Rate Limiting & Hide Docs

### Step 1: Backup Config Current

```bash
# Di server
cd ~/dasmap_prod/apps/nginx/sites-enabled
cp tamankehati.conf tamankehati.conf.backup
```

### Step 2: Update Config dengan Security

**Option A: Edit manual (recommended)**

```bash
# Edit config
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Add rate limiting zones di bagian atas (sebelum `server {`):**

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

server {
    listen 8080;
    # ... existing config
```

**Update location `/api/` dengan rate limiting:**

```nginx
# Backend API
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;  # ADD THIS LINE
    
    proxy_pass http://localhost:8000;
    # ... rest of existing config
}
```

**Update location `/docs` dan `/openapi.json` untuk restrict access:**

```nginx
# Backend docs (Swagger UI) - Restrict access
location /docs {
    allow 127.0.0.1;
    allow 172.27.0.0/16;  # Docker network
    deny all;
    
    proxy_pass http://localhost:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Backend OpenAPI JSON - Restrict access
location /openapi.json {
    allow 127.0.0.1;
    allow 172.27.0.0/16;  # Docker network
    deny all;
    
    proxy_pass http://localhost:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Option B: Replace dengan secure config**

```bash
# Copy secure config dari repo
cd ~/dasmap_prod/apps/tamankehati
cp deploy-package/nginx/tamankehati-container-go-port-secure.conf ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

### Step 3: Test Nginx Config

```bash
# Test config
docker exec -it dasmap_prod-go-1 nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 4: Reload Nginx

```bash
# Reload Nginx
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## ✅ Verify Security

### Test Rate Limiting

```bash
# Test rate limiting (should be limited after 10 requests/second)
for i in {1..15}; do 
    curl -s -o /dev/null -w "%{http_code}\n" http://38.47.93.167:8080/api/health
    sleep 0.1
done
```

**Expected:** 
- First 10 requests: `200`
- After 10 requests: `503` (Service Unavailable) karena rate limit

### Test API Docs Restriction

```bash
# Test dari external (should be denied)
curl http://38.47.93.167:8080/docs
# Expected: 403 Forbidden

# Test dari internal (should work)
docker exec tamankehati-backend-prod curl http://localhost:8000/docs
# Expected: HTML content
```

---

## 📋 Complete Secure Config Example

**Full config dengan semua security features:**

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

server {
    listen 8080;
    server_name 38.47.93.167 _;

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

    # OpenAPI - Restricted
    location /openapi.json {
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

    location /api/health {
        proxy_pass http://localhost:8000/health;
        access_log off;
    }
}
```

---

## 🌐 Next Steps: Setup Domain

**Untuk public access yang lebih baik, setup domain:**

1. **Setup DNS:**
   - Type: A
   - Name: `tamankehati`
   - Content: `38.47.93.167`

2. **Update Nginx config:**
   - Use `tamankehati-container-go-domain.conf`
   - Update `server_name` ke `tamankehati.dasmap.co.id`

3. **Update Frontend API URL:**
   - Rebuild dengan `NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api`

4. **Setup SSL (optional):**
   - Use Let's Encrypt dengan Certbot

**Lihat:** `docs/deployment/PUBLIC_ACCESS_AND_SECURITY.md` untuk detail lengkap.

---

## 📊 Rate Limiting Explained

**Zones:**
- `api_limit`: 10 requests/second untuk API
- `general_limit`: 30 requests/second untuk general traffic

**Burst:**
- `burst=20`: Allow 20 additional requests before rate limiting kicks in
- `nodelay`: Don't delay requests, immediately reject if over limit

**Adjustment:**
- Jika terlalu ketat: increase `rate` (misalnya `20r/s`)
- Jika masih abuse: decrease `rate` (misalnya `5r/s`)

---

## ✅ Summary

**Security Features Added:**
- ✅ Rate limiting (10 req/s untuk API)
- ✅ Hide API docs dari public
- ✅ Security headers
- ✅ Protection dari abuse

**Public Access:**
- **Current**: `http://38.47.93.167:8080` (IP:port)
- **Recommended**: `https://tamankehati.dasmap.co.id` (domain)

**API Access:**
- ✅ Rate limited (10 req/s)
- ✅ Docs restricted ke internal only
- ✅ Backend authentication tetap berlaku

---

**Last Updated:** 2025-11-05

