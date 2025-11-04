# 🚀 Langkah-Langkah Deployment Taman Kehati - Final

Panduan step-by-step untuk deploy Taman Kehati di server Ubuntu yang sudah ada aplikasi lain.

---

## ✅ Pre-Deployment Checklist

- [x] Port 3000 → Kosong (bisa digunakan)
- [x] Port 8000 → Kosong (bisa digunakan)
- [x] Port 80/443 → Service `go` (tidak akan konflik)
- [x] Port 5432 → Database existing (tidak akan konflik)
- [x] Network terpisah → `tamankehati-network` (tidak konflik)
- [x] Docker images sudah di-build dan di-push ke Docker Hub

---

## 📦 Step 1: Copy Deployment Package ke Server

**Di Local Machine:**

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new
scp deployment-package.tar.gz ubuntu@YOUR_SERVER_IP:/tmp/
```

**Ganti `YOUR_SERVER_IP` dengan IP server Anda.**

---

## 📂 Step 2: Extract Package di Server

**Di Server:**

```bash
# SSH ke server (jika belum)
ssh ubuntu@YOUR_SERVER_IP

# Navigate ke lokasi deployment
cd ~/dasmap_prod/apps
mkdir -p tamankehati
cd tamankehati

# Extract package
tar -xzf /tmp/deployment-package.tar.gz

# Verify files
ls -la
```

**Expected files:**
- `docker-compose.pull.no-nginx.yml`
- `env.production.example`
- `deploy-package/nginx/tamankehati-container-go.conf`
- `scripts/check-ports.sh`
- `scripts/verify-deployment.sh`
- `docs/` (dokumentasi)

---

## 🔧 Step 3: Setup Environment Variables

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Copy example file
cp env.production.example .env

# Edit .env
nano .env
```

**Update values berikut:**

```bash
# Server IP (ganti dengan IP server Anda)
SERVER_IP=YOUR_SERVER_IP

# Docker Registry
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=arnezzi
IMAGE_TAG=latest

# Domain (jika pakai subdomain, atau biarkan kosong untuk IP)
DOMAIN=tamankehati.dasmap.co.id
# atau
# DOMAIN=

# CORS Origins
CORS_ORIGINS=http://YOUR_SERVER_IP:3000,http://YOUR_SERVER_IP:80,https://dasmap.co.id
# Jika pakai subdomain, tambahkan:
# CORS_ORIGINS=https://tamankehati.dasmap.co.id,https://dasmap.co.id

# Frontend API URL
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8000
# Jika pakai subdomain dan Nginx routing:
# NEXT_PUBLIC_API_URL=http://tamankehati.dasmap.co.id/api

# Database (generate strong password!)
POSTGRES_DB=tamankehati_db
POSTGRES_USER=tamankehati_user
POSTGRES_PASSWORD=GENERATE_STRONG_PASSWORD_HERE

# Secret Key (generate new!)
SECRET_KEY=GENERATE_NEW_SECRET_KEY_HERE

# Admin User
ADMIN_EMAIL=admin@kehati.org
ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD

# Ports (default, tidak perlu diubah karena port kosong)
FRONTEND_PORT=3000
BACKEND_PORT=8000

# Ollama (optional)
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=qwen2:1.5b
```

**Generate Secret Key:**
```bash
# Di server
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Generate Strong Password:**
```bash
# Di server
openssl rand -base64 32
```

---

## 🌐 Step 4: Setup Nginx Routing (Container 'go')

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Copy Nginx config untuk container 'go'
cp deploy-package/nginx/tamankehati-container-go.conf \
   ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf

# Edit config (update server_name jika perlu)
nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Update `server_name`:**
```nginx
# Jika pakai subdomain:
server_name tamankehati.dasmap.co.id;

# Atau jika pakai IP:
server_name YOUR_SERVER_IP;
# atau
server_name _;  # Catch-all (tidak recommended untuk production)
```

**Test Nginx config di container:**
```bash
# Test config
docker exec -it dasmap_prod-go-1 nginx -t
```

**Jika test berhasil, reload Nginx:**
```bash
# Reload Nginx di container 'go'
docker exec -it dasmap_prod-go-1 nginx -s reload
```

**⚠️ JANGAN reload sekarang!** Tunggu sampai Taman Kehati containers sudah running (Step 6).

---

## 🐳 Step 5: Pull Docker Images

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Login ke Docker Hub (jika belum)
docker login

# Pull images dari Docker Hub
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

---

## 🚀 Step 6: Start Services

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Start services
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

**Wait for services to be ready:**
```bash
# Wait 30 seconds for services to initialize
sleep 30

# Check logs
docker compose -f docker-compose.pull.no-nginx.yml logs backend
docker compose -f docker-compose.pull.no-nginx.yml logs frontend
```

---

## 🔄 Step 7: Run Database Migrations

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

---

## 🔄 Step 8: Reload Nginx di Container 'go'

**Sekarang reload Nginx karena containers sudah running:**

```bash
# Test config
docker exec -it dasmap_prod-go-1 nginx -t

# Reload Nginx
docker exec -it dasmap_prod-go-1 nginx -s reload
```

---

## ✅ Step 9: Verify Deployment

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Run verification script
chmod +x scripts/verify-deployment.sh
./scripts/verify-deployment.sh
```

**Atau manual check:**

```bash
# Check containers
docker ps | grep tamankehati

# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000

# Check via Nginx (jika pakai subdomain)
curl http://tamankehati.dasmap.co.id
# atau
curl http://YOUR_SERVER_IP
```

---

## 🎯 Access Application

### Option A: Via IP (Direct)

- **Frontend:** `http://YOUR_SERVER_IP:3000`
- **Backend API:** `http://YOUR_SERVER_IP:8000`
- **API Docs:** `http://YOUR_SERVER_IP:8000/docs`

### Option B: Via Nginx (Subdomain)

- **Frontend:** `http://tamankehati.dasmap.co.id`
- **Backend API:** `http://tamankehati.dasmap.co.id/api`
- **API Docs:** `http://tamankehati.dasmap.co.id/docs`

### Option C: Via Nginx (IP)

- **Frontend:** `http://YOUR_SERVER_IP`
- **Backend API:** `http://YOUR_SERVER_IP/api`
- **API Docs:** `http://YOUR_SERVER_IP/docs`

---

## 🆘 Troubleshooting

### Containers Not Starting

```bash
# Check logs
docker compose -f docker-compose.pull.no-nginx.yml logs

# Check specific service
docker compose -f docker-compose.pull.no-nginx.yml logs backend
docker compose -f docker-compose.pull.no-nginx.yml logs frontend
```

### Port Already in Use

```bash
# Check what's using port
sudo ss -tulpn | grep :3000
sudo ss -tulpn | grep :8000

# If port in use, update .env with different ports
nano .env
# FRONTEND_PORT=3001
# BACKEND_PORT=8001
```

### Database Connection Failed

```bash
# Check database container
docker compose -f docker-compose.pull.no-nginx.yml logs postgres

# Check database connection
docker compose -f docker-compose.pull.no-nginx.yml exec postgres psql -U tamankehati_user -d tamankehati_db -c "SELECT 1;"
```

### Nginx Not Routing

```bash
# Check Nginx config
cat ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf

# Check Nginx logs in container
docker logs dasmap_prod-go-1 | grep -i error

# Test Nginx config
docker exec -it dasmap_prod-go-1 nginx -t

# Reload Nginx
docker exec -it dasmap_prod-go-1 nginx -s reload
```

### Frontend Not Loading

```bash
# Check if frontend container is running
docker ps | grep tamankehati-frontend

# Check frontend logs
docker compose -f docker-compose.pull.no-nginx.yml logs frontend

# Test direct access
curl http://localhost:3000
```

---

## 📝 Summary

**Deployment Location:**
- Path: `~/dasmap_prod/apps/tamankehati/`

**Containers:**
- `tamankehati-postgres-prod` → Database
- `tamankehati-redis-prod` → Cache
- `tamankehati-backend-prod` → Backend API (port 8000)
- `tamankehati-frontend-prod` → Frontend (port 3000)
- `tamankehati-ollama-prod` → Ollama (optional)

**Nginx Routing:**
- Config: `~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf`
- Reload: `docker exec -it dasmap_prod-go-1 nginx -s reload`

**Access:**
- Direct: `http://YOUR_SERVER_IP:3000` (Frontend)
- Via Nginx: `http://tamankehati.dasmap.co.id` (jika pakai subdomain)

---

**Last Updated:** 2025-11-04

