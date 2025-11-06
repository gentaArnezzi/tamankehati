# ⚠️ REMINDER: Revert engine.py Sebelum Push ke Main

## 🚨 PENTING!

File `apps/backend/core/database/engine.py` di branch feature Anda memiliki **fix untuk Supabase pooler** yang hanya untuk **local development**.

**Sebelum merge/push ke `main` branch untuk production deployment, HARUS revert perubahan ini!**

## 📝 Perubahan yang Ada di Feature Branch

File `apps/backend/core/database/engine.py` memiliki fix untuk Supabase pooler:

```python
# Check if using Supabase pooler (pgbouncer)
is_supabase_pooler = "pooler.supabase.com" in DATABASE_URL or ":6543" in DATABASE_URL

connect_args = {}
if is_supabase_pooler:
    connect_args["statement_cache_size"] = 0
    connect_args["prepared_statement_cache_size"] = 0
```

## 🔄 Cara Revert Sebelum Push ke Main

### Opsi 1: Git Checkout (Termudah)

```bash
# Pastikan Anda di feature branch
git checkout feature/update-feature

# Revert engine.py ke versi di main
git checkout main -- apps/backend/core/database/engine.py

# Commit perubahan revert
git add apps/backend/core/database/engine.py
git commit -m "revert: remove Supabase pooler fix before merge to main"
```

### Opsi 2: Manual Edit

Hapus semua kode yang terkait dengan Supabase pooler fix, kembalikan ke:

```python
# Engine & session maker async
# For asyncpg, we don't need special connect_args
# The statement cache settings don't apply to asyncpg in SQLAlchemy
engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=5,
    max_overflow=10
)
```

## ✅ Checklist Sebelum Push/Merge ke Main

- [ ] Revert `apps/backend/core/database/engine.py` ke kondisi original
- [ ] Verify tidak ada kode `statement_cache_size = 0` atau `pooler.supabase.com`
- [ ] Test bahwa aplikasi masih berjalan dengan baik
- [ ] Run script check: `./scripts/check-engine-before-push.sh`

## 🔍 Verifikasi

Setelah revert, pastikan file tidak mengandung:

```bash
# Check
grep -i "statement_cache_size\|pooler.supabase" apps/backend/core/database/engine.py

# Seharusnya tidak ada output (atau hanya di comment)
```

## 📋 Alasan Revert

1. **Server production** kemungkinan **tidak menggunakan Supabase pooler**
2. Fix ini hanya untuk **local development** dengan Supabase pooler
3. Di production, database connection berbeda (bisa direct connection atau pooler lain)

## 🛠️ Script Helper

Gunakan script untuk check sebelum push:

```bash
./scripts/check-engine-before-push.sh
```

Script ini akan:
- ✅ Check apakah engine.py punya Supabase pooler fix
- ⚠️ Warning jika ada fix dan Anda di main branch
- 🚨 Block push jika di main branch dan ada fix

---

**JANGAN LUPA REVERT SEBELUM PUSH KE MAIN!** 🚨

