# 🔗 Integrasi dengan Docker Compose yang Sudah Ada

Panduan untuk deploy aplikasi Taman Kehati di server yang sudah punya Docker Compose untuk aplikasi lain.

---

## 📋 Analisis Docker Compose yang Sudah Ada

**Dari `~/dasmap_prod/docker-compose.yml`:**

### Ports yang Sudah Digunakan:

- ✅ **Port 80** → Service `go` (nginx di container)
- ✅ **Port 443** → Service `go` (nginx di container)
- ✅ **Port 5432** → Database PostgreSQL (exposed)

### Network:

- ✅ Network: `go-net` (subnet: 172.27.0.0/16)
- ✅ Service `go` menggunakan `network_mode: host`

### Volumes:

- ✅ `db_1_data` → PostgreSQL data
- ✅ Volume mounts untuk aplikasi dasmap/amilna

---

## 🎯 Strategy untuk Taman Kehati

### Prinsip:

1. ✅ **Port 80/443** → Tetap untuk service `go` (tidak kita gunakan)
2. ✅ **Port 3000** → Frontend Taman Kehati (expose)
3. ✅ **Port 8000** → Backend Taman Kehati (expose)
4. ✅ **Nginx di service `go`** → Route ke port 3000 dan 8000
5. ✅ **Network terpisah** → Taman Kehati pakai network sendiri (tidak join ke `go-net`)

---

## 📦 Step 0: Copy Files ke Server

**Di Local Machine:**

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new
scp deployment-package.tar.gz ubuntu@server-ip:/tmp/
```

**Di Server:**

```bash
# SSH ke server
ssh ubuntu@server-ip

# Create directory
cd ~/dasmap_prod/apps
mkdir tamankehati
cd tamankehati

# Extract package
tar -xzf /tmp/deployment-package.tar.gz

# Verify files
ls -la
```

**Expected files:**

- `docker-compose.pull.no-nginx.yml`
- `env.production.example`
- `deploy-package/nginx/server-nginx-example.conf`
- `scripts/verify-deployment.sh`

---

## 📝 Step 1: Setup Environment Variables

**Di Server:**

```bash
cd ~/dasmap_prod/apps/tamankehati
cp env.production.example .env
nano .env
```

**Update values (lihat Step 5 untuk detail lengkap):**

```bash
SERVER_IP=YOUR_SERVER_IP
DOCKER_USERNAME=arnezzi
IMAGE_TAG=v1.0.0
DOMAIN=tamankehati.dasmap.co.id
CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id,https://tamankehati.dasmap.co.id
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
SECRET_KEY=GENERATE_NEW_SECRET_KEY
ADMIN_EMAIL=admin@kehati.org
ADMIN_PASSWORD=STRONG_ADMIN_PASSWORD
```

**Generate SECRET_KEY:**

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📝 Step 2: Deploy Taman Kehati

### Lokasi:

```bash
cd ~/dasmap_prod/apps/tamankehati
```

### Deploy tanpa Nginx container:

```bash
# Deploy containers (tanpa Nginx container)
docker compose -f docker-compose.pull.no-nginx.yml up -d

# Verify containers running
docker compose -f docker-compose.pull.no-nginx.yml ps
```

**Containers yang akan running:**

- `tamankehati-postgres-prod` (port internal, tidak exposed)
- `tamankehati-redis-prod` (port internal, tidak exposed)
- `tamankehati-backend-prod` (port 8000 exposed)
- `tamankehati-frontend-prod` (port 3000 exposed)
- `tamankehati-ollama-prod` (port internal, tidak exposed)

**TIDAK ada Nginx container** - kita pakai Nginx di service `go`.

---

## 🌐 Step 3: Setup Nginx Routing di Service `go`

### Option A: Tambahkan Config ke Nginx di Service `go`

**Nginx config ada di:** `~/dasmap_prod/apps/nginx/sites-enabled/`

**Buat file baru:**

```bash
cd ~/dasmap_prod/apps/nginx/sites-enabled
sudo nano tamankehati.conf
```

**Isi:**

```nginx
# Taman Kehati Application
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;  # atau subdomain yang Anda pilih

    # Frontend
    location / {
        proxy_pass http://localhost:3000;  # Frontend container Taman Kehati
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;  # Backend container Taman Kehati
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend uploads
    location /uploads/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Backend docs
    location /docs {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Reload Nginx di service `go`:**

```bash
# Restart service go untuk reload Nginx config
cd ~/dasmap_prod
docker compose restart go
```

### Option B: Edit Nginx Config yang Sudah Ada

**Jika Nginx config sudah ada di `~/dasmap_prod/apps/nginx/sites-enabled/`:**

```bash
# Edit config yang sudah ada
cd ~/dasmap_prod/apps/nginx/sites-enabled
sudo nano dasmap.co.id  # atau file config yang sudah ada
```

**Tambahkan server block baru di file yang sama:**

```nginx
# Existing config untuk dasmap.co.id
server {
    listen 80;
    server_name dasmap.co.id;
    # ... existing config
}

# Tambahkan server block untuk Taman Kehati
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;
    # ... config seperti di atas
}
```

**Reload:**

```bash
cd ~/dasmap_prod
docker compose restart go
```

---

## 🌐 Step 4: Setup DNS (Jika Pakai Subdomain)

**Di Domain Registrar (untuk dasmap.co.id atau amilna.co.id):**

1. Login ke domain registrar
2. Go to DNS Management
3. Add A Record:
   ```
   Type: A
   Host: tamankehati
   Value: YOUR_SERVER_IP
   TTL: 3600
   ```
4. Wait for DNS propagation (5-60 minutes)

**Verify DNS:**

```bash
dig tamankehati.dasmap.co.id +short
# Should return YOUR_SERVER_IP
```

---

## 🔍 Step 5: Verify Ports

### Cara Mengecek Port yang Sudah Digunakan:

#### **Method 1: Menggunakan `netstat` (Linux)**

```bash
# Check port 80 (harus digunakan oleh service go)
sudo netstat -tulpn | grep :80

# Check port 443
sudo netstat -tulpn | grep :443

# Check port 5432 (PostgreSQL)
sudo netstat -tulpn | grep :5432

# Check port 3000 (harus kosong atau digunakan oleh Taman Kehati)
sudo netstat -tulpn | grep :3000

# Check port 8000 (harus kosong atau digunakan oleh Taman Kehati)
sudo netstat -tulpn | grep :8000

# Check semua port yang listening
sudo netstat -tulpn | grep LISTEN
```

#### **Method 2: Menggunakan `ss` (Modern, lebih cepat)**

```bash
# Check port 80
sudo ss -tulpn | grep :80

# Check port 443
sudo ss -tulpn | grep :443

# Check port 5432
sudo ss -tulpn | grep :5432

# Check semua port yang listening
sudo ss -tulpn | grep LISTEN
```

#### **Method 3: Menggunakan `lsof` (Linux/macOS)**

```bash
# Check port 80
sudo lsof -i :80

# Check port 443
sudo lsof -i :443

# Check port 5432
sudo lsof -i :5432

# Check port 3000
sudo lsof -i :3000

# Check port 8000
sudo lsof -i :8000
```

#### **Method 4: Mengecek Docker Containers**

```bash
# Lihat semua container yang running dan port mereka
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Atau lebih detail
docker ps -a

# Check port mapping dari docker-compose
cd ~/dasmap_prod
docker compose ps
```

#### **Method 5: Mengecek di Docker Compose File**

```bash
# Buka file docker-compose.yml
cd ~/dasmap_prod
cat docker-compose.yml | grep -A 5 "ports:"

# Atau gunakan grep untuk mencari port mappings
grep -r "ports:" docker-compose.yml
```

#### **Method 6: Menggunakan `fuser` (Linux)**

```bash
# Check port 80
sudo fuser 80/tcp

# Check port 443
sudo fuser 443/tcp

# Check port 5432
sudo fuser 5432/tcp
```

#### **Method 7: Script Lengkap untuk Check Semua Port**

```bash
# Buat script untuk check semua port penting
cat > check_ports.sh << 'EOF'
#!/bin/bash
echo "=== Checking Important Ports ==="
echo ""
echo "Port 80 (HTTP):"
sudo netstat -tulpn | grep :80 || echo "Port 80 is free"
echo ""
echo "Port 443 (HTTPS):"
sudo netstat -tulpn | grep :443 || echo "Port 443 is free"
echo ""
echo "Port 5432 (PostgreSQL):"
sudo netstat -tulpn | grep :5432 || echo "Port 5432 is free"
echo ""
echo "Port 3000 (Frontend):"
sudo netstat -tulpn | grep :3000 || echo "Port 3000 is free"
echo ""
echo "Port 8000 (Backend):"
sudo netstat -tulpn | grep :8000 || echo "Port 8000 is free"
echo ""
echo "=== Docker Containers ==="
docker ps --format "table {{.Names}}\t{{.Ports}}"
EOF

chmod +x check_ports.sh
./check_ports.sh
```

**Expected Output:**

```
Port 80 (HTTP):
tcp6       0      0 :::80                   :::*                    LISTEN      12345/nginx

Port 443 (HTTPS):
tcp6       0      0 :::443                  :::*                    LISTEN      12345/nginx

Port 5432 (PostgreSQL):
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      6789/postgres

Port 3000 (Frontend):
(empty - port is free)

Port 8000 (Backend):
(empty - port is free)
```

**Expected:**

- Port 80: Used by service `go` (nginx)
- Port 443: Used by service `go` (nginx)
- Port 5432: Used by PostgreSQL database
- Port 3000: Free (untuk Taman Kehati Frontend)
- Port 8000: Free (untuk Taman Kehati Backend)

---

## 🔒 Step 6: Network Isolation

### Taman Kehati Network:

- ✅ Network: `tamankehati-network` (terpisah dari `go-net`)
- ✅ Tidak akan konflik dengan aplikasi lain
- ✅ Database dan Redis isolated

### Verify Networks:

```bash
# List all networks
docker network ls

# Verify networks are separate
docker network inspect go-net
docker network inspect tamankehati-network
```

---

## 📝 Step 7: Update Environment Variables (After Nginx Setup)

**Di Taman Kehati:**

```bash
cd ~/dasmap_prod/apps/tamankehati
nano .env
```

**Update:**

```bash
# Domain
DOMAIN=tamankehati.dasmap.co.id

# CORS - Include main website
CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id,https://tamankehati.dasmap.co.id,http://localhost:3000

# Frontend API URL
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api

# Database (isolated, tidak konflik dengan db-1)
POSTGRES_DB=tamankehati_db
POSTGRES_USER=tamankehati_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
```

**Restart:**

```bash
docker compose -f docker-compose.pull.no-nginx.yml restart backend frontend
```

---

## 🔐 Step 8: Setup SSL (Optional but Recommended)

**Jika menggunakan HTTPS:**

```bash
# Install Certbot (jika belum ada)
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
# Note: Certbot perlu akses ke Nginx config di service go
sudo certbot certonly --nginx -d tamankehati.dasmap.co.id

# Update Nginx config di service go untuk include SSL
# Edit: ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Atau jika Certbot tidak bisa akses Nginx di container, setup manual:**

1. Generate certificate:

   ```bash
   sudo certbot certonly --standalone -d tamankehati.dasmap.co.id
   ```

2. Update Nginx config di service `go`:

   ```nginx
   server {
       listen 443 ssl http2;
       server_name tamankehati.dasmap.co.id;

       ssl_certificate /etc/letsencrypt/live/tamankehati.dasmap.co.id/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/tamankehati.dasmap.co.id/privkey.pem;

       # ... location blocks
   }
   ```

3. Mount SSL certificates di service `go` (update docker-compose.yml):

   ```yaml
   volumes:
     - /etc/letsencrypt:/etc/letsencrypt:ro # Add this
     # ... other volumes
   ```

4. Restart service:
   ```bash
   cd ~/dasmap_prod
   docker compose restart go
   ```

---

## 🔗 Step 9: Add Link di Website Utama

**Di website utama (dasmap.co.id atau amilna.co.id):**

**Tambahkan link di navigation, homepage, atau footer:**

```html
<!-- Navigation Menu -->
<nav>
  <a href="/">Home</a>
  <a href="https://tamankehati.dasmap.co.id">Taman Kehati</a>
</nav>

<!-- Button -->
<a href="https://tamankehati.dasmap.co.id" class="btn"> Kunjungi Taman Kehati </a>

<!-- Footer -->
<footer>
  <a href="https://tamankehati.dasmap.co.id">Taman Kehati</a>
</footer>
```

---

## ✅ Step 10: Verification Checklist

- [ ] Taman Kehati containers running (port 3000 dan 8000)
- [ ] Service `go` running (port 80 dan 443)
- [ ] Nginx config di service `go` include routing ke Taman Kehati
- [ ] DNS A record pointing ke server IP (jika pakai subdomain)
- [ ] Port 3000 dan 8000 accessible dari host
- [ ] CORS configured untuk allow website utama
- [ ] Test akses via subdomain atau IP

---

## 🚀 Quick Start Commands (Complete Workflow)

```bash
# Step 0: Copy files ke server (di local)
scp deployment-package.tar.gz ubuntu@server-ip:/tmp/

# Step 1-2: Setup di server
ssh ubuntu@server-ip
cd ~/dasmap_prod/apps
mkdir tamankehati && cd tamankehati
tar -xzf /tmp/deployment-package.tar.gz
cp env.production.example .env
nano .env  # Edit dengan konfigurasi

# Step 3: Deploy containers
docker compose -f docker-compose.pull.no-nginx.yml pull
docker compose -f docker-compose.pull.no-nginx.yml up -d

# Step 4: Setup Nginx config di service go
cd ~/dasmap_prod/apps/nginx/sites-enabled
sudo nano tamankehati.conf
# Copy config dari ~/dasmap_prod/apps/tamankehati/deploy-package/nginx/server-nginx-example.conf

# Step 5: Restart service go untuk reload Nginx
cd ~/dasmap_prod
docker compose restart go

# Step 6: Verify
curl http://localhost:3000
curl http://localhost:8000/health
curl http://tamankehati.dasmap.co.id  # Jika DNS sudah setup
```

---

## 📊 Summary Architecture

```
┌─────────────────────────────────────┐
│  Nginx di Service `go` (Port 80)   │
│  ┌───────────────────────────────┐ │
│  │ dasmap.co.id → Service go      │ │
│  │ tamankehati.dasmap.co.id       │ │
│  │   ↓ proxy_pass                  │ │
│  │   localhost:3000 (Frontend)    │ │
│  │   localhost:8000 (Backend)     │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Taman Kehati Containers             │
│  - Frontend (Port 3000)              │
│  - Backend (Port 8000)               │
│  - PostgreSQL (Internal)             │
│  - Redis (Internal)                  │
│  Network: tamankehati-network        │
└─────────────────────────────────────┘
```

---

## ⚠️ Important Notes

1. **Port 80/443 sudah digunakan** → Jangan expose dari Taman Kehati containers
2. **Nginx di service `go`** → Route ke containers Taman Kehati
3. **Network isolation** → Taman Kehati pakai network sendiri
4. **Database isolation** → Taman Kehati punya database sendiri (tidak konflik dengan db-1)

---

## 🆘 Troubleshooting

Jika mengalami masalah, lihat panduan troubleshooting lengkap:

- `docs/deployment/TROUBLESHOOTING.md` - Panduan troubleshooting lengkap

**Common issues:**

- Containers tidak starting → Check logs dan port conflicts
- Nginx tidak routing → Check config dan restart service go
- Database connection failed → Check credentials dan network
- Images not found → Check Docker Hub login dan image tag

---

## 📚 Additional Documentation

- `docs/deployment/DEPLOYMENT_CHECKLIST_FINAL.md` - Checklist lengkap step-by-step
- `docs/deployment/MULTI_TENANT_DEPLOYMENT.md` - Multi-tenant deployment guide
- `docs/deployment/INTEGRATION_WITH_MAIN_WEBSITE.md` - Integrasi dengan website utama
- `docs/deployment/TROUBLESHOOTING.md` - Troubleshooting guide

---

**Last Updated:** 2025-11-04
