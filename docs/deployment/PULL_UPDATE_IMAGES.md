# 🔄 Pull Ulang Docker Images di Server

Panduan untuk pull ulang Docker images setelah rebuild dengan versi baru.

---

## 📋 Langkah-Langkah Pull Ulang

### Step 1: Update .env dengan Image Tag Baru

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Edit .env
nano .env
```

**Update `IMAGE_TAG`:**
```bash
# Ganti dari:
IMAGE_TAG=latest
# atau
IMAGE_TAG=v1.0.1

# Menjadi:
IMAGE_TAG=v1.0.2
```

**Save:** `Ctrl+X`, lalu `Y`, lalu `Enter`

---

### Step 2: Stop Containers yang Running

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Stop containers gracefully
docker compose -f docker-compose.pull.no-nginx.yml down
```

**Atau jika ingin keep volumes:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml stop
```

---

### Step 3: Pull Images Baru dari Docker Hub

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Pull images dengan tag baru
docker compose -f docker-compose.pull.no-nginx.yml pull
```

**Expected output:**
```
Pulling backend  ... done
Pulling frontend ... done
Pulling postgres ... done
Pulling redis    ... done
Pulling ollama   ... done (optional)
```

**Jika ada error authentication:**
```bash
# Login ke Docker Hub
docker login
```

---

### Step 4: Start Containers dengan Images Baru

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Start containers
docker compose -f docker-compose.pull.no-nginx.yml up -d

# Check status
docker compose -f docker-compose.pull.no-nginx.yml ps
```

**Expected output:**
```
NAME                          STATUS
tamankehati-postgres-prod     Up (healthy)
tamankehati-redis-prod        Up
tamankehati-backend-prod      Up (healthy)
tamankehati-frontend-prod      Up
tamankehati-ollama-prod       Up (optional)
```

---

### Step 5: Check Logs untuk Memastikan Tidak Ada Error

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Check backend logs
docker compose -f docker-compose.pull.no-nginx.yml logs backend --tail=50

# Check frontend logs
docker compose -f docker-compose.pull.no-nginx.yml logs frontend --tail=50
```

**Jika ada error, cek detail:**
```bash
# Check specific service
docker compose -f docker-compose.pull.no-nginx.yml logs backend
```

---

### Step 6: Run Migrations (Jika Perlu)

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Run migrations
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic upgrade head
```

---

### Step 7: Verify Deployment

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Run verification script
./scripts/verify-deployment.sh
```

**Atau manual check:**
```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000
```

---

## 🚀 Quick Command (All-in-One)

**Copy-paste semua command berikut di server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# 1. Update .env
nano .env
# Update IMAGE_TAG=v1.0.2, save (Ctrl+X, Y, Enter)

# 2. Stop containers
docker compose -f docker-compose.pull.no-nginx.yml down

# 3. Pull images baru
docker compose -f docker-compose.pull.no-nginx.yml pull

# 4. Start containers
docker compose -f docker-compose.pull.no-nginx.yml up -d

# 5. Wait for services
sleep 30

# 6. Check status
docker compose -f docker-compose.pull.no-nginx.yml ps

# 7. Check logs
docker compose -f docker-compose.pull.no-nginx.yml logs backend --tail=50

# 8. Run migrations
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic upgrade head

# 9. Verify
curl http://localhost:8000/health
```

---

## ⚠️ Troubleshooting

### Error: "Image not found"

**Problem:** Image dengan tag `v1.0.2` belum ada di Docker Hub.

**Solution:**
```bash
# Cek image di Docker Hub
docker pull docker.io/arnezzi/tamankehati-backend:v1.0.2
docker pull docker.io/arnezzi/tamankehati-frontend:v1.0.2

# Jika gagal, pastikan image sudah di-push dari local
```

---

### Error: "Authentication required"

**Problem:** Tidak login ke Docker Hub.

**Solution:**
```bash
docker login
# Enter username: arnezzi
# Enter password: (Docker Hub password atau access token)
```

---

### Error: "Container already running"

**Problem:** Container lama masih running.

**Solution:**
```bash
# Force stop dan remove
docker compose -f docker-compose.pull.no-nginx.yml down --remove-orphans

# Pull dan start ulang
docker compose -f docker-compose.pull.no-nginx.yml pull
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

---

### Error: "Port already in use"

**Problem:** Port 3000 atau 8000 masih digunakan container lama.

**Solution:**
```bash
# Stop semua containers
docker compose -f docker-compose.pull.no-nginx.yml down

# Check port
sudo ss -tulpn | grep -E ":3000|:8000"

# Jika masih digunakan, kill process
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9

# Start ulang
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

---

## ✅ Checklist

- [ ] Update `.env` dengan `IMAGE_TAG=v1.0.2`
- [ ] Stop containers lama: `docker compose down`
- [ ] Pull images baru: `docker compose pull`
- [ ] Start containers: `docker compose up -d`
- [ ] Check logs untuk memastikan tidak ada error
- [ ] Run migrations jika perlu
- [ ] Verify deployment: `curl http://localhost:8000/health`

---

**Last Updated:** 2025-11-04


