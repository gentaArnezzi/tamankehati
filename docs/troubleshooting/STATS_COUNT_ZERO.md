# 🔍 Stats Count Masih 0 atau Error - Troubleshooting

**Masalah**: Endpoint `/api/public/stats/park/{park_id}` mengembalikan 0 untuk semua count atau error.

---

## ✅ Perbaikan yang Sudah Dilakukan

### **1. Query Activities - Removed `deleted_at` Filter**

Tabel `activities` **TIDAK punya** kolom `deleted_at`, hanya punya `rejected_at`.

**Sebelum (❌ Error):**
```sql
SELECT COUNT(*) FROM activities 
WHERE park_id = :park_id 
AND status = 'approved' 
AND deleted_at IS NULL  -- ❌ Column doesn't exist!
```

**Sesudah (✅ Fixed):**
```sql
SELECT COUNT(*) FROM activities 
WHERE park_id = :park_id 
AND status = 'approved'  -- ✅ No deleted_at filter needed
```

### **2. Query Debug Flora - Fixed Column Name**

**Sebelum (❌ Error):**
```sql
SELECT id, nama_ilmiah, status, deleted_at FROM flora ...
-- ❌ Column 'nama_ilmiah' doesn't exist
```

**Sesudah (✅ Fixed):**
```sql
SELECT id, scientific_name, status, deleted_at FROM flora ...
-- ✅ Correct column name
```

### **3. Query Debug Fauna - Fixed Column Name**

**Sebelum (❌ Error):**
```sql
SELECT id, nama_ilmiah, status, deleted_at FROM fauna ...
-- ❌ Column 'nama_ilmiah' doesn't exist
```

**Sesudah (✅ Fixed):**
```sql
SELECT id, scientific_name, status, deleted_at FROM fauna ...
-- ✅ Correct column name
```

---

## 🐛 Error yang Sering Terjadi

### **Error 1: `column "deleted_at" does not exist` (activities)**

```
sqlalchemy.exc.ProgrammingError: column "deleted_at" does not exist
HINT: Perhaps you meant to reference the column "activities.rejected_at".
```

**Penyebab**: Query masih menggunakan `deleted_at` untuk tabel `activities`.

**Fix**: Sudah diperbaiki di `apps/backend/api/v1/public/stats.py` - activities query tidak lagi memakai `deleted_at`.

---

### **Error 2: `column "nama_ilmiah" does not exist`**

```
sqlalchemy.exc.ProgrammingError: column "nama_ilmiah" does not exist
[SQL: SELECT id, nama_ilmiah, status, deleted_at FROM flora ...]
```

**Penyebab**: Query menggunakan kolom `nama_ilmiah` yang tidak ada. Kolom yang benar adalah `scientific_name`.

**Fix**: Sudah diperbaiki di:
- `apps/backend/api/v1/public/stats.py`
- `apps/backend/api/v1/public/parks_simple.py`

---

## 🔍 Cara Debugging

### **Step 1: Check Backend Logs di Render**

1. Buka Render Dashboard → Your Backend Service → Logs
2. Cari log yang dimulai dengan:
   - `🔍 Debug - Park {park_id} flora count breakdown:`
   - `🔍 Debug - Park {park_id} fauna count breakdown:`
   - `🔍 Debug - Park {park_id} activities count breakdown:`
   - `❌ Error getting park stats`

3. **Jika masih ada error tentang `nama_ilmiah` atau `deleted_at` (activities):**
   - **Kemungkinan**: Perubahan belum ter-deploy atau ada cache Python
   - **Solution**: Redeploy di Render atau restart service

### **Step 2: Verify Code Changes**

Pastikan file-file berikut sudah benar:

**`apps/backend/api/v1/public/stats.py`:**
- ✅ Activities query: Tidak pakai `deleted_at`
- ✅ Debug flora query: Pakai `scientific_name` (bukan `nama_ilmiah`)
- ✅ Debug fauna query: Pakai `scientific_name` (bukan `nama_ilmiah`)

**`apps/backend/api/v1/public/parks_simple.py`:**
- ✅ Debug flora query: Pakai `scientific_name` (bukan `nama_ilmiah`)

### **Step 3: Force Redeploy di Render**

Jika error masih terjadi setelah verify code:

1. **Redeploy Service:**
   - Render Dashboard → Your Service → Manual Deploy → Deploy latest commit
   
2. **Atau Restart Service:**
   - Render Dashboard → Your Service → Settings → Restart

3. **Clear Python Cache (optional):**
   - Jika ada `__pycache__` folder, hapus di build command:
   ```bash
   find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true
   ```

---

## 📋 Query Reference

### **Correct Queries (sudah diimplementasikan):**

```sql
-- ✅ Flora (has deleted_at)
SELECT COUNT(*) FROM flora 
WHERE park_id = :park_id 
AND status = 'approved' 
AND deleted_at IS NULL

-- ✅ Fauna (has deleted_at)
SELECT COUNT(*) FROM fauna 
WHERE park_id = :park_id 
AND status = 'approved' 
AND deleted_at IS NULL

-- ✅ Activities (NO deleted_at, only rejected_at)
SELECT COUNT(*) FROM activities 
WHERE park_id = :park_id 
AND status = 'approved'
-- Note: No deleted_at filter needed for activities
```

### **Debug Queries (correct column names):**

```sql
-- ✅ Flora debug
SELECT id, scientific_name, status, deleted_at FROM flora 
WHERE park_id = :park_id

-- ✅ Fauna debug
SELECT id, scientific_name, status, deleted_at FROM fauna 
WHERE park_id = :park_id

-- ✅ Activities debug
SELECT id, title, status, rejected_at FROM activities 
WHERE park_id = :park_id
```

---

## 🔄 Checklist Setelah Perbaikan

- [ ] Code sudah benar (verify dengan grep)
- [ ] Deploy ulang di Render
- [ ] Check backend logs untuk verify fix
- [ ] Test endpoint `/api/public/stats/park/{park_id}` di production
- [ ] Verify count yang ditampilkan sesuai dengan database

---

## ⚠️ Important Notes

1. **Tabel `activities` berbeda**:
   - ❌ Tidak punya `deleted_at`
   - ✅ Punya `rejected_at` (untuk rejected items)
   - ✅ Tidak ada soft delete, hanya workflow status

2. **Kolom nama ilmiah**:
   - ❌ `nama_ilmiah` - **TIDAK ADA**
   - ✅ `scientific_name` - **BENAR** (untuk flora dan fauna)

3. **Jika error masih terjadi setelah deploy**:
   - Check apakah ada file `.pyc` yang cached
   - Restart service di Render
   - Verify file yang ter-deploy adalah versi terbaru

---

**Status**: ✅ Fixed - Semua query sudah diperbaiki  
**Next**: Redeploy di Render dan verify logs

*Last Updated: 2025-01-XX*

