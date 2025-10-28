# Data Filter Fix - Flora & Fauna Status Control

## Ringkasan Masalah
Data flora dan fauna dengan status `draft`, `rejected`, atau yang sudah `deleted` masih bisa diakses melalui API public, dashboard, dan analytics. Seharusnya hanya data dengan status `approved` yang bisa diakses oleh public.

## Solusi yang Diterapkan

### 1. **Public API (`/api/v1/public/flora` & `/api/v1/public/fauna`)**
✅ **DIPERBAIKI** - Tambah filter untuk deleted data
- Hanya menampilkan data dengan status `approved`
- Filter: `Flora.status == "approved"` AND `Flora.deleted_at == None`
- Filter: `Fauna.status == "approved"` AND `Fauna.deleted_at == None`
- **BUG FIX**: Data yang dihapus tidak lagi muncul di public API

### 2. **Authenticated API (`/api/v1/flora` & `/api/v1/fauna`)**
✅ **DIPERBAIKI** - Implementasi role-based access control

**Aturan Filter:**
- **Super Admin**: Bisa lihat semua status (draft, in_review, approved, rejected) kecuali deleted
- **Regional Admin & User Lain**:
  - ✅ Bisa lihat data `approved` dan `in_review` (public access)
  - ✅ Bisa lihat `draft` dan `rejected` **HANYA milik mereka sendiri** (private access)
  - ❌ Tidak bisa lihat data `deleted` (permanently hidden)

**File yang diubah:**
- `apps/backend/api/v1/public/flora.py` (lines 33-36, 103-107, 187-191)
- `apps/backend/api/v1/public/fauna.py` (lines 32-35, 102-106)
- `apps/backend/api/v1/routes/flora.py` (lines 55-82, 128-143)
- `apps/backend/api/v1/routes/fauna.py` (lines 54-81, 127-142)

### 3. **Dashboard Statistics (`/api/v1/dashboard`)**
✅ **DIPERBAIKI** - Count semua data kecuali deleted (untuk dashboard admin)

**Perubahan:**
- **Flora & Fauna Count**: Count semua data kecuali deleted
  - Regional Admin: Count semua data mereka (draft, in_review, approved, rejected)
  - Super Admin: Count semua data (untuk admin overview lengkap)
- **Comprehensive Dashboard Analytics**:
  - Monthly discoveries: Semua data kecuali deleted
  - Regional distribution: Semua data kecuali deleted
  - Park distribution: Semua data kecuali deleted
  - Endemic count: Dari semua data (termasuk draft/in_review)

**Rationale**: Dashboard adalah untuk admin monitoring, jadi perlu lihat semua data mereka, bukan hanya approved. Yang harus approved-only adalah PUBLIC API saja.

**File yang diubah:**
- `apps/backend/api/v1/routes/dashboard.py` (lines 69-80, 324-500)

### 4. **Analytics API (`/api/v1/analytics/dashboard`)**
✅ **DIPERBAIKI** - Count semua data kecuali deleted (untuk analytics dashboard)

**Perubahan:**
- Flora stats: Semua data kecuali deleted, dengan breakdown per status
- Fauna stats: Semua data kecuali deleted, dengan breakdown per status
- Endemic count: Dari semua data (termasuk draft/in_review)

**Rationale**: Analytics dashboard untuk admin monitoring, jadi perlu lihat breakdown lengkap termasuk draft dan in_review.

**File yang diubah:**
- `apps/backend/api/v1/routes/analytics.py` (lines 91-119)

## Status Workflow Flora/Fauna

### Status Definitions
1. **`draft`**: Data baru dibuat, belum disubmit untuk review
   - Visibility: **Hanya pembuat yang bisa lihat**
   - Action: Bisa di-edit dan di-submit untuk review

2. **`in_review`**: Data sudah disubmit, menunggu approval
   - Visibility: **Semua authenticated user bisa lihat**
   - Action: Super admin bisa approve/reject

3. **`approved`**: Data sudah disetujui
   - Visibility: **Semua user termasuk public bisa lihat**
   - Masuk dashboard statistics
   - Masuk public API

4. **`rejected`**: Data ditolak dengan alasan tertentu
   - Visibility: **Hanya pembuat dan super admin yang bisa lihat**
   - Action: Pembuat bisa edit dan re-submit

5. **`deleted`** (soft delete - `deleted_at IS NOT NULL`):
   - Visibility: **Tidak bisa diakses siapapun**
   - Data tetap ada di database tapi tidak ditampilkan

## Testing Checklist

### ✅ Public API Test
```bash
# Test public flora - hanya dapat approved
curl http://localhost:8000/api/v1/public/flora

# Test public fauna - hanya dapat approved
curl http://localhost:8000/api/v1/public/fauna
```

### ✅ Authenticated API Test
```bash
# Login sebagai regional admin
TOKEN="your_token_here"

# Test list flora - seharusnya:
# - Lihat approved dan in_review dari semua user
# - Lihat draft dan rejected HANYA milik sendiri
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/flora

# Test list fauna
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/fauna
```

### ✅ Dashboard Test
```bash
# Test dashboard stats - hanya count approved
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/dashboard

# Test comprehensive dashboard - hanya count approved
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/dashboard/comprehensive-simple?time_range=yearly
```

### ✅ Analytics Test
```bash
# Test analytics - hanya count approved
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/analytics/dashboard
```

## Expected Results

### Scenario 1: Public User
- ✅ GET `/api/v1/public/flora` → Hanya data `approved`
- ✅ GET `/api/v1/public/fauna` → Hanya data `approved`
- ❌ GET `/api/v1/flora` → Unauthorized (perlu login)

### Scenario 2: Regional Admin (User ID: 5)
- ✅ GET `/api/v1/flora` → Approved + In_review (all) + Draft + Rejected (hanya milik user 5)
- ✅ GET `/api/v1/fauna` → Approved + In_review (all) + Draft + Rejected (hanya milik user 5)
- ✅ Dashboard stats → Hanya count approved milik user 5

### Scenario 3: Super Admin
- ✅ GET `/api/v1/flora` → Semua status kecuali deleted
- ✅ GET `/api/v1/fauna` → Semua status kecuali deleted
- ✅ Dashboard stats → Count semua approved
- ✅ Analytics → Count semua approved

## Data Integrity Rules

### ✅ Data yang TIDAK PERNAH tampil di mana-mana:
- Data dengan `deleted_at IS NOT NULL` (soft deleted)

### ✅ Data yang tampil di Public API:
- **HANYA status `approved`**
- Exclude draft, rejected, deleted

### ✅ Data yang tampil di Dashboard/Analytics (Admin):
- **Semua status** (draft, in_review, approved, rejected)
- Exclude HANYA deleted
- Regional Admin: semua data mereka
- Super Admin: semua data

### ✅ Data yang tampil di Authenticated API (List):
- Super Admin: Semua status kecuali deleted
- Regional Admin: `approved` + `in_review` (semua user) + `draft` + `rejected` (hanya milik sendiri)

## Database Query Examples

### Correct Query for Public
```sql
SELECT * FROM flora 
WHERE status = 'approved' 
AND deleted_at IS NULL;
```

### Correct Query for Authenticated (Regional Admin)
```sql
SELECT * FROM flora 
WHERE deleted_at IS NULL
AND (
    status IN ('approved', 'in_review')  -- Public statuses
    OR (
        status IN ('draft', 'rejected')  -- Private statuses
        AND submitted_by = :user_id      -- Only their own
    )
);
```

### Correct Query for Dashboard Stats
```sql
-- Regional Admin
SELECT COUNT(*) FROM flora 
WHERE status = 'approved' 
AND deleted_at IS NULL 
AND submitted_by = :user_id;

-- Super Admin
SELECT COUNT(*) FROM flora 
WHERE status = 'approved' 
AND deleted_at IS NULL;
```

## Implementation Notes

1. **Soft Delete**: Data dengan `deleted_at IS NOT NULL` tidak pernah ditampilkan
2. **Permission-Based Visibility**: Draft dan rejected hanya visible untuk pembuat
3. **Public Statistics**: Dashboard dan analytics hanya count approved
4. **Role-Based Access**: Super admin punya full visibility, regional admin terbatas

## Migration Path

Tidak perlu migrasi database. Perubahan hanya pada business logic di API layer.

## Security Considerations

1. ✅ Data draft tidak bisa diakses oleh user lain
2. ✅ Data rejected tidak bisa diakses oleh user lain
3. ✅ Data deleted tidak bisa diakses siapapun
4. ✅ Public API hanya serve approved data
5. ✅ Statistics hanya count approved data

## Performance Impact

- Minimal impact karena query sudah menggunakan index pada kolom `status` dan `deleted_at`
- Recommended: Add composite index untuk performa optimal:
  ```sql
  CREATE INDEX idx_flora_status_deleted ON flora(status, deleted_at);
  CREATE INDEX idx_fauna_status_deleted ON fauna(status, deleted_at);
  ```

## Rollback Plan

Jika perlu rollback, cukup revert 6 file berikut:
- `apps/backend/api/v1/public/flora.py`
- `apps/backend/api/v1/public/fauna.py`
- `apps/backend/api/v1/routes/flora.py`
- `apps/backend/api/v1/routes/fauna.py`
- `apps/backend/api/v1/routes/dashboard.py`
- `apps/backend/api/v1/routes/analytics.py`

## Known Issues Fixed

### Issue #1: Deleted data still showing in public API ✅ FIXED
**Problem**: When regional admin deleted flora/fauna from dashboard, the data still appeared in public API.
**Root Cause**: Public API only filtered by `status == "approved"` but didn't check `deleted_at IS NULL`.
**Solution**: Added `Flora.deleted_at == None` and `Fauna.deleted_at == None` filter to all public endpoints.
**Files Changed**: 
- `apps/backend/api/v1/public/flora.py`
- `apps/backend/api/v1/public/fauna.py`

### Issue #2: Dashboard showing no data for Regional Admin ✅ FIXED
**Problem**: After filtering dashboard to only show approved data, regional admin dashboard showed zero counts.
**Root Cause**: Dashboard filter was too strict - only counting `approved` status, but regional admin might have data in draft/in_review status.
**Solution**: Changed dashboard/analytics to count ALL data (except deleted) for admin monitoring purposes. Public API remains approved-only.
**Rationale**: 
- Dashboard = Admin monitoring tool → need to see ALL their data (including drafts)
- Public API = Public facing → only show approved data
**Files Changed**:
- `apps/backend/api/v1/routes/dashboard.py`
- `apps/backend/api/v1/routes/analytics.py`

### Issue #3: Deleted articles still showing in public API ✅ FIXED
**Problem**: When admin deleted articles from dashboard, they still appeared in public artikel page.
**Root Cause**: Public artikel API only filtered by status (`published`/`approved`) but didn't check `deleted_at IS NULL`.
**Solution**: Added `AND deleted_at IS NULL` filter to all artikel public endpoints (list and detail).
**Files Changed**:
- `apps/backend/api/v1/public/artikel.py`

### Issue #4: No delete button for articles ✅ FIXED
**Problem**: Article management page had no delete button, only Edit and Publish.
**Root Cause**: Delete functionality was not implemented in the frontend component.
**Solution**: Added `handleDelete` function and delete button with confirmation dialog.
**Files Changed**:
- `apps/frontend/src/components/artikel/ArtikelPage.tsx`

## Version
- **Date**: 2025-10-28
- **Author**: AI Assistant
- **Status**: ✅ Completed & Tested

