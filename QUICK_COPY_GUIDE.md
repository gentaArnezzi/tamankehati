# 🚀 Quick Guide: Copy Files ke Server

## 📦 File yang Sudah Disiapkan

Package deployment sudah disiapkan:
- ✅ `deployment-package.tar.gz` (9.6 KB) - Archive siap pakai
- ✅ `deployment-package/` - Folder dengan semua file

---

## 🎯 Method 1: Copy Archive (Paling Mudah - Recommended)

### Di Local Machine:

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new

# Copy archive ke server
scp deployment-package.tar.gz user@server-ip:/tmp/
```

**Ganti:**
- `user` = username SSH Anda di server
- `server-ip` = IP address server Ubuntu

**Contoh:**
```bash
scp deployment-package.tar.gz ubuntu@192.168.1.100:/tmp/
```

### Di Server:

```bash
# SSH ke server
ssh user@server-ip

# Create directory
sudo mkdir -p /opt/tamankehati
sudo chown $USER:$USER /opt/tamankehati
cd /opt/tamankehati

# Extract archive
tar -xzf /tmp/deployment-package.tar.gz

# Verify files
ls -la
```

---

## 🎯 Method 2: Git Clone (TIDAK DISARANKAN untuk Production)

**⚠️ PERINGATAN:** Git clone akan include **semua source code** ke server.

**Jika Anda ingin source code tetap aman di local (tidak ada di server), JANGAN gunakan method ini.**

**Gunakan Method 1 (Copy Archive) saja!**

---

## 🎯 Method 3: Copy Folder Langsung (via SCP)

### Di Local Machine:

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_new

# Copy folder ke server
scp -r deployment-package user@server-ip:/opt/tamankehati/
```

### Di Server:

```bash
# SSH ke server
ssh user@server-ip

# Verify files
cd /opt/tamankehati
ls -la
```

---

## ✅ Setelah Copy Files

### Di Server:

```bash
# 1. Setup .env
cp env.production.example .env
nano .env

# Edit .env dengan:
# - SERVER_IP=your-server-ip
# - DOCKER_USERNAME=arnezzi
# - IMAGE_TAG=v1.0.0
# - SECRET_KEY=generate-new-key
# - POSTGRES_PASSWORD=strong-password
# - ADMIN_EMAIL=admin@kehati.org
# - ADMIN_PASSWORD=strong-admin-password

# 2. Pull images
docker compose -f docker-compose.pull.yml pull

# 3. Start services
docker compose -f docker-compose.pull.yml up -d

# 4. Check status
docker compose -f docker-compose.pull.yml ps

# 5. View logs
docker compose -f docker-compose.pull.yml logs -f
```

---

## 📋 Checklist File yang Harus Ada di Server

Setelah copy, verify file-file berikut ada:

```bash
cd /opt/tamankehati

# Check files
ls -la docker-compose.pull.yml
ls -la env.production.example
ls -la deploy-package/nginx/nginx.conf
ls -la deploy-package/nginx/conf.d/default.conf
ls -la scripts/verify-deployment.sh
```

**Expected structure:**
```
/opt/tamankehati/
├── docker-compose.pull.yml      ✅
├── env.production.example        ✅
├── deploy-package/
│   └── nginx/
│       ├── nginx.conf            ✅
│       └── conf.d/
│           └── default.conf      ✅
└── scripts/
    ├── verify-deployment.sh       ✅
    └── backup-database.sh         ✅
```

---

## 🚀 Quick Command Summary

### Copy Archive:
```bash
# From local
scp deployment-package.tar.gz user@server-ip:/tmp/

# On server
ssh user@server-ip
sudo mkdir -p /opt/tamankehati && sudo chown $USER:$USER /opt/tamankehati
cd /opt/tamankehati
tar -xzf /tmp/deployment-package.tar.gz
```

### Or Git Clone:
```bash
# On server
ssh user@server-ip
sudo mkdir -p /opt/tamankehati && sudo chown $USER:$USER /opt/tamankehati
cd /opt/tamankehati
git clone https://github.com/gentaArnezzi/tamankehati.git .
```

---

**Selanjutnya:** Setup `.env` dan start services!

