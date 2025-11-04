# 🌐 Domain Configuration Guide

Guide untuk konfigurasi domain/subdomain untuk Taman Kehati.

---

## 📋 Current vs Domain Setup

### Current Setup (IP-based)
```
URL: http://38.47.93.167:8080
NEXT_PUBLIC_API_URL: http://38.47.93.167:8080
CORS_ORIGINS: http://38.47.93.167:3000,http://38.47.93.167:80,http://38.47.93.167:8080
```

### Domain Setup (Recommended for Production)
```
URL: https://tamankehati.dasmap.co.id
NEXT_PUBLIC_API_URL: https://tamankehati.dasmap.co.id
CORS_ORIGINS: https://tamankehati.dasmap.co.id,http://38.47.93.167:8080
```

---

## 🔧 Configuration Files

### 1. Environment Variables (`.env`)

**Location:** `~/dasmap_prod/apps/tamankehati/.env`

```bash
# Domain configuration
DOMAIN=tamankehati.dasmap.co.id
SERVER_IP=38.47.93.167  # Keep for reference/fallback

# Frontend API URL
# Option 1: IP-based (current)
# NEXT_PUBLIC_API_URL=http://38.47.93.167:8080

# Option 2: Domain-based (recommended)
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id

# CORS Origins
# Include both domain and IP for flexibility
CORS_ORIGINS=https://tamankehati.dasmap.co.id,http://38.47.93.167:8080
```

### 2. Build Script (`scripts/build-and-push-images.sh`)

**Default:** `http://38.47.93.167:8080`

**Override dengan environment variable:**
```bash
export NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id
./scripts/build-and-push-images.sh
```

### 3. Nginx Configuration

**Location:** `~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf`

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    
    # Domain configuration
    server_name tamankehati.dasmap.co.id www.tamankehati.dasmap.co.id;
    
    # Keep IP as fallback
    # server_name tamankehati.dasmap.co.id 38.47.93.167 _;
    
    # SSL configuration (if using HTTPS)
    ssl_certificate /etc/letsencrypt/live/tamankehati.dasmap.co.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tamankehati.dasmap.co.id/privkey.pem;
    
    # ... rest of config
}
```

### 4. Frontend Code

**Location:** `apps/frontend/src/lib/api-url.ts`

**Current:**
```typescript
const PRODUCTION_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080";
```

**Untuk domain:** Tidak perlu ubah code, cukup set `NEXT_PUBLIC_API_URL` saat build!

---

## 🚀 Quick Migration Steps

### Step 1: Setup DNS

```bash
# Add A Record at domain registrar
Type: A
Name: tamankehati
Value: 38.47.93.167
TTL: 3600
```

### Step 2: Update `.env`

```bash
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id
CORS_ORIGINS=https://tamankehati.dasmap.co.id,http://38.47.93.167:8080
```

### Step 3: Rebuild Frontend

```bash
export NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=v1.0.6
./scripts/build-and-push-images.sh
```

### Step 4: Update Nginx

```bash
# Edit server_name
server_name tamankehati.dasmap.co.id 38.47.93.167 _;

# Reload
docker exec -it dasmap_prod-go-1 nginx -s reload
```

### Step 5: Pull & Restart

```bash
# On server
docker compose -f docker-compose.pull.no-nginx.yml pull frontend
docker compose -f docker-compose.pull.no-nginx.yml up -d frontend
```

---

## 🔍 Verification

### Check Domain Resolution

```bash
dig tamankehati.dasmap.co.id +short
# Should return: 38.47.93.167
```

### Test Domain Access

```bash
# HTTP (should redirect to HTTPS if SSL configured)
curl -I http://tamankehati.dasmap.co.id

# HTTPS
curl https://tamankehati.dasmap.co.id

# API
curl https://tamankehati.dasmap.co.id/api/health
```

### Check Frontend API URL

```bash
# Check what API URL is used in frontend
docker exec tamankehati-frontend-prod env | grep NEXT_PUBLIC_API_URL
```

---

## 💡 Best Practices

1. **Always use HTTPS in production**
   - Use Let's Encrypt for free SSL
   - Configure auto-renewal

2. **Keep IP as fallback**
   - Add IP to `server_name` in Nginx
   - Include IP in `CORS_ORIGINS`

3. **Use environment variables**
   - Never hardcode domain in code
   - Use `.env` for configuration

4. **Test before migration**
   - Test with subdomain first (e.g., `test.tamankehati.dasmap.co.id`)
   - Verify all features work

5. **Document changes**
   - Update deployment docs
   - Keep migration guide

---

## 🆘 Troubleshooting

### Domain not resolving
- Wait for DNS propagation (5-60 minutes)
- Check DNS records at registrar
- Verify A record points to correct IP

### SSL certificate errors
- Check certificate expiration
- Verify Nginx can access certificate files
- Check certificate path in Nginx config

### CORS errors
- Verify `CORS_ORIGINS` includes domain
- Restart backend after CORS changes
- Check browser console for CORS errors

### Frontend still using old URL
- `NEXT_PUBLIC_API_URL` is build-time only
- Must rebuild frontend image
- Pull new image and restart container

---

## 📚 References

- [Migration Guide](./MIGRATE_TO_DOMAIN.md) - Detailed migration steps
- [Complete Deployment Guide](./COMPLETE_DEPLOYMENT_GUIDE.md) - Full deployment guide
- [Nginx Configuration](./NGINX_CONFIG_REVIEW.md) - Nginx setup guide

