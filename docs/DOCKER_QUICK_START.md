# 🚀 Docker Quick Start

## ⚡ 3 Langkah untuk Mulai

```bash
# 1. Setup environment
cp env.example .env

# 2. Start semua services
make up
# atau: ./docker-dev.sh start

# 3. Akses aplikasi
# ✅ Frontend: http://localhost:3000
# ✅ Backend API: http://localhost:8000
# ✅ API Docs: http://localhost:8000/docs
```

## 📦 Services yang Berjalan

- ✅ **Frontend** (Next.js) - Port 3000
- ✅ **Backend API** (FastAPI) - Port 8000
- ✅ **PostgreSQL** - Port 5433
- ✅ **Redis** - Port 6379

## 🎮 Perintah Umum

```bash
make up          # Start services
make down        # Stop services
make logs        # View logs
make migrate     # Run migrations
make status      # Check status
```

## 🔑 Default Admin Login

Setelah pertama kali start:
- **Email**: `admin@kehati.org`
- **Password**: `admin123`

⚠️ **UBAH PASSWORD SETELAH LOGIN PERTAMA!**

## 📚 Dokumentasi Lengkap

- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Panduan lengkap Docker
- **[README_DOCKER.md](README_DOCKER.md)** - Quick reference

---

**Selamat coding!** 🎉

