# 🔐 SECURITY FIXES APPLIED
## Critical Security Improvements

**Tanggal**: 25 Oktober 2025  
**Status**: ✅ In Progress

---

## 📋 SUMMARY

Berdasarkan security audit yang telah dilakukan, berikut adalah fixes yang telah diimplementasikan untuk memastikan **role-based access control** berjalan dengan benar.

---

## ✅ FIXES APPLIED

### **1. Flora Create Endpoint** ✅

**File**: `apps/backend/api/v1/routes/flora.py`  
**Function**: `create_flora()`

**Security Improvements**:
1. ✅ **Park Ownership Validation**
   - Validates park exists before creating flora
   - Regional admin can only create flora in their own parks
   - Checks `park.created_by == user.id`

2. ✅ **Region Validation**
   - Validates regional admin's region matches park's region
   - Prevents cross-region data creation

3. ✅ **Auto-set submitted_by**
   - Automatically sets `submitted_by = user.id`
   - Cannot be spoofed by client

4. ✅ **Status Auto-set to "in_review"**
   - New flora automatically goes to approval queue
   - Changed from "draft" to "in_review"

**Code**:
```python
# SECURITY: Validate park exists and ownership
park_result = await db.execute(select(Park).where(Park.id == payload.park_id))
park = park_result.scalars().first()

if not park:
    raise HTTPException(400, "Park dengan ID tersebut tidak ditemukan")

# SECURITY: Regional admin can only create flora in their own parks
if user.role == UserRole.regional_admin:
    if park.created_by != user.id:
        raise HTTPException(403, "Anda tidak dapat menambahkan flora ke taman milik admin lain")
    
    # Also validate region matches
    region_result = await db.execute(select(Region).where(Region.id == park.region_id))
    region = region_result.scalars().first()
    if region and region.code != user.region_code:
        raise HTTPException(403, "Anda tidak memiliki akses untuk region ini")

# Insert with submitted_by
INSERT INTO flora (..., submitted_by, status, ...)
VALUES (..., :submitted_by, 'in_review', ...)
```

---

### **2. Flora Update Endpoint** ✅

**File**: `apps/backend/api/v1/routes/flora.py`  
**Function**: `update_flora()`

**Security Improvements**:
1. ✅ **Ownership Check**
   - Regional admin can only update their own flora
   - Checks `flora.submitted_by == user.id`

2. ✅ **Prevent Updating Approved Flora**
   - Cannot update flora with status "approved"
   - Must request rejection first

**Code**:
```python
# SECURITY: Check ownership for regional admin
if user.role == UserRole.regional_admin:
    if obj.submitted_by != user.id:
        raise HTTPException(403, "Anda tidak dapat mengubah flora yang dibuat oleh admin lain")

# SECURITY: Prevent updating approved flora
if obj.status == "approved":
    raise HTTPException(400, "Tidak dapat mengubah flora yang sudah disetujui")
```

---

### **3. Flora Delete Endpoint** ✅

**File**: `apps/backend/api/v1/routes/flora.py`  
**Function**: `delete_flora()`

**Security Improvements**:
1. ✅ **Ownership Check**
   - Regional admin can only delete their own flora
   - Checks `flora.submitted_by == user.id`

2. ✅ **Prevent Deleting Approved Flora**
   - Cannot delete flora with status "approved"

3. ✅ **Added User Parameter**
   - Added `user: User = Depends(current_user)` to function signature

**Code**:
```python
async def delete_flora(flora_id: int, db: AsyncSession, user: User = Depends(current_user)):
    # SECURITY: Check ownership for regional admin
    if user.role == UserRole.regional_admin:
        if obj.submitted_by != user.id:
            raise HTTPException(403, "Anda tidak dapat menghapus flora yang dibuat oleh admin lain")
    
    # SECURITY: Prevent deleting approved flora
    if obj.status == "approved":
        raise HTTPException(400, "Tidak dapat menghapus flora yang sudah disetujui")
```

---

## 🚧 PENDING FIXES

### **4. Fauna Endpoints** ⏳

**Files to Fix**:
- `apps/backend/api/v1/routes/fauna.py`

**Required Changes**:
1. ⏳ Add park ownership validation to `create_fauna()`
2. ⏳ Add ownership check to `update_fauna()`
3. ⏳ Add ownership check to `delete_fauna()`
4. ⏳ Prevent updating/deleting approved fauna

**Same pattern as Flora**:
```python
# In create_fauna()
park = await db.get(Park, payload.park_id)
if user.role == UserRole.regional_admin and park.created_by != user.id:
    raise HTTPException(403, "Cannot create fauna in other admin's park")

# In update_fauna()
if user.role == UserRole.regional_admin and fauna.submitted_by != user.id:
    raise HTTPException(403, "Cannot update other admin's fauna")

if fauna.status == "approved":
    raise HTTPException(400, "Cannot update approved fauna")

# In delete_fauna()
if user.role == UserRole.regional_admin and fauna.submitted_by != user.id:
    raise HTTPException(403, "Cannot delete other admin's fauna")

if fauna.status == "approved":
    raise HTTPException(400, "Cannot delete approved fauna")
```

---

### **5. Activities Endpoints** ⏳

**Files to Fix**:
- `apps/backend/api/v1/routes/activities.py`

**Required Changes**:
1. ⏳ Add park ownership validation to `create_activity()`
2. ⏳ Add ownership check to `update_activity()`
3. ⏳ Add ownership check to `delete_activity()`
4. ⏳ Prevent updating/deleting approved activities

---

### **6. Parks Create Endpoint** ⏳

**File**: `apps/backend/api/v1/routes/parks_crud.py`  
**Function**: `create_park()`

**Required Changes**:
1. ⏳ **Region Validation for Regional Admin**
   - Validate `region_id` matches user's `region_code`
   - Prevent creating parks in other regions

**Code to Add**:
```python
@router.post("/")
async def create_park(data: dict, db: AsyncSession, user: User):
    # SECURITY: Validate region for regional admin
    if user.role == UserRole.regional_admin:
        region = await db.get(Region, data.get("region_id"))
        if not region:
            raise HTTPException(404, "Region not found")
        
        if region.code != user.region_code:
            raise HTTPException(403, "Cannot create park in other region")
    
    park = Park(...)
```

---

### **7. Parks Update/Delete Endpoints** ⏳

**File**: `apps/backend/api/v1/routes/parks_crud.py`

**Required Changes**:
1. ⏳ Prevent updating approved parks
2. ⏳ Prevent deleting approved parks

**Code to Add**:
```python
# In update_park()
if park.status == "approved":
    raise HTTPException(400, "Cannot update approved park")

# In delete_park()
if park.status == "approved":
    raise HTTPException(400, "Cannot delete approved park")
```

---

## 📊 PROGRESS TRACKER

| Endpoint | Park Validation | Ownership Check | Prevent Update Approved | Status |
|----------|----------------|-----------------|------------------------|--------|
| **Flora Create** | ✅ Done | ✅ Done | N/A | ✅ Complete |
| **Flora Update** | N/A | ✅ Done | ✅ Done | ✅ Complete |
| **Flora Delete** | N/A | ✅ Done | ✅ Done | ✅ Complete |
| **Fauna Create** | ⏳ Pending | ⏳ Pending | N/A | ⏳ Pending |
| **Fauna Update** | N/A | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| **Fauna Delete** | N/A | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| **Activities Create** | ⏳ Pending | ⏳ Pending | N/A | ⏳ Pending |
| **Activities Update** | N/A | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| **Activities Delete** | N/A | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| **Parks Create** | ⏳ Region validation | ✅ Done | N/A | ⏳ Pending |
| **Parks Update** | N/A | ✅ Done | ⏳ Pending | ⏳ Pending |
| **Parks Delete** | N/A | ✅ Done | ⏳ Pending | ⏳ Pending |

**Overall Progress**: 3/12 endpoints fully secured (25%)

---

## 🎯 NEXT STEPS

### **Immediate (Today)**
1. ✅ Apply same fixes to Fauna endpoints
2. ✅ Apply same fixes to Activities endpoints
3. ✅ Add region validation to Parks create
4. ✅ Add approved status check to Parks update/delete

### **Short Term (This Week)**
5. ⏳ Add comprehensive unit tests for security checks
6. ⏳ Add integration tests for cross-admin access attempts
7. ⏳ Document all security checks in API docs

### **Long Term (Next Week)**
8. ⏳ Implement soft delete across all entities
9. ⏳ Add audit logging for all security violations
10. ⏳ Add rate limiting to prevent brute force

---

## 🧪 TESTING SECURITY FIXES

### **Test Case 1: Regional Admin Cannot Create Flora in Other Admin's Park**

```bash
# Login as KALTIM admin
TOKEN_KALTIM=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kaltim.admin@kehati.org","password":"password"}' \
  | jq -r '.access_token')

# Login as SUMUT admin
TOKEN_SUMUT=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sumut.admin@kehati.org","password":"password"}' \
  | jq -r '.access_token')

# KALTIM admin creates a park (get park_id)
PARK_ID=$(curl -s -X POST http://localhost:8000/api/v1/crud/parks/ \
  -H "Authorization: Bearer $TOKEN_KALTIM" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Park KALTIM","region_id":20}' \
  | jq -r '.id')

# SUMUT admin tries to create flora in KALTIM's park
curl -X POST http://localhost:8000/api/v1/flora/ \
  -H "Authorization: Bearer $TOKEN_SUMUT" \
  -H "Content-Type: application/json" \
  -d "{\"scientific_name\":\"Test Flora\",\"park_id\":$PARK_ID}"

# Expected: 403 Forbidden
# "Anda tidak dapat menambahkan flora ke taman milik admin lain"
```

---

### **Test Case 2: Regional Admin Cannot Update Other Admin's Flora**

```bash
# KALTIM admin creates flora
FLORA_ID=$(curl -s -X POST http://localhost:8000/api/v1/flora/ \
  -H "Authorization: Bearer $TOKEN_KALTIM" \
  -H "Content-Type: application/json" \
  -d "{\"scientific_name\":\"Test Flora\",\"park_id\":$PARK_ID}" \
  | jq -r '.id')

# SUMUT admin tries to update KALTIM's flora
curl -X PUT http://localhost:8000/api/v1/flora/$FLORA_ID \
  -H "Authorization: Bearer $TOKEN_SUMUT" \
  -H "Content-Type: application/json" \
  -d '{"description":"Hacked by SUMUT"}'

# Expected: 403 Forbidden
# "Anda tidak dapat mengubah flora yang dibuat oleh admin lain"
```

---

### **Test Case 3: Cannot Update Approved Flora**

```bash
# Super admin approves flora
curl -X POST http://localhost:8000/api/v1/flora/$FLORA_ID/approve \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# KALTIM admin tries to update their own approved flora
curl -X PUT http://localhost:8000/api/v1/flora/$FLORA_ID \
  -H "Authorization: Bearer $TOKEN_KALTIM" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated"}'

# Expected: 400 Bad Request
# "Tidak dapat mengubah flora yang sudah disetujui"
```

---

## 📝 SECURITY CHECKLIST

### **Before Deploying to Production**

- [ ] All Flora endpoints secured ✅
- [ ] All Fauna endpoints secured ⏳
- [ ] All Activities endpoints secured ⏳
- [ ] All Parks endpoints secured ⏳
- [ ] Unit tests written and passing ⏳
- [ ] Integration tests written and passing ⏳
- [ ] Security audit passed ⏳
- [ ] Penetration testing completed ⏳
- [ ] Documentation updated ⏳
- [ ] Code review completed ⏳

---

**Last Updated**: 25 Oktober 2025, 17:30 WIB  
**Implemented by**: Claude Sonnet 4.5  
**Status**: 🔐 Security fixes in progress (25% complete)

