# 🌐 Migrate ke Domain: tamankehati.dasmap.co.id

Step-by-step guide untuk migrate dari IP ke domain.

---

## 📋 Prerequisites

- Domain `tamankehati.dasmap.co.id` sudah ada
- Access ke DNS management (untuk point domain ke IP)
- Server IP: `38.47.93.167`

---

## Step 1: Setup DNS

### 1.1 Point Domain ke Server IP

**Di DNS Management (misal: Cloudflare, Namecheap, GoDaddy):**

1. Login ke domain registrar
2. Go to DNS Management
3. Add/Edit A Record:

```
Type: A
Name: tamankehati (atau @ jika root domain)
Value: 38.47.93.167
TTL: 3600 (atau Auto)
```

4. (Optional) Add www subdomain:
```
Type: A
Name: www.tamankehati
Value: 38.47.93.167
TTL: 3600
```

### 1.2 Verify DNS

**Wait 5-60 minutes for DNS propagation, then verify:**

```bash
# Check DNS
dig tamankehati.dasmap.co.id +short
# Should return: 38.47.93.167

# Or use nslookup
nslookup tamankehati.dasmap.co.id
```

---

## Step 2: Update Environment Variables

### 2.1 Update .env di Server

```bash
ssh ubuntu@38.47.93.167
cd ~/dasmap_prod/apps/tamankehati
nano .env
```

**Update values:**
```bash
# Domain configuration
DOMAIN=tamankehati.dasmap.co.id
SERVER_IP=38.47.93.167

# Frontend API URL - Change to domain
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id
# Or if using HTTP: http://tamankehati.dasmap.co.id

# CORS Origins - Add domain
CORS_ORIGINS=https://tamankehati.dasmap.co.id,http://38.47.93.167:8080
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Step 3: Rebuild Frontend dengan Domain Baru

**⚠️ IMPORTANT:** `NEXT_PUBLIC_API_URL` adalah build-time variable, jadi harus rebuild!

### 3.1 Rebuild di Local Machine

```bash
# Di local machine
cd /Users/irgyaarnezzi/Desktop/tamankehati_new

# Set environment variables
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=v1.0.6  # Increment version
export NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id

# Build dan push
./scripts/build-and-push-images.sh
```

### 3.2 Pull Image Baru di Server

```bash
# SSH ke server
ssh ubuntu@38.47.93.167
cd ~/dasmap_prod/apps/tamankehati

# Pull image baru
docker compose -f docker-compose.pull.no-nginx.yml pull frontend

# Restart frontend
docker compose -f docker-compose.pull.no-nginx.yml up -d frontend
```

---

## Step 4: Update Nginx Configuration

### 4.1 Update Nginx Config

```bash
# Di server
cd ~/dasmap_prod/apps/nginx/sites-enabled
nano tamankehati.conf
```

**Update `server_name`:**

**FROM:**
```nginx
server {
    listen 8080;
    server_name 38.47.93.167 _;
```

**TO:**
```nginx
server {
    listen 8080;
    server_name tamankehati.dasmap.co.id www.tamankehati.dasmap.co.id 38.47.93.167 _;
```

**Or if using port 80 (standard):**
```nginx
server {
    listen 80;
    server_name tamankehati.dasmap.co.id www.tamankehati.dasmap.co.id;
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.2 Test dan Reload Nginx

```bash
# Test config
docker exec -it dasmap_prod-go-1 nginx -t

# Reload Nginx
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## Step 5: Setup SSL/HTTPS (Recommended)

### 5.1 Install Certbot

```bash
# Di server
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Generate SSL Certificate

**Option A: Via Nginx plugin (easier)**
```bash
sudo certbot --nginx -d tamankehati.dasmap.co.id -d www.tamankehati.dasmap.co.id
```

**Option B: Standalone (if Nginx plugin doesn't work)**
```bash
# Stop Nginx temporarily
docker exec -it dasmap_prod-go-1 nginx -s stop

# Generate certificate
sudo certbot certonly --standalone -d tamankehati.dasmap.co.id

# Start Nginx again
docker exec -it dasmap_prod-go-1 nginx
```

### 5.3 Update Nginx untuk HTTPS

**Update Nginx config:**
```bash
cd ~/dasmap_prod/apps/nginx/sites-enabled
nano tamankehati.conf
```

**Add HTTPS server block:**

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name tamankehati.dasmap.co.id www.tamankehati.dasmap.co.id;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Main server
server {
    listen 443 ssl http2;
    server_name tamankehati.dasmap.co.id www.tamankehati.dasmap.co.id;
    
    # SSL certificates (path may vary)
    ssl_certificate /etc/letsencrypt/live/tamankehati.dasmap.co.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tamankehati.dasmap.co.id/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of config (proxy_pass, etc)
    location / {
        proxy_pass http://localhost:3000;
        # ... rest of proxy config
    }
    
    location /api/ {
        proxy_pass http://localhost:8000;
        # ... rest of proxy config
    }
}
```

**Note:** Path SSL certificate mungkin perlu di-mount ke container atau di-copy ke container.

### 5.4 Reload Nginx

```bash
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## Step 6: Restart Backend (Update CORS)

```bash
# Restart backend untuk apply CORS_ORIGINS baru
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml restart backend

# Verify CORS updated
docker logs tamankehati-backend-prod --tail=20 | grep -i cors
```

---

## Step 7: Verify Migration

### 7.1 Test Domain Access

```bash
# Test HTTP (should redirect to HTTPS if SSL configured)
curl -I http://tamankehati.dasmap.co.id

# Test HTTPS
curl https://tamankehati.dasmap.co.id

# Test API
curl https://tamankehati.dasmap.co.id/api/health
curl https://tamankehati.dasmap.co.id/api/public/stats/
```

### 7.2 Test di Browser

1. Buka: `https://tamankehati.dasmap.co.id` (atau `http://` jika belum SSL)
2. Check browser console (F12):
   - ✅ No `ERR_CONNECTION_REFUSED`
   - ✅ No errors
   - ✅ API calls ke domain baru

### 7.3 Check CORS

```bash
# Test CORS headers
curl -H "Origin: https://tamankehati.dasmap.co.id" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://tamankehati.dasmap.co.id/api/public/stats/
```

---

## 📝 Checklist

- [ ] DNS A Record pointing ke `38.47.93.167`
- [ ] DNS propagation verified (dig/nslookup)
- [ ] `.env` updated dengan domain
- [ ] `NEXT_PUBLIC_API_URL` updated ke domain
- [ ] `CORS_ORIGINS` include domain
- [ ] Frontend image rebuilt dengan domain baru
- [ ] Frontend image pulled dan restarted di server
- [ ] Nginx config updated dengan `server_name` domain
- [ ] Nginx reloaded
- [ ] Backend restarted (for CORS)
- [ ] SSL certificate generated (optional but recommended)
- [ ] Domain accessible via HTTPS
- [ ] All features tested
- [ ] No console errors

---

## 🔄 Rollback Plan

Jika ada masalah, bisa rollback ke IP:

```bash
# 1. Update .env
NEXT_PUBLIC_API_URL=http://38.47.93.167:8080

# 2. Rebuild frontend dengan IP
export NEXT_PUBLIC_API_URL=http://38.47.93.167:8080
./scripts/build-and-push-images.sh

# 3. Pull image lama
docker compose -f docker-compose.pull.no-nginx.yml pull frontend
docker compose -f docker-compose.pull.no-nginx.yml up -d frontend

# 4. Update Nginx server_name
server_name 38.47.93.167 _;
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## 🆘 Troubleshooting

### Problem: Domain not resolving

**Solution:**
- Wait for DNS propagation (5-60 minutes)
- Check DNS records: `dig tamankehati.dasmap.co.id +short`
- Verify A record points to `38.47.93.167`

### Problem: SSL certificate error

**Solution:**
- Check certificate path in Nginx config
- Verify certificates exist: `sudo ls -la /etc/letsencrypt/live/`
- Regenerate if needed: `sudo certbot renew`

### Problem: CORS errors

**Solution:**
- Verify `CORS_ORIGINS` includes domain
- Restart backend after CORS changes
- Check backend logs for CORS errors

---

## 💡 Quick Summary

**Main steps:**
1. DNS → Point domain ke IP
2. `.env` → Update `NEXT_PUBLIC_API_URL` dan `CORS_ORIGINS`
3. Rebuild frontend → Dengan domain baru
4. Nginx → Update `server_name`
5. SSL → Generate certificate (optional)
6. Restart → Services

---

**Last Updated:** 2025-11-05

