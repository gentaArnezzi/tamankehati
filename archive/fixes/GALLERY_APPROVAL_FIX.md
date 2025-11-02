# 🖼️ Gallery Approval Feature

## 📝 Summary

Galeri foto taman sekarang masuk ke **approval queue** super admin, sehingga super admin bisa review dan approve foto-foto yang diupload oleh regional admin.

## ✅ What's Fixed

### 1. **Grouped Approvals Endpoint**
File: `apps/backend/api/v1/routes/approvals.py`

**Added Gallery Query:**
```python
# Get galleries for parks (entity_type='park')
galleries_stmt = (
    select(Gallery, Park.name)
    .join(Park, Gallery.entity_id == Park.id)
    .where(
        Gallery.entity_type == 'park',
        Gallery.status.in_([GalleryStatus.draft.value, GalleryStatus.in_review.value]),
        Gallery.deleted_at.is_(None),
    )
)
```

**Result:**
- ✅ Galeri dengan `entity_type='park'` dan status `draft`/`in_review` muncul di approval queue
- ✅ Thumbnail preview menggunakan `gallery.image_url`
- ✅ Grouped by park

### 2. **Bulk Approval Support**

**Updated:**
```python
entity_types: Optional[List[Literal["flora", "fauna", "kegiatan", "galeri"]]] = None
```

**Added Bulk Approve Logic:**
```python
# Approve galleries (for park entity_type)
if "galeri" in entity_types:
    galleries_stmt = select(Gallery).where(
        Gallery.entity_type == 'park',
        Gallery.entity_id == request.park_id,
        Gallery.status.in_([GalleryStatus.draft.value, GalleryStatus.in_review.value]),
        Gallery.deleted_at.is_(None),
    )
    # ... approve all galleries
```

**Result:**
- ✅ Bulk approve semua galeri dari satu taman
- ✅ Counter `galeri_count` di approval summary

### 3. **Import Fix**

**Before:**
```python
from domains.articles.models import UserRole  # ❌ Wrong!
```

**After:**
```python
from users.models import User, UserRole  # ✅ Correct!
```

## 🎯 How It Works

### Regional Admin Workflow:

1. **Upload Galeri** di `/dashboard/taman`
   - Pilih taman
   - Upload galeri foto (max 10)
   - Submit

2. **Gallery Created**
   - Status: `draft` (for regional_admin)
   - `entity_type`: `park`
   - `entity_id`: `park_id`
   - Masuk ke approval queue

### Super Admin Workflow:

1. **Review Approval** di `/dashboard/approval`
   - Lihat grouped by park
   - Setiap park menampilkan:
     - Flora count
     - Fauna count
     - Kegiatan count
     - **Galeri count** ⭐ NEW!

2. **Preview Gallery**
   - Thumbnail foto ditampilkan
   - Click untuk lihat detail

3. **Approve**
   - **Individual**: Click "Setujui" per galeri
   - **Bulk**: Approve semua galeri dari 1 taman sekaligus

## 📊 Database Structure

```sql
-- Gallery for Park
entity_type = 'park'
entity_id = park.id
status = 'draft' | 'in_review' | 'approved'
image_url = 'https://...'
```

## 🚀 Endpoints

### Get Grouped Approvals
```
GET /api/v1/approvals/grouped
Response:
{
  groups: [
    {
      park_id: 1,
      park_name: "Taman Kehati X",
      items: [
        {
          entity_type: "galeri",
          entity_id: 123,
          title: "Taman X - Foto 1",
          status: "draft",
          thumbnail_url: "https://..."
        }
      ],
      galeri_count: 3  // NEW!
    }
  ]
}
```

### Bulk Approve
```
POST /api/v1/approvals/bulk-approve
Body:
{
  park_id: 1,
  entity_types: ["flora", "fauna", "kegiatan", "galeri"]
}
Response:
{
  approved_count: 10,
  failed_count: 0,
  details: {
    flora: 3,
    fauna: 2,
    kegiatan: 2,
    galeri: 3  // NEW!
  }
}
```

### Individual Approve
```
POST /api/v1/galleries/{gallery_id}/approve
```

## 🎨 Frontend Impact

**Approval Page** (`/dashboard/approval`):
- ✅ Shows gallery count per park
- ✅ Shows gallery thumbnails
- ✅ Can approve individually or in bulk
- ✅ Gallery items show in approval list

## ✅ Testing Steps

1. **Login as Regional Admin**
   - Create park or edit existing
   - Upload 3-5 gallery photos
   - Submit

2. **Login as Super Admin**
   - Go to `/dashboard/approval`
   - Should see park with `galeri_count: X`
   - Should see gallery items in list with thumbnails
   - Click "Setujui" to approve individual
   - Or click "Setujui Semua" to bulk approve

3. **Verify Approval**
   - Check gallery status changed to `approved`
   - Check photos visible in public view

## 🔧 Files Modified

1. **Backend:**
   - `apps/backend/api/v1/routes/approvals.py`
     - Added gallery query to `get_grouped_approvals()`
     - Added gallery support to `bulk_approve_by_park()`
     - Fixed `UserRole` import

## 📝 Notes

- Gallery approval works for **park entity_type only** (not flora/fauna galleries yet)
- Thumbnails use `gallery.image_url` 
- Auto-approve only works for super_admin
- Regional_admin galleries always start as `draft`

---

**Status**: ✅ **IMPLEMENTED & READY FOR TESTING**  
**Date**: October 29, 2025  
**Next**: Restart backend & test approval flow

