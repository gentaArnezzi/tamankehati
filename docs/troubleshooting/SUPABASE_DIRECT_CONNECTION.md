# 🔧 Solusi: Gunakan Direct Connection (Non-Pooler) untuk Supabase

## ❌ Masalah

Error: `prepared statement "__asyncpg_stmt_X__" already exists`

Ini terjadi karena Supabase **pooler** (port 6543) menggunakan pgbouncer yang tidak support prepared statements.

## ✅ Solusi: Gunakan Direct Connection

Gunakan **direct connection** (port 5432) bukan pooler (port 6543) untuk development.

### Cara 1: Update `.env` File

Edit `apps/backend/.env` dan ubah URL database:

**Sebelum (Pooler - port 6543):**
```env
DATABASE_URL="postgresql+asyncpg://postgres.kztboidieltsdlbzoadk:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"
DATABASE_URL_SYNC="postgresql://postgres.kztboidieltsdlbzoadk:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"
```

**Sesudah (Direct - port 5432):**
```env
DATABASE_URL="postgresql+asyncpg://postgres.kztboidieltsdlbzoadk:[PASSWORD]@aws-1-ap-southeast-2.compute.amazonaws.com:5432/postgres"
DATABASE_URL_SYNC="postgresql://postgres.kztboidieltsdlbzoadk:[PASSWORD]@aws-1-ap-southeast-2.compute.amazonaws.com:5432/postgres"
```

**Perubahan:**
- `pooler.supabase.com` → `compute.amazonaws.com` (atau hostname direct connection)
- Port `6543` → `5432`

### Cara 2: Dapatkan Direct Connection String dari Supabase

1. Buka **Supabase Dashboard**
2. Pilih project Anda
3. Buka **Settings** → **Database**
4. Scroll ke **Connection string**
5. Pilih tab **URI** (bukan **Connection pooling**)
6. Copy connection string yang menggunakan port **5432**

Format biasanya:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-2.compute.amazonaws.com:5432/postgres
```

### Cara 3: Update via Script

```bash
cd apps/backend

# Backup .env dulu
cp .env .env.backup

# Edit .env dan ganti:
# - pooler.supabase.com → compute.amazonaws.com (atau hostname direct)
# - :6543 → :5432
```

## 🔄 Setelah Update

1. **Restart backend server:**
   ```bash
   # Stop server (Ctrl+C)
   # Start lagi
   cd apps/backend
   source venv/bin/activate
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Test login** - Error seharusnya sudah hilang

## 📊 Perbandingan

| Tipe | Port | Prepared Statements | Connection Pooling | Kecepatan |
|------|------|---------------------|-------------------|-----------|
| **Pooler** | 6543 | ❌ Tidak support | ✅ Ada | Lebih cepat |
| **Direct** | 5432 | ✅ Support | ❌ Tidak ada | Lebih lambat |

## 💡 Rekomendasi

- **Development (Local)**: Gunakan **Direct Connection** (port 5432) - lebih stabil
- **Production**: Bisa tetap pakai **Pooler** (port 6543) dengan fix di engine.py, atau pakai direct connection

## ⚠️ Catatan

- Direct connection tidak memiliki connection pooling, jadi bisa lebih lambat untuk banyak request
- Tapi untuk development, ini lebih stabil dan tidak ada masalah dengan prepared statements
- Password tetap sama, hanya hostname dan port yang berbeda

---

**Setelah update `.env`, restart server dan error akan hilang!**

