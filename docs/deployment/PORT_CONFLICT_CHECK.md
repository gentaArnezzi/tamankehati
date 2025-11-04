# Port Conflict Check - Port 3000 dan 8000

## ⚠️ PENTING: Cek Port Sebelum Deploy

Port 3000 dan 8000 mungkin sudah digunakan oleh aplikasi lain di server!

---

## 🔍 Cara Cek Port di Server

### Step 1: Cek Port 3000

```bash
# Di server
sudo netstat -tulpn | grep :3000
# atau
sudo ss -tulpn | grep :3000
# atau
sudo lsof -i :3000
```

**Jika ada output:** Port 3000 sudah dipakai!

### Step 2: Cek Port 8000

```bash
# Di server
sudo netstat -tulpn | grep :8000
# atau
sudo ss -tulpn | grep :8000
# atau
sudo lsof -i :8000
```

**Jika ada output:** Port 8000 sudah dipakai!

### Step 3: Cek Port Lain (PostgreSQL, Redis)

```bash
# PostgreSQL biasanya port 5432
sudo ss -tulpn | grep :5432

# Redis biasanya port 6379
sudo ss -tulpn | grep :6379
```

---

## 🎯 Solusi Jika Port Sudah Dipakai

### Opsi 1: Gunakan Port Lain

Jika port 3000 atau 8000 sudah dipakai, ubah di:

**1. Update docker-compose.pull.no-nginx.yml:**

```yaml
# Frontend - ubah port
frontend:
  ports:
    - "${FRONTEND_PORT:-3001}:3000"  # Gunakan 3001 jika 3000 dipakai
```

```yaml
# Backend - ubah port
backend:
  ports:
    - "${BACKEND_PORT:-8001}:8000"  # Gunakan 8001 jika 8000 dipakai
```

**2. Update .env:**

```bash
# Di server .env
FRONTEND_PORT=3001  # Jika 3000 dipakai
BACKEND_PORT=8001   # Jika 8000 dipakai
```

**3. Update Nginx config:**

```nginx
# Di tamankehati-server.conf
location / {
    proxy_pass http://localhost:3001;  # Ubah sesuai port baru
}

location /api/ {
    proxy_pass http://localhost:8001;  # Ubah sesuai port baru
}
```

### Opsi 2: Stop Aplikasi yang Pakai Port (Tidak Recommended)

**Hanya jika Anda yakin aplikasi tersebut tidak digunakan!**

```bash
# Cek proses yang pakai port
sudo lsof -i :3000
sudo lsof -i :8000

# Stop proses (hati-hati!)
sudo kill <PID>
```

---

## 📋 Port yang Perlu Dicek

### Port yang Digunakan Taman Kehati:

| Service | Port Internal | Port External | Status |
|---------|--------------|--------------|--------|
| Frontend | 3000 | 3000 (atau custom) | ⚠️ Cek dulu |
| Backend | 8000 | 8000 (atau custom) | ⚠️ Cek dulu |
| PostgreSQL | 5432 | - (tidak exposed) | ✅ Biasanya aman |
| Redis | 6379 | - (tidak exposed) | ✅ Biasanya aman |
| Ollama | 11434 | - (tidak exposed) | ✅ Biasanya aman |

**Note:** PostgreSQL dan Redis biasanya tidak di-expose ke host (hanya di Docker network), jadi aman.

---

## 🔍 Script Cek Port Otomatis

Buat script untuk cek semua port:

```bash
#!/bin/bash
# check-ports.sh

echo "🔍 Checking ports for Taman Kehati deployment..."
echo ""

PORTS=(3000 8000 5432 6379)

for port in "${PORTS[@]}"; do
    if sudo ss -tulpn | grep -q ":$port "; then
        echo "❌ Port $port is IN USE:"
        sudo ss -tulpn | grep ":$port "
    else
        echo "✅ Port $port is AVAILABLE"
    fi
    echo ""
done
```

**Save sebagai `check-ports.sh` dan jalankan:**
```bash
chmod +x check-ports.sh
./check-ports.sh
```

---

## ✅ Checklist Sebelum Deploy

- [ ] Cek port 3000: `sudo ss -tulpn | grep :3000`
- [ ] Cek port 8000: `sudo ss -tulpn | grep :8000`
- [ ] Jika port dipakai, update `.env` dengan port baru
- [ ] Update `docker-compose.pull.no-nginx.yml` dengan port baru
- [ ] Update Nginx config dengan port baru
- [ ] Test: `curl http://localhost:NEW_PORT`

---

## 🎯 Rekomendasi Port Alternatif

Jika port 3000/8000 dipakai, gunakan:

| Service | Port Alternatif |
|---------|----------------|
| Frontend | 3001, 3002, 8080, 8081 |
| Backend | 8001, 8002, 8082, 8083 |

**Pilih port yang tidak digunakan oleh aplikasi lain!**

---

**Last Updated:** 2025-11-04

