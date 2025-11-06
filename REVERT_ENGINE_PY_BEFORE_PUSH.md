# 🚨 PENTING: REVERT engine.py SEBELUM PUSH KE MAIN!

## ⚠️ REMINDER INI HARUS DIBACA SEBELUM PUSH/MERGE KE MAIN BRANCH!

File `apps/backend/core/database/engine.py` di branch feature Anda memiliki **fix untuk Supabase pooler** yang hanya untuk **local development**.

**SEBELUM merge/push ke `main` branch untuk production deployment, HARUS revert perubahan ini!**

## 🔄 Cara Revert (Pilih Salah Satu)

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

Hapus semua kode yang terkait dengan Supabase pooler fix (baris 33-47), kembalikan ke:

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

- [ ] **REVERT** `apps/backend/core/database/engine.py` ke kondisi original
- [ ] Verify tidak ada kode `statement_cache_size = 0` atau `pooler.supabase.com`
- [ ] Run script check: `./scripts/check-engine-before-push.sh`
- [ ] Test bahwa aplikasi masih berjalan dengan baik

## 🔍 Verifikasi Setelah Revert

```bash
# Check apakah masih ada fix Supabase pooler
grep -i "statement_cache_size\|pooler.supabase" apps/backend/core/database/engine.py

# Seharusnya tidak ada output (atau hanya di comment)
```

## 📋 Alasan Revert

1. **Server production** kemungkinan **tidak menggunakan Supabase pooler**
2. Fix ini hanya untuk **local development** dengan Supabase pooler (port 6543)
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

## 📚 Dokumentasi Lengkap

Lihat: `docs/development/ENGINE_PY_REVERT_REMINDER.md`

---

**JANGAN LUPA REVERT SEBELUM PUSH KE MAIN!** 🚨

File ini sengaja diletakkan di root agar mudah terlihat!

