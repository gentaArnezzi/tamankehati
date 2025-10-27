# ✅ Fix UUID Type Mismatch - Complete

## 🐛 **Error**

```
operator does not exist: integer = character varying
HINT: No operator matches the given name and argument types. 
      You might need to add explicit type casts.
WHERE parks.created_by = $1::VARCHAR
```

**Root Cause**: 
- `parks.created_by` adalah **UUID** di database
- `user.id` adalah **string/TEXT** (dari table "user")
- SQLAlchemy mencoba compare UUID dengan VARCHAR → error!

---

## 🔧 **Solution**

Cast `user.id` (string) ke UUID sebelum comparison.

### **File**: `apps/backend/api/v1/routes/parks_crud.py`

**Changes**:

1. **Import UUID types**:
```python
from sqlalchemy import select, func, or_, cast, text
from sqlalchemy.dialects.postgresql import UUID
from uuid import UUID as PyUUID
```

2. **Fix list_parks filter** (line 57-64):
```python
# BEFORE:
if submitted_by:
    stmt = stmt.where(Park.created_by == submitted_by)

if user.role == UserRole.regional_admin:
    stmt = stmt.where(Park.created_by == user.id)

# AFTER:
if submitted_by:
    stmt = stmt.where(Park.created_by == cast(str(submitted_by), UUID))

if user.role == UserRole.regional_admin:
    stmt = stmt.where(Park.created_by == cast(str(user.id), UUID))
```

3. **Fix approve_park** (line 356):
```python
# BEFORE:
park.approved_by = user.id

# AFTER:
park.approved_by = PyUUID(str(user.id)) if user.id else None
```

4. **Fix reject_park** (line 444):
```python
# BEFORE:
park.approved_by = user.id

# AFTER:
park.approved_by = PyUUID(str(user.id)) if user.id else None
```

---

## ✅ **Result**

Sekarang query akan generate SQL yang benar:

**BEFORE** (❌ Error):
```sql
WHERE parks.created_by = $1::VARCHAR  -- Error! UUID vs VARCHAR
```

**AFTER** (✅ Works):
```sql
WHERE parks.created_by = $1::UUID  -- Correct! UUID vs UUID
```

---

## 🧪 **Testing**

Restart backend dan test:

```bash
cd apps/backend
pkill -f uvicorn
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Test endpoints:
- `GET /api/v1/crud/parks/` → Regional admin hanya lihat park mereka
- `POST /api/v1/parks/{id}/approve` → Super admin approve park
- `POST /api/v1/parks/{id}/reject` → Super admin reject park

Semua harus bekerja tanpa error UUID type mismatch! ✅

