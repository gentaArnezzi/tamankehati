# ✅ Pre-Deployment Checklist untuk Taman Kehati

Panduan lengkap untuk mengecek semua hal yang perlu diperhatikan sebelum deploy Taman Kehati ke server yang sudah ada project lain.

---

## 🔍 Checklist Lengkap

### ✅ 0. Domain & Nginx Configuration (PENTING - Cek Domain yang Ada)

```bash
# Cek Nginx config files (jika Nginx di host)
sudo ls -la /etc/nginx/sites-enabled/
sudo ls -la /etc/nginx/sites-available/

# Cek server blocks di Nginx
sudo grep -r "server_name" /etc/nginx/sites-enabled/ 2>/dev/null
sudo grep -r "server_name" /etc/nginx/conf.d/ 2>/dev/null

# Cek Nginx config di Docker container (service go)
docker ps | grep go
docker exec -it <go-container-name> nginx -T 2>/dev/null | grep "server_name"

# Atau cek Nginx config di service go
docker exec -it <go-container-name> cat /etc/nginx/nginx.conf

# Cek Nginx config di dasmap_prod
ls -la ~/dasmap_prod/apps/nginx/
ls -la ~/dasmap_prod/apps/nginx/sites-enabled/
cat ~/dasmap_prod/apps/nginx/sites-enabled/*.conf 2>/dev/null | grep "server_name"

# Cek domain dari docker-compose yang ada
cd ~/dasmap_prod
cat docker-compose.yml | grep -i "domain\|server_name\|hostname" -A 2

# Cek virtual hosts (jika ada)
sudo apache2ctl -S 2>/dev/null || echo "Apache tidak terinstall"

# Cek DNS records (jika bisa akses)
dig +short dasmap.co.id
dig +short www.dasmap.co.id
dig +short amilna.co.id
dig +short www.amilna.co.id
nslookup dasmap.co.id
nslookup amilna.co.id
```

**Expected Output:**

- List domain yang sudah digunakan
- Server blocks di Nginx
- Subdomain yang tersedia

**Action:**

- Pilih subdomain baru untuk Taman Kehati (misalnya: `tamankehati.dasmap.co.id`)
- Atau pakai IP langsung untuk testing

---

### ✅ 1. Ports (SUDAH DICEK)

```bash
# Check semua port penting
sudo lsof -i :80      # HTTP
sudo lsof -i :443     # HTTPS
sudo lsof -i :5432    # PostgreSQL
sudo lsof -i :3000    # Frontend Taman Kehati
sudo lsof -i :8000    # Backend Taman Kehati
sudo lsof -i :6379    # Redis (jika ada)
```

**Status:**

- ✅ Port 80 → Digunakan oleh nginx (service `go`)
- ✅ Port 443 → Kosong (bisa untuk HTTPS)
- ✅ Port 5432 → Digunakan oleh PostgreSQL existing
- ✅ Port 3000 → Kosong (untuk Taman Kehati Frontend)
- ✅ Port 8000 → Kosong (untuk Taman Kehati Backend)

---

### ✅ 2. Network (PENTING - Cek untuk Hindari Konflik)

```bash
# List semua Docker networks
docker network ls

# Cek network yang sudah ada (contoh: dasmap_prod_go-net)
docker network inspect dasmap_prod_go-net

# Cek subnet yang digunakan
docker network inspect dasmap_prod_go-net | grep Subnet

# Cek IP range yang digunakan
docker network inspect dasmap_prod_go-net | grep -A 5 "IPAM"

# Cek detail lengkap network
docker network inspect dasmap_prod_go-net
```

**Hasil dari Server Anda:**

```
NETWORK ID     NAME                 DRIVER    SCOPE
1e4ad727e988   bridge               bridge    local
44faba747286   dasmap_prod_go-net   bridge    local  ← Network existing
975092357d38   host                 host      local
c94956eaaa0a   none                 null      local
```

**Expected:**

- ✅ Taman Kehati akan pakai network sendiri (`kehati-network` atau `tamankehati-network`)
- ✅ Subnet: `172.x.x.x/16` (tidak konflik dengan `dasmap_prod_go-net`)
- ✅ Tidak akan konflik dengan network existing
- ✅ Network driver: `bridge` (default, tidak masalah)

**Verifikasi Subnet (PENTING):**

```bash
# Cek subnet yang digunakan oleh dasmap_prod_go-net
docker network inspect dasmap_prod_go-net | grep -A 10 "IPAM"

# Output akan seperti:
# "IPAM": {
#     "Driver": "default",
#     "Options": {},
#     "Config": [
#         {
#             "Subnet": "172.27.0.0/16",  ← Ini subnet yang digunakan
#             "Gateway": "172.27.0.1"
#         }
#     ]
# }
```

**Action jika ada konflik subnet:**

- Edit `docker-compose.pull.no-nginx.yml` dan ubah subnet di network config:
  ```yaml
  networks:
    kehati-network:
      driver: bridge
      ipam:
        config:
          - subnet: 172.28.0.0/16 # ← Gunakan subnet yang berbeda
  ```

---

### ✅ 3. Docker Volumes (Cek untuk Hindari Konflik Nama)

```bash
# List semua volumes
docker volume ls

# Cek volume yang sudah ada
docker volume inspect db_1_data  # contoh volume yang ada

# Cek ukuran volumes
docker system df -v
```

**Expected:**

- ✅ Taman Kehati akan pakai volume sendiri:
  - `tamankehati-postgres-data`
  - `tamankehati-redis-data`
  - `tamankehati-ollama-data`
- ✅ Tidak akan konflik dengan volume existing

**Action jika ada nama yang sama:**

- Edit `docker-compose.pull.no-nginx.yml` dan ubah nama volume

---

### ✅ 4. Container Names (Cek untuk Hindari Konflik)

```bash
# List semua containers (running dan stopped)
docker ps -a

# Cek nama container yang ada
docker ps -a --format "{{.Names}}"

# Cek container yang running
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Expected:**

- ✅ Taman Kehati containers akan pakai nama:
  - `tamankehati-postgres-prod`
  - `tamankehati-redis-prod`
  - `tamankehati-backend-prod`
  - `tamankehati-frontend-prod`
  - `tamankehati-ollama-prod`
- ✅ Pastikan tidak ada nama yang sama

**Action jika ada nama yang sama:**

- Edit `docker-compose.pull.no-nginx.yml` dan ubah nama container

---

### ✅ 5. Disk Space (PENTING - Cek Kapasitas)

```bash
# Cek disk space
df -h

# Cek disk space untuk Docker
docker system df

# Cek space untuk images
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Cek space untuk volumes
docker volume ls -q | xargs docker volume inspect | grep -E "Mountpoint|Size"
```

**Expected:**

- ✅ Minimal **10GB free space** untuk Taman Kehati
- ✅ Docker images: ~2-3GB
- ✅ Database data: ~1-2GB (growing)
- ✅ Logs: ~500MB-1GB

**Action jika disk penuh:**

```bash
# Clean unused Docker resources
docker system prune -a --volumes

# Atau clean specific
docker image prune -a
docker volume prune
docker container prune
```

---

### ✅ 6. Docker Compose Files (Cek Lokasi dan Konflik)

```bash
# Cek struktur direktori
ls -la ~/dasmap_prod/

# Cek docker-compose.yml yang ada
cat ~/dasmap_prod/docker-compose.yml | head -50

# Cek apakah ada file docker-compose.yml di root
ls -la ~/dasmap_prod/*.yml

# Cek direktori apps
ls -la ~/dasmap_prod/apps/
```

**Expected:**

- ✅ Taman Kehati akan di `~/dasmap_prod/apps/tamankehati/`
- ✅ File: `docker-compose.pull.no-nginx.yml`
- ✅ Tidak akan konflik dengan `docker-compose.yml` yang ada di root

**Action:**

```bash
# Create directory untuk Taman Kehati
mkdir -p ~/dasmap_prod/apps/tamankehati
cd ~/dasmap_prod/apps/tamankehati
```

---

### ✅ 7. Environment Variables (Cek untuk Konflik)

```bash
# Cek env vars di docker-compose yang ada
cat ~/dasmap_prod/docker-compose.yml | grep -i "environment:" -A 20

# Cek .env file yang ada (jika ada)
ls -la ~/dasmap_prod/.env*

# Cek env vars di shell
env | grep -i "postgres\|redis\|database"
```

**Expected:**

- ✅ Taman Kehati akan pakai `.env` di `~/dasmap_prod/apps/tamankehati/.env`
- ✅ Tidak akan konflik dengan env vars yang ada
- ✅ Database credentials berbeda

**Action:**

```bash
# Copy env template
cp env.production.example .env
# Edit dengan konfigurasi yang berbeda dari yang ada
nano .env
```

---

### ✅ 8. PostgreSQL Database (Cek untuk Konflik Nama Database)

```bash
# Cek database yang sudah ada (jika PostgreSQL container name diketahui)
docker ps | grep postgres

# Cek database yang ada
docker exec -it <postgres-container-name> psql -U postgres -c "\l"

# Atau jika PostgreSQL exposed
psql -h localhost -U postgres -c "\l"
```

**Expected:**

- ✅ Taman Kehati akan pakai database: `tamankehati_db`
- ✅ User: `tamankehati_user`
- ✅ Password: berbeda dari yang ada
- ✅ Pastikan tidak ada database dengan nama yang sama

**Action jika ada nama yang sama:**

- Edit `.env` dan ubah `POSTGRES_DB` dan `POSTGRES_USER`

---

### ✅ 9. Redis (Jika Ada - Cek Port)

```bash
# Cek apakah ada Redis yang running
sudo lsof -i :6379

# Cek Redis di Docker
docker ps | grep redis

# Cek Redis config di docker-compose
cat ~/dasmap_prod/docker-compose.yml | grep -i redis
```

**Expected:**

- ✅ Taman Kehati akan pakai Redis sendiri (port internal, tidak exposed)
- ✅ Tidak akan konflik jika Redis yang ada tidak exposed
- ✅ Jika Redis exposed, pastikan tidak konflik

**Action:**

- Pastikan Redis Taman Kehati tidak exposed ke host

---

### ✅ 10. Nginx Configuration (Cek Lokasi Config)

```bash
# Cek lokasi nginx config
ls -la ~/dasmap_prod/apps/nginx/

# Cek sites-enabled
ls -la ~/dasmap_prod/apps/nginx/sites-enabled/

# Cek apakah ada config untuk tamankehati
grep -r "tamankehati" ~/dasmap_prod/apps/nginx/ 2>/dev/null

# Cek nginx config di service go
docker exec -it <go-container-name> nginx -t
```

**Expected:**

- ✅ Nginx config akan ditambahkan di `~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf`
- ✅ Tidak akan overwrite config yang ada
- ✅ Akan di-mount ke service `go`

**Action:**

```bash
# Create nginx config untuk Taman Kehati
cd ~/dasmap_prod/apps/nginx/sites-enabled
sudo nano tamankehati.conf
# Copy config dari dokumentasi
```

---

### ✅ 11. Firewall/Security (Cek Port Access)

```bash
# Cek firewall rules
sudo ufw status

# Cek iptables rules
sudo iptables -L -n | grep -E "80|443|3000|8000"

# Cek port yang listening
sudo netstat -tulpn | grep LISTEN
```

**Expected:**

- ✅ Port 80 dan 443 sudah terbuka (untuk nginx)
- ✅ Port 3000 dan 8000 perlu accessible dari host (untuk nginx reverse proxy)
- ✅ Tidak perlu expose ke internet (hanya localhost)

**Action jika firewall memblokir:**

```bash
# Allow port (jika perlu)
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
```

---

### ✅ 12. Docker Resources (Cek Memory & CPU)

```bash
# Cek Docker resources
docker stats --no-stream

# Cek system resources
free -h
nproc

# Cek CPU usage
top -bn1 | grep "Cpu(s)"

# Cek memory usage
cat /proc/meminfo | grep -E "MemTotal|MemFree|MemAvailable"
```

**Expected:**

- ✅ Minimal **2GB RAM free** untuk Taman Kehati
- ✅ Minimal **2 CPU cores** available
- ✅ Docker memory limit: cukup untuk semua containers

**Action jika resources kurang:**

```bash
# Stop containers yang tidak perlu
docker stop <container-name>

# Atau limit resources di docker-compose
# Edit docker-compose.yml dan tambahkan:
# deploy:
#   resources:
#     limits:
#       memory: 512M
```

---

### ✅ 13. User Permissions (Cek Docker Access)

```bash
# Cek apakah user bisa akses Docker
docker ps

# Cek apakah user ada di docker group
groups $USER | grep docker

# Cek Docker socket permissions
ls -la /var/run/docker.sock
```

**Expected:**

- ✅ User harus bisa akses Docker tanpa sudo
- ✅ User ada di `docker` group

**Action jika tidak bisa:**

```bash
# Tambahkan user ke docker group
sudo usermod -aG docker $USER

# Logout dan login lagi
# Atau
newgrp docker

# Verify
docker ps
```

---

### ✅ 14. Domain/DNS (Jika Pakai Subdomain)

```bash
# Cek DNS untuk subdomain
dig tamankehati.dasmap.co.id +short

# Atau
nslookup tamankehati.dasmap.co.id

# Test dari server
curl -I http://tamankehati.dasmap.co.id
```

**Expected:**

- ✅ DNS A record pointing ke server IP
- ✅ Atau pakai IP langsung untuk testing

**Action jika DNS belum setup:**

- Setup DNS A record di domain registrar
- Atau pakai IP untuk testing: `http://YOUR_SERVER_IP:3000`

---

### ✅ 15. SSL Certificates (Jika Pakai HTTPS)

```bash
# Cek certificates yang ada
ls -la /etc/letsencrypt/live/

# Cek certbot
which certbot

# Cek certificate expiry
sudo certbot certificates
```

**Expected:**

- ✅ SSL certificate akan dibuat untuk subdomain baru
- ✅ Tidak akan konflik dengan certificate yang ada
- ✅ Certbot installed dan configured

**Action jika perlu SSL:**

```bash
# Install certbot (jika belum)
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d tamankehati.dasmap.co.id
```

---

## 🚀 Quick Check Script

Buat script untuk check semua sekaligus:

```bash
cat > ~/check_tamankehati_deployment.sh << 'EOF'
#!/bin/bash

echo "=========================================="
echo "Taman Kehati Pre-Deployment Check"
echo "=========================================="
echo ""

echo "1. Checking Ports..."
echo "Port 80:"
sudo lsof -i :80 | head -1 || echo "  ✓ Port 80 is free"
echo "Port 443:"
sudo lsof -i :443 | head -1 || echo "  ✓ Port 443 is free"
echo "Port 3000:"
sudo lsof -i :3000 | head -1 || echo "  ✓ Port 3000 is free"
echo "Port 8000:"
sudo lsof -i :8000 | head -1 || echo "  ✓ Port 8000 is free"
echo ""

echo "2. Checking Docker Networks..."
docker network ls | grep -E "go-net|tamankehati" || echo "  ✓ No conflicting networks"
echo ""

echo "3. Checking Docker Volumes..."
docker volume ls | grep -E "db_1_data|tamankehati" || echo "  ✓ No conflicting volumes"
echo ""

echo "4. Checking Container Names..."
docker ps -a --format "{{.Names}}" | grep -E "tamankehati|go|postgres" || echo "  ✓ No conflicting containers"
echo ""

echo "5. Checking Disk Space..."
df -h / | tail -1
echo "Docker disk usage:"
docker system df | head -5
echo ""

echo "6. Checking Docker Resources..."
echo "Memory:"
free -h | grep Mem
echo "CPU Cores:"
nproc
echo ""

echo "7. Checking Docker Access..."
docker ps > /dev/null 2>&1 && echo "  ✓ Docker accessible" || echo "  ✗ Docker not accessible"
echo ""

echo "8. Checking Directory Structure..."
if [ -d ~/dasmap_prod/apps/tamankehati ]; then
  echo "  ✓ Taman Kehati directory exists"
else
  echo "  ! Taman Kehati directory not found (will be created)"
fi
echo ""

echo "=========================================="
echo "Check Complete!"
echo "=========================================="
EOF

chmod +x ~/check_tamankehati_deployment.sh
~/check_tamankehati_deployment.sh
```

---

## 📊 Summary Checklist

Copy checklist ini dan centang saat sudah dicek:

- [ ] ✅ Ports (80, 443, 3000, 8000, 5432, 6379)
- [ ] ✅ Docker Networks (tidak konflik nama/subnet)
- [ ] ✅ Docker Volumes (tidak konflik nama)
- [ ] ✅ Container Names (tidak konflik)
- [ ] ✅ Disk Space (minimal 10GB free)
- [ ] ✅ Docker Compose Files (lokasi tidak konflik)
- [ ] ✅ Environment Variables (tidak konflik)
- [ ] ✅ PostgreSQL Database (nama database berbeda)
- [ ] ✅ Redis (tidak konflik port)
- [ ] ✅ Nginx Configuration (lokasi config)
- [ ] ✅ Firewall/Security (port accessible)
- [ ] ✅ Docker Resources (RAM & CPU cukup)
- [ ] ✅ User Permissions (Docker access OK)
- [ ] ✅ Domain/DNS (subdomain setup)
- [ ] ✅ SSL Certificates (jika perlu HTTPS)

---

## ⚠️ Common Issues & Solutions

### Issue 1: Port Already in Use

**Solution:**

- Gunakan port yang berbeda di `docker-compose.yml`
- Atau stop service yang menggunakan port tersebut

### Issue 2: Network Conflict

**Solution:**

- Edit network config di `docker-compose.yml`
- Atau gunakan network yang sudah ada (jika diizinkan)

### Issue 3: Volume Name Conflict

**Solution:**

- Edit volume name di `docker-compose.yml`
- Atau gunakan volume yang sudah ada (jika diizinkan)

### Issue 4: Disk Space Low

**Solution:**

```bash
# Clean Docker
docker system prune -a --volumes

# Remove unused images
docker image prune -a
```

### Issue 5: Docker Permission Denied

**Solution:**

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

**Last Updated:** 2025-11-04
