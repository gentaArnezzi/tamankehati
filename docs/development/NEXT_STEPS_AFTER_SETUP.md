# 🚀 Next Steps Setelah Setup Database & Migrations

Setelah setup database, environment variables, dan migrations selesai, berikut langkah-langkah untuk memulai development.

## ✅ Checklist Setup (Sudah Selesai)

- [x] Branch baru dibuat (`feature/new-feature`)
- [x] Database Supabase terhubung
- [x] File `.env` di `apps/backend/.env` sudah dikonfigurasi
- [x] Migrations sudah dijalankan (`alembic upgrade head`)

## 📋 Langkah Selanjutnya

### 1. Verifikasi Setup

Pastikan semua sudah benar:

```bash
# Check branch
git branch
# Should show: * feature/new-feature

# Check database connection
cd apps/backend
source venv/bin/activate
python -c "from core.database.session import get_db; next(get_db()); print('✅ Database OK!')"

# Check migration status
alembic current
```

### 2. Install Dependencies (jika belum)

```bash
cd apps/backend
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Menjalankan Backend Server

#### Cara Termudah (Recommended):

```bash
cd apps/backend
./start.sh
```

#### Cara Manual:

```bash
cd apps/backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Server akan berjalan di:** http://localhost:8000

**Endpoints yang tersedia:**
- Health: http://localhost:8000/health
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 4. Setup Frontend Environment

Sebelum menjalankan frontend, setup environment variables:

#### Cara Termudah (Recommended):

```bash
./scripts/setup-frontend-env.sh
```

Script ini akan membuat `.env.local` di `apps/frontend/` dengan konfigurasi yang sesuai.

#### Cara Manual:

1. Buat file `apps/frontend/.env.local`:
   ```bash
   cd apps/frontend
   touch .env.local
   ```

2. Edit `.env.local` dan tambahkan:
   ```env
   # Backend API URL (untuk local development)
   NEXT_PUBLIC_API_URL=http://localhost:8000
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME="Taman Kehati"
   NEXT_PUBLIC_APP_VERSION="2.1.0"
   
   # Next.js Configuration
   NODE_ENV=development
   NEXT_TELEMETRY_DISABLED=1
   ```

### 5. Menjalankan Frontend

Setelah environment variables di-setup:

```bash
cd apps/frontend
npm install  # Jika belum install dependencies
npm run dev
```

**Frontend akan berjalan di:** http://localhost:3000

**Pastikan backend juga berjalan di:** http://localhost:8000

### 5. Mulai Development Fitur Baru

Sekarang Anda siap untuk:

1. **Membuat perubahan code** di branch `feature/new-feature`
2. **Test perubahan** dengan backend/frontend yang berjalan
3. **Commit changes** secara berkala

#### Contoh Workflow:

```bash
# 1. Buat perubahan di code
# ... edit files ...

# 2. Test perubahan
# Backend akan auto-reload jika menggunakan --reload flag

# 3. Commit changes
git add .
git commit -m "feat: add new feature description"

# 4. Push ke remote (setelah selesai)
git push origin feature/new-feature
```

## 🔍 Testing & Verification

### Test Backend API:

```bash
# Health check
curl http://localhost:8000/health

# Test database connection via API
curl http://localhost:8000/api/v1/...
```

### Test Database:

```bash
cd apps/backend
source venv/bin/activate

# Test query
python -c "
from core.database.session import get_db
db = next(get_db())
result = db.execute('SELECT 1')
print('✅ Database query successful!')
"
```

## 📝 Development Tips

### 1. Auto-reload Backend

Jika menggunakan `--reload` flag, backend akan otomatis restart saat ada perubahan file Python.

### 2. Database Migrations

Jika membuat perubahan model:

```bash
cd apps/backend
source venv/bin/activate

# Generate migration
alembic revision --autogenerate -m "description of changes"

# Review migration file di apps/backend/migrations/versions/

# Apply migration
alembic upgrade head
```

### 3. Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit dengan message yang jelas
git commit -m "feat: add new feature"
# atau
git commit -m "fix: fix bug description"
# atau
git commit -m "refactor: improve code structure"

# Push ke remote
git push origin feature/new-feature
```

### 4. Environment Variables

Jika perlu update `.env`:
- Edit `apps/backend/.env`
- Restart backend server untuk load perubahan

## 🐛 Troubleshooting

### Backend tidak bisa connect ke database

```bash
# Check .env file
cat apps/backend/.env | grep DATABASE_URL

# Test connection
cd apps/backend
source venv/bin/activate
python -c "from core.database.session import get_db; next(get_db())"
```

### Port 8000 sudah digunakan

```bash
# Stop server yang berjalan
pkill -f uvicorn

# Atau gunakan port lain
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Migration error

```bash
# Check current migration
alembic current

# Check migration history
alembic history

# Rollback jika perlu (HATI-HATI!)
alembic downgrade -1
```

## 📚 Related Documentation

- [Setup Local Workspace](./SETUP_LOCAL_WORKSPACE.md)
- [Backend How To Run](../../apps/backend/HOWTO_RUN.md)
- [Development Workflow](./WORKFLOW_DEVELOPMENT.md)

## 🎯 Quick Reference

```bash
# Start backend
cd apps/backend && ./start.sh

# Stop backend
cd apps/backend && ./stop.sh  # atau Ctrl+C

# Check logs
# Logs akan muncul di terminal tempat server berjalan

# Test API
curl http://localhost:8000/health
```

---

**Selamat coding! 🎉**

