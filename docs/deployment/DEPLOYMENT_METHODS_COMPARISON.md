# 📊 Perbandingan Metode Deployment

Panduan menjelaskan perbedaan antara deployment tradisional vs Docker-based deployment.

---

## 🔍 Analisis Struktur `goproject` (Deployment Tradisional)

### Struktur Directory yang Ada:

```
~/dasmap_prod/apps/goproject/
├── asa.conf.json         → Konfigurasi aplikasi
├── asa.key               → Key file
├── backup_ibsap_20250927.sql  → Database backup
├── backup_data.sql       → Data backup
├── backup_db_retensi.sh  → Script backup database
├── godasmap              → Binary/executable aplikasi
├── data/                 → Data directory
├── prepare_db.sh         → Script setup database
├── queries.json          → Query configuration
├── start.sh              → Script untuk start aplikasi
├── tiles/                → Map tiles
├── www/                  → Static files (HTML, CSS, JS)
└── xml/                  → XML files
```

### Karakteristik Deployment Tradisional:

1. **Binary/Executable Langsung:**
   - `godasmap` → Binary yang langsung dijalankan
   - Tidak ada containerization
   - Aplikasi running langsung di host

2. **Script Shell untuk Management:**
   - `start.sh` → Script untuk start aplikasi
   - `prepare_db.sh` → Script setup database
   - `backup_db_retensi.sh` → Script backup manual

3. **Static Files di Directory:**
   - `www/` → Static files (HTML, CSS, JS)
   - `tiles/` → Map tiles
   - File-file langsung di server

4. **Konfigurasi File Langsung:**
   - `asa.conf.json` → Konfigurasi aplikasi
   - `asa.key` → Key file
   - File konfigurasi langsung di filesystem

5. **Tidak Ada Containerization:**
   - Tidak ada `Dockerfile`
   - Tidak ada `docker-compose.yml`
   - Tidak ada Docker image
   - Dependency management manual

---

## 🐳 Deployment Modern dengan Docker (Taman Kehati)

### Struktur Directory Taman Kehati:

```
~/dasmap_prod/apps/tamankehati/
├── docker-compose.pull.no-nginx.yml  → Docker Compose config
├── .env                               → Environment variables
├── deploy-package/                    → Deployment package
│   ├── nginx/                         → Nginx config
│   └── scripts/                       → Deployment scripts
└── (containers running via Docker)    → Aplikasi dalam container
```

### Karakteristik Deployment Modern:

1. **Containerization:**
   - Aplikasi dalam Docker containers
   - Isolated environment
   - Consistent across environments

2. **Docker Compose untuk Management:**
   - `docker-compose.yml` → Orchestration
   - `docker-compose up/down` → Start/stop services
   - Dependency management otomatis

3. **Docker Images:**
   - Images dari Docker Hub atau registry
   - Version control via tags
   - Easy rollback

4. **Environment Variables:**
   - `.env` file untuk konfigurasi
   - Separation of config and code
   - Easy to manage secrets

5. **Health Checks:**
   - Built-in health checks
   - Automatic restart
   - Monitoring ready

---

## 📊 Perbandingan: Traditional vs Docker

### Deployment Tradisional (`goproject`)

**Keuntungan:**
- ✅ Simple setup (langsung copy file)
- ✅ No overhead dari containerization
- ✅ Direct access ke filesystem
- ✅ Easy debugging (langsung di host)

**Kekurangan:**
- ❌ Dependency management manual
- ❌ Environment inconsistency
- ❌ Hard to scale
- ❌ Hard to rollback
- ❌ No isolation
- ❌ Manual process management
- ❌ Hard to maintain

**Cara Kerja:**
```bash
# Start aplikasi
./start.sh

# Backup database
./backup_db_retensi.sh

# Update aplikasi
# 1. Stop aplikasi
# 2. Copy file baru
# 3. Start aplikasi lagi
```

---

### Deployment Modern dengan Docker (Taman Kehati)

**Keuntungan:**
- ✅ Consistent environment
- ✅ Easy to scale
- ✅ Easy rollback (just change image tag)
- ✅ Isolation (tidak konflik dengan aplikasi lain)
- ✅ Dependency management otomatis
- ✅ Health checks built-in
- ✅ Easy to maintain
- ✅ Portable (run anywhere)

**Kekurangan:**
- ❌ Docker overhead (minimal)
- ❌ Learning curve (jika belum familiar)
- ❌ Need Docker installed

**Cara Kerja:**
```bash
# Start semua services
docker compose -f docker-compose.pull.no-nginx.yml up -d

# Update aplikasi
docker compose -f docker-compose.pull.no-nginx.yml pull
docker compose -f docker-compose.pull.no-nginx.yml up -d

# Backup database
docker compose exec postgres pg_dump -U user database > backup.sql

# Stop semua services
docker compose -f docker-compose.pull.no-nginx.yml down
```

---

## 🎯 Mengapa Taman Kehati Pakai Docker?

### 1. **Isolation**
- Taman Kehati punya database sendiri
- Taman Kehati punya dependencies sendiri
- Tidak konflik dengan `goproject` atau aplikasi lain

### 2. **Consistency**
- Development = Production
- Same environment everywhere
- No "works on my machine" issues

### 3. **Easy Management**
- Start/stop dengan satu command
- Update dengan pull image baru
- Rollback dengan change tag

### 4. **Scalability**
- Easy to scale (add more containers)
- Load balancing ready
- Microservices ready

### 5. **Maintainability**
- Version control via image tags
- Easy to update dependencies
- Easy to backup/restore

---

## 📋 Struktur Deployment di Server Anda

### Aplikasi Lama (Traditional):
```
~/dasmap_prod/apps/goproject/
├── godasmap              → Binary executable
├── start.sh              → Start script
├── www/                  → Static files
└── ...                   → Config files
```

**Cara run:**
```bash
cd ~/dasmap_prod/apps/goproject
./start.sh
```

### Aplikasi Baru (Docker):
```
~/dasmap_prod/apps/tamankehati/
├── docker-compose.pull.no-nginx.yml  → Docker Compose
├── .env                               → Environment variables
└── (containers running)               → Aplikasi dalam container
```

**Cara run:**
```bash
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

---

## ✅ Kesimpulan

**Ya, `goproject` menggunakan deployment tradisional (jadul):**
- ✅ Binary langsung dijalankan
- ✅ Script shell untuk management
- ✅ Static files di directory
- ✅ Tidak ada containerization

**Taman Kehati menggunakan deployment modern (Docker):**
- ✅ Containerization
- ✅ Docker Compose untuk orchestration
- ✅ Environment variables untuk config
- ✅ Health checks built-in
- ✅ Easy to manage dan maintain

**Keduanya bisa coexist di server yang sama:**
- ✅ `goproject` → Traditional deployment (port 8081)
- ✅ Taman Kehati → Docker deployment (port 3000 dan 8000)
- ✅ Nginx di service `go` → Route ke keduanya

---

## 🔄 Migration Path (Jika Ingin)

Jika ingin migrate `goproject` ke Docker (opsional):

1. **Create Dockerfile:**
   ```dockerfile
   FROM ubuntu:22.04
   COPY godasmap /app/
   COPY www /app/www/
   COPY asa.conf.json /app/
   WORKDIR /app
   CMD ["./godasmap"]
   ```

2. **Create docker-compose.yml:**
   ```yaml
   services:
     goproject:
       build: .
       ports:
         - "8081:8081"
       volumes:
         - ./data:/app/data
   ```

3. **Update:**
   ```bash
   docker compose build
   docker compose up -d
   ```

**Tapi ini opsional** - bisa tetap pakai traditional deployment jika sudah stabil.

---

**Last Updated:** 2025-11-04

