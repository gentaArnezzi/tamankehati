# 🌐 Public Access & API Security

Guide untuk setup public access dan mengamankan API endpoint.

---

## 📋 Current Situation

**Saat ini:**
- Web: `http://38.47.93.167:8080` ✅ (Frontend)
- API: `http://38.47.93.167:8080/api` ⚠️ (Bisa diakses semua orang)

**Masalah:**
- API endpoint langsung accessible via IP:port
- Tidak ada rate limiting
- Tidak ada protection untuk API docs
- Tidak user-friendly untuk public

---

## ✅ Solution: Domain-Based Access

**Untuk production public access, gunakan domain:**

### Option 1: Subdomain (Recommended)
- Public URL: `https://tamankehati.dasmap.co.id`
- Frontend: Accessible via domain
- API: Tetap melalui `/api` tapi dengan security measures

### Option 2: Port 80 (Standard HTTP)
- Public URL: `http://38.47.93.167` (port 80, standard)
- Frontend: Accessible via port 80
- API: Tetap melalui `/api` tapi dengan security measures

---

## 🔒 Security Measures

### 1. Rate Limiting

Add rate limiting untuk API endpoints:

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

# API endpoint dengan rate limiting
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    
    proxy_pass http://localhost:8000;
    # ... rest of config
}
```

### 2. Hide API Docs from Public

Restrict `/docs` dan `/openapi.json`:

```nginx
# Only allow docs from localhost or specific IPs
location /docs {
    allow 127.0.0.1;
    allow 172.27.0.0/16;  # Docker network
    deny all;
    
    proxy_pass http://localhost:8000;
}

location /openapi.json {
    allow 127.0.0.1;
    allow 172.27.0.0/16;
    deny all;
    
    proxy_pass http://localhost:8000;
}
```

### 3. CORS Configuration

Backend sudah punya CORS, pastikan `CORS_ORIGINS` di `.env`:

```bash
# Allow only specific domains
CORS_ORIGINS=https://tamankehati.dasmap.co.id,http://38.47.93.167:8080
```

### 4. API Authentication

Backend sudah require authentication untuk most endpoints. Pastikan:
- Public endpoints (login, register) tidak perlu auth
- Protected endpoints require JWT token
- Admin endpoints require `super_admin` role

---

## 🌐 Setup Domain Access (Recommended)

### Step 1: DNS Configuration

**Di DNS provider (misalnya Cloudflare atau DNS management):**

```
Type: A
Name: tamankehati
Content: 38.47.93.167
TTL: Auto
```

Atau untuk subdomain:

```
Type: A
Name: tamankehati.dasmap.co.id
Content: 38.47.93.167
TTL: Auto
```

### Step 2: Update Nginx Config

**Update `tamankehati-container-go-port.conf` atau create new config:**

```nginx
server {
    listen 80;
    server_name tamankehati.dasmap.co.id 38.47.93.167;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;
    
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
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
    
    # API Docs - Restrict access
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
    
    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
        access_log off;
    }
}
```

### Step 3: Update Environment Variables

**Update `.env` di server:**

```bash
# Update API URL untuk domain
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api

# CORS origins
CORS_ORIGINS=https://tamankehati.dasmap.co.id,http://38.47.93.167:8080
```

**Rebuild frontend dengan API URL baru:**

```bash
# Update GitHub Secret: NEXT_PUBLIC_API_URL
# Atau rebuild manual dengan:
docker build -t arnezzi/tamankehati-frontend:v1.0.6 \
  --build-arg NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api \
  ./apps/frontend
```

### Step 4: SSL/HTTPS (Optional but Recommended)

**Setup SSL dengan Let's Encrypt:**

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d tamankehati.dasmap.co.id

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🔧 Quick Fix: Add Security to Current Setup

**Jika belum bisa setup domain, tambahkan security ke config yang ada:**

```bash
# Edit config di server
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Add rate limiting di bagian atas:**

```nginx
# Rate limiting zones (add sebelum server block)
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

server {
    listen 8080;
    # ... existing config
    
    # Update API location dengan rate limiting
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;  # ADD THIS LINE
        
        proxy_pass http://localhost:8000;
        # ... rest of config
    }
    
    # Hide docs from public
    location /docs {
        allow 127.0.0.1;
        allow 172.27.0.0/16;
        deny all;
        
        proxy_pass http://localhost:8000;
    }
}
```

**Reload Nginx:**

```bash
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## 📊 Comparison

### Current Setup (IP:Port)
- ✅ Works immediately
- ❌ Not user-friendly
- ❌ API accessible via IP
- ❌ No rate limiting
- ❌ No SSL

### Domain Setup
- ✅ User-friendly URL
- ✅ Professional
- ✅ Can add SSL
- ✅ Better security
- ✅ SEO friendly
- ⚠️ Requires DNS setup

---

## 🎯 Recommended Approach

**For production:**

1. **Setup domain** (tamankehati.dasmap.co.id)
2. **Add rate limiting** untuk API
3. **Hide API docs** dari public
4. **Setup SSL** (HTTPS)
5. **Update frontend** dengan domain API URL
6. **Keep port 8080** sebagai fallback atau restrict ke internal only

**For development/testing:**

- Keep IP:port access
- Add rate limiting
- Hide docs from public

---

## 🔍 Verify Security

**Test rate limiting:**

```bash
# Should be rate limited after 10 requests/second
for i in {1..15}; do curl -s http://38.47.93.167:8080/api/health; echo ""; done
```

**Test API docs restriction:**

```bash
# Should be denied from external
curl http://38.47.93.167:8080/docs

# Should work from inside container
docker exec tamankehati-backend-prod curl http://localhost:8000/docs
```

---

## 📝 Summary

**Public Access:**
- **Recommended**: `https://tamankehati.dasmap.co.id`
- **Current**: `http://38.47.93.167:8080`

**API Security:**
- ✅ Rate limiting (10 req/s)
- ✅ Hide docs from public
- ✅ CORS configuration
- ✅ Authentication required (backend)

**Next Steps:**
1. Setup DNS A record
2. Update Nginx config dengan security
3. Update frontend API URL
4. Setup SSL (optional)

---

**Last Updated:** 2025-11-05

