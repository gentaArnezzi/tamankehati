# 🛠️ Setup Local Workspace untuk Development

Dokumen ini menjelaskan cara setup workspace lokal agar sama dengan konfigurasi server (Supabase database).

## 📋 Prerequisites

- Python 3.9+ dengan virtual environment
- PostgreSQL client tools (untuk testing connection)
- Git

## 🚀 Quick Setup

### 1. Buat Branch Baru untuk Fitur

```bash
git checkout -b feature/nama-fitur-anda
```

### 2. Setup Environment Variables

Jalankan script setup:

```bash
./scripts/setup-local-env.sh
```

Script ini akan:
- Meminta password Supabase database
- Membuat file `.env` dengan konfigurasi yang sesuai
- Setup connection string ke Supabase

**Atau manual:**

1. Copy `env.example` ke `apps/backend/.env`:
   ```bash
   cp env.example apps/backend/.env
   ```

2. Edit `apps/backend/.env` dan update `DATABASE_URL` dan `DATABASE_URL_SYNC`:
   ```env
   DATABASE_URL="postgresql+asyncpg://postgres.kztboidieltsdlbzoadk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"
   DATABASE_URL_SYNC="postgresql://postgres.kztboidieltsdlbzoadk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"
   ```
   
   **⚠️ Ganti `[YOUR-PASSWORD]` dengan password Supabase database Anda!**

### 3. Install Dependencies

```bash
cd apps/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Run Database Migrations

```bash
cd apps/backend
alembic upgrade head
```

Ini akan menjalankan semua migration ke database Supabase.

### 5. Verify Database Connection

Test koneksi database:

```bash
cd apps/backend
python -c "from core.database.session import get_db; next(get_db()); print('✅ Database connection successful!')"
```

## 🔍 Verifikasi Setup

### Check Current Branch

```bash
git branch
# Should show: * feature/nama-fitur-anda
```

### Check Environment Variables

```bash
cd apps/backend
# Verify .env file exists
ls -la .env

# Check if variables are loaded
python -c "from core.config.env import get_settings; s = get_settings(); print(f'Database: {s.DATABASE_URL[:50]}...')"
```

### Check Migration Status

```bash
cd apps/backend
alembic current
alembic history
```

## 📝 Notes

1. **⚠️ Jangan commit `.env` file ke Git!** File ini sudah ada di `.gitignore`.

2. **Database Supabase adalah production database**, jadi:
   - Hati-hati saat menjalankan migrations
   - Jangan hapus data production
   - Gunakan untuk development/testing dengan data real

3. **Branch Strategy:**
   - Buat branch baru untuk setiap fitur: `feature/nama-fitur`
   - Commit changes ke branch
   - Push branch dan buat Pull Request ke `main`

## 🐛 Troubleshooting

### Error: "password authentication failed"

- Pastikan password Supabase sudah benar
- Check apakah password mengandung karakter khusus yang perlu di-escape

### Error: "connection refused" atau "timeout"

- Check koneksi internet
- Pastikan Supabase database pooler accessible
- Coba gunakan direct connection (port 5432) jika pooler tidak bekerja

### Error: "relation does not exist"

- Pastikan migrations sudah dijalankan: `alembic upgrade head`
- Check migration history: `alembic history`

### Alembic tidak menemukan database URL

- Pastikan `.env` file ada di `apps/backend/.env` (bukan di project root)
- Check apakah `DATABASE_URL_SYNC` sudah di-set dengan benar

## 🔄 Workflow Development

1. **Pull latest changes:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/nama-fitur
   ```

3. **Make changes and test locally**

4. **Run migrations if needed:**
   ```bash
   cd apps/backend
   alembic revision --autogenerate -m "description"
   alembic upgrade head
   ```

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/nama-fitur
   ```

6. **Create Pull Request di GitHub**

## 📚 Related Documentation

- [Development Workflow](./WORKFLOW_DEVELOPMENT.md)
- [Database Migrations](../../migration/README.md)
- [Environment Variables](../../../env.example)

