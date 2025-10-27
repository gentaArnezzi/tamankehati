# ✅ Submission-Based Workflow - Complete

## 🔄 **Flow yang Benar (Submission-Based)**

Sistem sekarang menggunakan **submission-based workflow** di mana:
1. User create park → status="draft", `created_by`=user.id
2. Super admin approve park → status="approved", `user.park_id` di-set
3. User create flora/fauna → `submitted_by`=user.id, `park_id`=user.park_id
4. Dashboard regional admin → tampilkan data yang `submitted_by`=user.id

---

## 📋 **Flow Lengkap**

### **1️⃣ Regional Admin Create Park**

```
1. Regional admin login
2. Create park baru
   - Park status = "draft" (pending approval)
   - Park created_by = user.id
   - User.park_id masih NULL (belum assigned)
3. Park masuk queue approval untuk super admin
```

**API Endpoint**: `POST /api/v1/parks/`

**Validasi**:
- ✅ Satu user hanya bisa create 1 park
- ✅ Jika user sudah punya park, error: "Anda sudah memiliki taman"
- ✅ Park otomatis status="draft"

---

### **2️⃣ Super Admin Approve Park**

```
1. Super admin lihat park yang pending approval
2. Super admin approve park
   - Park status = "approved"
   - Park approved_by = super_admin.id
   - Park approved_at = now()
   - ✅ USER.PARK_ID = approved_park.id (auto-assigned!)
3. Sekarang user punya park_id dan bisa create flora/fauna
```

**API Endpoint**: `POST /api/v1/parks/{park_id}/approve`

**Yang Terjadi**:
```sql
-- 1. Update park status
UPDATE parks 
SET status = 'approved', approved_by = :super_admin_id, approved_at = NOW()
WHERE id = :park_id;

-- 2. Assign park_id ke user
UPDATE "user"
SET park_id = :park_id, updated_at = NOW()
WHERE id = (SELECT created_by FROM parks WHERE id = :park_id);
```

---

### **3️⃣ Regional Admin Create Flora/Fauna**

```
1. Regional admin sudah punya park_id (setelah park approved)
2. Regional admin create flora/fauna
   - flora.park_id = user.park_id (auto-set)
   - flora.submitted_by = user.id (auto-set)
   - flora.status = "draft"
3. Flora/fauna masuk ke dashboard regional admin
```

**API Endpoint**: 
- `POST /api/v1/flora/`
- `POST /api/v1/fauna/`

**Validasi**:
- ❌ Jika user belum punya park_id → Error: "Silakan buat dan submit park terlebih dahulu"
- ✅ Jika user sudah punya park_id → Flora/fauna di-create dengan:
  - `park_id = user.park_id`
  - `submitted_by = user.id`

---

### **4️⃣ Dashboard Regional Admin**

```
Regional admin dashboard menampilkan data yang:
- ✅ submitted_by = user.id (data yang user submit sendiri)
- ❌ BUKAN filter by park_id
```

**API Endpoint**:
- `GET /api/v1/flora/` → filter by `submitted_by=user.id`
- `GET /api/v1/fauna/` → filter by `submitted_by=user.id`
- `GET /api/v1/parks/` → filter by `created_by=user.id`

**SQL Query**:
```sql
-- Flora list untuk regional admin
SELECT * FROM flora 
WHERE submitted_by = :user_id
AND deleted_at IS NULL;

-- Fauna list untuk regional admin
SELECT * FROM fauna
WHERE submitted_by = :user_id
AND deleted_at IS NULL;

-- Parks list untuk regional admin
SELECT * FROM parks
WHERE created_by = :user_id;
```

---

## 🛠️ **Perubahan Teknis Detail**

### **1. Authentication (rbac.py)**

**Perubahan**:
- Added `rollback()` untuk handle failed transaction
- User object sekarang include `park_id` dari database

**Code**:
```python
try:
    result = await db.execute(
        text('SELECT id, email, name, role, region, regionid, park_id FROM "user" WHERE id = :user_id'),
        {"user_id": user_id}
    )
    row = result.fetchone()
    if row:
        return SimpleUser(
            id=row[0],
            email=row[1],
            role=role,
            park_id=row[6]  # park_id from database
        )
except Exception as e:
    await db.rollback()  # ✅ Rollback failed transaction
    # Fallback to JWT
```

---

### **2. Park Creation (regions_crud.py)**

**Perubahan**:
- ❌ TIDAK auto-assign `park_id` ke user saat create
- ✅ Validasi: satu user hanya bisa create 1 park
- ✅ Park status selalu "draft" (waiting approval)

**Code**:
```python
@router.post("/parks/")
async def create_park(...):
    # Check if user already has a park
    if user.role == UserRole.regional_admin:
        check_user_park = await db.execute(
            text('SELECT id FROM parks WHERE created_by = :user_id'),
            {"user_id": str(user.id)}
        )
        if check_user_park.fetchone():
            raise HTTPException(400, "Anda sudah memiliki taman")
    
    # Create park with status="draft"
    result = await db.execute(text("""
        INSERT INTO parks (name, slug, status, created_by, ...)
        VALUES (:name, :slug, 'draft', :created_by, ...)
    """), {...})
    
    # ❌ TIDAK assign park_id ke user di sini
    # ✅ park_id akan di-assign saat super_admin approve
```

---

### **3. Park Approval (parks_crud.py)**

**Perubahan**:
- ✅ Saat approve, update `user.park_id = park.id`
- ✅ User sekarang bisa create flora/fauna

**Code**:
```python
@router.post("/{park_id}/approve")
async def approve_park(...):
    # Update park status
    park.status = "approved"
    park.approved_by = user.id
    park.approved_at = datetime.utcnow()
    
    # ✅ ASSIGN park_id ke user
    if park.created_by:
        update_user_query = """
            UPDATE "user"
            SET park_id = :park_id, updated_at = NOW()
            WHERE id = :user_id
        """
        await db.execute(text(update_user_query), {
            "park_id": str(park.id),
            "user_id": str(park.created_by)
        })
    
    await db.commit()
```

---

### **4. Flora API (flora.py)**

**Perubahan**:

#### **List Flora** (`GET /api/v1/flora/`)
```python
# BEFORE: Filter by park_id
if user.role == UserRole.regional_admin:
    stmt = stmt.where(Flora.park_id == user.park_id)

# AFTER: Filter by submitted_by
if user.role == UserRole.regional_admin:
    stmt = stmt.where(Flora.submitted_by == user.id)
```

#### **Create Flora** (`POST /api/v1/flora/`)
```python
# Validasi park_id
if user.role == UserRole.regional_admin:
    if not user.park_id:
        raise HTTPException(403, "Belum di-assign ke park. Buat park dulu.")
    payload.park_id = user.park_id  # Auto-set

# Insert dengan submitted_by
result = await db.execute(text("""
    INSERT INTO flora (..., submitted_by, ...)
    VALUES (..., :submitted_by, ...)
"""), {
    ...,
    "submitted_by": user.id  # ✅ Set submitted_by
})
```

#### **Update Flora** (`PUT /api/v1/flora/{id}`)
```python
# BEFORE: Validasi by park_id
if obj.park_id != user.park_id:
    raise HTTPException(403, "Tidak punya akses")

# AFTER: Validasi by submitted_by
if obj.submitted_by != user.id:
    raise HTTPException(403, "Hanya bisa update flora yang Anda submit")
```

---

### **5. Fauna API (fauna.py)**

**Perubahan**: Sama persis seperti Flora

- ✅ List fauna: filter by `submitted_by=user.id`
- ✅ Create fauna: set `submitted_by=user.id`
- ✅ Update fauna: validate `submitted_by=user.id`

---

## 🧪 **Testing Scenarios**

### **Scenario 1: New Regional Admin**

```bash
# 1. Login sebagai regional admin baru
POST /api/v1/auth/login
{ "email": "regional@test.com", "password": "password" }

# 2. Coba create flora → ERROR
POST /api/v1/flora/ {...}
Response: 403 "Silakan buat dan submit park terlebih dahulu"

# 3. Create park
POST /api/v1/parks/
{ "name": "Taman Test", "slug": "taman-test", ... }
Response: 201 Created
✅ Park status="draft", created_by=user.id
❌ User.park_id masih NULL

# 4. Coba create flora lagi → MASIH ERROR
POST /api/v1/flora/ {...}
Response: 403 "Belum di-assign ke park"

# 5. Super admin approve park
POST /api/v1/parks/{park_id}/approve
Response: 200 OK
✅ Park status="approved"
✅ User.park_id = park.id

# 6. Sekarang bisa create flora
POST /api/v1/flora/
{ "local_name": "Bunga Test", ... }
Response: 201 Created
✅ flora.park_id = user.park_id
✅ flora.submitted_by = user.id
```

---

### **Scenario 2: Regional Admin dengan Park Approved**

```bash
# Login sebagai regional admin yang sudah punya park_id
POST /api/v1/auth/login
Response: { "user": { "park_id": "abc-123-..." } }

# List flora → hanya lihat yang submitted_by user
GET /api/v1/flora/
Response: [
  { "id": 1, "local_name": "Bunga A", "submitted_by": user.id },
  { "id": 2, "local_name": "Bunga B", "submitted_by": user.id }
]
# ❌ Flora dari user lain TIDAK muncul

# Create flora baru
POST /api/v1/flora/
{ "local_name": "Bunga C", ... }
Response: 201 Created
✅ flora.park_id = user.park_id (auto)
✅ flora.submitted_by = user.id (auto)

# Coba update flora user lain
PUT /api/v1/flora/999
Response: 403 "Hanya bisa update flora yang Anda submit"
```

---

### **Scenario 3: Coba Create Park Kedua**

```bash
# Regional admin sudah punya 1 park
POST /api/v1/parks/
{ "name": "Taman Kedua", ... }
Response: 400 "Anda sudah memiliki taman. Satu user hanya bisa membuat satu taman."
```

---

## 📊 **Database Schema**

### **Table: user**
```sql
CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role user_role NOT NULL,
    park_id UUID REFERENCES parks(id),  -- ✅ Added
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Table: parks**
```sql
CREATE TABLE parks (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    status content_status DEFAULT 'DRAFT',
    created_by UUID REFERENCES users(id),  -- ✅ Who created this park
    approved_by UUID,
    approved_at TIMESTAMP,
    ...
);
```

### **Table: flora**
```sql
CREATE TABLE flora (
    id SERIAL PRIMARY KEY,
    park_id INTEGER REFERENCES parks(id),
    local_name VARCHAR,
    scientific_name VARCHAR,
    submitted_by INTEGER REFERENCES users(id),  -- ✅ Who submitted this flora
    status VARCHAR DEFAULT 'draft',
    ...
);
```

### **Table: fauna**
```sql
CREATE TABLE fauna (
    id SERIAL PRIMARY KEY,
    park_id INTEGER REFERENCES parks(id),
    local_name VARCHAR,
    scientific_name VARCHAR,
    submitted_by INTEGER REFERENCES users(id),  -- ✅ Who submitted this fauna
    status VARCHAR DEFAULT 'draft',
    ...
);
```

---

## 🔍 **Key Concepts**

| Concept | Penjelasan |
|---------|-----------|
| **created_by** | User yang create park |
| **submitted_by** | User yang submit flora/fauna |
| **park_id (user table)** | Park yang di-assign ke user (setelah approved) |
| **park_id (flora/fauna table)** | Park yang "owns" flora/fauna |

### **Perbedaan `park_id` vs `submitted_by`**

```
Park A: created_by = User1, approved
  ├── User1.park_id = Park A (after approval)
  ├── Flora 1: park_id=Park A, submitted_by=User1 ✅
  ├── Flora 2: park_id=Park A, submitted_by=User1 ✅
  └── Fauna 1: park_id=Park A, submitted_by=User1 ✅

Park B: created_by = User2, approved
  ├── User2.park_id = Park B (after approval)
  ├── Flora 3: park_id=Park B, submitted_by=User2 ✅
  └── Fauna 2: park_id=Park B, submitted_by=User2 ✅

Dashboard Regional Admin (User1):
  - Lihat flora/fauna WHERE submitted_by = User1
  - Result: Flora 1, Flora 2, Fauna 1
  - TIDAK lihat Flora 3, Fauna 2 (milik User2)
```

---

## ✅ **Summary**

| Task | Status |
|------|--------|
| Fix authentication rollback | ✅ Complete |
| Update park creation (no auto-assign) | ✅ Complete |
| Update park approval (assign park_id) | ✅ Complete |
| Update Flora filter (submitted_by) | ✅ Complete |
| Update Flora create (set submitted_by) | ✅ Complete |
| Update Flora update (validate submitted_by) | ✅ Complete |
| Update Fauna filter (submitted_by) | ✅ Complete |
| Update Fauna create (set submitted_by) | ✅ Complete |
| Update Fauna update (validate submitted_by) | ✅ Complete |

---

## 🚀 **Next Steps**

1. **Restart Backend**:
```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_23/tamankehati_21/apps/backend
pkill -f uvicorn
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Test Flow**:
   - Login sebagai regional admin
   - Create park → verify status="draft"
   - Login sebagai super admin
   - Approve park → verify user.park_id updated
   - Login kembali sebagai regional admin
   - Create flora/fauna → verify otomatis submitted_by
   - Verify dashboard hanya tampil data submitted_by user

3. **Frontend Update** (optional):
   - Hide park_id field di form (karena auto-set)
   - Show message jika user belum punya park: "Silakan create park terlebih dahulu"
   - Show park approval status di dashboard

---

Sekarang sistem sudah menggunakan **submission-based workflow** yang benar! 🎉

