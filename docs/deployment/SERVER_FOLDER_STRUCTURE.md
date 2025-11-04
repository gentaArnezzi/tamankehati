# Struktur Folder Server - Verifikasi

## ✅ Struktur yang Benar

```
~/dasmap_prod/
└── apps/
    ├── amilna.co.id/
    ├── dasmap.co.id/
    ├── goproject/
    ├── nginx/              ← Nginx config di server
    └── tamankehati/        ← ✅ LOKASI DEPLOYMENT TAMAN KEHATI
```

---

## 📍 Lokasi Deployment Taman Kehati

**Path lengkap:** `~/dasmap_prod/apps/tamankehati/`

**Ini sudah benar!** ✅

---

## 📦 Setup di Server

### Step 1: Copy Package ke Server

```bash
# Di local machine
scp deployment-package.tar.gz ubuntu@YOUR_SERVER_IP:/tmp/

# Di server
cd ~/dasmap_prod/apps/tamankehati
tar -xzf /tmp/deployment-package.tar.gz
```

### Step 2: Struktur Setelah Extract

```
~/dasmap_prod/apps/tamankehati/
├── docker-compose.pull.no-nginx.yml
├── docker-compose.pull.yml
├── env.production.example
├── deploy-package/
│   └── nginx/
│       ├── tamankehati-server.conf  ← Config untuk Nginx di server
│       └── ...
├── scripts/
│   ├── verify-deployment.sh
│   └── backup-database.sh
└── README.md
```

### Step 3: Setup .env

```bash
cd ~/dasmap_prod/apps/tamankehati
cp env.production.example .env
nano .env
# Edit dengan konfigurasi server Anda
```

### Step 4: Setup Nginx

```bash
# Copy config Nginx ke sites-enabled
sudo cp ~/dasmap_prod/apps/tamankehati/deploy-package/nginx/tamankehati-server.conf \
  /etc/nginx/sites-enabled/tamankehati.conf

# Edit server_name jika perlu
sudo nano /etc/nginx/sites-enabled/tamankehati.conf

# Test & reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Start Services

```bash
cd ~/dasmap_prod/apps/tamankehati

# Pull images dari Docker Hub
docker compose -f docker-compose.pull.no-nginx.yml pull

# Start services
docker compose -f docker-compose.pull.no-nginx.yml up -d

# Verifikasi
docker compose -f docker-compose.pull.no-nginx.yml ps
```

---

## ✅ Verifikasi Struktur

Setelah setup, struktur seharusnya:

```
~/dasmap_prod/apps/tamankehati/
├── .env                           ← Config production
├── docker-compose.pull.no-nginx.yml
├── deploy-package/
│   └── nginx/
│       └── tamankehati-server.conf
└── (volumes akan dibuat otomatis oleh Docker)
```

---

## 🔍 Checklist

- [x] Folder `~/dasmap_prod/apps/tamankehati/` sudah ada ✅
- [ ] Package `deployment-package.tar.gz` sudah di-extract
- [ ] File `.env` sudah dibuat dari `env.production.example`
- [ ] Nginx config sudah di-copy ke `/etc/nginx/sites-enabled/`
- [ ] Nginx sudah di-reload
- [ ] Docker images sudah di-pull dari Docker Hub
- [ ] Services sudah di-start

---

**Last Updated:** 2025-11-04

