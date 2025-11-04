# Penjelasan: Nginx Container vs Nginx di Server

## ❓ Pertanyaan

**"Kenapa ada `tamankehati-server.conf` padahal pakai `docker-compose.pull.no-nginx.yml` (no nginx)?"**

---

## ✅ Penjelasan

Ada **2 jenis Nginx** yang berbeda:

### 1. Nginx Container (TIDAK ADA) ❌

**File:** `docker-compose.pull.no-nginx.yml`  
**Artinya:** Tidak ada Nginx container di dalam Docker Compose

**Kenapa tidak ada?**
- Server sudah punya Nginx yang berjalan di host (bukan di container)
- Nginx di host sudah handle port 80
- Tidak perlu Nginx container tambahan

---

### 2. Nginx di Server (PERLU DIKONFIGURASI) ✅

**File:** `tamankehati-server.conf`  
**Artinya:** Config untuk Nginx yang sudah ada di server

**Kenapa perlu?**
- Nginx di server perlu dikonfigurasi untuk route traffic ke aplikasi Taman Kehati
- Aplikasi Taman Kehati berjalan di containers:
  - Frontend: `localhost:3000`
  - Backend: `localhost:8000`
- Nginx di server perlu tahu: "Jika ada request ke `tamankehati.dasmap.co.id`, route ke `localhost:3000` dan `localhost:8000`"

---

## 🔄 Flow Traffic

```
User Request
    ↓
Nginx di Server (port 80)
    ↓
Route berdasarkan server_name:
    - dasmap.co.id → aplikasi existing (38.47.93.167:8081)
    - tamankehati.dasmap.co.id → Taman Kehati containers
        ├── / → localhost:3000 (Frontend)
        ├── /api/ → localhost:8000 (Backend)
        └── /uploads/ → localhost:8000 (Backend)
```

---

## 📋 Setup yang Benar

### Step 1: Docker Compose (TANPA Nginx Container)

```bash
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

**Hasil:**
- ✅ Frontend container running di `localhost:3000`
- ✅ Backend container running di `localhost:8000`
- ❌ Nginx container TIDAK ada (karena pakai `.no-nginx.yml`)

### Step 2: Konfigurasi Nginx di Server

```bash
# Copy config untuk Nginx di server (bukan container!)
sudo cp ~/dasmap_prod/apps/tamankehati/deploy-package/nginx/tamankehati-server.conf \
  /etc/nginx/sites-enabled/tamankehati.conf

# Reload Nginx di server
sudo systemctl reload nginx
```

**Hasil:**
- ✅ Nginx di server sekarang tahu cara route ke Taman Kehati
- ✅ Traffic ke `tamankehati.dasmap.co.id` akan di-route ke containers

---

## 🎯 Kesimpulan

| Item | Status | Keterangan |
|------|--------|------------|
| Nginx Container | ❌ TIDAK ADA | Pakai `docker-compose.pull.no-nginx.yml` |
| Nginx di Server | ✅ PERLU DIKONFIGURASI | Route traffic ke containers |
| Frontend Container | ✅ Running di `localhost:3000` | Exposed ke host |
| Backend Container | ✅ Running di `localhost:8000` | Exposed ke host |

---

## 📝 File yang Ada

```
~/dasmap_prod/apps/tamankehati/
├── docker-compose.pull.no-nginx.yml  ← TIDAK ada Nginx container
├── deploy-package/
│   └── nginx/
│       └── tamankehati-server.conf   ← Config untuk Nginx di SERVER
└── .env
```

**Kedua file ini berbeda tujuan:**
- `docker-compose.pull.no-nginx.yml` → Tidak membuat Nginx container
- `tamankehati-server.conf` → Config untuk Nginx yang sudah ada di server

---

## ✅ Checklist

- [x] Pakai `docker-compose.pull.no-nginx.yml` (tidak ada Nginx container)
- [ ] Copy `tamankehati-server.conf` ke `/etc/nginx/sites-enabled/` (config Nginx di server)
- [ ] Reload Nginx di server: `sudo systemctl reload nginx`
- [ ] Test: `curl http://tamankehati.dasmap.co.id`

---

**Last Updated:** 2025-11-04

