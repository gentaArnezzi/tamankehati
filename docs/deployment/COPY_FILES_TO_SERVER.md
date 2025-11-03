# 📦 Copy Minimal Files ke Server Ubuntu

Panduan lengkap untuk copy file-file minimal yang diperlukan untuk deployment ke server Ubuntu.

---

## 📋 File-File Minimal yang Diperlukan

### ✅ File Essential (WAJIB):
1. **`docker-compose.pull.yml`** - Konfigurasi Docker Compose untuk pull images
2. **`env.production.example`** - Template environment variables
3. **`deploy-package/nginx/`** - Konfigurasi Nginx reverse proxy
   - `nginx.conf`
   - `conf.d/default.conf`

### 📝 File Optional (Disarankan):
4. **`scripts/verify-deployment.sh`** - Script untuk verify deployment
5. **`scripts/backup-database.sh`** - Script untuk backup database

**Total size:** ~50-100 KB (sangat kecil!)

---

## 🚀 Method 1: Menggunakan Script Otomatis (Recommended)

### Step 1: Generate Deployment Package

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new

# Run script untuk prepare package
./scripts/prepare-server-deployment.sh
```

Script ini akan:
- ✅ Membuat folder `deployment-package/` dengan semua file minimal
- ✅ Membuat `deployment-package.tar.gz` untuk easy transfer
- ✅ Menampilkan instruksi next steps

### Step 2: Copy ke Server

**Option A: Copy folder (via SCP)**
```bash
# Copy folder ke server
scp -r deployment-package user@server-ip:/opt/tamankehati/
```

**Option B: Copy archive (via SCP)**
```bash
# Copy archive ke server
scp deployment-package.tar.gz user@server-ip:/opt/tamankehati/

# Di server, extract:
ssh user@server-ip
cd /opt/tamankehati
tar -xzf deployment-package.tar.gz
```

---

## 🔧 Method 2: Copy Manual (Step-by-Step)

### Step 1: Identifikasi File yang Perlu

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new

# List file yang perlu di-copy
ls -la docker-compose.pull.yml
ls -la env.production.example
ls -la deploy-package/nginx/
```

### Step 2: Copy ke Server

**Copy via SCP (Secure Copy):**

```bash
# 1. Copy docker-compose.pull.yml
scp docker-compose.pull.yml user@server-ip:/opt/tamankehati/

# 2. Copy env template
scp env.production.example user@server-ip:/opt/tamankehati/

# 3. Copy Nginx config
scp -r deploy-package/nginx user@server-ip:/opt/tamankehati/deploy-package/

# 4. Copy scripts (optional)
scp scripts/verify-deployment.sh user@server-ip:/opt/tamankehati/scripts/
scp scripts/backup-database.sh user@server-ip:/opt/tamankehati/scripts/
```

**Atau copy semua sekaligus:**
```bash
# Copy semua file sekaligus
scp -r docker-compose.pull.yml \
      env.production.example \
      deploy-package/ \
      scripts/verify-deployment.sh \
      scripts/backup-database.sh \
      user@server-ip:/opt/tamankehati/
```

---

## 🌐 Method 3: Git Clone (TIDAK DISARANKAN untuk Production)

**⚠️ PERINGATAN:** Git clone akan include **semua source code** ke server.

**Jika Anda ingin source code tetap aman di local, JANGAN gunakan method ini untuk production server.**

### Kapan Bisa Digunakan:
- ✅ Testing/Development server
- ✅ Server yang memang perlu source code (untuk development)

### Kapan TIDAK Boleh Digunakan:
- ❌ Production server (seperti yang Anda inginkan)
- ❌ Server yang hanya untuk running aplikasi (tidak untuk development)

**Untuk production, gunakan Method 1 (Copy Archive) saja!**

---

## 📝 Step-by-Step: Complete Workflow

### Di Local Machine:

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new

# Option A: Generate package (recommended)
./scripts/prepare-server-deployment.sh

# Copy package ke server
scp deployment-package.tar.gz user@server-ip:/tmp/
```

### Di Server:

```bash
# SSH ke server
ssh user@server-ip

# Create directory
sudo mkdir -p /opt/tamankehati
sudo chown $USER:$USER /opt/tamankehati
cd /opt/tamankehati

# Extract package
tar -xzf /tmp/deployment-package.tar.gz

# Or, if using git clone:
git clone https://github.com/gentaArnezzi/tamankehati.git .

# Setup .env
cp env.production.example .env
nano .env  # Edit dengan konfigurasi server

# Pull images
docker compose -f docker-compose.pull.yml pull

# Start services
docker compose -f docker-compose.pull.yml up -d
```

---

## 🔍 Verification Checklist

Setelah copy files, verify di server:

```bash
# SSH ke server
ssh user@server-ip
cd /opt/tamankehati

# Check files
ls -la docker-compose.pull.yml
ls -la env.production.example
ls -la deploy-package/nginx/
ls -la scripts/verify-deployment.sh

# Check structure
tree -L 2  # atau: find . -type f | head -20
```

**Expected structure:**
```
/opt/tamankehati/
├── docker-compose.pull.yml
├── env.production.example
├── deploy-package/
│   └── nginx/
│       ├── nginx.conf
│       └── conf.d/
│           └── default.conf
└── scripts/
    ├── verify-deployment.sh
    └── backup-database.sh
```

---

## 🎯 Quick Reference Commands

### Generate Package:
```bash
./scripts/prepare-server-deployment.sh
```

### Copy via SCP:
```bash
# Copy folder
scp -r deployment-package user@server-ip:/opt/tamankehati/

# Copy archive
scp deployment-package.tar.gz user@server-ip:/opt/tamankehati/
```

### Or Git Clone di Server:
```bash
ssh user@server-ip
cd /opt/tamankehati
git clone https://github.com/gentaArnezzi/tamankehati.git .
```

---

## ⚠️ Important Notes

1. **File Size:** Package sangat kecil (~50-100 KB), tidak masalah kalau copy semua file dari repo
2. **Source Code:** Server tidak perlu source code, tapi tidak masalah kalau ada (karena ukurannya kecil)
3. **Security:** Pastikan `.env` file tidak di-commit ke Git (sudah ada di `.gitignore`)
4. **Permissions:** Pastikan files di server memiliki permission yang benar:
   ```bash
   chmod +x scripts/*.sh
   chmod 644 docker-compose.pull.yml
   chmod 644 env.production.example
   ```

---

## 🚀 Recommended Method

**Untuk production server (source code tetap aman di local):**

### Method: Copy Deployment Package (Method 1)

```bash
# Di local:
scp deployment-package.tar.gz user@server-ip:/tmp/

# Di server:
ssh user@server-ip
sudo mkdir -p /opt/tamankehati
sudo chown $USER:$USER /opt/tamankehati
cd /opt/tamankehati
tar -xzf /tmp/deployment-package.tar.gz
```

**Kenapa?**
- ✅ **TIDAK include source code** - hanya file konfigurasi
- ✅ Source code tetap aman di local
- ✅ Ukuran sangat kecil (~9.6 KB)
- ✅ Server hanya perlu file konfigurasi

**Lalu di server:**
```bash
# Setup .env
cp env.production.example .env
nano .env

# Pull images & start (TIDAK build di server!)
docker compose -f docker-compose.pull.yml pull
docker compose -f docker-compose.pull.yml up -d
```

**Server hanya pull images dari registry, tidak pernah build!**

---

**Last Updated:** 2025-11-04

