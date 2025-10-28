# ✅ Cascade Approval Implementation

## Problem

User workflow issue:
1. ✅ Edit flora → add gallery images
2. ✅ Super admin approves **flora**  
3. ❌ Gallery images **NOT approved** → tidak muncul di public page

## Root Cause

Flora dan Gallery punya **approval workflow terpisah**:
- Flora di-approve → status `approved` ✅
- Gallery tetap status `draft` ❌
- Public endpoint hanya tampilkan gallery `approved`
- Result: Gallery tidak muncul meskipun flora sudah approved

## Solution: Cascade Approval

Saat flora/fauna di-approve, **semua gallery terkait juga otomatis di-approve**.

### Implementation Flow

```
Super Admin clicks "Approve Flora"
    ↓
Flora status → 'approved' ✅
    ↓
Find all galleries:
  - entity_type = 'flora'
  - entity_id = flora_id
  - status in ['draft', 'in_review']
    ↓
Update gallery status → 'approved' ✅
    ↓
Commit transaction
    ↓
✅ Galleries now visible in public page!
```

## Code Changes

### 1. Flora Approval (`flora.py`)

#### Updated Imports:
```python
from sqlalchemy import select, func, update  # Added 'update'
from domains.galleries.models import Gallery, GalleryStatus  # NEW ✨
```

#### Updated `approve_flora()`:
```python
@router.post("/{flora_id}/approve")
async def approve_flora(flora_id: int, ...):
    # 1. Approve flora
    obj.status = "approved"
    obj.approved_by = user.id
    obj.approved_at = datetime.now(timezone.utc)
    
    # 2. CASCADE APPROVE: Auto-approve all galleries ✨
    await db.execute(
        update(Gallery)
        .where(
            Gallery.entity_type == "flora",
            Gallery.entity_id == flora_id,
            Gallery.status.in_([
                GalleryStatus.draft.value, 
                GalleryStatus.in_review.value
            ])
        )
        .values(status=GalleryStatus.approved.value)
    )
    
    await db.commit()
    
    # 3. Log gallery count
    gallery_count = (await db.execute(
        select(func.count(Gallery.id))
        .where(
            Gallery.entity_type == "flora", 
            Gallery.entity_id == flora_id,
            Gallery.status == GalleryStatus.approved.value
        )
    )).scalar()
    print(f"✅ Flora {flora_id} approved. Auto-approved {gallery_count} galleries.")
    
    return {"ok": True}
```

### 2. Fauna Approval (`fauna.py`)

#### Same Implementation:
```python
@router.post("/{fauna_id}/approve")
async def approve_fauna(fauna_id: int, ...):
    # Approve fauna
    obj.status = "approved"
    
    # CASCADE APPROVE galleries
    await db.execute(
        update(Gallery)
        .where(
            Gallery.entity_type == "fauna",
            Gallery.entity_id == fauna_id,
            Gallery.status.in_([...])
        )
        .values(status=GalleryStatus.approved.value)
    )
    
    await db.commit()
    return {"ok": True}
```

## Benefits

### User Experience
- ✅ **One-click approval** - Approve flora = approve semua galleries
- ✅ **Immediate visibility** - Gallery langsung muncul di public page
- ✅ **No manual steps** - Tidak perlu approve gallery satu-satu
- ✅ **Consistent state** - Flora approved = galleries approved

### Developer Experience
- ✅ **Clean code** - Cascade logic di satu tempat
- ✅ **Type safe** - Using SQLAlchemy ORM
- ✅ **Logging** - Print jumlah galleries yang di-approve
- ✅ **Efficient** - Single UPDATE query untuk semua galleries

### Admin Workflow
- ✅ **Faster approval** - 1 click instead of N+1 clicks
- ✅ **Less errors** - Tidak lupa approve galleries
- ✅ **Better UX** - Seamless workflow

## Testing

### Test Scenario 1: New Flora with Galleries

```bash
# 1. Regional admin creates flora with 5 gallery images
POST /api/v1/flora
{
  "nama_ilmiah": "Test Species",
  # ... plus 5 gallery images
}
# Result: Flora = draft, Galleries = draft

# 2. Regional admin submits for review
POST /api/v1/flora/{id}/submit
# Result: Flora = in_review, Galleries = draft

# 3. Super admin approves flora
POST /api/v1/flora/{id}/approve
# Result: Flora = approved, Galleries = approved ✅
# Console log: "✅ Flora 123 approved. Auto-approved 5 galleries."

# 4. Check public endpoint
GET /api/public/flora/123/gallery
# Response: { "gallery_images": [...], "total": 5 } ✅
```

### Test Scenario 2: Edit Flora, Add More Galleries

```bash
# 1. Flora already approved with 3 galleries
GET /api/public/flora/123/gallery
# Response: { "total": 3 }

# 2. Edit flora, add 2 more gallery images
PUT /api/v1/flora/123
# Result: Flora = in_review, New Galleries = draft

# 3. Super admin approves flora again
POST /api/v1/flora/123/approve
# Result: Flora = approved, ALL 5 Galleries = approved ✅
# Console log: "✅ Flora 123 approved. Auto-approved 5 galleries."

# 4. Check public endpoint
GET /api/public/flora/123/gallery
# Response: { "total": 5 } ✅ (3 old + 2 new)
```

### Test Scenario 3: Fauna with Galleries

```bash
# Same workflow as flora
POST /api/v1/fauna/{id}/approve
# Console log: "✅ Fauna 456 approved. Auto-approved 7 galleries."
```

## SQL Verification

Check gallery status in database:

```sql
-- Before flora approval
SELECT id, entity_type, entity_id, title, status 
FROM galleries 
WHERE entity_type = 'flora' AND entity_id = 123;
-- Result: status = 'draft'

-- After flora approval
-- Result: status = 'approved' ✅
```

## Backend Logs

When approving flora, you'll see:

```
✅ Flora 123 approved. Auto-approved 5 galleries.
```

This confirms cascade approval worked!

## Backward Compatibility

### Existing Galleries (Before Fix)

For galleries that were created before this fix (still `draft`):

**Option 1: Re-approve Flora (Recommended)**
```bash
# Just approve the flora again (even if already approved)
POST /api/v1/flora/{id}/approve
# This will catch all draft galleries and approve them
```

**Option 2: SQL Manual Fix**
```sql
-- Approve all draft galleries for approved flora
UPDATE galleries g
SET status = 'approved'
FROM flora f
WHERE g.entity_type = 'flora'
  AND g.entity_id = f.id
  AND f.status = 'approved'
  AND g.status = 'draft';
```

**Option 3: Use SQL Script**
```bash
cd apps/backend
psql $DATABASE_URL -f scripts/approve_galleries.sql
```

### New Galleries (After Fix)

All new galleries will be auto-approved when flora is approved! ✨

## Edge Cases Handled

### 1. Gallery in Different States
```python
# Only approve draft and in_review galleries
Gallery.status.in_([
    GalleryStatus.draft.value,      # ✅ Will be approved
    GalleryStatus.in_review.value   # ✅ Will be approved
])
# Already approved galleries: unchanged
# Rejected galleries: unchanged
```

### 2. No Galleries
```python
# If flora has no galleries, UPDATE returns 0 rows
# No error, just logs: "Auto-approved 0 galleries."
```

### 3. Transaction Safety
```python
# Both flora and galleries updated in same transaction
await db.commit()
# If commit fails, both rollback together ✅
```

### 4. Multiple Approvals
```python
# Re-approving flora is safe
# Will catch any new draft galleries
# Already approved galleries remain approved
```

## API Response

No change to API response:
```json
{
  "ok": true
}
```

Backend logs provide confirmation:
```
✅ Flora 123 approved. Auto-approved 5 galleries.
```

## Monitoring

Check cascade approval effectiveness:

```sql
-- Count galleries by status for approved entities
SELECT 
    g.entity_type,
    g.status,
    COUNT(*) as count
FROM galleries g
JOIN flora f ON g.entity_type = 'flora' AND g.entity_id = f.id
WHERE f.status = 'approved'
GROUP BY g.entity_type, g.status;

-- Expected result after fix:
-- entity_type | status   | count
-- flora       | approved | 150
-- flora       | draft    | 0     ← Should be 0!
```

## Future Enhancements

### 1. Cascade Reject
```python
# When rejecting flora, also reject galleries
@router.post("/{flora_id}/reject")
async def reject_flora(...):
    obj.status = "rejected"
    
    # Cascade reject galleries
    await db.execute(
        update(Gallery)
        .where(Gallery.entity_type == "flora", ...)
        .values(status=GalleryStatus.rejected.value)
    )
```

### 2. Approval History
```python
# Log cascade approval in audit trail
create_audit_log(
    action="cascade_approve_galleries",
    entity_type="flora",
    entity_id=flora_id,
    details={"gallery_count": gallery_count}
)
```

### 3. Selective Cascade
```python
# Add option to disable cascade
@router.post("/{flora_id}/approve")
async def approve_flora(
    flora_id: int,
    cascade_galleries: bool = True  # Optional flag
):
    if cascade_galleries:
        # Approve galleries
        ...
```

## Files Modified

- ✅ `/apps/backend/api/v1/routes/flora.py`
  - Added Gallery imports
  - Updated `approve_flora()` with cascade logic

- ✅ `/apps/backend/api/v1/routes/fauna.py`
  - Added Gallery imports
  - Updated `approve_fauna()` with cascade logic

## Result

Now ketika super admin approve flora:

### Before Fix ❌
```
1. Approve flora ✅
2. Flora visible in public ✅
3. Galleries NOT visible ❌ (still draft)
4. Manual approve each gallery ❌ (tedious!)
```

### After Fix ✅
```
1. Approve flora ✅
2. Flora visible in public ✅
3. Galleries AUTO-APPROVED ✅
4. Galleries visible in public ✅
5. One-click approval! 🎉
```

Perfect workflow for content management! 📸✨

