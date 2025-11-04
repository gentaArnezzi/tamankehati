# 🔍 Troubleshooting: Nginx Route ke Aplikasi Lain

Panduan untuk mengatasi masalah Nginx route ke aplikasi yang sudah ada, bukan Taman Kehati.

---

## ❌ Masalah

**Response yang didapat:**
```html
<!DOCTYPE html><html><head><title>Rumah Data Keanekaragaman Hayati</title>
...
<script src="/../lib/komodo.js"></script>
```

**Ini adalah aplikasi lain (Vue.js dengan Komodo.js), bukan Taman Kehati (Next.js)!**

---

## 🔍 Penyebab

### 1. Default Server Block Catch-All

**Problem:** Default server block di Nginx masih aktif dan catch semua request sebelum `tamankehati.conf`.

**Cek:**
```bash
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/default | head -30
```

**Jika default config juga listen di port 80, bisa konflik!**

---

### 2. Server Blocks Priority

**Problem:** Urutan server blocks di Nginx menentukan mana yang dipilih.

**Cek:**
```bash
docker exec -it dasmap_prod-go-1 nginx -T | grep -A 5 "server {" | head -40
```

---

### 3. server_name Tidak Match

**Problem:** `server_name` di `tamankehati.conf` tidak match dengan request.

**Cek:**
```bash
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | grep server_name
```

---

## 🔧 Solusi

### Option 1: Disable Default Config (Recommended)

**Jika default config tidak dipakai untuk IP 38.47.93.167:**

```bash
# Di server
# Disable default config
docker exec -it dasmap_prod-go-1 mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.disabled

# Atau via host (karena ter-mount)
mv ~/dasmap_prod/apps/nginx/sites-enabled/default ~/dasmap_prod/apps/nginx/sites-enabled/default.disabled

# Test dan reload
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

### Option 2: Update tamankehati.conf dengan default_server

**Buat tamankehati.conf menjadi default server:**

```bash
# Di server
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

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
    server_name 38.47.93.167 _;
```

**Save, test, dan reload:**
```bash
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

### Option 3: Update server_name di tamankehati.conf

**Pastikan server_name match dengan IP:**

```bash
# Di server
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Update:**
```nginx
server_name 38.47.93.167 _;
```

**Atau:**
```nginx
server_name _;
```

**Save, test, dan reload:**
```bash
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## 🔍 Debugging Commands

### 1. Cek Semua Server Blocks

```bash
docker exec -it dasmap_prod-go-1 nginx -T | grep -A 10 "server {" | head -50
```

**Lihat urutan dan `server_name` dari setiap block.**

---

### 2. Cek Default Config

```bash
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/default | head -30
```

**Cek apakah default config juga listen di port 80 dan catch-all.**

---

### 3. Cek tamankehati.conf

```bash
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | head -20
```

**Pastikan config sudah benar.**

---

### 4. Test dengan Host Header

```bash
# Test dengan Host header yang berbeda
curl -H "Host: tamankehati.dasmap.co.id" http://38.47.93.167
curl -H "Host: 38.47.93.167" http://38.47.93.167
curl http://38.47.93.167
```

---

## ✅ Expected Result Setelah Fix

```bash
curl http://38.47.93.167 | head -20
```

**Expected output:**
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Taman Kehati</title>
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

## 🎯 Recommended Solution

**Langkah terbaik:**

1. **Disable default config** (jika tidak dipakai untuk IP ini)
2. **Update tamankehati.conf dengan `default_server`**
3. **Update `server_name` ke IP atau catch-all**

```bash
# Di server
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Update menjadi:**
```nginx
server {
    listen 80 default_server;
    server_name 38.47.93.167 _;
    
    # ... rest of config
}
```

**Save, test, reload:**
```bash
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

**Last Updated:** 2025-11-04


