# 📸 Fitur Galeri Foto Taman

## 🎯 Overview

Fitur galeri foto untuk taman telah berhasil diimplementasikan, memungkinkan user untuk upload **banyak foto** untuk setiap taman, mirip dengan Flora dan Fauna.

## ✨ Fitur yang Ditambahkan

### 1. **Upload Multiple Images**
- User bisa upload **hingga 10 foto** untuk setiap taman
- Setiap foto maksimal **5MB**
- Preview langsung setelah dipilih
- Bisa hapus foto sebelum di-submit

### 2. **Foto Utama + Galeri**
- **Foto Utama**: 1 foto landscape representatif taman
- **Galeri Foto**: Banyak foto tambahan untuk showcase taman

### 3. **Auto-Approve Gallery**
- Gallery foto taman otomatis **approved** (tidak perlu review terpisah)
- Langsung ditampilkan setelah upload

### 4. **Integrasi dengan Database**
- Menggunakan tabel `galleries` yang sudah ada
- `entity_type = 'park'` dan `entity_id = park_id`
- Relasi polymorphic dengan taman

## 🔧 Implementasi Teknis

### Frontend Changes

#### 1. **TamanSubmissionPage.tsx**
```typescript
// States
const [selectedFiles, setSelectedFiles] = useState<Array<{file: File; preview: string; id: string}>>([]);
const [uploadingGallery, setUploadingGallery] = useState(false);

// Functions
- uploadMultipleFiles()       // Upload semua file sekaligus
- handleGalleryFilesChange()  // Handle file selection
- submitGalleryImages()       // Create gallery entries in DB
```

**UI Component:**
```tsx
<MultipleFileUpload
  selectedFiles={selectedFiles}
  onFilesChange={handleGalleryFilesChange}
  maxFiles={10}
  maxSize={5}
/>
```

#### 2. **ParkForm.tsx**
Implementasi yang sama dengan TamanSubmissionPage:
- States untuk gallery
- Upload functions
- UI component

### Backend

**Gallery Model** (sudah ada):
```python
class Gallery(Base):
    entity_type = Column(String(20))  # 'park'
    entity_id = Column(Integer)        # park.id
    image_url = Column(String(500))
    status = Column(String(20))        # 'approved'
```

**API Endpoint** (sudah ada):
- `POST /api/v1/crud/galleries/` - Create gallery entry
- `GET /api/v1/crud/galleries/?entity_type=park&entity_id={id}` - Get park gallery

## 📋 Alur Upload Galeri

### Create Park:
1. User pilih foto utama
2. User pilih galeri foto (drag & drop atau click)
3. Submit form → Park dibuat
4. Upload foto utama ke server
5. **Upload semua galeri foto ke server**
6. **Create gallery entries di database**
7. Success toast menunjukkan jumlah foto yang diupload

### Edit Park:
1. Load existing park data
2. (Future: Load existing gallery photos)
3. User bisa tambah foto baru ke galeri
4. Submit → Galeri baru ditambahkan ke yang sudah ada

## 🎨 UI/UX Features

### 1. **Drag & Drop**
- User bisa drag foto dari komputer
- Atau click untuk browse file

### 2. **Preview Grid**
- Semua foto ditampilkan dalam grid
- Hover untuk aksi (remove)
- X button untuk hapus foto

### 3. **Loading States**
```tsx
{uploadingGallery && (
  <p className="text-sm text-gray-500 flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    Mengupload galeri...
  </p>
)}
```

### 4. **Progress Feedback**
- Toast notification: "3 foto galeri berhasil ditambahkan"
- Error handling untuk setiap foto yang gagal

## 📊 Database Schema

### galleries Table
```sql
CREATE TABLE galleries (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  entity_type VARCHAR(20),  -- 'park'
  entity_id INTEGER,        -- park.id
  status VARCHAR(20),       -- 'approved'
  author_id INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Index:**
- `(entity_type, entity_id)` untuk query cepat

## 🚀 Cara Menggunakan

### 1. Create Taman dengan Galeri:
```
1. Buka /dashboard/taman
2. Isi form taman
3. Upload foto utama di section "Foto Utama Taman"
4. Upload galeri di section "Galeri Foto Taman (Opsional)"
   - Drag & drop atau click
   - Pilih hingga 10 foto
5. Click "Simpan sebagai Draft" atau "Submit untuk Review"
6. Galeri otomatis terupload
```

### 2. View Gallery:
```
Frontend dapat query gallery dengan:
GET /api/v1/crud/galleries/?entity_type=park&entity_id={park_id}
```

## 🔄 Future Enhancements

### 1. **Load Existing Gallery on Edit**
- Fetch gallery saat edit park
- Show existing photos
- Allow add/remove

### 2. **Gallery Reorder**
- Drag to reorder gallery photos
- Set priority/order number

### 3. **Gallery in Park Detail View**
- Display gallery in carousel
- Lightbox untuk full view
- Navigation antar foto

### 4. **Gallery Management**
- Bulk delete
- Bulk edit descriptions
- Set cover photo from gallery

## 📁 Files Modified

### Frontend:
1. `apps/frontend/src/components/taman/TamanSubmissionPage.tsx`
   - Added gallery states
   - Added gallery upload functions
   - Added gallery UI component

2. `apps/frontend/src/components/taman/ParkForm.tsx`
   - Same as TamanSubmissionPage

3. `apps/frontend/src/components/ui/multiple-file-upload.tsx`
   - Reused existing component (no changes)

### Backend:
- **No changes needed** - Gallery model dan API sudah support park!

## ✅ Testing Checklist

- [x] Upload 1 foto galeri
- [x] Upload multiple foto (2-10)
- [x] Remove foto sebelum submit
- [x] Upload dengan foto utama + galeri
- [x] Upload hanya foto utama (no gallery)
- [x] Error handling untuk file > 5MB
- [x] Error handling untuk > 10 files
- [ ] Edit park dan tambah galeri baru
- [ ] View gallery di park detail page

## 🎉 Result

User sekarang bisa:
✅ Upload **foto utama** taman (1 foto)  
✅ Upload **galeri foto** taman (hingga 10 foto)  
✅ Preview semua foto sebelum submit  
✅ Hapus foto yang tidak diinginkan  
✅ Galeri otomatis approved dan tersimpan di database  

---

**Status**: ✅ **IMPLEMENTED & WORKING**  
**Date**: October 29, 2025  
**Version**: 1.0

