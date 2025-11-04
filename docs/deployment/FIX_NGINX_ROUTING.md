# 🔧 Fix Nginx Routing ke Taman Kehati

Panduan untuk memperbaiki Nginx routing agar route ke Taman Kehati, bukan aplikasi lain.

---

## ❌ Masalah Saat Ini

**Response yang didapat:**
- `curl http://localhost:3000` → ✅ Taman Kehati (Next.js) - **BERHASIL**
- `curl http://38.47.93.167` → ❌ Aplikasi lain (Vue.js) - **MASALAH**

**Ini berarti:**
- Frontend Taman Kehati sudah running ✅
- Nginx masih route ke aplikasi lama ❌

---

## 🔍 Penyebab

1. **Default server block masih aktif** dan catch semua request
2. **tamankehati.conf tidak diprioritaskan** (tidak ada `default_server`)
3. **server_name tidak match** dengan IP

---

## 🔧 Solusi: Update tamankehati.conf

### Step 1: Edit Config

**Di Server:**

```bash
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

### Step 2: Update Konfigurasi

**Ubah:**
```nginx
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;
```

**Menjadi:**
```nginx
server {
    listen 80 default_server;
    server_name 38.47.93.167 tamankehati.dasmap.co.id _;
```

**Penjelasan:**
- `default_server` → Membuat ini jadi default server untuk port 80
- `server_name 38.47.93.167 tamankehati.dasmap.co.id _` → Match dengan IP, subdomain, atau catch-all

**Save:** `Ctrl+X`, lalu `Y`, lalu `Enter`

---

### Step 3: Test dan Reload

```bash
# Test config
docker exec -it dasmap_prod-go-1 nginx -t

# Reload Nginx
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

### Step 4: Test Lagi

```bash
# Test via IP
curl http://38.47.93.167 | head -20

# Test backend API
curl http://38.47.93.167/api/health
```

**Expected output:**
- HTML dari Taman Kehati (Next.js), bukan Vue.js
- Backend API response: `{"status":"ok"}`

---

## 🌐 Setup Subdomain (Optional)

**Jika ingin pakai subdomain `tamankehati.dasmap.co.id`:**

### 1. Setup DNS

**Di Domain Registrar (untuk dasmap.co.id):**

1. Login ke domain registrar
2. Go to DNS Management
3. Add A Record:
   ```
   Type: A
   Host: tamankehati
   Value: 38.47.93.167
   TTL: 3600
   ```

4. Wait for DNS propagation (5-60 minutes)

### 2. Verify DNS

```bash
# Test DNS
dig tamankehati.dasmap.co.id +short
# Should return: 38.47.93.167
```

### 3. Test Subdomain

```bash
# Test via subdomain
curl http://tamankehati.dasmap.co.id | head -20
```

---

## ✅ Config yang Benar

**File: `~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf`**

```nginx
server {
    listen 80 default_server;
    server_name 38.47.93.167 tamankehati.dasmap.co.id _;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        # ... proxy headers ...
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        # ... proxy headers ...
    }

    # Backend uploads
    location /uploads/ {
        proxy_pass http://localhost:8000;
        # ... proxy headers ...
    }

    # Backend docs
    location /docs {
        proxy_pass http://localhost:8000;
        # ... proxy headers ...
    }
}
```

---

## 🎯 Quick Fix Command

**Copy-paste semua command berikut di server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Edit config
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
# Update: listen 80 default_server;
# Update: server_name 38.47.93.167 tamankehati.dasmap.co.id _;
# Save: Ctrl+X, Y, Enter

# Test dan reload
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload

# Test
curl http://38.47.93.167 | head -20
curl http://38.47.93.167/api/health
```

---

## 🔍 Troubleshooting

### Masih Route ke Aplikasi Lain

**Cek default config:**
```bash
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/default | head -20
```

**Jika default config juga listen di port 80, disable:**
```bash
mv ~/dasmap_prod/apps/nginx/sites-enabled/default ~/dasmap_prod/apps/nginx/sites-enabled/default.disabled
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

### Subdomain Tidak Resolve

**Error:** `Could not resolve host: tamankehati.dasmap.co.id`

**Solution:**
1. Setup DNS A record untuk subdomain
2. Wait for DNS propagation
3. Test dengan: `dig tamankehati.dasmap.co.id +short`

**Atau pakai IP langsung:** `http://38.47.93.167`

---

## ✅ Expected Result

**Setelah fix:**

```bash
curl http://38.47.93.167 | head -20
```

**Expected output:**
```html
<!DOCTYPE html>
<html lang="id">
<head>
<meta charSet="utf-8"/>
<title>Portal Keanekaragaman Hayati Indonesia</title>
<!-- Next.js app, bukan Vue.js -->
```

**Bukan:**
```html
<!DOCTYPE html>
<html>
<head>
<title>Rumah Data Keanekaragaman Hayati</title>
<!-- Vue.js app -->
```

---

**Last Updated:** 2025-11-04


