# 🔍 Park Stats Count Salah - Troubleshooting

**Masalah**: Jumlah flora, fauna, atau kegiatan di halaman detail taman menampilkan angka yang salah (misalnya 4 padahal seharusnya 3).

---

## ✅ Perbaikan yang Sudah Dilakukan

### **1. Filter `deleted_at IS NULL` Ditambahkan**

Query di endpoint `/api/public/stats/park/{park_id}` sudah diperbaiki untuk exclude deleted records untuk **Flora, Fauna, dan Activities**:

**Sebelum:**
```sql
-- ❌ Flora
SELECT COUNT(*) FROM flora 
WHERE park_id = :park_id AND status = 'approved'

-- ❌ Fauna  
SELECT COUNT(*) FROM fauna 
WHERE park_id = :park_id AND status = 'approved'

-- ❌ Activities
SELECT COUNT(*) FROM activities 
WHERE park_id = :park_id AND status = 'approved'
```

**Sesudah:**
```sql
-- ✅ Flora
SELECT COUNT(*) FROM flora 
WHERE park_id = :park_id 
AND status = 'approved' 
AND deleted_at IS NULL

-- ✅ Fauna
SELECT COUNT(*) FROM fauna 
WHERE park_id = :park_id 
AND status = 'approved' 
AND deleted_at IS NULL

-- ✅ Activities (Kegiatan)
SELECT COUNT(*) FROM activities 
WHERE park_id = :park_id 
AND status = 'approved' 
AND deleted_at IS NULL
```

### **2. Debug Logging Ditambahkan**

Endpoint sekarang log semua **Flora, Fauna, dan Activities** untuk park tertentu untuk membantu troubleshooting:

```
🔍 Debug - Park {park_id} flora count breakdown:
   Total flora (all status): X
   Approved & not deleted: Y
   Query result: Z
   - ID: 1, Nama: ..., Status: approved, active
   - ID: 2, Nama: ..., Status: draft, active
   - ...

🔍 Debug - Park {park_id} fauna count breakdown:
   Total fauna (all status): X
   Approved & not deleted: Y
   Query result: Z
   - ID: 1, Nama: ..., Status: approved, active
   - ...

🔍 Debug - Park {park_id} activities count breakdown:
   Total activities (all status): X
   Approved & not deleted: Y
   Query result: Z
   - ID: 1, Title: ..., Status: approved, active
   - ...
```

---

## 🔍 Cara Debugging

### **Step 1: Check Server Logs**

Setelah deploy, akses halaman detail taman dan lihat logs di Render.com:

1. Render Dashboard → Your Service → Logs
2. Cari log yang dimulai dengan `🔍 Debug - Park`
3. Lihat breakdown semua flora untuk park tersebut

**Yang perlu dicek:**
- Apakah ada flora/fauna/activities dengan `status != 'approved'` yang terhitung?
- Apakah ada flora/fauna/activities dengan `deleted_at IS NOT NULL` yang terhitung?
- Apakah jumlah `Approved & not deleted` sama dengan yang ditampilkan?
- Check semua tiga breakdown: flora, fauna, dan activities

### **Step 2: Check Database Langsung**

Jika punya akses ke database:

```sql
-- Check semua flora untuk park tertentu
SELECT 
    id, 
    nama_ilmiah, 
    status, 
    deleted_at,
    park_id
FROM flora 
WHERE park_id = <PARK_ID>
ORDER BY id;

-- Check count yang benar untuk Flora
SELECT COUNT(*) 
FROM flora 
WHERE park_id = <PARK_ID>
AND status = 'approved' 
AND deleted_at IS NULL;

-- Check count yang benar untuk Fauna
SELECT COUNT(*) 
FROM fauna 
WHERE park_id = <PARK_ID>
AND status = 'approved' 
AND deleted_at IS NULL;

-- Check count yang benar untuk Activities (Kegiatan)
SELECT COUNT(*) 
FROM activities 
WHERE park_id = <PARK_ID>
AND status = 'approved' 
AND deleted_at IS NULL;
```

### **Step 3: Verify Query Consistency**

Pastikan semua endpoint menggunakan filter yang sama:

✅ **`/api/public/stats/park/{park_id}`** - Sudah fixed
✅ **`/api/public/parks/{park_id}`** - Sudah benar (line 211 di `parks_simple.py`)

---

## 🐛 Kemungkinan Penyebab

### **1. Data dengan Status Bukan 'approved'**
- Ada flora/fauna/activities dengan status `draft`, `in_review`, atau `rejected` yang terhitung
- **Fix**: Query sudah filter `status = 'approved'` ✅ (untuk flora, fauna, dan activities)

### **2. Data yang Sudah Di-Delete (Soft Delete)**
- Ada flora/fauna/activities dengan `deleted_at IS NOT NULL` yang masih terhitung
- **Fix**: Query sudah filter `deleted_at IS NULL` ✅ (untuk flora, fauna, dan activities)

### **3. Duplikasi Data**
- Ada flora/fauna/activities dengan `park_id` yang sama muncul lebih dari sekali
- **Check**: Lihat debug logs untuk ID yang sama

### **4. Inconsistent Query Between Endpoints**
- Endpoint `/api/public/stats/park/{id}` dan `/api/public/parks/{id}` menggunakan query berbeda
- **Fix**: Kedua endpoint sekarang konsisten ✅

### **5. Caching Issue**
- Data stats di-cache dan belum update
- **Fix**: Clear cache atau tunggu revalidate (5 menit)

### **6. Fallback Data dari Endpoint Lain**
- Jika `/api/public/stats/park/{id}` gagal, frontend fallback ke `taman.statistik?.flora`
- Endpoint `/api/public/parks/{id}` mungkin punya query berbeda
- **Fix**: Pastikan kedua endpoint konsisten ✅

---

## ✅ Verifikasi

Setelah deploy perbaikan:

1. **Clear Browser Cache**
   - Hard refresh: `Cmd + Shift + R` (Mac) atau `Ctrl + Shift + R` (Windows)

2. **Check Server Logs**
   - Lihat debug output untuk park yang bermasalah
   - Verify count breakdown

3. **Check Frontend**
   - Refresh halaman detail taman
   - Verify angka yang ditampilkan sesuai dengan database

4. **Jika Masih Salah:**
   - Check apakah ada flora/fauna/activities yang seharusnya di-delete tapi belum
   - Check apakah ada flora/fauna/activities dengan status yang salah
   - Lihat debug logs untuk detail (ada 3 breakdown: flora, fauna, activities)

---

## 📋 Query Reference

**Correct Query (sudah diimplementasikan untuk semua):**

```sql
-- ✅ Flora
SELECT COUNT(*) 
FROM flora 
WHERE park_id = :park_id 
AND status = 'approved' 
AND deleted_at IS NULL

-- ✅ Fauna
SELECT COUNT(*) 
FROM fauna 
WHERE park_id = :park_id 
AND status = 'approved' 
AND deleted_at IS NULL

-- ✅ Activities (Kegiatan)
SELECT COUNT(*) 
FROM activities 
WHERE park_id = :park_id 
AND status = 'approved' 
AND deleted_at IS NULL
```

**Incorrect Query (OLD - jangan pakai):**
```sql
-- ❌ Missing: AND deleted_at IS NULL
SELECT COUNT(*) 
FROM flora 
WHERE park_id = :park_id 
AND status = 'approved'
```

---

**Status**: ✅ Fixed - Query sudah diperbaiki dan logging ditambahkan  
**Next**: Check server logs setelah deploy untuk melihat breakdown flora count

*Last Updated: 2025-01-XX*

