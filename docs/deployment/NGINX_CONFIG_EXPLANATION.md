# 🔍 Penjelasan Nginx Config untuk Container 'go'

Penjelasan lengkap tentang `tamankehati-container-go.conf` dan cara kerjanya.

---

## 📋 Apa Itu `tamankehati-container-go.conf`?

**File ini adalah TEMPLATE config Nginx yang:**
- ✅ Sudah disesuaikan untuk container `go`
- ✅ Route ke `localhost:3000` (Frontend Taman Kehati)
- ✅ Route ke `localhost:8000` (Backend Taman Kehati)
- ⚠️ **BELUM otomatis terintegrasi** - masih perlu di-copy dan reload!

---

## 🔄 Cara Kerja Mount Volume

### Setup yang Ada di Server:

**Docker Compose (`~/dasmap_prod/docker-compose.yml`):**
```yaml
services:
  go:
    volumes:
      - ./apps/nginx/sites-enabled:/etc/nginx/sites-enabled
      # ↑ Folder ini ter-mount ke container
```

**Artinya:**
- Folder `~/dasmap_prod/apps/nginx/sites-enabled/` di **host**
- Ter-mount ke `/etc/nginx/sites-enabled/` di **container `go`**
- File yang di-copy ke folder host otomatis terlihat di container

---

## 📝 Langkah-Langkah Setup

### Step 1: Copy Config ke Folder yang Ter-Mount

**Di Server:**
```bash
cd ~/dasmap_prod/apps/tamankehati

# Copy config ke folder yang ter-mount ke container 'go'
cp deploy-package/nginx/tamankehati-container-go.conf \
   ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Penjelasan:**
- File di-copy ke `~/dasmap_prod/apps/nginx/sites-enabled/`
- Folder ini ter-mount ke container `go`
- Config otomatis terlihat di container di `/etc/nginx/sites-enabled/tamankehati.conf`

---

### Step 2: Edit Config (Jika Perlu)

**Di Server:**
```bash
# Edit config
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Update `server_name`:**
```nginx
# Jika pakai IP:
server_name 38.47.93.167;

# Atau jika pakai subdomain:
server_name tamankehati.dasmap.co.id;
```

---

### Step 3: Test Nginx Config di Container

**Di Server:**
```bash
# Test config di container 'go'
docker exec -it dasmap_prod-go-1 nginx -t
```

**Expected Output:**
```
nginx: the configuration file /etc/nginx/nginx.conf test is successful
```

---

### Step 4: Reload Nginx di Container

**⚠️ JANGAN reload sekarang!** Tunggu sampai Taman Kehati containers sudah running.

**Setelah containers running:**
```bash
# Reload Nginx di container 'go'
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## 🔍 Verifikasi Config

### Cek File di Host:
```bash
# Di host
ls -la ~/dasmap_prod/apps/nginx/sites-enabled/
cat ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

### Cek File di Container:
```bash
# Di container 'go'
docker exec -it dasmap_prod-go-1 ls -la /etc/nginx/sites-enabled/
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf
```

**Kedua file harus sama karena ter-mount!**

---

## 🎯 Kenapa Perlu File Khusus untuk Container 'go'?

**File `tamankehati-container-go.conf` sudah disesuaikan untuk:**

1. **Container `go` menggunakan `network_mode: host`**
   - Container bisa akses `localhost:3000` dan `localhost:8000` langsung
   - Tidak perlu IP Docker network

2. **Route ke Taman Kehati containers:**
   - Frontend: `proxy_pass http://localhost:3000`
   - Backend: `proxy_pass http://localhost:8000`

3. **Sudah include security headers:**
   - X-Frame-Options
   - X-XSS-Protection
   - X-Content-Type-Options
   - Referrer-Policy

---

## ⚠️ Catatan Penting

1. **Config BELUM otomatis aktif:**
   - File template masih di `deploy-package/nginx/`
   - Perlu di-copy ke `~/dasmap_prod/apps/nginx/sites-enabled/`
   - Perlu reload Nginx untuk apply

2. **Reload HANYA setelah containers running:**
   - Jangan reload sebelum Taman Kehati containers start
   - Reload setelah containers running dan sehat

3. **File ter-mount secara otomatis:**
   - Tidak perlu copy manual ke container
   - File di host = file di container (karena volume mount)

---

## ✅ Checklist

- [ ] Copy `tamankehati-container-go.conf` ke `~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf`
- [ ] Edit `server_name` jika perlu
- [ ] Test config: `docker exec -it dasmap_prod-go-1 nginx -t`
- [ ] Start Taman Kehati containers
- [ ] Reload Nginx: `docker exec -it dasmap_prod-go-1 nginx -s reload`
- [ ] Verify routing: `curl http://38.47.93.167` atau `curl http://tamankehati.dasmap.co.id`

---

## 🚀 Quick Command

```bash
# 1. Copy config
cd ~/dasmap_prod/apps/tamankehati
cp deploy-package/nginx/tamankehati-container-go.conf \
   ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf

# 2. Edit (optional)
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf

# 3. Test (setelah containers running)
docker exec -it dasmap_prod-go-1 nginx -t

# 4. Reload (setelah containers running)
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

**Last Updated:** 2025-11-04

