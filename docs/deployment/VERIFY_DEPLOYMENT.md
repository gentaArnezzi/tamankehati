# ✅ Verifikasi Deployment Setelah Pull Images Baru

Panduan untuk memverifikasi bahwa deployment berhasil setelah pull images baru.

---

## 📋 Status Saat Ini

**Dari logs yang terlihat:**
- ✅ Backend: Running dengan 4 workers (healthy)
- ✅ Frontend: Running (healthy)
- ✅ PostgreSQL: Running (healthy)
- ✅ Redis: Running (healthy)
- ✅ Ollama: Running (health: starting)

---

## 🔍 Langkah Verifikasi

### Step 1: Run Migrations

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Run migrations
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic upgrade head
```

**Expected output:**
```
INFO  [alembic.runtime.migration] Running upgrade ... -> ..., ...
```

**Jika sudah up-to-date:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
```

---

### Step 2: Test Backend Health

**Di Server:**

```bash
# Test backend health endpoint
curl http://localhost:8000/health
```

**Expected output:**
```json
{"status":"healthy","timestamp":"2025-11-04T14:09:50"}
```

**Atau test dengan detail:**
```bash
curl -s http://localhost:8000/health | jq .
```

---

### Step 3: Test Frontend

**Di Server:**

```bash
# Test frontend
curl -I http://localhost:3000
```

**Expected output:**
```
HTTP/1.1 200 OK
```

**Atau test full response:**
```bash
curl http://localhost:3000 | head -20
```

---

### Step 4: Test Backend API Endpoints

**Di Server:**

```bash
# Test API docs
curl -I http://localhost:8000/docs

# Test OpenAPI JSON
curl -s http://localhost:8000/openapi.json | head -20
```

---

### Step 5: Reload Nginx di Container 'go'

**⚠️ PENTING: Reload Nginx untuk apply routing ke containers baru**

**Di Server:**

```bash
# Test Nginx config
docker exec -it dasmap_prod-go-1 nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf test is successful
```

**Jika test berhasil, reload Nginx:**
```bash
docker exec -it dasmap_prod-go-1 nginx -s reload
```

**Expected output:**
```
(no output, but Nginx reloaded successfully)
```

---

### Step 6: Test Via Nginx (Jika Sudah Setup)

**Di Server:**

```bash
# Test via Nginx (jika sudah setup routing)
curl -I http://38.47.93.167
curl http://38.47.93.167/api/health
```

**Expected output:**
```
HTTP/1.1 200 OK
{"status":"healthy","timestamp":"..."}
```

---

## 🚀 Quick Verification Script

**Copy-paste semua command berikut:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# 1. Run migrations
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic upgrade head

# 2. Test backend
curl http://localhost:8000/health

# 3. Test frontend
curl -I http://localhost:3000

# 4. Reload Nginx
docker exec -it dasmap_prod-go-1 nginx -t && docker exec -it dasmap_prod-go-1 nginx -s reload

# 5. Test via Nginx (jika sudah setup)
curl http://38.47.93.167/api/health
```

---

## ✅ Checklist

- [ ] Containers running dan healthy (✅ sudah)
- [ ] Run migrations: `alembic upgrade head`
- [ ] Test backend health: `curl http://localhost:8000/health`
- [ ] Test frontend: `curl http://localhost:3000`
- [ ] Reload Nginx: `docker exec -it dasmap_prod-go-1 nginx -s reload`
- [ ] Test via Nginx: `curl http://38.47.93.167/api/health`

---

## 🎯 Expected Results

### Backend Health Check:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-04T14:09:50"
}
```

### Frontend Response:
- HTTP 200 OK
- HTML content (Next.js app)

### Via Nginx:
- HTTP 200 OK
- Routes ke backend: `/api/health` → Backend response
- Routes ke frontend: `/` → Frontend HTML

---

## ⚠️ Troubleshooting

### Backend tidak respond:
```bash
# Check logs
docker compose -f docker-compose.pull.no-nginx.yml logs backend --tail=100

# Check container
docker compose -f docker-compose.pull.no-nginx.yml ps backend
```

### Frontend tidak respond:
```bash
# Check logs
docker compose -f docker-compose.pull.no-nginx.yml logs frontend --tail=100

# Check container
docker compose -f docker-compose.pull.no-nginx.yml ps frontend
```

### Nginx tidak route:
```bash
# Check Nginx config
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf

# Check Nginx logs
docker logs dasmap_prod-go-1 | grep -i error
```

---

**Last Updated:** 2025-11-04

