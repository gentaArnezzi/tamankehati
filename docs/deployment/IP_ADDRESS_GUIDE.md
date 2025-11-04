# 🌐 IP Address Guide - Public vs Private

Panduan untuk memahami perbedaan Public IP dan Private IP, serta mana yang harus digunakan untuk deployment.

---

## 📋 IP Address yang Anda Miliki

**Public IP:** `38.47.93.167`
- IP yang bisa diakses dari internet
- Digunakan untuk akses dari luar server

**Private IP:** `192.168.1.58`
- IP untuk komunikasi internal di network lokal
- Hanya bisa diakses dari dalam network yang sama

---

## 🔍 Perbedaan Public vs Private IP

### Public IP (38.47.93.167)

**Karakteristik:**
- ✅ Bisa diakses dari internet
- ✅ Bisa diakses dari mana saja (jika firewall mengizinkan)
- ✅ Digunakan untuk akses eksternal
- ✅ Unique di seluruh internet

**Contoh Penggunaan:**
- `http://38.47.93.167:3000` → Frontend
- `http://38.47.93.167:8000` → Backend API
- `http://38.47.93.167/api` → Via Nginx

---

### Private IP (192.168.1.58)

**Karakteristik:**
- ✅ Hanya bisa diakses dari dalam network yang sama
- ✅ Tidak bisa diakses dari internet
- ✅ Digunakan untuk komunikasi internal
- ✅ Bisa sama dengan IP di network lain

**Contoh Penggunaan:**
- `http://192.168.1.58:3000` → Hanya dari dalam network
- `http://192.168.1.58:8000` → Hanya dari dalam network

---

## 🎯 Rekomendasi untuk Deployment Taman Kehati

### Opsi A: Akses dari Internet (Recommended)

**Gunakan Public IP (38.47.93.167)**

**Konfigurasi `.env`:**
```bash
SERVER_IP=38.47.93.167

CORS_ORIGINS=http://38.47.93.167:3000,http://38.47.93.167:80,https://dasmap.co.id

NEXT_PUBLIC_API_URL=http://38.47.93.167:8000
```

**Keuntungan:**
- ✅ Bisa diakses dari internet
- ✅ Bisa diakses dari mana saja
- ✅ Cocok untuk production

**Kekurangan:**
- ⚠️ Perlu pastikan firewall sudah dikonfigurasi
- ⚠️ Perlu pastikan port 3000 dan 8000 sudah dibuka

---

### Opsi B: Akses Internal Saja (Local Network)

**Gunakan Private IP (192.168.1.58)**

**Konfigurasi `.env`:**
```bash
SERVER_IP=192.168.1.58

CORS_ORIGINS=http://192.168.1.58:3000,http://192.168.1.58:80

NEXT_PUBLIC_API_URL=http://192.168.1.58:8000
```

**Keuntungan:**
- ✅ Lebih aman (tidak bisa diakses dari internet)
- ✅ Cocok untuk development/testing internal

**Kekurangan:**
- ❌ Hanya bisa diakses dari dalam network yang sama
- ❌ Tidak bisa diakses dari internet

---

### Opsi C: Hybrid (Recommended untuk Production)

**Gunakan Public IP untuk External, Private IP untuk Internal**

**Konfigurasi `.env`:**
```bash
# Public IP untuk akses dari internet
SERVER_IP=38.47.93.167

# CORS bisa include keduanya
CORS_ORIGINS=http://38.47.93.167:3000,http://38.47.93.167:80,http://192.168.1.58:3000,https://dasmap.co.id

# Frontend API URL (public untuk akses dari internet)
NEXT_PUBLIC_API_URL=http://38.47.93.167:8000
```

**Keuntungan:**
- ✅ Bisa diakses dari internet (public IP)
- ✅ Bisa diakses dari internal network (private IP)
- ✅ Fleksibel

---

## ✅ Checklist untuk Memilih IP

**Pilih Public IP (38.47.93.167) jika:**
- ✅ Aplikasi akan diakses dari internet
- ✅ Aplikasi akan diakses dari berbagai lokasi
- ✅ Production deployment
- ✅ Sudah ada firewall configuration

**Pilih Private IP (192.168.1.58) jika:**
- ✅ Aplikasi hanya untuk internal use
- ✅ Aplikasi hanya diakses dari dalam network
- ✅ Development/testing environment
- ✅ Tidak perlu akses dari internet

---

## 🔧 Konfigurasi `.env` yang Disarankan

**Untuk Production (Akses dari Internet):**

```bash
# Server IP (Public IP)
SERVER_IP=38.47.93.167

# CORS Origins
CORS_ORIGINS=http://38.47.93.167:3000,http://38.47.93.167:80,https://dasmap.co.id

# Frontend API URL
NEXT_PUBLIC_API_URL=http://38.47.93.167:8000

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=8000
```

**Untuk Internal Use Only:**

```bash
# Server IP (Private IP)
SERVER_IP=192.168.1.58

# CORS Origins
CORS_ORIGINS=http://192.168.1.58:3000,http://192.168.1.58:80

# Frontend API URL
NEXT_PUBLIC_API_URL=http://192.168.1.58:8000

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=8000
```

---

## 🎯 Rekomendasi Final

**Untuk deployment Taman Kehati, gunakan Public IP (38.47.93.167):**

1. ✅ Aplikasi bisa diakses dari internet
2. ✅ Cocok untuk production
3. ✅ Bisa diakses dari berbagai lokasi
4. ✅ Sudah ada firewall configuration di server

**Konfigurasi `.env`:**
```bash
SERVER_IP=38.47.93.167
CORS_ORIGINS=http://38.47.93.167:3000,http://38.47.93.167:80,https://dasmap.co.id
NEXT_PUBLIC_API_URL=http://38.47.93.167:8000
```

---

## ⚠️ Catatan Penting

1. **Firewall:**
   - Pastikan port 3000 dan 8000 sudah dibuka di firewall
   - Jika belum, buka dengan:
     ```bash
     sudo ufw allow 3000/tcp
     sudo ufw allow 8000/tcp
     ```

2. **Nginx Routing:**
   - Jika pakai Nginx, pastikan config menggunakan IP yang benar
   - Untuk akses dari internet, gunakan public IP

3. **CORS:**
   - Pastikan `CORS_ORIGINS` include semua IP yang akan mengakses
   - Bisa include keduanya (public dan private) jika perlu

---

**Last Updated:** 2025-11-04

