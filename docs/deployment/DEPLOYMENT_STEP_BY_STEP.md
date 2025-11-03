# 🚀 Deployment Step-by-Step Guide: Local Build to Ubuntu Server

Panduan lengkap step-by-step dari build aplikasi di local sampai running production build di server Ubuntu.

## 📋 Informasi Deployment

**Docker Hub Username:** arnezzi  
**Registry:** docker.io  
**Image Tag:** (akan ditentukan di Step 1.2)

---

## Phase 1: Local Build & Push Images

### ✅ Step 1.1: Persiapan Local (COMPLETED)

- [x] Git status clean dan up to date
- [x] Docker Hub account: arnezzi
- [x] Docker Hub login verified
- [x] Docker running (v20.10.21)

---

### Step 1.2: Build Images Locally

#### 1.2.1 Set Environment Variables

Buka terminal dan set environment variables:

```bash
# Set Docker Hub username
export DOCKER_USERNAME=arnezzi

# Set image tag version
# Pilihan:
# - v1.0.0 (semantic versioning - recommended)
# - latest (simple, tapi kurang baik untuk production)
export IMAGE_TAG=v1.0.0

# Optional: Use custom registry (default: docker.io)
# export DOCKER_REGISTRY=registry.example.com
```

**Atau bisa set permanen di shell profile:**
```bash
# Add ke ~/.zshrc atau ~/.bashrc
echo 'export DOCKER_USERNAME=arnezzi' >> ~/.zshrc
echo 'export IMAGE_TAG=v1.0.0' >> ~/.zshrc
source ~/.zshrc
```

#### 1.2.2 Verify Build Script

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new

# Check script exists dan executable
ls -la scripts/build-and-push-images.sh
chmod +x scripts/build-and-push-images.sh
```

#### 1.2.3 Build and Push Images

```bash
# Run build script
./scripts/build-and-push-images.sh
```

**Proses ini akan:**
1. Build backend image (`tamankehati-backend`)
2. Build frontend image (`tamankehati-frontend`)
3. Tag images dengan format: `docker.io/arnezzi/tamankehati-backend:v1.0.0`
4. Push images ke Docker Hub

**Waktu yang dibutuhkan:**
- First build: ~10-15 menit (download dependencies)
- Subsequent builds: ~5-8 menit (dengan cache)

**Output yang diharapkan:**
```
✅ Backend image built successfully
✅ Frontend image built successfully
✅ Backend image pushed successfully
✅ Frontend image pushed successfully

Image tags:
  Backend:  docker.io/arnezzi/tamankehati-backend:v1.0.0
  Frontend: docker.io/arnezzi/tamankehati-frontend:v1.0.0
```

#### 1.2.4 Verify Images Pushed

```bash
# Test pull images untuk verify
docker pull docker.io/arnezzi/tamankehati-backend:v1.0.0
docker pull docker.io/arnezzi/tamankehati-frontend:v1.0.0

# List local images
docker images | grep tamankehati

# Check di Docker Hub web interface
# https://hub.docker.com/r/arnezzi/tamankehati-backend
# https://hub.docker.com/r/arnezzi/tamankehati-frontend
```

---

### Step 1.3: Prepare Server Deployment Package

Tidak perlu package khusus karena server akan clone repository dan gunakan `docker-compose.pull.yml`.

**Files yang diperlukan di server:**
- `docker-compose.pull.yml` ✅ (sudah ada)
- `env.production.example` ✅ (sudah ada)
- `deploy-package/nginx/` ✅ (sudah ada)
- `scripts/verify-deployment.sh` ✅ (sudah ada)

---

## Phase 2: Server Preparation

### Step 2.1: Initial Server Setup

**2.1.1 SSH ke Server**

```bash
# SSH ke server Ubuntu
ssh user@your-server-ip

# Contoh:
# ssh ubuntu@192.168.1.100
# atau
# ssh root@your-server-ip
```

**2.1.2 Update System**

```bash
# Update package list
sudo apt update

# Upgrade system packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y \
    curl \
    wget \
    git \
    nano \
    htop \
    ufw
```

**2.1.3 Install Docker**

```bash
# Remove old versions (jika ada)
sudo apt remove docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install prerequisites
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

**2.1.4 Setup User Permissions**

```bash
# Add user to docker group (ganti 'ubuntu' dengan username Anda)
sudo usermod -aG docker $USER

# Apply group changes (atau logout/login)
newgrp docker

# Verify Docker access
docker ps
```

---

### Step 2.2: Security Setup - Firewall

**2.2.1 Configure UFW Firewall**

```bash
# Set default policies (deny incoming, allow outgoing)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (CRITICAL - must be first!)
sudo ufw allow 22/tcp

# Allow HTTP (port 80) - For Nginx
sudo ufw allow 80/tcp

# Allow HTTPS (port 443) - For future SSL
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

# Verify firewall status
sudo ufw status verbose
```

**2.2.2 Verify Internal Ports NOT Exposed**

```bash
# Check that internal ports are NOT exposed
sudo ufw status | grep -E "8000|3000|5432|6379"

# Should return nothing (no matches)
# If there are matches, remove them:
# sudo ufw delete allow 8000/tcp
```

---

### Step 2.3: Get Server Information

```bash
# Get public IP
curl ifconfig.me

# Get private IP (for local network)
hostname -I | awk '{print $1}'
```

**Catat informasi ini:**
- Server IP: _______________
- Server Username: _______________

---

## Phase 3: Deployment Files Setup

### Step 3.1: Copy Deployment Files

**Option A: Clone Repository (Recommended)**

```bash
# Create application directory
sudo mkdir -p /opt/tamankehati
sudo chown $USER:$USER /opt/tamankehati
cd /opt/tamankehati

# Clone repository
git clone https://github.com/gentaArnezzi/tamankehati.git .

# Verify files
ls -la docker-compose.pull.yml
ls -la env.production.example
ls -la deploy-package/nginx/
```

**Option B: Copy Files via SCP (Alternative)**

Dari local machine:
```bash
# Create deployment package
cd /Users/irgyaarnezzi/Desktop/tamankehati_new
tar -czf deployment-package.tar.gz \
    docker-compose.pull.yml \
    env.production.example \
    deploy-package/nginx/ \
    scripts/verify-deployment.sh

# Copy ke server
scp deployment-package.tar.gz user@server:/opt/tamankehati/

# Di server, extract
cd /opt/tamankehati
tar -xzf deployment-package.tar.gz
```

---

### Step 3.2: Configure Environment

**3.2.1 Create .env File**

```bash
cd /opt/tamankehati

# Copy template
cp env.production.example .env

# Edit .env
nano .env
```

**3.2.2 Generate SECRET_KEY**

```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Copy output dan paste ke .env sebagai SECRET_KEY
```

**3.2.3 Update Critical Variables in .env**

Update values berikut di `.env`:

```bash
# Server IP (ganti dengan IP server Anda)
SERVER_IP=192.168.1.100  # atau IP server Anda

# Docker Registry Configuration
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=arnezzi
IMAGE_TAG=v1.0.0  # atau tag yang Anda gunakan saat build

# Database Password (generate strong password)
POSTGRES_PASSWORD=StrongPassword123!

# Admin Credentials
ADMIN_EMAIL=admin@kehati.org
ADMIN_PASSWORD=StrongAdminPassword123!

# CORS Configuration
CORS_ORIGINS=http://${SERVER_IP}:3000,http://${SERVER_IP}:80

# API URL
NEXT_PUBLIC_API_URL=http://${SERVER_IP}:8000
# atau via Nginx:
# NEXT_PUBLIC_API_URL=http://${SERVER_IP}/api

# Security
SECRET_KEY=<paste-generated-secret-key>
ENVIRONMENT=production
DEBUG=false
```

**3.2.4 Verify .env Configuration**

```bash
# Check .env file
cat .env | grep -E "SERVER_IP|DOCKER_USERNAME|IMAGE_TAG|SECRET_KEY|POSTGRES_PASSWORD" | head -10
```

---

### Step 3.3: Setup Ollama (Optional - for AI)

**Option A: Install natively on server**

```bash
# Run setup script
sudo ./scripts/setup-ollama.sh

# Or manual:
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl enable ollama
sudo systemctl start ollama
ollama pull llama3.1:8b  # atau qwen2:1.5b untuk model lebih kecil
```

**Update .env:**
```bash
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

**Option B: Use Docker (already in docker-compose.pull.yml)**

Ollama service sudah dikonfigurasi di `docker-compose.pull.yml`. Tidak perlu setup manual.

---

## Phase 4: Deploy Application

### Step 4.1: Pull Images from Registry

```bash
cd /opt/tamankehati

# Verify .env configuration
grep DOCKER_USERNAME .env
grep IMAGE_TAG .env

# Pull images from Docker Hub
docker compose -f docker-compose.pull.yml pull

# Verify images downloaded
docker images | grep tamankehati
```

**Expected output:**
```
Pulling backend  ... done
Pulling frontend ... done
Pulling ollama   ... done (if enabled)
```

---

### Step 4.2: Start Services

```bash
# Start all services
docker compose -f docker-compose.pull.yml up -d

# Check status
docker compose -f docker-compose.pull.yml ps

# View logs
docker compose -f docker-compose.pull.yml logs -f
```

**Monitor startup:**
- Wait for all services to show "healthy" status
- Check logs for any errors
- Typical startup time: 30-60 seconds

---

### Step 4.3: Database Setup

Migrations dan admin user akan dibuat otomatis via `start.sh` script.

**Verify:**
```bash
# Check backend logs for migration
docker compose -f docker-compose.pull.yml logs backend | grep -i "migration\|admin"

# Check if admin user created
docker compose -f docker-compose.pull.yml logs backend | grep -i "admin created"
```

---

## Phase 5: Verification & Testing

### Step 5.1: Health Checks

```bash
cd /opt/tamankehati

# Run verification script
chmod +x scripts/verify-deployment.sh
./scripts/verify-deployment.sh
```

**Manual checks:**
```bash
# Backend health
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000

# Nginx
curl http://localhost/health

# Database
docker compose -f docker-compose.pull.yml exec postgres pg_isready -U kehati_user

# Redis
docker compose -f docker-compose.pull.yml exec redis redis-cli ping

# Ollama (if enabled)
curl http://localhost:11434/api/tags
```

---

### Step 5.2: Functional Testing

**Access Application:**
- Frontend: http://YOUR_SERVER_IP:3000
- Backend API: http://YOUR_SERVER_IP:8000
- API Docs: http://YOUR_SERVER_IP:8000/docs
- Via Nginx: http://YOUR_SERVER_IP

**Test Checklist:**
- [ ] Login dengan admin credentials
- [ ] Dashboard loads correctly
- [ ] Create Flora (with image upload)
- [ ] Create Fauna (with image upload)
- [ ] Create Taman (Parks)
- [ ] Image uploads work
- [ ] No localhost:8000 errors in console
- [ ] Buttons display correctly
- [ ] Chatbot works (if Ollama enabled)

---

### Step 5.3: Security Verification

```bash
# Check firewall
sudo ufw status verbose

# Verify internal ports NOT exposed
sudo ufw status | grep -E "8000|3000|5432|6379"
# Should return nothing

# Check CORS in backend logs
docker compose -f docker-compose.pull.yml logs backend | grep -i cors
```

---

## Phase 6: Post-Deployment

### Step 6.1: Document Deployment

**Save this information:**

```
Server Information:
- IP Address: _______________
- SSH User: _______________
- SSH Port: 22

Application URLs:
- Frontend: http://_______________:3000
- Backend: http://_______________:8000
- API Docs: http://_______________:8000/docs
- Via Nginx: http://_______________

Credentials:
- Admin Email: _______________
- Admin Password: _______________
- Database Password: _______________

Docker Images:
- Backend: docker.io/arnezzi/tamankehati-backend:v1.0.0
- Frontend: docker.io/arnezzi/tamankehati-frontend:v1.0.0
```

---

### Step 6.2: Setup Monitoring (Optional)

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/docker-containers

# Add:
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
```

---

## Troubleshooting

### Build Failed

```bash
# Check Docker build logs
docker compose -f docker-compose.prod.yml build --no-cache

# Check for errors
docker compose -f docker-compose.prod.yml logs
```

### Images Not Found

```bash
# Verify Docker login
docker login

# Check images in registry
docker pull docker.io/arnezzi/tamankehati-backend:v1.0.0
```

### Services Not Starting

```bash
# Check logs
docker compose -f docker-compose.pull.yml logs -f

# Check specific service
docker compose -f docker-compose.pull.yml logs backend
docker compose -f docker-compose.pull.yml logs frontend
```

### Database Connection Failed

```bash
# Check PostgreSQL
docker compose -f docker-compose.pull.yml exec postgres psql -U kehati_user -d kehati_db -c "SELECT 1;"

# Check DATABASE_URL in .env
grep DATABASE_URL .env
```

---

## Quick Reference Commands

```bash
# View logs
docker compose -f docker-compose.pull.yml logs -f

# Restart services
docker compose -f docker-compose.pull.yml restart

# Stop services
docker compose -f docker-compose.pull.yml down

# Start services
docker compose -f docker-compose.pull.yml up -d

# Check status
docker compose -f docker-compose.pull.yml ps

# Pull new images
docker compose -f docker-compose.pull.yml pull

# Update services (pull + restart)
docker compose -f docker-compose.pull.yml pull && \
docker compose -f docker-compose.pull.yml up -d
```

---

**Last Updated:** 2025-01-04  
**Docker Hub Username:** arnezzi

