# 📋 Checklist Migrasi ke Subdomain

Complete checklist untuk migrate dari `http://38.47.93.167:8080` ke `https://tamankehati.dasmap.co.id`.

---

## 🎯 Target Domain

**Domain Baru:**
- Frontend: `https://tamankehati.dasmap.co.id`
- API: `https://tamankehati.dasmap.co.id/api`

**Fallback (optional):**
- IP:port tetap bisa diakses: `http://38.47.93.167:8080`

---

## ✅ Checklist Migrasi

### 1. DNS Configuration

- [ ] **Setup DNS A Record**
  ```
  Type: A
  Host: tamankehati
  Value: 38.47.93.167
  TTL: 3600
  ```
  
- [ ] **Wait DNS Propagation** (5-60 menit)
  ```bash
  dig tamankehati.dasmap.co.id +short
  # Should return: 38.47.93.167
  ```

- [ ] **Test DNS Resolution**
  ```bash
  nslookup tamankehati.dasmap.co.id
  ```

---

### 2. Environment Variables

- [ ] **Update `.env` di server**
  ```bash
  cd ~/dasmap_prod/apps/tamankehati
  nano .env
  ```
  
  **Update:**
  ```bash
  NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api
  CORS_ORIGINS=https://tamankehati.dasmap.co.id,http://38.47.93.167:8080
  ```

- [ ] **Update `env.production.example`** (optional, untuk dokumentasi)
  ```bash
  NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api
  CORS_ORIGINS=https://tamankehati.dasmap.co.id
  ```

---

### 3. Frontend Code (Fallback Values)

**⚠️ Important:** Frontend code sudah pakai `process.env.NEXT_PUBLIC_API_URL`, tapi fallback masih hardcoded. Update fallback untuk production-ready.

- [ ] **Update `apps/frontend/src/lib/api-url.ts`**
  ```typescript
  // Before
  const PRODUCTION_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://38.47.93.167:8080";
  
  // After (optional - better to rely on env var)
  const PRODUCTION_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tamankehati.dasmap.co.id/api";
  ```

- [ ] **Update fallback di semua API client files:**
  - `apps/frontend/src/lib/api/featured.ts`
  - `apps/frontend/src/lib/api/public.ts`
  - `apps/frontend/src/lib/api/server.ts`
  - `apps/frontend/src/lib/api/public-client.ts`
  - `apps/frontend/src/lib/api/client.ts`
  - `apps/frontend/src/lib/api/client-public.ts`
  - `apps/frontend/src/lib/api/stats.ts`
  - `apps/frontend/src/lib/api/queries.ts`
  - `apps/frontend/src/lib/api/prefetch.ts`
  - `apps/frontend/src/lib/gallery-integration.ts`
  - `apps/frontend/src/lib/public-api-client.ts`

- [ ] **Update fallback di component files:**
  - `apps/frontend/src/components/ui/safe-image.tsx`
  - `apps/frontend/src/components/ui/image-with-fallback.tsx`
  - Dan semua files yang pakai hardcoded fallback (lihat grep results)

**Note:** Fallback ini hanya untuk development. Production harus pakai `NEXT_PUBLIC_API_URL` env var.

---

### 4. Docker Configuration

- [ ] **Update `docker-compose.pull.no-nginx.yml`**
  ```yaml
  frontend:
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-https://tamankehati.dasmap.co.id/api}
  ```

- [ ] **Update `scripts/build-and-push-images.sh`**
  ```bash
  # Before
  DEFAULT_API_URL="${NEXT_PUBLIC_API_URL:-http://38.47.93.167:8080}"
  
  # After
  DEFAULT_API_URL="${NEXT_PUBLIC_API_URL:-https://tamankehati.dasmap.co.id/api}"
  ```

---

### 5. Nginx Configuration

- [ ] **Update Nginx config di server**
  ```bash
  nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
  ```
  
  **Update:**
  ```nginx
  server {
      listen 80;
      server_name tamankehati.dasmap.co.id 38.47.93.167;  # Add domain, keep IP as fallback
      
      # ... rest of config
  }
  ```

- [ ] **Test Nginx config**
  ```bash
  docker exec -it dasmap_prod-go-1 nginx -t
  ```

- [ ] **Reload Nginx**
  ```bash
  docker exec -it dasmap_prod-go-1 nginx -s reload
  ```

---

### 6. Rebuild & Deploy Frontend

- [ ] **Update GitHub Secret** (untuk CI/CD)
  ```
  NEXT_PUBLIC_API_URL = https://tamankehati.dasmap.co.id/api
  ```

- [ ] **Rebuild frontend image** (local atau via CI/CD)
  ```bash
  export NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api
  export DOCKER_USERNAME=arnezzi
  export IMAGE_TAG=v1.0.6  # Increment version
  ./scripts/build-and-push-images.sh
  ```

- [ ] **Pull image baru di server**
  ```bash
  cd ~/dasmap_prod/apps/tamankehati
  docker compose -f docker-compose.pull.no-nginx.yml pull frontend
  docker compose -f docker-compose.pull.no-nginx.yml up -d frontend
  ```

---

### 7. SSL/HTTPS Setup (Optional but Recommended)

- [ ] **Install Certbot**
  ```bash
  sudo apt-get update
  sudo apt-get install certbot python3-certbot-nginx
  ```

- [ ] **Get SSL Certificate**
  ```bash
  # Note: Certbot perlu akses ke Nginx config
  # Jika Nginx di container, mungkin perlu mount volume atau setup di host level
  sudo certbot --nginx -d tamankehati.dasmap.co.id
  ```

- [ ] **Update Nginx config untuk HTTPS redirect**
  ```nginx
  server {
      listen 80;
      server_name tamankehati.dasmap.co.id;
      return 301 https://$server_name$request_uri;
  }
  
  server {
      listen 443 ssl;
      server_name tamankehati.dasmap.co.id;
      
      ssl_certificate /etc/letsencrypt/live/tamankehati.dasmap.co.id/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/tamankehati.dasmap.co.id/privkey.pem;
      
      # ... rest of config
  }
  ```

- [ ] **Setup Auto-renewal**
  ```bash
  sudo certbot renew --dry-run
  ```

---

### 8. Backend CORS Configuration

- [ ] **Update `.env` di server**
  ```bash
  CORS_ORIGINS=https://tamankehati.dasmap.co.id,http://38.47.93.167:8080
  ```

- [ ] **Restart backend**
  ```bash
  docker compose -f docker-compose.pull.no-nginx.yml restart backend
  ```

---

### 9. Verification

- [ ] **Test Domain Access**
  ```bash
  curl -I http://tamankehati.dasmap.co.id
  curl -I https://tamankehati.dasmap.co.id  # If SSL configured
  ```

- [ ] **Test API via Domain**
  ```bash
  curl https://tamankehati.dasmap.co.id/api/health
  curl https://tamankehati.dasmap.co.id/api/public/stats/
  ```

- [ ] **Test Frontend in Browser**
  - Open: `https://tamankehati.dasmap.co.id`
  - Check browser console - no errors
  - Check Network tab - all API calls use domain

- [ ] **Verify Frontend API URL**
  ```bash
  docker exec tamankehati-frontend-prod env | grep NEXT_PUBLIC_API_URL
  # Should show: NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api
  ```

- [ ] **Test IP:Port Fallback** (optional)
  ```bash
  curl http://38.47.93.167:8080/health
  # Should still work if IP kept in server_name
  ```

---

### 10. Documentation Updates

- [ ] **Update README.md** (if exists)
- [ ] **Update deployment docs** (optional)
- [ ] **Update any hardcoded URLs in documentation**

---

## 📝 Quick Reference

**Before:**
- Frontend: `http://38.47.93.167:8080`
- API: `http://38.47.93.167:8080/api`

**After:**
- Frontend: `https://tamankehati.dasmap.co.id`
- API: `https://tamankehati.dasmap.co.id/api`

**Fallback (optional):**
- IP:port tetap bisa diakses jika ditambahkan ke `server_name`

---

## 🔧 Script Helper

**Gunakan script untuk find semua hardcoded URLs:**

```bash
# Find all hardcoded IP references
grep -r "38.47.93.167" apps/ --exclude-dir=node_modules
grep -r "38.47.93.167" scripts/
grep -r "38.47.93.167" deployment-package/
```

**Find all files that need updating:**

```bash
# Find frontend files with hardcoded fallback
grep -r "http://38.47.93.167:8080" apps/frontend/src/ --include="*.ts" --include="*.tsx"
```

---

## ⚠️ Important Notes

1. **Fallback Values:**
   - Fallback values di code hanya untuk development
   - Production harus selalu pakai `NEXT_PUBLIC_API_URL` env var
   - Update fallback untuk consistency, tapi tidak critical

2. **Build-time vs Runtime:**
   - `NEXT_PUBLIC_API_URL` adalah build-time variable
   - Harus rebuild frontend setelah update
   - Tidak bisa diubah dengan environment variable di runtime

3. **IP:Port Fallback:**
   - Bisa tetap accessible jika ditambahkan ke `server_name`
   - Berguna untuk development/testing
   - Bisa di-remove nanti untuk security

4. **SSL/HTTPS:**
   - Highly recommended untuk production
   - Free dengan Let's Encrypt
   - Auto-renewal dengan certbot

---

## 🚀 Quick Migration Script

**Run script untuk automatic migration:**

```bash
# Run migration script
./scripts/migrate-to-domain.sh tamankehati.dasmap.co.id
```

**Lihat:** `scripts/migrate-to-domain.sh` untuk script lengkap.

---

**Last Updated:** 2025-11-05

