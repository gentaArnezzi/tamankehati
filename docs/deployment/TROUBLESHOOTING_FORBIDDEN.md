# 🔍 Troubleshooting: Forbidden Error

Panduan untuk mengatasi error "Forbidden" saat mengakses via Nginx.

---

## ❌ Error yang Terjadi

```bash
curl http://38.47.93.167/api/health
# Response: Forbidden
```

---

## 🔍 Penyebab Umum

### 1. `server_name` Tidak Match dengan IP

**Problem:** Nginx config menggunakan `server_name tamankehati.dasmap.co.id` tapi request datang dari IP `38.47.93.167`.

**Solution:** Update `server_name` di config.

---

### 2. Default Server Block Catch-All

**Problem:** Default server block di Nginx catch semua request sebelum `tamankehati.conf` diproses.

**Solution:** Pastikan `tamankehati.conf` memiliki priority lebih tinggi atau update `server_name`.

---

### 3. Nginx Config Belum Ter-Reload

**Problem:** Config sudah di-update tapi Nginx belum reload dengan benar.

**Solution:** Reload ulang Nginx.

---

## 🔧 Langkah Troubleshooting

### Step 1: Cek Config di Container

**Di Server:**

```bash
# Cek server_name di tamankehati.conf
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | grep server_name
```

**Expected output:**
```nginx
server_name tamankehati.dasmap.co.id; # atau
server_name 38.47.93.167; # atau
server_name _;
```

---

### Step 2: Cek Default Config

**Di Server:**

```bash
# Cek default config yang mungkin catch-all
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/default | head -30
```

**Jika default config juga listen di port 80, bisa konflik!**

---

### Step 3: Update server_name

**Di Server:**

```bash
# Edit config
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Update `server_name`:**

**Opsi A: Pakai IP (untuk testing)**
```nginx
server_name 38.47.93.167 _;
```

**Opsi B: Pakai catch-all (tidak recommended untuk production)**
```nginx
server_name _;
```

**Opsi C: Pakai subdomain (jika sudah setup DNS)**
```nginx
server_name tamankehati.dasmap.co.id;
```

**Save:** `Ctrl+X`, lalu `Y`, lalu `Enter`

---

### Step 4: Test dan Reload Nginx

**Di Server:**

```bash
# Test config
docker exec -it dasmap_prod-go-1 nginx -t

# Reload Nginx
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

### Step 5: Test Lagi

**Di Server:**

```bash
# Test backend via Nginx
curl http://38.47.93.167/api/health

# Test dengan Host header (jika pakai subdomain)
curl -H "Host: tamankehati.dasmap.co.id" http://38.47.93.167/api/health
```

---

## 🎯 Quick Fix (Recommended)

**Update `server_name` untuk catch-all:**

```bash
# Di server
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Ubah:**
```nginx
server_name tamankehati.dasmap.co.id;
```

**Menjadi:**
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

### Cek Nginx Logs

```bash
# Check error logs
docker logs dasmap_prod-go-1 | grep -i error | tail -20

# Check access logs
docker logs dasmap_prod-go-1 | grep "38.47.93.167" | tail -20
```

### Cek Request yang Masuk

```bash
# Test dengan verbose
curl -v http://38.47.93.167/api/health

# Test dengan Host header
curl -H "Host: 38.47.93.167" http://38.47.93.167/api/health
```

### Cek Nginx Config Lengkap

```bash
# Lihat semua server blocks
docker exec -it dasmap_prod-go-1 nginx -T | grep -A 10 "server {"
```

---

## ✅ Expected Result Setelah Fix

```bash
curl http://38.47.93.167/api/health
# Response: {"status":"ok"}
```

---

**Last Updated:** 2025-11-04


