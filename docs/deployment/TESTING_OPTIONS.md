# 🧪 Testing Options: Local vs Server

Ada **2 opsi** untuk testing deployment aplikasi Taman Kehati:

---

## 📍 Opsi 1: Testing di Local (Recommended untuk First Time)

### ✅ Keuntungan Testing di Local:
1. **Lebih aman** - tidak mengganggu server production
2. **Lebih cepat** - tidak perlu SSH ke server
3. **Lebih mudah debug** - akses langsung ke logs dan files
4. **Bisa test berkali-kali** - tanpa risiko merusak server
5. **Tidak perlu akses server** - test sebelum server siap

### 🎯 Kapan Gunakan:
- ✅ First time deployment (belum pernah deploy sebelumnya)
- ✅ Testing workflow baru
- ✅ Debugging issues sebelum deploy ke server
- ✅ Server belum siap atau belum ada akses

### 📋 Workflow Testing di Local:

```bash
# 1. Setup folder simulasi (mirip server)
cd ~
mkdir tamankehati-simulation
cd tamankehati-simulation

# 2. Clone repository (atau copy files)
git clone https://github.com/gentaArnezzi/tamankehati.git .

# 3. Setup .env (mirip production)
cp env.production.example .env
# Edit .env dengan konfigurasi local

# 4. Pull images (yang sudah kita build)
docker compose -f docker-compose.pull.yml pull

# 5. Start services
docker compose -f docker-compose.pull.yml up -d

# 6. Test aplikasi
curl http://localhost:3000
curl http://localhost:8000/health
```

### 📝 File yang Diperlukan di Local:
- ✅ `docker-compose.pull.yml` (sudah ada)
- ✅ `env.production.example` (sudah ada)
- ✅ `deploy-package/nginx/` (sudah ada)
- ✅ Images sudah di-push ke Docker Hub (✅ sudah selesai)

---

## 🖥️ Opsi 2: Testing Langsung di Server Ubuntu

### ✅ Keuntungan Testing di Server:
1. **Real environment** - kondisi production yang sebenarnya
2. **Network testing** - test dengan IP server yang sebenarnya
3. **Performance testing** - test dengan resources server yang sebenarnya
4. **Final validation** - memastikan semua berjalan di production

### ⚠️ Pertimbangan:
- Harus punya akses SSH ke server
- Harus hati-hati karena bisa mempengaruhi server production
- Lebih lambat untuk debugging (perlu SSH)

### 🎯 Kapan Gunakan:
- ✅ Sudah test di local dan berhasil
- ✅ Server sudah siap dan dikonfigurasi
- ✅ Ingin validasi final sebelum go-live
- ✅ Testing dengan real IP dan network

### 📋 Workflow Testing di Server:

```bash
# 1. SSH ke server
ssh user@your-server-ip

# 2. Setup directory
sudo mkdir -p /opt/tamankehati
sudo chown $USER:$USER /opt/tamankehati
cd /opt/tamankehati

# 3. Clone repository
git clone https://github.com/gentaArnezzi/tamankehati.git .

# 4. Setup .env
cp env.production.example .env
nano .env  # Edit dengan konfigurasi server

# 5. Pull images
docker compose -f docker-compose.pull.yml pull

# 6. Start services
docker compose -f docker-compose.pull.yml up -d

# 7. Test aplikasi
curl http://YOUR_SERVER_IP:3000
curl http://YOUR_SERVER_IP:8000/health
```

---

## 🎯 Recommended Workflow (Best Practice)

### Step-by-Step Recommended Approach:

```
1. ✅ Build images di local (SUDAH SELESAI)
   └─> docker.io/arnezzi/tamankehati-backend:v1.0.0
   └─> docker.io/arnezzi/tamankehati-frontend:v1.0.0

2. 🧪 TEST DI LOCAL DULU (Recommended)
   └─> Simulasi deployment di local
   └─> Verify semua services berjalan
   └─> Test fitur utama (login, CRUD, dll)
   └─> Fix issues jika ada

3. 🖥️ SETUP SERVER (Jika belum)
   └─> Install Docker
   └─> Setup firewall
   └─> Clone repository

4. 🚀 DEPLOY KE SERVER
   └─> Pull images dari registry
   └─> Start services
   └─> Verify deployment

5. ✅ TEST DI SERVER
   └─> Final validation
   └─> Performance testing
   └─> Go-live!
```

---

## 📊 Comparison Table

| Aspek | Testing di Local | Testing di Server |
|-------|------------------|-------------------|
| **Keamanan** | ✅ Aman (tidak ganggu server) | ⚠️ Perlu hati-hati |
| **Speed** | ✅ Cepat (local network) | ⚠️ Lebih lambat (via SSH) |
| **Debug** | ✅ Mudah (akses langsung) | ⚠️ Lebih sulit (perlu SSH) |
| **Real Environment** | ❌ Simulasi | ✅ Real production |
| **Network Testing** | ❌ Localhost only | ✅ Real IP & network |
| **Akses Server** | ✅ Tidak perlu | ❌ Perlu akses SSH |
| **Recommended** | ✅ Untuk first time | ✅ Untuk final validation |

---

## 🎯 Rekomendasi untuk Anda

**Karena ini first time deployment, saya sarankan:**

### Option A: Test di Local Dulu (Recommended)
```bash
# 1. Setup simulasi di local
cd ~
mkdir tamankehati-simulation
cd tamankehati-simulation
git clone https://github.com/gentaArnezzi/tamankehati.git .

# 2. Setup .env
cp env.production.example .env
# Edit .env dengan local IP

# 3. Pull dan test
docker compose -f docker-compose.pull.yml pull
docker compose -f docker-compose.pull.yml up -d

# 4. Test
curl http://localhost:3000
```

**Keuntungan:**
- ✅ Bisa test berkali-kali tanpa risiko
- ✅ Fix issues sebelum deploy ke server
- ✅ Verify workflow sebelum ke server real

### Option B: Langsung ke Server (Jika sudah yakin)
```bash
# Langsung SSH ke server dan deploy
ssh user@server-ip
# ... follow deployment steps
```

**Keuntungan:**
- ✅ Real environment testing
- ✅ Final validation

---

## 📝 Quick Decision Guide

**Pilih Testing di Local jika:**
- ✅ Belum pernah deploy aplikasi ini sebelumnya
- ✅ Ingin test workflow tanpa risiko
- ✅ Server belum siap atau belum ada akses
- ✅ Ingin debug dengan mudah

**Pilih Langsung ke Server jika:**
- ✅ Sudah test di local dan berhasil
- ✅ Server sudah siap dan dikonfigurasi
- ✅ Ingin validasi final dengan real IP
- ✅ Yakin dengan konfigurasi

---

## 🚀 Next Steps

**Jika pilih Testing di Local:**
→ Ikuti panduan di `docs/deployment/LOCAL_TESTING_GUIDE.md`

**Jika pilih Langsung ke Server:**
→ Ikuti panduan di `docs/deployment/DEPLOYMENT_STEP_BY_STEP.md` (Phase 2-6)

---

**Last Updated:** 2025-11-04

