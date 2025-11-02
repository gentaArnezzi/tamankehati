# 🐳 Docker Quick Start Guide

Panduan cepat untuk menjalankan aplikasi dengan Docker.

---

## ⚡ Quick Start (Development)

```bash
# 1. Setup environment
cp env.example .env

# 2. Start semua services
./docker-dev.sh start
# atau
make up

# 3. Akses aplikasi
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## 📋 Available Commands

### Menggunakan `docker-dev.sh`

```bash
./docker-dev.sh start      # Start services
./docker-dev.sh stop       # Stop services
./docker-dev.sh restart    # Restart services
./docker-dev.sh migrate    # Run migrations
./docker-dev.sh logs       # View logs
./docker-dev.sh status     # Check status
./docker-dev.sh clean      # Clean up
```

### Menggunakan `make` (Recommended)

```bash
make up            # Start development
make down          # Stop services
make logs          # View logs
make migrate       # Run migrations
make shell-backend # Open backend shell
make shell-db      # Open database shell
make status        # Check status
make clean         # Clean up
```

### Menggunakan `docker-compose` langsung

```bash
# Development
docker-compose up -d              # Start
docker-compose down               # Stop
docker-compose logs -f backend    # View backend logs
docker-compose restart backend    # Restart backend

# Production
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🏭 Production Setup

```bash
# 1. Configure environment
cp env.example .env
# Edit .env dengan production values

# 2. Build production images
make build-prod

# 3. Start production
make up-prod

# 4. Check status
make status-prod
```

---

## 🔧 Configuration

Edit `.env` file untuk konfigurasi:
- Database credentials
- SECRET_KEY (WAJIB diubah!)
- CORS_ORIGINS
- Environment settings

---

## 📚 Dokumentasi Lengkap

Lihat **[DOCKER_SETUP.md](DOCKER_SETUP.md)** untuk dokumentasi lengkap.

---

## 🆘 Troubleshooting

```bash
# Check logs
make logs LOGS_SERVICE=backend

# Restart service
make restart

# Clean and rebuild
make clean
make build
make up
```

---

**Selamat menggunakan Docker!** 🚀

