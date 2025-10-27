# ✅ Fix: User Table Mismatch (Temporary Workaround)

## 🐛 **Root Cause**

```
ValueError: badly formed hexadecimal UUID string
created_by=PyUUID(str(user.id))  # user.id='2' → not valid UUID!
```

**Problem**: Ada **2 user tables** dengan tipe ID berbeda:

| Table | ID Type | Usage |
|-------|---------|-------|
| `"user"` (singular) | **TEXT** ('2', '3', etc) | Authentication (JWT, login) |
| `"users"` (plural) | **UUID** (abc-123-...) | Parks foreign keys |

**Conflict**:
- Authentication menggunakan table `"user"` → `user.id = '2'` (TEXT)
- Parks menggunakan table `"users"` → `parks.created_by` expect UUID
- '2' bukan valid UUID → **ERROR!**

---

## 🔧 **Temporary Solution**

### **Disabled Features**:

1. **created_by tracking** - Park creation tidak set `created_by`
2. **One park per user validation** - Tidak bisa validate karena tidak ada tracking
3. **approved_by tracking** - Approval tidak set `approved_by`
4. **Regional admin filtering** - List parks shows ALL parks (tidak filter by user)

### **File**: `apps/backend/api/v1/routes/parks_crud.py`

**Changes**:

1. **Line 166-168**: Disable one-park-per-user validation
```python
# NOTE: Validation disabled temporarily
# Issue: Auth uses "user" table (id=TEXT), parks.created_by uses "users" table (id=UUID)
```

2. **Line 189-233**: Use raw SQL insert WITHOUT created_by
```python
# Use raw SQL to insert park (avoid UUID type mismatch)
INSERT INTO parks (name, slug, ..., status)
VALUES (:name, :slug, ..., 'draft')
# NOTE: created_by NOT SET
```

3. **Line 61-66**: Disable regional admin filtering
```python
# Regional admin scope - TEMPORARILY show all parks
# Cannot reliably filter by created_by until user tables are unified
```

4. **Line 364-365**: Disable approved_by in approval
```python
# NOTE: approved_by disabled - user.id doesn't match type (UUID)
```

5. **Line 370-383**: Disable park assignment to user
```python
# NOTE: Temporarily disabled - created_by is not set due to user table mismatch
```

---

## 🏗️ **Proper Solution (TODO)**

### **Option 1: Unified User Table**

Migrate semua ke satu user table dengan UUID:
```sql
-- Convert "user" table id to UUID
ALTER TABLE "user" ALTER COLUMN id TYPE UUID USING id::UUID;
-- Or migrate all data to "users" table
```

### **Option 2: Park Submissions Tracking Table**

Create mapping table untuk track submissions:
```sql
CREATE TABLE park_submissions (
    id SERIAL PRIMARY KEY,
    park_id UUID REFERENCES parks(id),
    user_id TEXT REFERENCES "user"(id),  -- TEXT from auth table
    submitted_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20)  -- draft, approved, rejected
);
```

Then update queries:
```python
# Check if user already submitted park
existing = await db.execute(
    select(ParkSubmission).where(ParkSubmission.user_id == user.id)
)
```

### **Option 3: Add TEXT Column to Parks**

```sql
ALTER TABLE parks ADD COLUMN submitted_by_text TEXT;
-- Store user.id (TEXT) separately from created_by (UUID)
```

---

## ⚠️ **Current Limitations**

1. **No ownership tracking** - Cannot determine which user created which park
2. **All parks visible** - Regional admin see ALL parks, not just theirs
3. **No one-park limit** - Users can create multiple parks
4. **No user assignment** - Park approval doesn't assign park to user

---

## 🧪 **Testing Current State**

```bash
# Restart backend
cd apps/backend
pkill -f uvicorn
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Test create park:
```bash
POST /api/v1/crud/parks/
{
  "name": "Taman Test",
  "region_id": 1,
  ...
}

Response: 201 Created
✅ Park created successfully (without created_by)
✅ No UUID error
```

Test list parks:
```bash
GET /api/v1/crud/parks/

Response: [ all parks ]
✅ Shows all parks (no user filtering)
```

---

## 📋 **Recommendation**

**Prioritas**: Implement **Option 2 (Park Submissions Table)** karena:
- ✅ Tidak perlu migrate existing data
- ✅ Maintains both user tables as-is
- ✅ Clean separation of concerns
- ✅ Easy to implement

**Implementation Steps**:
1. Create `park_submissions` table
2. Update create_park to insert into park_submissions
3. Update list_parks to filter by park_submissions.user_id
4. Update approve_park to read from park_submissions

---

## ✅ **Current Status**

| Feature | Status |
|---------|--------|
| Create Park | ✅ Works (no tracking) |
| List Parks | ✅ Works (shows all) |
| Approve Park | ✅ Works (no user assignment) |
| Reject Park | ✅ Works |
| One Park Per User | ❌ Disabled |
| Regional Admin Filter | ❌ Disabled |
| User Assignment | ❌ Disabled |

**Sekarang park creation works, tapi tracking masih manual!** 🎉

