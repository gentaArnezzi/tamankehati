# ✅ Final Deployment Checklist

Checklist lengkap step-by-step untuk deploy aplikasi Taman Kehati di server yang sudah ada Docker Compose.

---

## 📋 Pre-Deployment Checklist

### Di Local Machine:
- [x] Docker images sudah di-build dan di-push ke Docker Hub
  - [x] `docker.io/arnezzi/tamankehati-backend:v1.0.0`
  - [x] `docker.io/arnezzi/tamankehati-frontend:v1.0.0`
- [x] Deployment package sudah disiapkan
  - [x] `deployment-package.tar.gz` (hanya file konfigurasi, tidak ada source code)

### Informasi yang Diperlukan:
- [ ] Server IP address
- [ ] SSH username (contoh: `ubuntu`)
- [ ] Domain untuk subdomain (jika ada): `tamankehati.dasmap.co.id` atau `tamankehati.amilna.co.id`
- [ ] Docker Hub credentials (sudah login)

---

## 🚀 Step-by-Step Deployment

### Step 1: Copy Files ke Server

**Di Local:**
```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new
scp deployment-package.tar.gz ubuntu@server-ip:/tmp/
```

**Di Server:**
```bash
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

**Checklist:**
- [ ] `docker-compose.pull.no-nginx.yml` ada
- [ ] `env.production.example` ada
- [ ] `deploy-package/nginx/server-nginx-example.conf` ada
- [ ] `scripts/verify-deployment.sh` ada

---

### Step 2: Setup Environment Variables

**Di Server:**
```bash
cd ~/dasmap_prod/apps/tamankehati
cp env.production.example .env
nano .env
```

**Update values:**
```bash
# Server IP
SERVER_IP=YOUR_SERVER_IP

# Docker Registry
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=arnezzi
IMAGE_TAG=v1.0.0

# Domain (jika pakai subdomain)
DOMAIN=tamankehati.dasmap.co.id

# CORS
CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id,https://tamankehati.dasmap.co.id

# Frontend API URL
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api

# Database (generate strong password)
POSTGRES_DB=tamankehati_db
POSTGRES_USER=tamankehati_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE

# Security
SECRET_KEY=GENERATE_NEW_SECRET_KEY_MINIMUM_32_CHARACTERS
ADMIN_EMAIL=admin@kehati.org
ADMIN_PASSWORD=STRONG_ADMIN_PASSWORD
```

**Generate SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Checklist:**
- [ ] `.env` file created
- [ ] `SERVER_IP` di-set dengan IP server
- [ ] `DOCKER_USERNAME` di-set ke `arnezzi`
- [ ] `IMAGE_TAG` di-set ke `v1.0.0`
- [ ] `SECRET_KEY` di-generate (32+ characters)
- [ ] `POSTGRES_PASSWORD` di-set (strong password)
- [ ] `ADMIN_PASSWORD` di-set (strong password)
- [ ] `DOMAIN` di-set (jika pakai subdomain)
- [ ] `CORS_ORIGINS` include domain utama dan subdomain

---

### Step 3: Deploy Containers

**Di Server:**
```bash
cd ~/dasmap_prod/apps/tamankehati

# Pull images dari Docker Hub
docker compose -f docker-compose.pull.no-nginx.yml pull

# Start services
docker compose -f docker-compose.pull.no-nginx.yml up -d

# Check status
docker compose -f docker-compose.pull.no-nginx.yml ps

# View logs
docker compose -f docker-compose.pull.no-nginx.yml logs -f
```

**Checklist:**
- [ ] Images berhasil di-pull dari Docker Hub
- [ ] Semua containers running
- [ ] Port 3000 (frontend) accessible
- [ ] Port 8000 (backend) accessible
- [ ] Tidak ada error di logs

**Verify containers:**
```bash
# List containers
docker ps | grep tamankehati

# Expected:
# tamankehati-postgres-prod
# tamankehati-redis-prod
# tamankehati-backend-prod
# tamankehati-frontend-prod
# tamankehati-ollama-prod (optional)
```

---

### Step 4: Setup Nginx Routing di Service `go`

**Di Server:**
```bash
# Nginx config location
cd ~/dasmap_prod/apps/nginx/sites-enabled

# Buat config baru
sudo nano tamankehati.conf
```

**Copy config dari:**
```bash
# Di server, copy dari package
cat ~/dasmap_prod/apps/tamankehati/deploy-package/nginx/server-nginx-example.conf
```

**Atau create manual:**
```nginx
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;  # Ganti dengan subdomain Anda

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /docs {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Reload Nginx:**
```bash
cd ~/dasmap_prod
docker compose restart go
```

**Checklist:**
- [ ] Nginx config file created di `~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf`
- [ ] `server_name` di-update dengan subdomain Anda
- [ ] Service `go` di-restart untuk reload Nginx
- [ ] Nginx config test passed (tidak ada syntax error)

**Verify Nginx:**
```bash
# Check Nginx di service go
docker compose logs go | grep -i nginx

# Test config (jika Nginx di host)
sudo nginx -t
```

---

### Step 5: Setup DNS (Jika Pakai Subdomain)

**Di Domain Registrar:**

1. Login ke domain registrar (untuk dasmap.co.id atau amilna.co.id)
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

**Checklist:**
- [ ] DNS A record created
- [ ] DNS pointing ke server IP
- [ ] DNS propagation completed (verified dengan `dig`)

---

### Step 6: Setup SSL (Optional but Recommended)

**Di Server:**
```bash
# Install Certbot (jika belum ada)
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate (standalone mode karena Nginx di container)
sudo certbot certonly --standalone -d tamankehati.dasmap.co.id

# Update Nginx config untuk include SSL
sudo nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Update Nginx config dengan SSL:**
```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name tamankehati.dasmap.co.id;
    
    ssl_certificate /etc/letsencrypt/live/tamankehati.dasmap.co.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tamankehati.dasmap.co.id/privkey.pem;
    
    # ... location blocks (same as above)
}
```

**Mount SSL certificates di service `go`:**

Update `~/dasmap_prod/docker-compose.yml`:
```yaml
services:
  go:
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro  # Add this line
      # ... other volumes
```

**Restart service:**
```bash
cd ~/dasmap_prod
docker compose restart go
```

**Checklist:**
- [ ] Certbot installed
- [ ] SSL certificate generated
- [ ] Nginx config updated dengan SSL
- [ ] SSL certificates mounted di service `go`
- [ ] Service `go` restarted
- [ ] HTTPS accessible

---

### Step 7: Update Environment Variables (After SSL)

**Di Server:**
```bash
cd ~/dasmap_prod/apps/tamankehati
nano .env
```

**Update untuk HTTPS:**
```bash
# Update CORS untuk HTTPS
CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id,https://tamankehati.dasmap.co.id

# Update API URL untuk HTTPS
NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id/api
```

**Restart services:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml restart backend frontend
```

**Checklist:**
- [ ] `.env` updated dengan HTTPS URLs
- [ ] CORS updated untuk HTTPS
- [ ] Services restarted

---

### Step 8: Verification

**Di Server:**
```bash
# Check containers
docker compose -f docker-compose.pull.no-nginx.yml ps

# Check ports
sudo netstat -tulpn | grep -E ":3000|:8000"

# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:8000/health

# Test via Nginx (jika subdomain sudah setup)
curl http://tamankehati.dasmap.co.id
curl http://tamankehati.dasmap.co.id/api/health
```

**Checklist:**
- [ ] All containers running
- [ ] Port 3000 accessible (frontend)
- [ ] Port 8000 accessible (backend)
- [ ] Health check endpoint returns 200
- [ ] Nginx routing working
- [ ] Subdomain accessible (jika setup)
- [ ] HTTPS working (jika setup)

---

### Step 9: Add Link di Website Utama

**Di website utama (dasmap.co.id atau amilna.co.id):**

**Add link di navigation atau page:**
```html
<!-- Navigation -->
<a href="https://tamankehati.dasmap.co.id">Taman Kehati</a>

<!-- Button -->
<a href="https://tamankehati.dasmap.co.id" class="btn">
  Kunjungi Taman Kehati
</a>
```

**Checklist:**
- [ ] Link added di website utama
- [ ] Link working (redirect ke subdomain)
- [ ] Test click link dari website utama

---

### Step 10: Functional Testing

**Test fitur utama:**
- [ ] Login dengan admin credentials
- [ ] Dashboard loads
- [ ] Create Flora (with image upload)
- [ ] Create Fauna (with image upload)
- [ ] Create Taman (Parks)
- [ ] Image uploads work
- [ ] No errors di browser console
- [ ] No localhost:8000 errors

**Checklist:**
- [ ] All features working
- [ ] No errors
- [ ] Images loading correctly
- [ ] API calls successful

---

## 📊 Summary

### Files Structure:
```
~/dasmap_prod/
├── docker-compose.yml (existing - service go)
├── apps/
│   ├── dasmap.co.id/ (existing)
│   ├── amilna.co.id/ (existing)
│   ├── goproject/ (existing)
│   ├── nginx/
│   │   └── sites-enabled/
│   │       └── tamankehati.conf (NEW)
│   └── tamankehati/ (NEW)
│       ├── docker-compose.pull.no-nginx.yml
│       ├── .env
│       └── deploy-package/
```

### Containers Running:
- Service `go` (existing) - Port 80/443
- `tamankehati-postgres-prod` (NEW)
- `tamankehati-redis-prod` (NEW)
- `tamankehati-backend-prod` (NEW) - Port 8000
- `tamankehati-frontend-prod` (NEW) - Port 3000
- `tamankehati-ollama-prod` (NEW) - Optional

### Ports:
- Port 80: Service `go` (Nginx)
- Port 443: Service `go` (Nginx)
- Port 3000: Taman Kehati Frontend
- Port 8000: Taman Kehati Backend
- Port 5432: Existing database (db-1)

### Network:
- `go-net`: Existing network (service go, db-1)
- `tamankehati-network`: New network (isolated)

---

## 🆘 Troubleshooting

### Containers Not Starting:
```bash
# Check logs
docker compose -f docker-compose.pull.no-nginx.yml logs

# Check specific service
docker compose -f docker-compose.pull.no-nginx.yml logs backend
```

### Port Conflicts:
```bash
# Check what's using ports
sudo netstat -tulpn | grep -E ":3000|:8000"

# If port in use, stop conflicting service or change port in docker-compose
```

### Nginx Not Routing:
```bash
# Check Nginx config
cat ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf

# Check Nginx logs in service go
docker compose logs go | grep -i nginx

# Restart service go
cd ~/dasmap_prod
docker compose restart go
```

### Database Connection Failed:
```bash
# Check database container
docker compose -f docker-compose.pull.no-nginx.yml logs postgres

# Check database connection
docker compose -f docker-compose.pull.no-nginx.yml exec postgres psql -U tamankehati_user -d tamankehati_db -c "SELECT 1;"
```

---

## ✅ Final Checklist

- [ ] All files copied to server
- [ ] `.env` configured correctly
- [ ] Containers deployed and running
- [ ] Nginx config created and enabled
- [ ] DNS setup (if using subdomain)
- [ ] SSL setup (optional)
- [ ] Services accessible
- [ ] Link added di website utama
- [ ] Functional testing passed
- [ ] No errors in logs

---

**Dokumentasi Lengkap:** `docs/deployment/INTEGRATION_EXISTING_DOCKER_COMPOSE.md`

**Last Updated:** 2025-11-04

