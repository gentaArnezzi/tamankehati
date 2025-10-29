# Database Cleanup Scripts

## ⚠️ PERINGATAN

Script ini akan **MENGHAPUS SEMUA DATA** dari database Railway kecuali **1 super_admin user**.

**Pastikan Anda sudah backup database sebelum menjalankan!**

---

## 📋 Ada 2 Cara Cleanup

### **Cara 1: Python Script (Recommended)**

#### Kelebihan:
- ✅ Lebih aman (ada konfirmasi)
- ✅ Auto rollback jika error
- ✅ Progress feedback real-time
- ✅ Verifikasi otomatis setelah cleanup

#### Cara Pakai:

```bash
cd apps/backend
./venv/bin/python scripts/cleanup_database.py
```

Script akan meminta konfirmasi dengan mengetik `HAPUS SEMUA`.

#### Output:
```
======================================================================
DATABASE CLEANUP SCRIPT
======================================================================

⚠️  WARNING: Script ini akan menghapus SEMUA data!
Hanya menyisakan 1 super_admin user

Ketik 'HAPUS SEMUA' untuk melanjutkan: HAPUS SEMUA

🔄 Memulai cleanup database...

📋 Step 1: Mencari super_admin...
✅ Super admin ditemukan: admin@tamankehati.id (ID: 1)

📋 Step 2: Menghapus notifications...
✅ Notifications dihapus. Sisa: 0

... (proses berlanjut)

======================================================================
✅ DATABASE CLEANUP SELESAI!
======================================================================

Data yang tersisa:
  - Super Admin: admin@tamankehati.id
  - Semua data lain telah dihapus
```

---

### **Cara 2: SQL Script**

#### Kelebihan:
- ✅ Bisa dijalankan langsung dari database client (pgAdmin, DBeaver, psql)
- ✅ Tidak perlu Python environment

#### Cara Pakai:

1. **Via psql (terminal)**:
   ```bash
   psql postgresql://postgres:PASSWORD@maglev.proxy.rlwy.net:26951/railway -f scripts/cleanup_database.sql
   ```

2. **Via Railway CLI**:
   ```bash
   railway run psql < scripts/cleanup_database.sql
   ```

3. **Via pgAdmin / DBeaver**:
   - Buka file `cleanup_database.sql`
   - Edit baris 90: Ganti `ROLLBACK;` dengan `COMMIT;`
   - Execute SQL

#### ⚠️ PENTING untuk SQL Script:

Script default menggunakan `ROLLBACK` (safe mode). 

Untuk benar-benar menghapus data, **edit baris 90**:

```sql
-- Ganti ini:
ROLLBACK;

-- Dengan ini:
COMMIT;
```

---

## 🔍 Apa yang Akan Dihapus

Script akan menghapus data dari tabel-tabel berikut (urutan penting untuk FK):

1. ✅ **notifications** - Semua notifikasi
2. ✅ **audit_log** - Semua log audit (jika ada)
3. ✅ **activities** - Semua kegiatan
4. ✅ **galleries** - Semua foto galeri
5. ✅ **articles** - Semua artikel
6. ✅ **flora** - Semua data flora
7. ✅ **fauna** - Semua data fauna
8. ✅ **announcements** - Semua pengumuman (jika ada)
9. ✅ **news** - Semua berita (jika ada)
10. ✅ **parks** - Semua taman
11. ✅ **users** - Semua user KECUALI 1 super_admin

## 🔒 Apa yang TIDAK Dihapus

- ✅ **1 super_admin user** (user pertama dengan role='super_admin')
- ✅ **Table structure** (schema tetap ada)
- ✅ **regions** table (data wilayah Indonesia)
- ✅ **system_settings** (konfigurasi sistem)

---

## 📊 Verifikasi Setelah Cleanup

Script Python akan otomatis verifikasi. Untuk SQL, jalankan query ini:

```sql
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'parks', COUNT(*) FROM parks
UNION ALL
SELECT 'flora', COUNT(*) FROM flora
UNION ALL
SELECT 'fauna', COUNT(*) FROM fauna
UNION ALL
SELECT 'activities', COUNT(*) FROM activities
UNION ALL
SELECT 'articles', COUNT(*) FROM articles
UNION ALL
SELECT 'galleries', COUNT(*) FROM galleries
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY table_name;
```

**Expected Result:**
```
table_name    | row_count
--------------+-----------
users         |         1  ← super_admin
parks         |         0
flora         |         0
fauna         |         0
activities    |         0
articles      |         0
galleries     |         0
notifications |         0
```

---

## 🆘 Troubleshooting

### Error: "Tidak ada super_admin ditemukan!"

**Solusi**: Buat super_admin dulu atau edit script untuk tidak menghapus user tertentu.

### Error: "relation does not exist"

**Solusi**: Tabel mungkin belum ada. Script akan skip tabel yang tidak ada.

### Error: "permission denied"

**Solusi**: Pastikan DATABASE_URL_SYNC di `.env` menggunakan user dengan permission yang cukup.

### Ingin Undo?

Jika menggunakan SQL script dengan `ROLLBACK`, data tidak akan terhapus.

Jika sudah `COMMIT`, satu-satunya cara adalah restore dari backup.

---

## 🎯 Next Steps Setelah Cleanup

1. **Stamp Alembic** (jika belum):
   ```bash
   ./venv/bin/alembic stamp head
   ```

2. **Cek Login Super Admin**:
   - Buka frontend
   - Login dengan akun super_admin yang tersisa
   - Pastikan bisa masuk dashboard

3. **Mulai Input Data Fresh**:
   - Buat taman baru
   - Input flora/fauna
   - Dll.

---

## 📝 Catatan

- Script ini **TIDAK** membuat backup otomatis
- **SELALU backup database** sebelum cleanup
- Script ini aman untuk development/testing
- Untuk production, **SANGAT disarankan** test di staging dulu

---

## 🔗 Related Files

- `cleanup_database.py` - Python cleanup script
- `cleanup_database.sql` - SQL cleanup script  
- `../alembic/` - Database migrations

---

**Dibuat**: 2025-10-29  
**Last Updated**: 2025-10-29

