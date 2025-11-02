# 🚀 Quick Start Guide untuk Client

Panduan singkat untuk menjalankan aplikasi Taman Kehati dengan Docker.

---

## ⚡ 5 Langkah Cepat

### 1. Clone & Setup

```bash
git clone <repository-url>
cd tamankehati_new
cp env.example .env
```

### 2. Generate SECRET_KEY

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy hasilnya dan paste ke `SECRET_KEY` di file `.env`.

### 3. Edit .env (WAJIB!)

Buka file `.env` dan update minimal:
- `SECRET_KEY` - Paste hasil dari step 2
- `POSTGRES_PASSWORD` - Buat password yang kuat
- `CORS_ORIGINS` - Domain production Anda
- `NEXT_PUBLIC_API_URL` - URL backend production
- `ENVIRONMENT="production"`
- `DEBUG="false"`

### 4. Build & Start

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Verify & Login

```bash
# Check status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

Akses aplikasi:
- Frontend: http://your-server-ip:3000
- Backend API: http://your-server-ip:8000
- API Docs: http://your-server-ip:8000/docs

**Login pertama:**
- Email: `admin@kehati.org`
- Password: `admin123`
- ⚠️ **UBAH PASSWORD SETELAH LOGIN!**

---

## 🔍 Troubleshooting Cepat

### Services tidak start?
```bash
docker-compose -f docker-compose.prod.yml logs
```

### Database error?
```bash
docker-compose -f docker-compose.prod.yml logs postgres
```

### Port sudah digunakan?
```bash
# Check port
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000

# Atau ubah port di .env:
BACKEND_PORT=8001
FRONTEND_PORT=3001
```

### Migration error?
```bash
docker-compose -f docker-compose.prod.yml exec backend alembic current
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## 📚 Dokumentasi Lengkap

Untuk panduan detail, lihat:
- **`CLIENT_DEPLOYMENT_GUIDE.md`** - Panduan lengkap deployment
- **`DEPLOYMENT_CHECKLIST.md`** - Checklist untuk deployment
- **`DOCKER_SETUP.md`** - Dokumentasi Docker umum

---

## ✅ Selesai!

Jika semua service running dan aplikasi accessible, deployment berhasil! 🎉

