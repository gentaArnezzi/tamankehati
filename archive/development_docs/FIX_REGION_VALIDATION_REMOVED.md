# ✅ Fix: Remove Region Validation

## 🐛 **Error**

```
403: Anda tidak dapat membuat taman di region lain. 
Region Anda: None, Region yang dipilih: BANTEN
```

**Cause**: Masih ada validasi region di endpoint create park, padahal kolom `region` sudah dihapus dari user table.

---

## 🔧 **Solution**

### **File**: `apps/backend/api/v1/routes/parks_crud.py`

**Changes**:

1. **REMOVED**: Region validation (line 160-184)
```python
# ❌ REMOVED:
if user.role == UserRole.regional_admin:
    if region.code != user.region_code:
        raise HTTPException(403, "Anda tidak dapat membuat taman di region lain")
```

2. **ADDED**: One park per user validation
```python
# ✅ NEW:
if user.role == UserRole.regional_admin:
    # Check if user already created a park
    existing_park = await db.execute(
        select(Park).where(text("parks.created_by::text = :user_id")).params(user_id=str(user.id))
    )
    if existing_park.scalars().first():
        raise HTTPException(400, "Anda sudah memiliki taman. Satu user hanya bisa membuat satu taman.")
```

3. **FIXED**: Status always "draft"
```python
# Line 206
status="draft",  # Always draft for submission workflow
```

4. **FIXED**: created_by cast to UUID
```python
# Line 207
created_by=PyUUID(str(user.id)) if user.id else None,  # Cast to UUID
```

---

## 🔄 **New Flow**

### **Before** (❌ Old):
```
1. User create park
2. ❌ System validate: user.region_code == park.region_code
3. Error jika region tidak match
```

### **After** (✅ New):
```
1. User create park (any region)
2. ✅ System validate: user can only create ONE park
3. Park status = "draft"
4. Park waits for super_admin approval
```

---

## ✅ **Result**

Sekarang regional admin bisa:
- ✅ Create park di region manapun
- ✅ Satu user = satu park
- ✅ Park otomatis status "draft"
- ✅ Tidak ada validasi region

---

## 🧪 **Test**

Restart backend dan test create park:

```bash
cd apps/backend
pkill -f uvicorn
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Test:
```bash
POST /api/v1/crud/parks/
{
  "name": "Taman Test",
  "region_id": 1,  # Any region OK!
  ...
}

Response: 201 Created
✅ Park created dengan status="draft"
✅ No region validation error
```

Error sudah fixed! 🎉

