# 🔧 Fix: Supabase Pooler Prepared Statements Error

## ❌ Error yang Terjadi

```
asyncpg.exceptions.DuplicatePreparedStatementError: prepared statement "__asyncpg_stmt_X__" already exists
HINT: pgbouncer with pool_mode set to "transaction" or "statement" does not support prepared statements properly.
```

## 🔍 Penyebab

Supabase menggunakan **pgbouncer** sebagai connection pooler dengan mode "transaction" atau "statement". Mode ini **tidak mendukung prepared statements** yang digunakan oleh asyncpg/SQLAlchemy.

## ✅ Solusi yang Sudah Diterapkan

File `apps/backend/core/database/engine.py` sudah dikonfigurasi untuk:
1. **Mendeteksi Supabase pooler** (mengandung `pooler.supabase.com` atau port `6543`)
2. **Menonaktifkan prepared statements** dengan:
   - `statement_cache_size=0` di `connect_args`
   - `prepared_statement_cache_size=0` di `connect_args`
   - `execution_options={"prepared_statement_cache_size": 0}` di engine

## 🚀 Cara Menerapkan Fix

### 1. Pastikan Perubahan Sudah Ada

File `apps/backend/core/database/engine.py` harus memiliki:

```python
if is_supabase_pooler:
    connect_args["statement_cache_size"] = 0
    connect_args["prepared_statement_cache_size"] = 0
```

### 2. **RESTART BACKEND SERVER** (PENTING!)

**Fix tidak akan bekerja sampai server di-restart!**

```bash
# Stop server (Ctrl+C atau)
pkill -f uvicorn

# Start lagi
cd apps/backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Verifikasi

Setelah restart, saat server start, Anda akan melihat:
```
⚠️  Supabase pooler detected - disabling prepared statements (statement_cache_size=0, prepared_statement_cache_size=0)
```

## 🔄 Alternatif: Gunakan Direct Connection (Non-Pooler)

Jika masalah masih terjadi, gunakan **direct connection** (bukan pooler) untuk development:

**Di Supabase Dashboard:**
1. Buka **Settings** → **Database**
2. Copy **Connection string** (bukan **Connection pooling**)
3. Gunakan port **5432** (bukan **6543**)

**Update `.env`:**
```env
DATABASE_URL="postgresql+asyncpg://postgres.kztboidieltsdlbzoadk:[PASSWORD]@aws-1-ap-southeast-2.compute.amazonaws.com:5432/postgres"
DATABASE_URL_SYNC="postgresql://postgres.kztboidieltsdlbzoadk:[PASSWORD]@aws-1-ap-southeast-2.compute.amazonaws.com:5432/postgres"
```

**Note:** Direct connection tidak memiliki connection pooling, jadi lebih lambat untuk production. Tapi untuk development, ini lebih stabil.

## 📝 Catatan

- **Pooler (port 6543)**: Lebih efisien, tapi tidak support prepared statements → perlu fix ini
- **Direct (port 5432)**: Support prepared statements, tapi tidak ada pooling → lebih lambat

## 🐛 Jika Masih Error

1. **Pastikan server sudah di-restart** setelah perubahan
2. **Check apakah warning muncul** saat server start
3. **Coba gunakan direct connection** (port 5432) untuk testing
4. **Clear connection pool** dengan restart server

---

**Fix sudah diterapkan di `apps/backend/core/database/engine.py`**

