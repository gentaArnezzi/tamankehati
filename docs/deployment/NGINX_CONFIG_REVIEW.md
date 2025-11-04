# ✅ Review Nginx Config untuk Port-based Routing

Analisis dan perbaikan config Nginx untuk port-based routing.

---

## 📋 Config yang Anda Miliki

**Bagian yang sudah benar:**
- ✅ `listen 8080;` - Port yang tepat untuk port-based routing
- ✅ Security settings (server_tokens, limits, timeouts)
- ✅ Rate limiting zones (tapi belum diaplikasikan)

**Yang perlu diperbaiki:**
- ⚠️ `server_name tamankehati.dasmap.co.id;` - Untuk port-based routing, lebih baik pakai IP atau catch-all
- ⚠️ Rate limiting zones belum diaplikasikan di location blocks
- ⚠️ Perlu pastikan semua location blocks lengkap

---

## ✅ Config yang Benar (Complete)

```nginx
# RATE LIMITING ZONES (DDoS Protection)
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;
limit_req_zone $binary_remote_addr zone=strict_limit:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=5r/s;

# Connection limiting
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

server {
    listen 8080;
    server_name 38.47.93.167 _; # IP atau catch-all untuk port-based routing

    # Security: Hide Nginx version
    server_tokens off;

    # Security: Connection limits per IP
    limit_conn conn_limit 20;

    # Security: Request body size
    client_max_body_size 10M;

    # Security: Timeouts
    client_body_timeout 60s;
    client_header_timeout 60s;
    keepalive_timeout 65s;

    # Frontend (Next.js) - Apply rate limiting
    location / {
        limit_req zone=general_limit burst=20 nodelay;
        limit_req_status 429;
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }

    # Backend API - Apply strict rate limiting
    location /api/ {
        limit_req zone=api_limit burst=10 nodelay;
        limit_req_status 429;
        
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }

    # Backend uploads - Apply upload rate limiting
    location /uploads/ {
        limit_req zone=upload_limit burst=5 nodelay;
        limit_req_status 429;
        
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }

    # Backend docs (Swagger UI) - Apply strict rate limiting
    location /docs {
        limit_req zone=strict_limit burst=3 nodelay;
        limit_req_status 429;
        
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend OpenAPI JSON
    location /openapi.json {
        limit_req zone=api_limit burst=5 nodelay;
        
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint (no rate limiting)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }

    # Custom error page for rate limiting
    error_page 429 /429.html;
    location = /429.html {
        internal;
        return 429 "Too Many Requests\n";
        add_header Content-Type text/plain;
    }
}
```

---

## 🔍 Perubahan yang Dibutuhkan

### 1. Server Name

**Saat ini:**
```nginx
server_name tamankehati.dasmap.co.id;
```

**Untuk port-based routing (tanpa DNS), ubah menjadi:**
```nginx
server_name 38.47.93.167 _;
```

**Atau jika ingin tetap pakai subdomain (meskipun belum setup DNS), bisa tetap:**
```nginx
server_name tamankehati.dasmap.co.id 38.47.93.167 _;
```

---

### 2. Aplikasikan Rate Limiting

**Tambahkan di setiap location block:**

```nginx
location / {
    limit_req zone=general_limit burst=20 nodelay;
    limit_req_status 429;
    # ... proxy settings
}

location /api/ {
    limit_req zone=api_limit burst=10 nodelay;
    limit_req_status 429;
    # ... proxy settings
}

location /uploads/ {
    limit_req zone=upload_limit burst=5 nodelay;
    limit_req_status 429;
    # ... proxy settings
}

location /docs {
    limit_req zone=strict_limit burst=3 nodelay;
    limit_req_status 429;
    # ... proxy settings
}
```

**Penjelasan:**
- `burst=20` - Allow burst hingga 20 requests
- `nodelay` - Process burst requests immediately
- `limit_req_status 429` - Return 429 status code when limit exceeded

---

### 3. Pastikan Semua Location Blocks Ada

**Location blocks yang diperlukan:**
- ✅ `/` - Frontend (Next.js)
- ✅ `/api/` - Backend API
- ✅ `/uploads/` - Backend uploads
- ✅ `/docs` - Backend docs (Swagger)
- ✅ `/openapi.json` - OpenAPI JSON
- ✅ `/health` - Health check (optional)

---

## 📋 Checklist

- [ ] `server_name` sudah sesuai (IP atau catch-all untuk port-based)
- [ ] Rate limiting zones sudah diaplikasikan di location blocks
- [ ] Semua location blocks lengkap (/, /api/, /uploads/, /docs)
- [ ] Security headers sudah ditambahkan
- [ ] Proxy settings sudah benar (localhost:3000 untuk frontend, localhost:8000 untuk backend)
- [ ] Timeouts dan limits sudah sesuai

---

## 🧪 Test Config

**Setelah update config:**

```bash
# Test Nginx config
docker exec -it dasmap_prod-go-1 nginx -t

# Jika sukses, reload
docker exec -it dasmap_prod-go-1 nginx -s reload

# Test frontend
curl http://38.47.93.167:8080 | head -20

# Test backend API
curl http://38.47.93.167:8080/api/health

# Test rate limiting (harus return 429 setelah banyak request)
for i in {1..60}; do curl -s http://38.47.93.167:8080/api/health | head -1; done
```

---

## ⚠️ Catatan Penting

**Rate Limiting:**
- `general_limit: 50r/s` - Untuk frontend (bisa ditingkatkan)
- `api_limit: 20r/s` - Untuk API endpoints
- `strict_limit: 5r/s` - Untuk docs (ketat)
- `upload_limit: 5r/s` - Untuk uploads

**Jika terlalu ketat:**
- Bisa adjust rate di zone definition
- Atau adjust burst value di location blocks

**Jika terlalu longgar:**
- Turunkan rate atau kurangi burst
- Atau tambahkan delay di location blocks

---

**Last Updated:** 2025-11-04

