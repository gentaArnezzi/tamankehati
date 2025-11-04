# 🔧 Troubleshooting Backend API

Panduan untuk troubleshoot masalah backend API.

---

## ❌ Error: "Method Not Allowed"

**Error yang muncul:**
```json
{"detail":"Method Not Allowed"}
```

**Kemungkinan penyebab:**
1. Backend belum running
2. Endpoint path salah
3. HTTP method tidak support
4. Routing issue di Nginx

---

## 🔍 Step 1: Cek Container Status

```bash
docker ps | grep tamankehati
```

**Expected output:**
```
CONTAINER ID   IMAGE                          STATUS    PORTS
xxx   arnezzi/tamankehati-backend:latest   Up        0.0.0.0:8000->8000/tcp
xxx   arnezzi/tamankehati-frontend:latest  Up        0.0.0.0:3000->3000/tcp
```

**Jika backend tidak muncul:**
```bash
# Cek semua container (termasuk yang stopped)
docker ps -a | grep tamankehati

# Start container jika stopped
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml up -d backend
```

---

## 🔍 Step 2: Cek Backend Logs

```bash
docker logs tamankehati-backend-1 --tail 30
```

**Expected output:**
```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Jika ada error:**
- Cek database connection
- Cek environment variables
- Cek port conflict

---

## 🔍 Step 3: Test Backend Langsung (Bypass Nginx)

**Test backend tanpa Nginx routing:**

```bash
# Test dari server (localhost)
curl http://localhost:8000/health

# Expected: {"status":"ok"}
```

**Jika ini berhasil, berarti backend running tapi ada masalah di Nginx routing.**

**Jika ini gagal, berarti backend belum running atau ada masalah di backend.**

---

## 🔍 Step 4: Test Endpoint yang Benar

**Backend memiliki beberapa health endpoints:**

```bash
# Endpoint 1: Root level (recommended)
curl http://38.47.93.167:8080/health

# Endpoint 2: Alternative
curl http://38.47.93.167:8080/healthz

# Endpoint 3: API v1
curl http://38.47.93.167:8080/api/v1/health

# Endpoint 4: Public stats (test API routing)
curl http://38.47.93.167:8080/api/v1/public/stats
```

**Note:** `/api/health` mungkin tidak ada. Coba `/health` atau `/healthz` atau `/api/v1/health`.

---

## 🔍 Step 5: Cek Nginx Routing

**Cek Nginx config untuk backend:**

```bash
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | grep -A 10 "location /api"
```

**Expected:**
```nginx
location /api/ {
    proxy_pass http://localhost:8000;
    # ... proxy headers
}
```

**Jika salah, update config:**
```bash
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
# Pastikan location /api/ proxy_pass ke http://localhost:8000
```

---

## 🔍 Step 6: Test dari Container

**Test backend dari dalam container Nginx:**

```bash
# Test koneksi ke backend
docker exec -it dasmap_prod-go-1 curl http://localhost:8000/health

# Expected: {"status":"ok"}
```

**Jika ini gagal, berarti:**
- Backend tidak accessible dari container Nginx
- Network issue
- Port mapping issue

---

## ✅ Quick Fix Commands

**Copy-paste semua command berikut:**

```bash
# 1. Cek container status
echo "=== Container Status ==="
docker ps | grep tamankehati

# 2. Cek backend logs
echo "=== Backend Logs (last 30 lines) ==="
docker logs tamankehati-backend-1 --tail 30

# 3. Test backend langsung
echo "=== Test Backend Direct ==="
curl http://localhost:8000/health || echo "❌ Backend not accessible"

# 4. Test via Nginx - root health
echo "=== Test via Nginx - /health ==="
curl http://38.47.93.167:8080/health || echo "❌ Nginx routing issue"

# 5. Test via Nginx - healthz
echo "=== Test via Nginx - /healthz ==="
curl http://38.47.93.167:8080/healthz || echo "❌ Nginx routing issue"

# 6. Test via Nginx - API v1
echo "=== Test via Nginx - /api/v1/public/stats ==="
curl http://38.47.93.167:8080/api/v1/public/stats || echo "❌ API routing issue"
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Backend Container Not Running

**Symptoms:**
- `docker ps | grep tamankehati` tidak menampilkan backend
- `curl http://localhost:8000/health` connection refused

**Solution:**
```bash
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml up -d backend

# Wait a few seconds
sleep 5

# Check logs
docker logs tamankehati-backend-1 --tail 20
```

---

### Issue 2: Database Connection Error

**Symptoms:**
- Backend logs menunjukkan database connection error
- Backend container restarting

**Solution:**
```bash
# Cek database container
docker ps | grep postgres

# Cek database logs
docker logs tamankehati-db-1 --tail 20

# Test database connection
docker exec -it tamankehati-backend-1 python -c "from core.database.session import engine; engine.connect()"
```

---

### Issue 3: Nginx Routing Wrong Path

**Symptoms:**
- `curl http://localhost:8000/health` berhasil
- `curl http://38.47.93.167:8080/api/health` gagal

**Solution:**
**Backend health endpoint ada di root, bukan di `/api/`:**

```bash
# Test root health endpoint
curl http://38.47.93.167:8080/health

# Atau healthz
curl http://38.47.93.167:8080/healthz
```

**Jika perlu routing `/api/health` ke `/health`:**
```nginx
location /api/health {
    proxy_pass http://localhost:8000/health;
    # ... proxy headers
}
```

---

### Issue 4: Port Conflict

**Symptoms:**
- Backend container tidak bisa start
- Port 8000 sudah digunakan

**Solution:**
```bash
# Cek port yang digunakan
sudo netstat -tulpn | grep 8000

# Stop aplikasi yang menggunakan port 8000
# Atau update docker-compose.yml untuk pakai port lain
```

---

## 📋 Health Endpoints Available

**Backend memiliki beberapa health endpoints:**

1. **`/health`** - Basic health check
   ```bash
   curl http://38.47.93.167:8080/health
   # Expected: {"status":"ok"}
   ```

2. **`/healthz`** - Alternative health check
   ```bash
   curl http://38.47.93.167:8080/healthz
   # Expected: {"status":"ok"}
   ```

3. **`/api/v1/health`** - API v1 health check
   ```bash
   curl http://38.47.93.167:8080/api/v1/health
   # Expected: {"status":"healthy",...}
   ```

4. **`/health/detailed`** - Detailed health with DB check
   ```bash
   curl http://38.47.93.167:8080/health/detailed
   # Expected: {"status":"healthy","database":"connected",...}
   ```

---

## ✅ Expected Working Endpoints

**Setelah semua fix, test endpoints berikut:**

```bash
# 1. Root health
curl http://38.47.93.167:8080/health
# Expected: {"status":"ok"}

# 2. Healthz
curl http://38.47.93.167:8080/healthz
# Expected: {"status":"ok"}

# 3. Public stats
curl http://38.47.93.167:8080/api/v1/public/stats
# Expected: {"total_flora":...,"total_fauna":...,...}

# 4. API docs
curl http://38.47.93.167:8080/docs
# Expected: HTML Swagger UI
```

---

**Last Updated:** 2025-11-04


