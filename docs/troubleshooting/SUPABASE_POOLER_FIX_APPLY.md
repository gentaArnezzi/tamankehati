# 🔧 Cara Menerapkan Fix Supabase Pooler

## ⚠️ PENTING: Restart Server Setelah Fix!

Setelah mengubah `apps/backend/core/database/engine.py`, **HARUS restart backend server** agar perubahan diterapkan!

## ✅ Langkah-langkah

### 1. Pastikan Fix Sudah Ada

File `apps/backend/core/database/engine.py` harus memiliki:

```python
is_supabase_pooler = "pooler.supabase.com" in DATABASE_URL or ":6543" in DATABASE_URL

connect_args = {}
if is_supabase_pooler:
    connect_args["statement_cache_size"] = 0
    print("⚠️  Supabase pooler detected - disabling prepared statements (statement_cache_size=0)")

engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    # ... other params ...
    connect_args=connect_args if connect_args else {}
)
```

### 2. Restart Backend Server

**Jika menggunakan uvicorn langsung:**
```bash
# Stop server (Ctrl+C)
# Start lagi
cd apps/backend
uvicorn main:app --reload
```

**Jika menggunakan Docker:**
```bash
docker compose restart backend
# atau
docker compose down && docker compose up -d
```

**Jika menggunakan systemd/service:**
```bash
sudo systemctl restart tamankehati-backend
```

### 3. Verifikasi Fix Bekerja

Setelah restart, cek log backend. Anda harus melihat:

```
⚠️  Supabase pooler detected - disabling prepared statements (statement_cache_size=0)
```

Jika pesan ini muncul, fix sudah diterapkan!

### 4. Test Login

Coba login lagi. Error `prepared statement already exists` seharusnya sudah hilang.

## 🐛 Troubleshooting

### Error Masih Terjadi Setelah Restart?

1. **Pastikan server benar-benar restart:**
   ```bash
   # Cek apakah process baru sudah jalan
   ps aux | grep uvicorn
   # atau
   docker ps | grep backend
   ```

2. **Cek apakah DATABASE_URL benar:**
   ```bash
   # Pastikan URL mengandung pooler.supabase.com atau :6543
   grep DATABASE_URL apps/backend/.env
   ```

3. **Cek log backend:**
   ```bash
   # Lihat apakah warning message muncul
   tail -f logs/backend.log
   # atau
   docker compose logs -f backend
   ```

4. **Pastikan tidak ada cache Python:**
   ```bash
   # Hapus __pycache__
   find apps/backend -type d -name __pycache__ -exec rm -r {} +
   # Hapus .pyc files
   find apps/backend -name "*.pyc" -delete
   ```

### Fix Tidak Terdeteksi?

Jika warning message tidak muncul, kemungkinan:
- DATABASE_URL tidak mengandung `pooler.supabase.com` atau `:6543`
- Fix belum benar-benar diterapkan
- Server belum restart

Cek dengan:
```python
# Test di Python shell
import os
os.chdir('apps/backend')
from core.config.env import load_env
load_env()
url = os.getenv('DATABASE_URL') or os.getenv('DATABASE_URL_SYNC')
print('Has pooler:', 'pooler.supabase.com' in str(url) or ':6543' in str(url))
```

---

**Jika masih error setelah semua langkah di atas, coba gunakan direct connection (port 5432) sebagai workaround.**

