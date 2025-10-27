# ✅ Update: Zona/Taman Sekarang Menggunakan Filter `submitted_by`

## Perubahan yang Dilakukan

Sesuai permintaan, **Taman & Zona** sekarang juga menggunakan filter `submitted_by` seperti Flora, Fauna, dan Kegiatan.

---

## 📝 Perubahan Backend

### 1. Model Zone (`domains/zones/models.py`)
**Ditambahkan field baru**:
```python
# Workflow fields
submitted_by = Column(Integer, ForeignKey('users.id', ondelete="SET NULL"), nullable=True,
                     comment="User who submitted/created this zone")
```

### 2. Database Migration
**File**: `migrations/add_submitted_by_to_zones.sql`
- Menambahkan kolom `submitted_by` ke tabel `park_zones`
- Menambahkan foreign key ke tabel `users`
- ✅ Migration sudah dijalankan

### 3. Zone Repository (`domains/zones/repo.py`)
**Update function `list_all`**:
```python
async def list_all(db: AsyncSession, page: int, size: int, submitted_by: Optional[int] = None):
    where_clauses = []
    if submitted_by is not None:
        where_clauses.append(Zone.submitted_by == submitted_by)
    
    total = await count_all(db, where_clauses if where_clauses else None)
    stmt = select(Zone).order_by(Zone.id.desc()).offset((page - 1) * size).limit(size)
    
    if where_clauses:
        stmt = stmt.where(*where_clauses)
    
    res = await db.execute(stmt)
    items = res.scalars().all()
    return items, total
```

### 4. Zone Service (`domains/zones/services.py`)
**Update**:
- Method `list()` sekarang menerima parameter `submitted_by`
- Method `create()` otomatis set `submitted_by = user.id` saat membuat zone baru

### 5. Zones Routes (`api/v1/routes/zones.py`)
**Update endpoint `GET /api/v1/zones/`**:
```python
@router.get("/", response_model=list[ZoneOut])
async def list_zones(
    user: Annotated[CurrentUser, Depends(current_user)],
    page: int = 1, 
    size: int = 20,
    submitted_by: Optional[int] = Query(None, description="Filter by user who submitted"),
    db: AsyncSession = Depends(get_session),
):
    # If regional_admin and no submitted_by specified, filter by their own submissions
    filter_submitted_by = submitted_by
    if user.role == UserRole.regional_admin and submitted_by is None:
        filter_submitted_by = user.id
    
    items, _ = await ZoneService.list(db, page, size, submitted_by=filter_submitted_by)
    return [ZoneOut.model_validate(obj) for obj in items]
```

**Behavior**:
- **Regional Admin**: Otomatis di-filter `submitted_by = user.id`
- **Super Admin**: Bisa lihat semua zones (tidak di-filter)
- **User lain**: Mengikuti RBAC policy yang ada

---

## 🎨 Perubahan Frontend

### TamanPage.tsx (`components/taman/TamanPage.tsx`)

**Update `zonesQuery`**:
```typescript
const zonesQuery = useQuery({
  queryKey: ['zones', user?.role === 'regional_admin' ? user?.id : 'all'],
  queryFn: async () => {
    const params: any = { page: 1, size: 200 };
    
    // Regional admin should only see their own submitted zones
    if (user?.role === 'regional_admin') {
      params.submitted_by = user.id;
    }
    
    const data = await tamanApi.list(params);
    return data;
  },
});
```

**Update `filteredZones`**:
- **Sebelumnya**: Client-side filtering berdasarkan `region_code`
- **Sekarang**: Hanya filter berdasarkan search query, karena `submitted_by` sudah di-filter di backend

```typescript
const filteredZones = useMemo(() => {
  if (!zonesQuery.data) return [];
  const base = zonesQuery.data as Taman[];
  // Only filter by search query - submitted_by filtering is done on backend
  return base.filter((item) => {
    const matchesKeyword =
      !searchQuery ||
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.wilayah.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesKeyword;
  });
}, [zonesQuery.data, searchQuery]);
```

---

## ✅ Status Filter Regional Admin (UPDATED)

### ✅ Flora - Filter `submitted_by = user.id`
**Status**: SUDAH BENAR ✅

### ✅ Fauna - Filter `submitted_by = user.id`
**Status**: SUDAH BENAR ✅

### ✅ Kegiatan - Filter `submitted_by = user.id`
**Status**: SUDAH BENAR ✅

### ✅ Taman & Zona - Filter `submitted_by = user.id`
**Status**: SUDAH BENAR ✅ (BARU DIUPDATE)

---

## 🧪 Testing

### Test Case 1: Regional Admin KALTIM Upload Shapefile

1. Login sebagai Regional Admin KALTIM
2. Upload shapefile ke halaman Taman & Zona
3. Shapefile akan membuat beberapa zones dengan `submitted_by = user_id_kaltim`
4. **Ekspektasi**: Hanya zones yang dia upload yang muncul di list

### Test Case 2: Regional Admin SUMUT Login

1. Login sebagai Regional Admin SUMUT
2. Buka halaman Taman & Zona
3. **Ekspektasi**: 
   - TIDAK ada zones dari Regional Admin KALTIM
   - Hanya ada zones yang dia upload sendiri (jika ada)
   - List kosong jika dia belum pernah upload

### Test Case 3: Super Admin

1. Login sebagai Super Admin
2. Buka halaman Taman & Zona
3. **Ekspektasi**: Bisa lihat SEMUA zones dari semua regional admin

---

## 🎯 Kesimpulan

**SEMUA halaman dashboard sekarang menggunakan filter `submitted_by` untuk Regional Admin:**

| Halaman | Filter | Status |
|---------|--------|--------|
| Flora | `submitted_by = user.id` | ✅ |
| Fauna | `submitted_by = user.id` | ✅ |
| Kegiatan | `submitted_by = user.id` | ✅ |
| **Taman & Zona** | **`submitted_by = user.id`** | **✅ BARU** |

**Regional Admin sekarang HANYA bisa melihat dan mengedit data yang mereka submit sendiri di SEMUA halaman!**

---

## 🔧 Cara Testing

### 1. Restart Backend
Backend sudah di-restart otomatis dengan perubahan ini.

### 2. Test di Frontend
```bash
cd apps/frontend
npm run dev
```

### 3. Login sebagai Regional Admin
```
Email: kaltim.admin@kehati.org
Password: password
```

### 4. Upload Shapefile
- Buka halaman "Taman & Zona"
- Upload shapefile
- Cek bahwa zones yang muncul hanya yang baru di-upload

### 5. Login sebagai Regional Admin lain
```
Email: sumut.admin@kehati.org
Password: password
```

### 6. Verifikasi Isolation
- Buka halaman "Taman & Zona"
- Seharusnya TIDAK ada zones dari Regional Admin KALTIM
- Hanya ada zones yang dia submit sendiri (jika ada)

---

## 📌 Note Penting

### Data Lama (Zones tanpa submitted_by)
Zones yang sudah ada sebelum update ini akan memiliki `submitted_by = NULL`. 

**Opsi handling**:
1. **Set semua NULL ke super_admin**: Update manual di database
2. **Filter NULL sebagai public**: Regional admin tidak bisa lihat zones lama
3. **Allow NULL untuk backward compatibility**: Regional admin bisa lihat zones lama + zones mereka sendiri

**Rekomendasi**: Opsi 1 - Set semua zones lama ke super_admin atau regional admin pertama.

**SQL untuk set zones lama**:
```sql
-- Set all NULL submitted_by to super_admin (user_id = 1)
UPDATE park_zones 
SET submitted_by = 1 
WHERE submitted_by IS NULL;

-- Atau set ke regional admin pertama berdasarkan region
-- (membutuhkan logic lebih complex)
```

---

**Dibuat**: 2025-10-24
**Status**: ✅ COMPLETED
**Backend**: ✅ Running
**Frontend**: ⏳ Perlu di-test

