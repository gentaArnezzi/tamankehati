# 🔍 Analisis Setup Server yang Ada

Berdasarkan informasi dari server, berikut analisis lengkap setup yang ada.

---

## 📋 Setup Server yang Ada

### Docker Containers yang Running:

```
CONTAINER ID   IMAGE                                     STATUS      PORTS
490c696a267d   docker.inweb.id/amilna-godev:22.16.2     Up 3 weeks   Port 80, 443
399eaf7eeee5   docker.inweb.id/amilna-pgpostgis:20.1.1 Up 3 weeks  Port 5432
```

### Service `go` (Web Utama):

**Image:** `docker.inweb.id/amilna-godev:22.16.2`

**Network Mode:** `host` (menggunakan network host, bukan Docker network)

**Ports:**
- Port 80 → HTTP
- Port 443 → HTTPS

**Volumes (Mounts):**
- `./apps/dasmap.co.id` → `/mnt/go/src/dasmap.co.id`
- `./apps/amilna.co.id` → `/mnt/go/src/amilna.co.id`
- `./apps/nginx/sites-enabled` → `/etc/nginx/sites-enabled`
- `./apps/nginx/nginx.conf` → `/etc/nginx/nginx.conf`
- `./apps/goproject` → `/mnt/go/src/dasmap.co.id/goproject`
- Data volumes untuk uploads, privates, xml, tiles

**Environment:**
- `ENTRYBASH=/mnt/go/src/dasmap.co.id/goproject/start.sh`

**Kesimpulan:**
- Service `go` adalah **container Go yang berisi aplikasi dasmap/amilna**
- **Nginx running di dalam container `go`** (config di-mount dari `./apps/nginx/`)
- Aplikasi Go running di dalam container dengan network mode `host`
- Port 80/443 digunakan oleh service `go`

---

### Service `db-1` (Database):

**Image:** `docker.inweb.id/amilna-pgpostgis:20.1.1` (PostgreSQL + PostGIS)

**Network:**
- Network: `go-net` (subnet: 172.27.0.0/16)
- IP: `172.27.0.3`

**Ports:**
- Port 5432 → Exposed ke host

**Kesimpulan:**
- Database PostgreSQL untuk aplikasi dasmap/amilna
- Port 5432 sudah digunakan (exposed)

---

## 🎯 Implikasi untuk Deployment Taman Kehati

### 1. Port Management

**Port yang Sudah Digunakan:**
- ✅ Port 80 → Service `go` (Nginx di dalam container)
- ✅ Port 443 → Service `go` (Nginx di dalam container)
- ✅ Port 5432 → Service `db-1` (PostgreSQL)

**Port yang Akan Digunakan Taman Kehati:**
- ✅ Port 3000 → Frontend Taman Kehati (perlu cek apakah kosong)
- ✅ Port 8000 → Backend Taman Kehati (perlu cek apakah kosong)

**Action:**
- Cek port 3000 dan 8000 sebelum deploy
- Jika port sudah dipakai, gunakan port alternatif (3001, 8001, dll)

---

### 2. Network Isolation

**Network yang Ada:**
- `go-net` (subnet: 172.27.0.0/16) → Untuk service `go` dan `db-1`

**Network Taman Kehati:**
- `tamankehati-network` → Network terpisah (isolated)
- Tidak akan konflik dengan `go-net`

**Action:**
- ✅ Taman Kehati akan pakai network sendiri
- ✅ Tidak akan konflik dengan network yang ada

---

### 3. Nginx Routing

**Setup Saat Ini:**
- Nginx running **di dalam container `go`**
- Config di-mount dari `./apps/nginx/`
- Port 80/443 digunakan oleh service `go`

**Untuk Taman Kehati:**
- **Opsi 1:** Tambah config Nginx di `./apps/nginx/sites-enabled/` untuk route ke Taman Kehati
  - Edit config di host: `~/dasmap_prod/apps/nginx/sites-enabled/`
  - Config akan otomatis ter-mount ke container `go`
  - Route ke `localhost:3000` (Frontend) dan `localhost:8000` (Backend)

- **Opsi 2:** Pakai Nginx di host (jika ada)
  - Setup config di `/etc/nginx/sites-enabled/tamankehati.conf`
  - Route ke port 3000 dan 8000

**Action:**
- Pilih opsi 1 (edit config di `./apps/nginx/`) karena Nginx sudah running di container `go`
- Atau pakai opsi 2 jika ada Nginx di host

---

### 4. Database

**Database yang Ada:**
- Service `db-1` → PostgreSQL untuk dasmap/amilna
- Port 5432 exposed

**Database Taman Kehati:**
- Akan membuat database sendiri (PostgreSQL container)
- Tidak akan konflik dengan `db-1`
- Port tidak akan di-expose (hanya internal Docker network)

**Action:**
- ✅ Taman Kehati akan pakai database sendiri
- ✅ Tidak akan konflik dengan database yang ada

---

## 📝 Checklist Sebelum Deploy Taman Kehati

### 1. Cek Port 3000 dan 8000

```bash
# Di server
sudo ss -tulpn | grep :3000
sudo ss -tulpn | grep :8000
```

**Jika port sudah dipakai:**
- Update `.env` dengan `FRONTEND_PORT=3001` dan `BACKEND_PORT=8001`
- Update Nginx config dengan port baru

---

### 2. Pilih Nginx Routing Strategy

**Opsi A: Edit Nginx Config di Container `go` (Recommended)**

```bash
# Di server
cd ~/dasmap_prod/apps/nginx/sites-enabled/

# Buat config baru untuk Taman Kehati
sudo nano tamankehati.conf
```

**Isi config:**
```nginx
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;  # atau IP

    location / {
        proxy_pass http://localhost:3000;  # Frontend Taman Kehati
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8000;  # Backend Taman Kehati
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Reload Nginx di container:**
```bash
# Reload Nginx di dalam container go
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 nginx -s reload
```

**Opsi B: Pakai Nginx di Host (jika ada)**

```bash
# Di server
sudo nano /etc/nginx/sites-enabled/tamankehati.conf
# Copy config dari deploy-package/nginx/tamankehati-server.conf
sudo nginx -t
sudo systemctl reload nginx
```

---

### 3. Deploy Taman Kehati

```bash
# Di server
cd ~/dasmap_prod/apps/tamankehati

# Extract package (jika belum)
tar -xzf /tmp/deployment-package.tar.gz

# Setup .env
cp env.production.example .env
nano .env

# Pull images dan start
docker compose -f docker-compose.pull.no-nginx.yml pull
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

---

## ✅ Summary

**Setup Server yang Ada:**
- ✅ Service `go` → Container Go dengan Nginx di dalamnya (port 80/443)
- ✅ Service `db-1` → PostgreSQL (port 5432)
- ✅ Nginx config di `./apps/nginx/` (ter-mount ke container `go`)

**Untuk Taman Kehati:**
- ✅ Port 3000 dan 8000 → Taman Kehati (perlu cek apakah kosong)
- ✅ Network terpisah → `tamankehati-network` (tidak konflik)
- ✅ Database sendiri → PostgreSQL container (tidak konflik)
- ✅ Nginx routing → Edit config di `./apps/nginx/sites-enabled/` atau pakai Nginx di host

**Action Items:**
1. ✅ Cek port 3000 dan 8000
2. ✅ Pilih Nginx routing strategy
3. ✅ Setup Nginx config untuk Taman Kehati
4. ✅ Deploy Taman Kehati

---

**Last Updated:** 2025-11-04

