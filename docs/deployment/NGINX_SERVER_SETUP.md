# Setup Nginx di Server untuk Taman Kehati

## 📋 Konteks

Server sudah punya Nginx yang berjalan di:
- Path: `~/dasmap_prod/apps/nginx/`
- Config: `~/dasmap_prod/apps/nginx/sites-enabled/default`
- User: `www-data`

Aplikasi Taman Kehati akan di-deploy di:
- Path: `~/dasmap_prod/apps/tamankehati/`
- Frontend: `localhost:3000`
- Backend: `localhost:8000`

---

## 🎯 Opsi Routing

### Opsi 1: Subdomain (Recommended)

Jika Anda punya domain dan ingin pakai subdomain:
- `tamankehati.dasmap.co.id` → Taman Kehati
- `dasmap.co.id` → Aplikasi existing

### Opsi 2: Path-based Routing

Jika tidak ada subdomain, bisa pakai path:
- `dasmap.co.id/tamankehati/` → Taman Kehati
- `dasmap.co.id/` → Aplikasi existing

### Opsi 3: Port-based (Temporary)

Jika tidak ada domain, bisa pakai port:
- `YOUR_SERVER_IP:80` → Aplikasi existing
- `YOUR_SERVER_IP:8080` → Taman Kehati (butuh buka port baru)

---

## 📝 Setup Nginx untuk Taman Kehati

### Step 1: Copy Konfigurasi

```bash
# Di server
cd ~/dasmap_prod/apps/tamankehati
# Extract deployment package jika belum
tar -xzf /tmp/deployment-package.tar.gz

# Copy config Nginx
sudo cp deploy-package/nginx/tamankehati-server.conf /etc/nginx/sites-enabled/tamankehati.conf
```

### Step 2: Edit Konfigurasi

**Opsi A: Subdomain (Recommended)**

```bash
sudo nano /etc/nginx/sites-enabled/tamankehati.conf
```

Edit `server_name`:
```nginx
server_name tamankehati.dasmap.co.id;
```

**Opsi B: Path-based**

Jika mau pakai path `/tamankehati/`, perlu update konfigurasi lebih kompleks. Lebih baik pakai subdomain.

**Opsi C: IP-based (Temporary)**

```nginx
server_name YOUR_SERVER_IP;
```

### Step 3: Test Konfigurasi

```bash
sudo nginx -t
```

Jika berhasil, akan muncul:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 4: Reload Nginx

```bash
sudo systemctl reload nginx
```

---

## 🔍 Verifikasi

### 1. Cek Nginx Status

```bash
sudo systemctl status nginx
```

### 2. Test Frontend

```bash
curl http://localhost:3000
# atau jika pakai subdomain
curl http://tamankehati.dasmap.co.id
```

### 3. Test Backend

```bash
curl http://localhost:8000/health
# atau jika pakai subdomain
curl http://tamankehati.dasmap.co.id/api/health
```

---

## ⚠️ Troubleshooting

### Error: "port already in use"

Jika port 80 sudah dipakai aplikasi existing:
- Gunakan subdomain (server_name berbeda)
- Atau gunakan port lain (perlu buka firewall)

### Error: "nginx: [emerg] bind() to 0.0.0.0:80 failed"

Port 80 sudah dipakai. Solusi:
1. Gunakan subdomain (server_name berbeda) - Nginx akan route berdasarkan server_name
2. Atau ganti port di config (tidak recommended)

### Frontend tidak load

1. Cek apakah container frontend running:
   ```bash
   docker ps | grep tamankehati-frontend
   ```

2. Cek logs:
   ```bash
   docker logs tamankehati-frontend-prod
   ```

3. Test direct access:
   ```bash
   curl http://localhost:3000
   ```

### Backend tidak load

1. Cek apakah container backend running:
   ```bash
   docker ps | grep tamankehati-backend
   ```

2. Cek logs:
   ```bash
   docker logs tamankehati-backend-prod
   ```

3. Test direct access:
   ```bash
   curl http://localhost:8000/health
   ```

---

## 📋 Checklist Setup

- [ ] Copy `tamankehati-server.conf` ke `/etc/nginx/sites-enabled/`
- [ ] Edit `server_name` sesuai kebutuhan (subdomain/IP)
- [ ] Test konfigurasi: `sudo nginx -t`
- [ ] Reload Nginx: `sudo systemctl reload nginx`
- [ ] Verifikasi frontend: `curl http://localhost:3000`
- [ ] Verifikasi backend: `curl http://localhost:8000/health`
- [ ] Test dari browser: `http://tamankehati.dasmap.co.id` (atau IP)

---

## 🔗 Referensi

- Konfigurasi Nginx existing: `~/dasmap_prod/apps/nginx/sites-enabled/default`
- Konfigurasi Taman Kehati: `deploy-package/nginx/tamankehati-server.conf`
- Dokumentasi deployment: `docs/deployment/MULTI_TENANT_DEPLOYMENT.md`

---

**Last Updated:** 2025-11-04

