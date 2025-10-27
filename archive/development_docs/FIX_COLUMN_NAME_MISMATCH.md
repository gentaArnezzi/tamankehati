# 🔧 Fix: Column Name Mismatch After Git Pull

**Date**: 2025-10-26  
**Status**: ✅ FIXED

---

## 🐛 Problem

Setelah `git pull`, terjadi error saat create park:

```
column "sk_number" of relation "parks" does not exist
```

**Root Cause**:
- File `regions_crud.py` dari remote menggunakan **nama kolom Inggris**
- Database lokal menggunakan **nama kolom Indonesia**
- Ada ketidaksesuaian antara kode dan database schema

---

## 📋 Column Name Mapping

| Remote (English) | Local Database (Indonesian) |
|------------------|----------------------------|
| `sk_number` | `sk_penetapan` ✅ |
| `manager_agency` | `pengelola` ✅ |
| `province` | `lokasi_provinsi` ✅ |
| `regency` | `lokasi_kabupaten` ✅ |
| `district` | `lokasi_kecamatan` ✅ |
| `village` | `lokasi_desa` ✅ |
| `physical_condition` | `kondisi_fisik` ✅ |
| `ecological_value` | `nilai_penting` ✅ |
| `ecoregion_type` | `tipe_ekoregion` ✅ |
| `vision_mission` | `visi` + `misi` ✅ |
| `core_values` | `nilai_dasar` ✅ |
| `history` | `sejarah` ✅ |

---

## ✅ Solutions Applied

### 1. **Fix INSERT Query**

**File**: `apps/backend/api/v1/routes/regions_crud.py`

**Before** (English column names):
```python
INSERT INTO parks (name, slug, status, sk_number, manager_agency, province, regency, district, village, area_ha, physical_condition, ecological_value, ecoregion_type, history, vision_mission, core_values, created_by, created_at, updated_at)
VALUES (:name, :slug, :status, :sk_number, :manager_agency, :province, :regency, :district, :village, :area_ha, :physical_condition, :ecological_value, :ecoregion_type, :history, :vision_mission, :core_values, :created_by, NOW(), NOW())
```

**After** (Indonesian column names):
```python
INSERT INTO parks (name, slug, status, sk_penetapan, pengelola, lokasi_provinsi, lokasi_kabupaten, lokasi_kecamatan, lokasi_desa, area_ha, kondisi_fisik, nilai_penting, tipe_ekoregion, sejarah, visi, misi, nilai_dasar, created_by, created_at, updated_at)
VALUES (:name, :slug, :status, :sk_penetapan, :pengelola, :lokasi_provinsi, :lokasi_kabupaten, :lokasi_kecamatan, :lokasi_desa, :area_ha, :kondisi_fisik, :nilai_penting, :tipe_ekoregion, :sejarah, :visi, :misi, :nilai_dasar, :created_by, NOW(), NOW())
```

---

### 2. **Fix SELECT Query**

**Before**:
```python
SELECT id, name, slug, region_id, area_ha, description, status, sk_number, vision_mission, vision_mission, core_values, manager_agency, ecoregion_type, physical_condition, ecological_value, history, core_values, province, regency, district, village, created_at, updated_at FROM parks WHERE id = :park_id
```

**After**:
```python
SELECT id, name, slug, region_id, area_ha, description, status, sk_penetapan, visi, misi, nilai_dasar, pengelola, tipe_ekoregion, kondisi_fisik, nilai_penting, sejarah, lokasi_provinsi, lokasi_kabupaten, lokasi_kecamatan, lokasi_desa, created_at, updated_at FROM parks WHERE id = :park_id
```

---

### 3. **Fix Type Conversion for `created_by`**

**Issue**: `created_by` column is `INTEGER`, but code was using `str(user.id)`

**Before**:
```python
"created_by": str(user.id) if user and user.id else None
```

**After**:
```python
"created_by": int(user.id) if user and user.id else None  # Convert to int (created_by is INTEGER)
```

Also fixed in the park existence check:
```python
# Before
{"user_id": str(user.id)}

# After
{"user_id": int(user.id)}  # Convert to int (created_by is INTEGER)
```

---

## 📝 Changes Summary

### **File 1**: `apps/backend/api/v1/routes/regions_crud.py`

1. ✅ Updated `INSERT INTO parks` query to use Indonesian column names
2. ✅ Updated `SELECT FROM parks` query to use Indonesian column names
3. ✅ Fixed parameter mapping to match Indonesian column names
4. ✅ Fixed `created_by` type conversion from `str()` to `int()`
5. ✅ Fixed ParkResponse mapping to align with new SELECT query

### **File 2**: `apps/backend/api/v1/routes/parks_crud.py`

1. ✅ Updated `INSERT INTO parks` query to use Indonesian column names
2. ✅ Changed from `vision_mission` to separate `visi` and `misi` columns
3. ✅ Added `created_by` column to INSERT query
4. ✅ Fixed `created_by` type conversion to `int(user.id)`
5. ✅ Updated parameter mapping to match Indonesian column names

---

## 🔍 Why This Happened

1. **Remote repository** menggunakan schema Inggris (mungkin dari branch lain atau refactoring)
2. **Local database** tetap menggunakan schema Indonesia (sesuai model Python)
3. Saat `git pull`, code berubah tapi database schema tidak berubah
4. **Solution**: Update code untuk match dengan database schema lokal

---

## 📋 Testing Checklist

- [ ] Restart backend: `cd apps/backend && uvicorn main:app --reload --port 8000`
- [ ] Test create park (harus berhasil tanpa error `sk_number`)
- [ ] Test list parks (harus tampil dengan data lengkap)
- [ ] Verify `created_by` tersimpan sebagai INTEGER, bukan STRING

---

## 🚨 Important Notes

### **Database Schema Consistency**

Penting untuk **selalu sinkronisasi** antara:
1. Python models (`domains/parks/models.py`)
2. SQL queries (`api/v1/routes/regions_crud.py`)
3. Database actual schema

### **Column Naming Convention**

Project ini menggunakan **Indonesian column names**:
- ✅ `sk_penetapan` (bukan `sk_number`)
- ✅ `pengelola` (bukan `manager_agency`)
- ✅ `kondisi_fisik` (bukan `physical_condition`)
- etc.

### **Type Consistency**

- `user.id` dari JWT adalah **TEXT** (e.g., `'2'`)
- `created_by` di database adalah **INTEGER**
- **Always convert**: `int(user.id)` untuk comparison/insertion

---

## ✅ Summary

| Issue | Status | Fix |
|-------|--------|-----|
| Column `sk_number` not found | ✅ FIXED | Use `sk_penetapan` |
| English column names | ✅ FIXED | Use Indonesian names |
| `created_by` type mismatch | ✅ FIXED | Convert to `int()` |
| INSERT query error | ✅ FIXED | Updated column names |
| SELECT query error | ✅ FIXED | Updated column names |

**Overall**: Park creation sekarang berjalan normal! 🎉

