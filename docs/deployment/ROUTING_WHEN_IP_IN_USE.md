# 🔧 Routing Strategy Ketika IP Sudah Dipakai

Panduan untuk setup routing ketika IP `38.47.93.167` sudah digunakan oleh aplikasi lain.

---

## ❌ Masalah

**IP `38.47.93.167` sudah digunakan oleh aplikasi lain:**
- Default server block catch semua request
- `tamankehati.conf` tidak bisa jadi default untuk IP yang sama
- Perlu strategi routing yang berbeda

---

## 🎯 Opsi Solusi

### Opsi 1: Pakai Subdomain (Recommended) ⭐

**Setup DNS untuk subdomain, lalu Nginx route berdasarkan `server_name`.**

#### Keuntungan:
- ✅ Professional URL
- ✅ Tidak konflik dengan aplikasi lain
- ✅ Mudah di-manage
- ✅ Bisa pakai SSL nanti

#### Langkah:

**1. Setup DNS A Record:**

Di Domain Registrar (untuk `dasmap.co.id`):
```
Type: A
Host: tamankehati
Value: 38.47.93.167
TTL: 3600
```

**📖 Panduan lengkap:** Lihat [DNS_SETUP_GUIDE.md](./DNS_SETUP_GUIDE.md) untuk langkah detail cara setup DNS di registrar.

**2. Update Nginx Config:**

```bash
# Di server
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Config:**
```nginx
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;  # Hanya subdomain, bukan IP
    # ... rest of config
}
```

**3. Test DNS (tunggu 5-60 menit setelah setup):**

```bash
dig tamankehati.dasmap.co.id +short
# Should return: 38.47.93.167
```

**4. Test dan Reload:**

```bash
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

**5. Test Subdomain:**

```bash
curl http://tamankehati.dasmap.co.id | head -20
```

**Expected:** HTML dari Taman Kehati (Next.js)

---

### Opsi 2: Path-based Routing

**Route berdasarkan path: `/tamankehati/`**

#### Keuntungan:
- ✅ Tidak perlu setup DNS
- ✅ Bisa pakai IP yang sama
- ✅ Tidak konflik dengan aplikasi lain

#### Kekurangan:
- ⚠️ URL kurang professional: `http://38.47.93.167/tamankehati/`
- ⚠️ Perlu update frontend untuk handle base path

#### Langkah:

**1. Update Nginx Config:**

```bash
# Di server
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Config:**
```nginx
server {
    listen 80;
    server_name 38.47.93.167;  # IP tetap, tapi location berbeda
    
    # Taman Kehati - Path-based routing
    location /tamankehati/ {
        proxy_pass http://localhost:3000/;
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
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # ... aplikasi lain tetap di location /
}
```

**2. Update Frontend Config:**

Di `.env`:
```bash
NEXT_PUBLIC_BASE_PATH=/tamankehati
```

**3. Test dan Reload:**

```bash
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

**4. Test:**

```bash
curl http://38.47.93.167/tamankehati/ | head -20
```

---

### Opsi 3: Port Berbeda (Recommended untuk Quick Setup) ⭐

**Pakai Nginx di port berbeda (8080), route ke container.**

#### Keuntungan:
- ✅ Tidak perlu setup DNS
- ✅ Tidak konflik dengan aplikasi lain
- ✅ Simple dan cepat
- ✅ Professional URL via Nginx: `http://38.47.93.167:8080`

#### Kekurangan:
- ⚠️ URL masih pakai port: `http://38.47.93.167:8080`
- ⚠️ Perlu expose port di firewall

#### Langkah:

**1. Copy Nginx Config:**

```bash
# Di server
cp deploy-package/nginx/tamankehati-container-go-port.conf \
   ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**2. Buka Port di Firewall:**

```bash
sudo ufw allow 8080/tcp
```

**3. Test dan Reload Nginx:**

```bash
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

**4. Test:**

```bash
curl http://38.47.93.167:8080 | head -20
```

**URL:**
- Frontend: `http://38.47.93.167:8080`
- Backend: `http://38.47.93.167:8080/api/`

**📖 Panduan lengkap:** Lihat [PORT_BASED_ROUTING.md](./PORT_BASED_ROUTING.md)

---

## 🎯 Recommended: Opsi 1 (Subdomain)

**Mengapa pakai subdomain:**
- ✅ Professional: `http://tamankehati.dasmap.co.id`
- ✅ Tidak konflik dengan aplikasi lain
- ✅ Mudah di-manage
- ✅ Bisa pakai SSL nanti

**Setup DNS:**
1. Login ke domain registrar untuk `dasmap.co.id`
2. Add A Record: `tamankehati` → `38.47.93.167`
3. Wait 5-60 menit untuk DNS propagation
4. Update Nginx config dengan `server_name tamankehati.dasmap.co.id;`
5. Test: `curl http://tamankehati.dasmap.co.id`

---

## 📋 Quick Setup untuk Subdomain

**1. Update Nginx Config:**

```bash
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Update:**
```nginx
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;  # Hanya subdomain, bukan IP
    # ... rest of config
}
```

**2. Setup DNS:**

Di domain registrar, add:
```
Type: A
Host: tamankehati
Value: 38.47.93.167
TTL: 3600
```

**3. Wait & Test:**

```bash
# Wait 5-60 minutes, then test DNS
dig tamankehati.dasmap.co.id +short

# Test Nginx
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload

# Test subdomain
curl http://tamankehati.dasmap.co.id | head -20
```

---

## ⚠️ Catatan Penting

**Jika IP sudah dipakai:**
- ❌ Jangan pakai `default_server` untuk IP yang sama
- ❌ Jangan pakai `server_name 38.47.93.167` jika IP dipakai aplikasi lain
- ✅ Pakai subdomain dengan DNS setup
- ✅ Atau pakai path-based routing
- ✅ Atau pakai port langsung (temporary)

---

**Last Updated:** 2025-11-04

