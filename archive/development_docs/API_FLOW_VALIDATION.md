# 🔐 API FLOW VALIDATION & SECURITY AUDIT
## Complete Endpoint Review with Role-Based Access Control

**Tanggal**: 25 Oktober 2025  
**Status**: 🔍 In Review

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Super Admin Endpoints](#super-admin-endpoints)
4. [Regional Admin Endpoints](#regional-admin-endpoints)
5. [Approval Flow](#approval-flow)
6. [Security Validation](#security-validation)
7. [Issues & Recommendations](#issues--recommendations)

---

## 🎯 OVERVIEW

### **Role Definitions**

| Role | Access Rights | Restrictions |
|------|--------------|--------------|
| **super_admin** | ✅ User Management<br>✅ Approval Queue (all regions)<br>✅ Announcement CRUD<br>✅ Article CRUD | ❌ Cannot create Taman<br>❌ Cannot create Flora/Fauna<br>❌ Cannot create Activities |
| **regional_admin** | ✅ Taman CRUD (own only)<br>✅ Flora CRUD (own parks only)<br>✅ Fauna CRUD (own parks only)<br>✅ Activities CRUD (own parks only) | ❌ Cannot access User Management<br>❌ Cannot access Approval Queue<br>❌ Cannot create Announcements<br>❌ Cannot create Articles<br>❌ Cannot see other admin's data |

---

## 🔐 AUTHENTICATION FLOW

### **Login Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER SUBMITS LOGIN                                           │
│    POST /api/v1/auth/login                                      │
│    Body: { email, password }                                    │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. BACKEND VALIDATES CREDENTIALS                                │
│    - Check email exists                                         │
│    - Verify password hash (bcrypt)                              │
│    - Check is_active = true                                     │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                    ┌──────┴──────┐
                    ↓             ↓
            [ VALID ]      [ INVALID ]
                ↓               ↓
┌───────────────────────┐  ┌────────────────────┐
│ 3. GENERATE JWT TOKEN │  │ Return 401         │
│    - user_id          │  │ "Invalid email or  │
│    - email            │  │  password"         │
│    - role             │  └────────────────────┘
│    - wilayah (if RA)  │
│    - exp: 24h         │
└───────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. RETURN TOKEN + USER DATA                                     │
│    Response: {                                                  │
│      access_token: "eyJ...",                                    │
│      token_type: "bearer",                                      │
│      user_id: 1,                                                │
│      email: "admin@kehati.org",                                 │
│      role: "super_admin",                                       │
│      nama: "Super Admin"                                        │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. FRONTEND STORES TOKEN                                        │
│    - localStorage.setItem('token', access_token)                │
│    - localStorage.setItem('user', JSON.stringify(user))         │
└─────────────────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. SUBSEQUENT REQUESTS INCLUDE TOKEN                            │
│    Headers: { Authorization: "Bearer eyJ..." }                  │
└─────────────────────────────────────────────────────────────────┘
```

**Endpoint**: `POST /api/v1/auth/login`  
**File**: `apps/backend/api/v1/routes/auth.py`  
**Security**: ✅ Password hashed with bcrypt  
**Token**: ✅ JWT with 24h expiration

---

## 👑 SUPER ADMIN ENDPOINTS

### **1. USER MANAGEMENT**

#### **List Users**
```
GET /api/v1/users/
Authorization: Bearer {token}
Role Required: super_admin
```

**Flow**:
```
Request → Verify JWT → Check role == super_admin → Query all users → Return list
```

**Security Checks**:
- ✅ JWT validation
- ✅ Role check: `require_roles(UserRole.super_admin)`
- ✅ No data leakage (passwords hashed)

**Response**:
```json
{
  "items": [
    {
      "id": 1,
      "email": "admin@kehati.org",
      "role": "super_admin",
      "is_active": true
    }
  ],
  "total": 10
}
```

---

#### **Create User**
```
POST /api/v1/users/
Authorization: Bearer {token}
Role Required: super_admin
Body: {
  "email": "newadmin@kehati.org",
  "password": "password123",
  "role": "regional_admin",
  "wilayah": "JAWA BARAT",
  "full_name": "Admin Jawa Barat"
}
```

**Flow**:
```
Request → Verify JWT → Check role == super_admin 
  → Validate email unique 
  → Hash password 
  → Create user 
  → Return user data
```

**Security Checks**:
- ✅ Only super_admin can create users
- ✅ Password auto-hashed before saving
- ✅ Email uniqueness validated
- ⚠️ **ISSUE**: Need to validate role values (only allow super_admin, regional_admin)

---

#### **Update User**
```
PUT /api/v1/users/{user_id}
Authorization: Bearer {token}
Role Required: super_admin
Body: { "is_active": false }
```

**Security Checks**:
- ✅ Only super_admin can update
- ✅ Cannot update own role (prevent privilege escalation)
- ⚠️ **ISSUE**: Should prevent deactivating self

---

#### **Delete User**
```
DELETE /api/v1/users/{user_id}
Authorization: Bearer {token}
Role Required: super_admin
```

**Security Checks**:
- ✅ Only super_admin can delete
- ⚠️ **ISSUE**: Should prevent deleting self
- ⚠️ **ISSUE**: Should soft delete instead of hard delete

---

### **2. APPROVAL QUEUE**

#### **List Pending Approvals**
```
GET /api/v1/approvals/
Authorization: Bearer {token}
Role Required: super_admin OR regional_admin (filtered)
Query Params:
  - entity_type: flora|fauna|zona|artikel|galeri|taman
  - limit: 100
  - offset: 0
```

**Flow for Super Admin**:
```
Request → Verify JWT → Check role
  → Query all pending items (status = draft OR in_review)
  → Group by entity_type
  → Return with counts
```

**Flow for Regional Admin**:
```
Request → Verify JWT → Check role == regional_admin
  → Query pending items WHERE region_code = user.region_code
  → Return filtered list
```

**Security Checks**:
- ✅ Super admin sees all pending items
- ✅ Regional admin only sees items from their region
- ✅ Proper filtering by `region_code`

**Response**:
```json
{
  "items": [
    {
      "entity_type": "taman",
      "entity_id": 5,
      "title": "Taman Nasional Kutai",
      "status": "draft",
      "submitted_at": "2025-10-25T10:00:00Z",
      "metadata": {
        "submitted_by": 2,
        "approved_by": null
      }
    }
  ],
  "total": 5,
  "counts": {
    "flora": 2,
    "fauna": 1,
    "taman": 1,
    "artikel": 1
  }
}
```

---

### **3. ANNOUNCEMENT MANAGEMENT**

#### **Create Announcement**
```
POST /api/v1/announcements/
Authorization: Bearer {token}
Role Required: super_admin
Body: {
  "title": "Pengumuman Penting",
  "content": "...",
  "visibility": "public"
}
```

**Flow**:
```
Request → Verify JWT → Check role == super_admin
  → Validate required fields
  → Create announcement
  → Return created data
```

**Security Checks**:
- ✅ Only super_admin can create
- ✅ Auto-set created_by = user.id
- ⚠️ **ISSUE**: Need to validate visibility values

---

#### **Update Announcement**
```
PUT /api/v1/announcements/{id}
Authorization: Bearer {token}
Role Required: super_admin
```

**Security Checks**:
- ✅ Only super_admin can update
- ⚠️ **ISSUE**: Should check if announcement exists

---

#### **Delete Announcement**
```
DELETE /api/v1/announcements/{id}
Authorization: Bearer {token}
Role Required: super_admin
```

**Security Checks**:
- ✅ Only super_admin can delete
- ⚠️ **ISSUE**: Should soft delete instead of hard delete

---

### **4. ARTICLE MANAGEMENT**

#### **Create Article**
```
POST /api/v1/articles/
Authorization: Bearer {token}
Role Required: super_admin
Body: {
  "title": "Berita Terbaru",
  "content": "...",
  "category": "news",
  "status": "published"
}
```

**Flow**:
```
Request → Verify JWT → Check role == super_admin
  → Validate required fields
  → Auto-generate slug from title
  → Create article
  → Return created data
```

**Security Checks**:
- ✅ Only super_admin can create
- ✅ Auto-set author_id = user.id
- ✅ Slug auto-generated
- ⚠️ **ISSUE**: Need to validate status values

---

## 🌍 REGIONAL ADMIN ENDPOINTS

### **1. TAMAN (PARKS) MANAGEMENT**

#### **List Parks**
```
GET /api/v1/crud/parks/
Authorization: Bearer {token}
Role Required: authenticated
Query Params:
  - search: string
  - region_id: int
  - limit: 100
  - skip: 0
```

**Flow for Regional Admin**:
```
Request → Verify JWT → Check role == regional_admin
  → Auto-filter: WHERE created_by = user.id
  → Apply additional filters (search, region)
  → Return filtered list
```

**Flow for Super Admin**:
```
Request → Verify JWT → Check role == super_admin
  → Query all parks (no filtering by created_by)
  → Apply filters (search, region)
  → Return list
```

**Security Implementation**:
```python
# apps/backend/api/v1/routes/parks_crud.py
if user.role == UserRole.regional_admin:
    stmt = stmt.where(Park.created_by == user.id)
```

**Security Checks**:
- ✅ Regional admin auto-filtered by created_by
- ✅ Regional admin cannot see other admin's parks
- ✅ Super admin can see all parks

---

#### **Create Park**
```
POST /api/v1/crud/parks/
Authorization: Bearer {token}
Role Required: regional_admin
Body: {
  "name": "Taman Nasional Kutai",
  "region_id": 20,
  "area_ha": 198629,
  "description": "...",
  "sk_penetapan": "SK Menteri No. 123/2024",
  "pengelola": "BKSDA Kalimantan Timur"
}
```

**Flow**:
```
Request → Verify JWT → Check authenticated
  → Auto-set created_by = user.id
  → Auto-generate slug from name
  → Set status = "draft"
  → Create park
  → Return created data
```

**Security Implementation**:
```python
park = Park(
    name=data.get("name"),
    slug=auto_generate_slug(name),
    status="draft",
    created_by=user.id,  # Auto-set
    ...
)
```

**Security Checks**:
- ✅ Auto-set created_by (cannot be spoofed)
- ✅ Status defaults to "draft"
- ✅ Slug auto-generated (prevent duplicates)
- ⚠️ **ISSUE**: Should validate region_id exists
- ⚠️ **ISSUE**: Should validate regional admin's region matches park's region

---

#### **Update Park**
```
PUT /api/v1/crud/parks/{park_id}
Authorization: Bearer {token}
Role Required: authenticated
Body: { "name": "Updated Name" }
```

**Flow**:
```
Request → Verify JWT → Get park by ID
  → Check ownership: park.created_by == user.id (if regional_admin)
  → Update fields
  → Return updated data
```

**Security Implementation**:
```python
if user.role == UserRole.regional_admin and park.created_by != user.id:
    raise HTTPException(403, "Access denied")
```

**Security Checks**:
- ✅ Regional admin can only update own parks
- ✅ Super admin can update any park
- ✅ Cannot change created_by field
- ⚠️ **ISSUE**: Should prevent updating approved parks without re-approval

---

#### **Delete Park**
```
DELETE /api/v1/crud/parks/{park_id}
Authorization: Bearer {token}
Role Required: authenticated
```

**Security Checks**:
- ✅ Regional admin can only delete own parks
- ✅ Ownership check enforced
- ⚠️ **ISSUE**: Should prevent deleting approved parks
- ⚠️ **ISSUE**: Should soft delete instead of hard delete

---

### **2. FLORA MANAGEMENT**

#### **List Flora**
```
GET /api/v1/flora/
Authorization: Bearer {token}
Role Required: authenticated
Query Params:
  - park_id: int
  - status_filter: string
  - submitted_by: int
```

**Flow for Regional Admin**:
```
Request → Verify JWT → Check role == regional_admin
  → Auto-filter: WHERE submitted_by = user.id
  → Join with Park WHERE park.created_by = user.id
  → Apply additional filters
  → Return filtered list
```

**Security Implementation**:
```python
# apps/backend/api/v1/routes/flora.py
if user.role == UserRole.regional_admin:
    stmt = stmt.join(Park, Park.id == Flora.park_id)
    stmt = stmt.join(Region, Region.id == Park.region_id)
    stmt = stmt.where(Region.code == user.region_code)
```

**Security Checks**:
- ✅ Regional admin only sees flora from their parks
- ✅ Proper join with Park and Region
- ✅ Cannot see other admin's flora
- ⚠️ **ISSUE**: Should also filter by submitted_by for double security

---

#### **Create Flora**
```
POST /api/v1/flora/
Authorization: Bearer {token}
Role Required: regional_admin
Body: {
  "scientific_name": "Rafflesia arnoldii",
  "local_name": "Bunga Bangkai",
  "park_id": 5,
  "is_endemic": true
}
```

**Flow**:
```
Request → Verify JWT → Check authenticated
  → Validate park_id exists
  → Check park ownership (park.created_by == user.id)
  → Auto-set submitted_by = user.id
  → Set status = "in_review"
  → Create flora
  → Return created data
```

**Security Checks**:
- ✅ Auto-set submitted_by
- ✅ Status defaults to "in_review"
- ⚠️ **ISSUE**: Should validate park ownership before creating flora
- ⚠️ **ISSUE**: Should prevent creating flora in other admin's parks

---

#### **Approve Flora**
```
POST /api/v1/flora/{flora_id}/approve
Authorization: Bearer {token}
Role Required: super_admin
```

**Flow**:
```
Request → Verify JWT → Check role == super_admin
  → Get flora by ID
  → Update status = "approved"
  → Set approved_by = user.id
  → Set approved_at = now()
  → Return success
```

**Security Implementation**:
```python
@router.post("/{flora_id}/approve", 
    dependencies=[Depends(require_roles(UserRole.super_admin))])
async def approve_flora(flora_id: int, ...):
    obj.status = "approved"
    obj.approved_by = user.id
    obj.approved_at = datetime.now(timezone.utc)
```

**Security Checks**:
- ✅ Only super_admin can approve
- ✅ Auto-set approved_by and approved_at
- ✅ Status updated to "approved"

---

#### **Reject Flora**
```
POST /api/v1/flora/{flora_id}/reject
Authorization: Bearer {token}
Role Required: super_admin
Body: { "reason": "Data tidak lengkap" }
```

**Flow**:
```
Request → Verify JWT → Check role == super_admin
  → Get flora by ID
  → Validate reason not empty
  → Update status = "rejected"
  → Set rejection_reason = reason
  → Set approved_by = user.id (who rejected)
  → Set rejected_at = now()
  → Return success
```

**Security Checks**:
- ✅ Only super_admin can reject
- ✅ Rejection reason required
- ✅ Proper audit trail (approved_by, rejected_at)

---

### **3. FAUNA MANAGEMENT**

**Same flow as Flora**:
- ✅ List: Auto-filtered by region for regional_admin
- ✅ Create: Auto-set submitted_by, status = "in_review"
- ✅ Approve: Only super_admin
- ✅ Reject: Only super_admin with reason

**Endpoints**:
- `GET /api/v1/fauna/`
- `POST /api/v1/fauna/`
- `PUT /api/v1/fauna/{id}`
- `DELETE /api/v1/fauna/{id}`
- `POST /api/v1/fauna/{id}/approve`
- `POST /api/v1/fauna/{id}/reject`

**Security**: ✅ Same as Flora

---

### **4. ACTIVITIES MANAGEMENT**

**Same flow as Flora/Fauna**:
- ✅ List: Auto-filtered by park ownership
- ✅ Create: Auto-set created_by, status = "in_review"
- ✅ Approve: Only super_admin
- ✅ Reject: Only super_admin with reason

**Endpoints**:
- `GET /api/v1/activities/`
- `POST /api/v1/activities/`
- `PUT /api/v1/activities/{id}`
- `DELETE /api/v1/activities/{id}`
- `POST /api/v1/activities/{id}/approve`
- `POST /api/v1/activities/{id}/reject`

**Security**: ✅ Same as Flora/Fauna

---

## 🔄 COMPLETE APPROVAL FLOW

### **Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: REGIONAL ADMIN CREATES DATA                            │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 1. Regional Admin Login                                         │
│    POST /api/v1/auth/login                                      │
│    → Returns JWT token                                          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Create Park                                                  │
│    POST /api/v1/crud/parks/                                     │
│    → Auto-set: created_by = user.id                             │
│    → Auto-set: status = "draft"                                 │
│    → Returns: park with ID and status                           │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Submit Park for Review                                       │
│    PUT /api/v1/crud/parks/{id}                                  │
│    Body: { "status": "in_review" }                              │
│    → Park now visible in Super Admin approval queue            │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Create Flora/Fauna/Activities                                │
│    POST /api/v1/flora/                                          │
│    → Auto-set: submitted_by = user.id                           │
│    → Auto-set: status = "in_review"                             │
│    → Validate: park_id belongs to user                          │
│    → Returns: flora with ID and status                          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: SUPER ADMIN REVIEWS & APPROVES                        │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Super Admin Login                                            │
│    POST /api/v1/auth/login                                      │
│    → Returns JWT token with role = super_admin                  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. View Approval Queue                                          │
│    GET /api/v1/approvals/                                       │
│    → Returns all pending items (status = in_review)             │
│    → Grouped by entity_type (taman, flora, fauna, etc)          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                    ┌──────┴──────┐
                    ↓             ↓
            [ APPROVE ]      [ REJECT ]
                ↓               ↓
┌───────────────────────────┐  ┌────────────────────────────────┐
│ 7a. Approve Park          │  │ 7b. Reject Park                │
│ POST /api/v1/crud/parks/  │  │ POST /api/v1/crud/parks/       │
│      {id}/approve         │  │      {id}/reject               │
│                           │  │ Body: {                        │
│ → Check: role = super_admin│  │   "rejection_reason": "..."  │
│ → Update: status = "approved"│ │ }                             │
│ → Set: approved_by = user.id│ │                               │
│ → Set: approved_at = now() │  │ → Check: role = super_admin   │
│ → Return: success         │  │ → Update: status = "rejected" │
└───────────────────────────┘  │ → Set: rejection_reason       │
                               │ → Set: approved_by = user.id  │
                               │ → Set: approved_at = now()    │
                               │ → Return: success             │
                               └────────────────────────────────┘
                                           ↓
                    ┌──────────────────────┴──────────────────────┐
                    ↓                                             ↓
┌───────────────────────────────┐  ┌────────────────────────────────┐
│ 8a. Park Published            │  │ 8b. Regional Admin Notified    │
│ → Visible on public website   │  │ → Can edit and re-submit       │
│ → Regional admin notified     │  │ → Status back to "draft"       │
└───────────────────────────────┘  └────────────────────────────────┘
```

---

## 🔍 SECURITY VALIDATION CHECKLIST

### **Authentication & Authorization** ✅

| Check | Status | Notes |
|-------|--------|-------|
| JWT token validation | ✅ Pass | All protected endpoints check token |
| Token expiration | ✅ Pass | 24h expiration set |
| Password hashing | ✅ Pass | bcrypt used |
| Role-based access | ✅ Pass | `require_roles()` decorator used |
| CORS configuration | ✅ Pass | Proper origins configured |

---

### **Super Admin Endpoints** 🔍

| Endpoint | Role Check | Data Filtering | Issues |
|----------|------------|----------------|--------|
| `GET /api/v1/users/` | ✅ super_admin | N/A | None |
| `POST /api/v1/users/` | ✅ super_admin | N/A | ⚠️ Need role validation |
| `PUT /api/v1/users/{id}` | ✅ super_admin | N/A | ⚠️ Prevent self-deactivate |
| `DELETE /api/v1/users/{id}` | ✅ super_admin | N/A | ⚠️ Prevent self-delete |
| `GET /api/v1/approvals/` | ✅ super_admin | ✅ All regions | None |
| `POST /api/v1/announcements/` | ✅ super_admin | N/A | ⚠️ Validate visibility |
| `POST /api/v1/articles/` | ✅ super_admin | N/A | ⚠️ Validate status |
| `POST /api/v1/crud/parks/{id}/approve` | ✅ super_admin | N/A | None |
| `POST /api/v1/flora/{id}/approve` | ✅ super_admin | N/A | None |
| `POST /api/v1/fauna/{id}/approve` | ✅ super_admin | N/A | None |
| `POST /api/v1/activities/{id}/approve` | ✅ super_admin | N/A | None |

---

### **Regional Admin Endpoints** 🔍

| Endpoint | Role Check | Data Filtering | Ownership Check | Issues |
|----------|------------|----------------|-----------------|--------|
| `GET /api/v1/crud/parks/` | ✅ Auth | ✅ created_by | N/A | None |
| `POST /api/v1/crud/parks/` | ✅ Auth | N/A | ✅ Auto-set | ⚠️ Validate region match |
| `PUT /api/v1/crud/parks/{id}` | ✅ Auth | N/A | ✅ Check owner | ⚠️ Prevent update approved |
| `DELETE /api/v1/crud/parks/{id}` | ✅ Auth | N/A | ✅ Check owner | ⚠️ Prevent delete approved |
| `GET /api/v1/flora/` | ✅ Auth | ✅ region_code | N/A | ⚠️ Add submitted_by filter |
| `POST /api/v1/flora/` | ✅ Auth | N/A | ⚠️ Missing | ⚠️ Validate park ownership |
| `PUT /api/v1/flora/{id}` | ✅ Auth | N/A | ⚠️ Missing | ⚠️ Add ownership check |
| `DELETE /api/v1/flora/{id}` | ✅ Auth | N/A | ⚠️ Missing | ⚠️ Add ownership check |
| `GET /api/v1/fauna/` | ✅ Auth | ✅ region_code | N/A | ⚠️ Add submitted_by filter |
| `POST /api/v1/fauna/` | ✅ Auth | N/A | ⚠️ Missing | ⚠️ Validate park ownership |
| `GET /api/v1/activities/` | ✅ Auth | ✅ created_by | N/A | None |
| `POST /api/v1/activities/` | ✅ Auth | N/A | ⚠️ Missing | ⚠️ Validate park ownership |

---

## ⚠️ CRITICAL ISSUES & RECOMMENDATIONS

### **🔴 HIGH PRIORITY**

#### **Issue 1: Flora/Fauna Create - Missing Park Ownership Validation**
**Location**: `apps/backend/api/v1/routes/flora.py`, `fauna.py`

**Problem**:
```python
# Current: No check if park belongs to user
@router.post("/")
async def create_flora(data: FloraIn, ...):
    flora = Flora(
        park_id=data.park_id,  # ⚠️ No validation!
        submitted_by=user.id,
        ...
    )
```

**Risk**: Regional admin could create flora/fauna in other admin's parks by guessing park_id.

**Fix**:
```python
@router.post("/")
async def create_flora(data: FloraIn, db: AsyncSession, user: User):
    # Validate park ownership
    park = await db.get(Park, data.park_id)
    if not park:
        raise HTTPException(404, "Park not found")
    
    if user.role == UserRole.regional_admin and park.created_by != user.id:
        raise HTTPException(403, "Cannot create flora in other admin's park")
    
    flora = Flora(
        park_id=data.park_id,
        submitted_by=user.id,
        ...
    )
```

---

#### **Issue 2: Flora/Fauna Update/Delete - Missing Ownership Check**
**Location**: `apps/backend/api/v1/routes/flora.py`, `fauna.py`

**Problem**:
```python
# Current: No ownership check
@router.put("/{flora_id}")
async def update_flora(flora_id: int, data: FloraUpdate, ...):
    flora = await db.get(Flora, flora_id)
    # ⚠️ No check if flora.submitted_by == user.id
    for key, value in data.dict(exclude_unset=True).items():
        setattr(flora, key, value)
```

**Risk**: Regional admin could update/delete other admin's flora/fauna.

**Fix**:
```python
@router.put("/{flora_id}")
async def update_flora(flora_id: int, data: FloraUpdate, db: AsyncSession, user: User):
    flora = await db.get(Flora, flora_id)
    if not flora:
        raise HTTPException(404, "Flora not found")
    
    # Check ownership
    if user.role == UserRole.regional_admin and flora.submitted_by != user.id:
        raise HTTPException(403, "Access denied")
    
    # Prevent updating approved flora
    if flora.status == "approved":
        raise HTTPException(400, "Cannot update approved flora")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(flora, key, value)
```

---

#### **Issue 3: Park Create - Missing Region Validation**
**Location**: `apps/backend/api/v1/routes/parks_crud.py`

**Problem**:
```python
# Regional admin could create park in wrong region
park = Park(
    region_id=data.get("region_id"),  # ⚠️ No validation!
    created_by=user.id,
    ...
)
```

**Risk**: Regional admin KALTIM could create park in SUMUT region.

**Fix**:
```python
@router.post("/")
async def create_park(data: dict, db: AsyncSession, user: User):
    # Validate region for regional admin
    if user.role == UserRole.regional_admin:
        region = await db.get(Region, data.get("region_id"))
        if not region:
            raise HTTPException(404, "Region not found")
        
        if region.code != user.region_code:
            raise HTTPException(403, "Cannot create park in other region")
    
    park = Park(...)
```

---

### **🟡 MEDIUM PRIORITY**

#### **Issue 4: Prevent Updating/Deleting Approved Data**
**Location**: All CRUD endpoints

**Problem**: Regional admin can update/delete data after it's been approved.

**Fix**: Add status check before update/delete:
```python
if obj.status == "approved":
    raise HTTPException(400, "Cannot modify approved data. Request rejection first.")
```

---

#### **Issue 5: Soft Delete Instead of Hard Delete**
**Location**: All DELETE endpoints

**Problem**: Hard delete loses audit trail.

**Fix**: Implement soft delete:
```python
@router.delete("/{id}")
async def delete_park(id: int, ...):
    park.deleted_at = datetime.now(timezone.utc)
    park.deleted_by = user.id
    await db.commit()
```

---

#### **Issue 6: Prevent Self-Deactivate/Delete for Super Admin**
**Location**: `apps/backend/api/v1/routes/users.py`

**Problem**: Super admin could accidentally deactivate/delete their own account.

**Fix**:
```python
@router.put("/{user_id}")
async def update_user(user_id: int, data: dict, user: User):
    if user_id == user.id and data.get("is_active") == False:
        raise HTTPException(400, "Cannot deactivate your own account")
```

---

### **🟢 LOW PRIORITY**

#### **Issue 7: Input Validation**
**Location**: All POST/PUT endpoints

**Recommendation**: Add Pydantic models for strict validation:
```python
class ParkCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    region_id: int = Field(..., gt=0)
    area_ha: float = Field(..., gt=0)
    status: Literal["draft", "in_review"] = "draft"
```

---

#### **Issue 8: Rate Limiting**
**Location**: All endpoints

**Recommendation**: Add rate limiting to prevent abuse:
```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@router.post("/", dependencies=[Depends(limiter.limit("10/minute"))])
async def create_park(...):
    ...
```

---

## 📊 SECURITY SCORE

| Category | Score | Status |
|----------|-------|--------|
| Authentication | 9/10 | ✅ Excellent |
| Authorization | 7/10 | ⚠️ Good, needs improvement |
| Data Filtering | 8/10 | ✅ Very Good |
| Input Validation | 6/10 | ⚠️ Needs improvement |
| Audit Trail | 7/10 | ⚠️ Good, soft delete needed |
| Error Handling | 8/10 | ✅ Very Good |
| **OVERALL** | **7.5/10** | ⚠️ **Good, but needs fixes** |

---

## ✅ ACTION ITEMS

### **Immediate (This Week)**
1. ✅ Add park ownership validation to Flora/Fauna create
2. ✅ Add ownership check to Flora/Fauna update/delete
3. ✅ Add region validation to Park create
4. ✅ Prevent updating approved data

### **Short Term (Next Week)**
5. ⏳ Implement soft delete
6. ⏳ Prevent super admin self-deactivate
7. ⏳ Add comprehensive input validation
8. ⏳ Add unit tests for security checks

### **Long Term (Next Month)**
9. ⏳ Add rate limiting
10. ⏳ Add audit logging
11. ⏳ Add security monitoring
12. ⏳ Penetration testing

---

**Last Updated**: 25 Oktober 2025, 17:00 WIB  
**Reviewed by**: Claude Sonnet 4.5  
**Status**: 🔍 Security audit complete, fixes in progress

