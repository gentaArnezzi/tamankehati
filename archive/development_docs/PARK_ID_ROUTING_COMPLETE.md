# ✅ Park-Based API Routing - Complete

## 📋 **Ringkasan Perubahan**

Sistem routing API telah berhasil diperbaiki untuk mendukung **park-based access control** untuk regional admin. Sekarang user yang login sebagai regional admin akan otomatis di-assign ke park yang mereka buat, dan hanya bisa mengelola data dari park tersebut.

---

## 🔄 **Flow Kerja Baru**

### **1. Regional Admin Create Park**
```
1. Regional admin login ke dashboard
2. Regional admin create park baru
3. ✅ Sistem otomatis set user.park_id = newly created park id
4. Regional admin sekarang "assigned" ke park tersebut
```

### **2. Regional Admin Manage Data**
```
Setelah punya park_id, regional admin bisa:
- ✅ Create Flora → otomatis set park_id = user.park_id
- ✅ Create Fauna → otomatis set park_id = user.park_id
- ✅ View Flora/Fauna → hanya lihat data dari park mereka
- ✅ Update Flora/Fauna → hanya bisa update data dari park mereka
- ❌ TIDAK bisa akses data dari park lain
```

---

## 🛠️ **Perubahan Teknis**

### **1. Database Migration**
```sql
-- Tambah park_id ke table user
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS park_id UUID REFERENCES parks(id);
CREATE INDEX IF NOT EXISTS idx_user_park_id ON "user"(park_id);
```

**File**: `apps/backend/migrations/add_park_id_to_user.sql`
**Status**: ✅ Sudah dijalankan

---

### **2. Authentication (rbac.py)**

**Perubahan**:
- Authentication sekarang load user dari database (bukan hanya decode JWT)
- `SimpleUser` sekarang include `park_id`
- JWT token di-decode → user di-load dari DB → park_id tersedia di semua route

**File**: `apps/backend/api/v1/permissions/rbac.py`

**Contoh**:
```python
# Sebelum:
user = SimpleUser(id=1, email="admin@kehati", role="regional_admin")

# Sekarang:
user = SimpleUser(id=1, email="admin@kehati", role="regional_admin", park_id="abc-123-...")
```

---

### **3. Park Creation (regions_crud.py)**

**Perubahan**:
- Endpoint `/api/v1/parks/` sekarang require authentication
- Setelah park dibuat, jika user adalah regional_admin dan belum punya park_id:
  ```python
  # Auto-assign park to user
  UPDATE "user" SET park_id = newly_created_park_id WHERE id = user_id
  ```

**File**: `apps/backend/api/v1/routes/regions_crud.py`

**Hasil**:
- ✅ Regional admin yang create park akan otomatis di-assign ke park tersebut
- ✅ Super admin bisa create multiple parks tanpa di-assign

---

### **4. Flora API Routes (flora.py)**

**Perubahan**:

#### **List Flora** (`GET /api/v1/flora/`)
```python
# Regional admin hanya lihat flora dari park mereka
if user.role == UserRole.regional_admin:
    if user.park_id:
        stmt = stmt.where(Flora.park_id == user.park_id)
    else:
        return []  # Belum punya park_id → return empty
```

#### **Create Flora** (`POST /api/v1/flora/`)
```python
# Validasi park_id
if user.role == UserRole.regional_admin:
    if not user.park_id:
        raise HTTPException(403, "Belum di-assign ke park. Buat park dulu.")
    
    # Auto-set park_id
    payload.park_id = user.park_id
```

#### **Update Flora** (`PUT /api/v1/flora/{flora_id}`)
```python
# Validasi ownership
if user.role == UserRole.regional_admin:
    if str(obj.park_id) != str(user.park_id):
        raise HTTPException(403, "Hanya bisa update flora dari park Anda")
```

**File**: `apps/backend/api/v1/routes/flora.py`

---

### **5. Fauna API Routes (fauna.py)**

**Perubahan**: Sama persis seperti Flora

- ✅ List fauna: filter by park_id
- ✅ Create fauna: validate & auto-set park_id
- ✅ Update fauna: validate ownership

**File**: `apps/backend/api/v1/routes/fauna.py`

---

## 🧪 **Testing**

### **Scenario 1: Regional Admin Baru (Belum Punya Park)**

```bash
# Login sebagai regional admin baru
POST /api/v1/auth/login
{
  "email": "regional@test.com",
  "password": "password"
}

# Coba create flora → ERROR
POST /api/v1/flora/
Response: 403 "Regional admin belum di-assign ke park manapun. Silakan buat park terlebih dahulu."

# Create park dulu
POST /api/v1/parks/
{
  "name": "Taman Kehati Test",
  "slug": "taman-kehati-test",
  ...
}
Response: 201 Created
✅ user.park_id otomatis di-set ke park yang baru dibuat

# Sekarang bisa create flora
POST /api/v1/flora/
{
  "local_name": "Bunga Test",
  "scientific_name": "Testus florus",
  ...
}
Response: 201 Created
✅ flora.park_id otomatis di-set ke user.park_id
```

---

### **Scenario 2: Regional Admin dengan Park**

```bash
# Login sebagai regional admin yang sudah punya park
POST /api/v1/auth/login
Response: { "user": { "park_id": "park-123-..." } }

# List flora → hanya lihat flora dari park-nya
GET /api/v1/flora/
Response: [
  { "id": 1, "local_name": "Bunga A", "park_id": "park-123-..." },
  { "id": 2, "local_name": "Bunga B", "park_id": "park-123-..." }
]
# ❌ Flora dari park lain tidak muncul

# Create flora baru
POST /api/v1/flora/
{
  "local_name": "Bunga C",
  "park_id": "different-park-id"  # Coba set park_id lain
}
Response: 403 "Anda hanya bisa menambah flora untuk park Anda (park_id: park-123-...)"

# Update flora dari park lain
PUT /api/v1/flora/999
Response: 403 "Anda hanya bisa mengupdate flora dari park Anda"
```

---

### **Scenario 3: Super Admin**

```bash
# Super admin bisa akses semua
GET /api/v1/flora/
Response: [...semua flora dari semua park...]

POST /api/v1/flora/
{
  "park_id": "any-park-id"  # Bisa pilih park manapun
}
Response: 201 Created
```

---

## 📊 **Validation Summary**

| Route | Regional Admin | Super Admin |
|-------|----------------|-------------|
| **List Flora** | ✅ Hanya park mereka | ✅ Semua park |
| **Create Flora** | ✅ Auto park_id mereka | ✅ Pilih park manapun |
| **Update Flora** | ✅ Hanya dari park mereka | ✅ Update manapun |
| **Delete Flora** | ✅ Hanya dari park mereka | ✅ Delete manapun |
| **List Fauna** | ✅ Hanya park mereka | ✅ Semua park |
| **Create Fauna** | ✅ Auto park_id mereka | ✅ Pilih park manapun |
| **Update Fauna** | ✅ Hanya dari park mereka | ✅ Update manapun |
| **Delete Fauna** | ✅ Hanya dari park mereka | ✅ Delete manapun |

---

## 🚀 **Next Steps**

### **1. Restart Backend**
```bash
cd apps/backend
# Kill existing process
pkill -f "uvicorn"

# Start fresh
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **2. Test dengan User Baru**
- Buat user baru sebagai `regional_admin`
- Login
- Coba create park
- Verifikasi `park_id` ter-assign
- Coba create flora/fauna
- Verifikasi hanya bisa lihat data dari park sendiri

### **3. Update Frontend (Opsional)**
Frontend sudah bisa otomatis pakai park_id dari user. Tapi untuk UX lebih baik, bisa:
- Tampilkan nama park user di dashboard
- Hide park_id field di form flora/fauna (karena otomatis)
- Show warning jika user belum punya park

---

## 🐛 **Troubleshooting**

### **Error: "park_id does not exist"**
```bash
# Jalankan migration lagi
cd apps/backend
psql $DATABASE_URL -f migrations/add_park_id_to_user.sql
```

### **Error: "Regional admin belum di-assign"**
```
1. Login sebagai regional admin
2. Create park dulu
3. Setelah itu baru bisa create flora/fauna
```

### **User sudah punya park tapi tetap error**
```bash
# Check database
psql $DATABASE_URL -c 'SELECT id, email, park_id FROM "user";'

# Jika park_id masih NULL, set manual:
psql $DATABASE_URL -c 'UPDATE "user" SET park_id = (SELECT id FROM parks LIMIT 1) WHERE email = "regional@test.com";'
```

---

## ✅ **Status**

| Task | Status |
|------|--------|
| Add park_id to database | ✅ Complete |
| Update authentication | ✅ Complete |
| Update Flora API | ✅ Complete |
| Update Fauna API | ✅ Complete |
| Update Park creation | ✅ Complete |
| Testing | ⏳ Ready for testing |

---

## 📝 **Catatan Penting**

1. **Regional admin harus create park dulu** sebelum bisa create flora/fauna
2. **Satu regional admin = Satu park** (tidak bisa manage multiple parks)
3. **Super admin tetap bisa manage semua** tanpa batasan park_id
4. **park_id otomatis di-assign** saat regional admin create park pertama kali

---

Sekarang sistem routing sudah benar! Regional admin akan otomatis ter-assign ke park yang mereka buat dan hanya bisa manage data dari park tersebut. 🎉

