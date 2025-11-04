# 🌐 Migrate dari IP ke Domain/Subdomain

Guide lengkap untuk migrate dari IP address (`http://38.47.93.167:8080`) ke domain/subdomain (misal: `https://tamankehati.dasmap.co.id`).

---

## 📋 Status Saat Ini

**Current Setup:**
- IP-based: `http://38.47.93.167:8080`
- Hardcoded di beberapa tempat (tapi ada fallback ke env vars)

**Target Setup:**
- Domain-based: `https://tamankehati.dasmap.co.id` (atau subdomain lain)

---

## 🔧 Step 1: Setup Domain DNS

### 1.1 Point Domain ke Server IP

**Di Domain Registrar (misal: GoDaddy, Namecheap, Cloudflare):**

1. Login ke domain registrar
2. Go to DNS Management
3. Add A Record:
   ```
   Type: A
   Name: tamankehati (atau @ untuk root domain)
   Value: 38.47.93.167
   TTL: 3600
   ```

4. (Optional) Add www subdomain:
   ```
   Type: A
   Name: www.tamankehati
   Value: 38.47.93.167
   TTL: 3600
   ```

5. Wait for DNS propagation (5-60 minutes)

### 1.2 Verify DNS

```bash
# Check if domain points to correct IP
dig tamankehati.dasmap.co.id +short
# Should return: 38.47.93.167

# Or use nslookup
nslookup tamankehati.dasmap.co.id
```

---

## 🔧 Step 2: Update Environment Variables

### 2.1 Update `.env` di Server

```bash
# SSH ke server
ssh ubuntu@38.47.93.167
cd ~/dasmap_prod/apps/tamankehati

# Edit .env
nano .env
```

**Update values:**
```bash
# Domain configuration
DOMAIN=tamankehati.dasmap.co.id
SERVER_IP=38.47.93.167  # Keep for reference

# Frontend API URL - Change to domain
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id

# CORS Origins - Add domain
CORS_ORIGINS=https://tamankehati.dasmap.co.id,http://38.47.93.167:8080
```

### 2.2 Update `env.production.example` (Optional)

Untuk reference di masa depan, update example file juga.

---

## 🔧 Step 3: Update Nginx Configuration

### 3.1 Update Nginx Config

```bash
# Di server
cd ~/dasmap_prod/apps/nginx/sites-enabled

# Edit tamankehati.conf
nano tamankehati.conf
```

**Update `server_name`:**
```nginx
server {
    listen 8080;
    # Change from IP to domain
    server_name tamankehati.dasmap.co.id www.tamankehati.dasmap.co.id 38.47.93.167 _;
    
    # ... rest of config
}
```

**Atau jika pakai port 80 (standard):**
```nginx
server {
    listen 80;
    server_name tamankehati.dasmap.co.id www.tamankehati.dasmap.co.id;
    
    # ... rest of config
}
```

### 3.2 Test dan Reload Nginx

```bash
# Test config
docker exec -it dasmap_prod-go-1 nginx -t

# Reload Nginx
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## 🔧 Step 4: Rebuild Frontend dengan Domain Baru

**⚠️ IMPORTANT:** `NEXT_PUBLIC_API_URL` adalah build-time variable, jadi harus rebuild frontend!

### 4.1 Rebuild di Local

```bash
# Di local machine
cd /path/to/tamankehati_new

# Set environment variables
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=v1.0.6  # Increment version
export NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id

# Build dan push
./scripts/build-and-push-images.sh
```

### 4.2 Pull Image Baru di Server

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

## 🔧 Step 5: Setup SSL/HTTPS (Recommended)

### 5.1 Install Certbot

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Generate SSL Certificate

```bash
# Generate certificate via Nginx plugin
sudo certbot --nginx -d tamankehati.dasmap.co.id -d www.tamankehati.dasmap.co.id

# Or manual (if Nginx plugin doesn't work)
sudo certbot certonly --standalone -d tamankehati.dasmap.co.id
```

### 5.3 Update Nginx untuk HTTPS

```nginx
server {
    listen 80;
    server_name tamankehati.dasmap.co.id www.tamankehati.dasmap.co.id;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tamankehati.dasmap.co.id www.tamankehati.dasmap.co.id;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/tamankehati.dasmap.co.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tamankehati.dasmap.co.id/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of config (proxy_pass, etc)
}
```

### 5.4 Reload Nginx

```bash
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## 🔧 Step 6: Verify Migration

### 6.1 Test Domain Access

```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://tamankehati.dasmap.co.id

# Test HTTPS
curl https://tamankehati.dasmap.co.id

# Test API
curl https://tamankehati.dasmap.co.id/api/health
curl https://tamankehati.dasmap.co.id/api/public/stats/
```

### 6.2 Test di Browser

1. Buka: `https://tamankehati.dasmap.co.id`
2. Check browser console - tidak ada error
3. Test semua fitur:
   - Homepage loads
   - Flora, Fauna, Taman pages load
   - Login works
   - Dashboard loads

### 6.3 Check CORS

```bash
# Test CORS headers
curl -H "Origin: https://tamankehati.dasmap.co.id" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://tamankehati.dasmap.co.id/api/public/stats/
```

---

## 📝 Checklist Migration

- [ ] DNS A Record pointing ke server IP
- [ ] DNS propagation verified (dig/nslookup)
- [ ] `.env` updated dengan domain
- [ ] `NEXT_PUBLIC_API_URL` updated ke domain
- [ ] `CORS_ORIGINS` include domain
- [ ] Nginx config updated dengan `server_name` domain
- [ ] Frontend image rebuilt dengan domain baru
- [ ] Frontend image pulled dan restarted di server
- [ ] SSL certificate generated (optional but recommended)
- [ ] Nginx HTTPS config updated (if using SSL)
- [ ] Domain accessible via HTTPS
- [ ] All features tested
- [ ] No console errors

---

## 🔄 Rollback Plan

Jika ada masalah, bisa rollback ke IP:

### Quick Rollback

```bash
# 1. Update .env
NEXT_PUBLIC_API_URL=http://38.47.93.167:8080

# 2. Rebuild frontend dengan IP
export NEXT_PUBLIC_API_URL=http://38.47.93.167:8080
./scripts/build-and-push-images.sh

# 3. Pull image lama atau image dengan IP
docker compose -f docker-compose.pull.no-nginx.yml pull frontend
docker compose -f docker-compose.pull.no-nginx.yml up -d frontend

# 4. Update Nginx server_name
server_name 38.47.93.167 _;
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## 💡 Tips

1. **Test DNS First:** Pastikan DNS sudah resolve sebelum migrate
2. **Keep IP as Fallback:** Tambahkan IP di `server_name` untuk backup
3. **Use HTTPS:** SSL recommended untuk production
4. **Gradual Migration:** Bisa test dengan subdomain dulu (misal: `test.tamankehati.dasmap.co.id`)
5. **Monitor Logs:** Check logs setelah migration untuk errors

---

## 🆘 Troubleshooting

### Problem: Domain not resolving

**Solution:**
```bash
# Check DNS
dig tamankehati.dasmap.co.id +short

# Wait for DNS propagation (can take up to 48 hours)
# Check from multiple locations
```

### Problem: SSL certificate error

**Solution:**
```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew --dry-run

# Check Nginx can access certificates
docker exec -it dasmap_prod-go-1 ls -la /etc/letsencrypt/live/
```

### Problem: CORS errors after migration

**Solution:**
1. Check `CORS_ORIGINS` in `.env`
2. Restart backend:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml restart backend
   ```
3. Check backend logs for CORS errors

---

## 📚 Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [DNS Propagation Check](https://www.whatsmydns.net/)

