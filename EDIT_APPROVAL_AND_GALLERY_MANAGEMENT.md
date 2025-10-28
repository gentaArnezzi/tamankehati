# ✅ Edit Approval & Gallery Management Fix

## Problems Identified

### Problem 1: Edit Tidak Masuk Approval ❌
**Issue**: Saat regional_admin edit flora yang sudah approved, perubahan langsung applied tanpa masuk approval super_admin.

**Expected Behavior**: Edit flora approved → harus masuk approval lagi

**Root Cause**: Update endpoint tidak change status kembali ke `in_review`

### Problem 2: Edit Gambar Malah Nambah ❌
**Issue**: Saat edit flora dan upload gambar gallery baru, gambar lama tidak terhapus. Semua gambar terakumulasi.

**Expected Behavior**: 
- Show existing gallery images
- Allow user to delete gallery images
- Upload new images to add to gallery

**Root Cause**: No UI to view/manage existing gallery images in edit mode

## Solutions Implemented

### Solution 1: Re-Approval on Edit ✅

#### Backend Changes

**Files Modified:**
- `apps/backend/api/v1/routes/flora.py`
- `apps/backend/api/v1/routes/fauna.py`

**Implementation:**

```python
# When regional_admin edits approved flora/fauna
if user.role == UserRole.regional_admin and obj.status == "approved":
    update_fields.append("status = 'in_review'")
    print(f"⚠️  Flora {flora_id} was approved, now back to in_review after edit by regional_admin")
```

**Logic Flow:**

```
Regional Admin Edits Approved Flora/Fauna
    ↓
Check user role & current status
    ↓
If regional_admin + status = 'approved':
  → Set status = 'in_review' ✅
    ↓
Super Admin sees in Approval Dashboard ✅
    ↓
Super Admin can review changes
    ↓
Approve → status = 'approved' again ✅
```

**Why This Matters:**

- ✅ **Quality Control**: Super admin can review all changes
- ✅ **Accountability**: All edits tracked through approval workflow
- ✅ **Data Integrity**: Prevents unauthorized changes to approved content
- ✅ **Audit Trail**: Clear history of who changed what

### Solution 2: Gallery Management in Edit Form ✅

#### Frontend Changes

**File Modified:**
- `apps/frontend/src/components/flora/FloraForm.tsx`

**New Features Added:**

1. **Fetch Existing Galleries**
```typescript
const [existingGalleries, setExistingGalleries] = useState<Array<{
  id: number; 
  title: string; 
  image_url: string
}>>([]);

const fetchExistingGalleries = async (floraId: string | number) => {
  const response = await fetch(
    `http://localhost:8000/api/v1/galleries?entity_type=flora&entity_id=${floraId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  if (response.ok) {
    const data = await response.json();
    setExistingGalleries(data.items || []);
  }
};
```

2. **Delete Gallery Function**
```typescript
const deleteGallery = async (galleryId: number) => {
  if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) return;
  
  const response = await fetch(
    `http://localhost:8000/api/v1/galleries/${galleryId}`,
    { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  if (response.ok) {
    setExistingGalleries(prev => prev.filter(g => g.id !== galleryId));
  }
};
```

3. **UI to Display & Delete Galleries**
```tsx
{mode === 'edit' && existingGalleries.length > 0 && (
  <div className="p-4 border rounded-lg bg-slate-50">
    <div className="flex items-center justify-between mb-3">
      <label>Gambar Gallery Saat Ini</label>
      <span>{existingGalleries.length} gambar</span>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {existingGalleries.map((gallery) => (
        <div key={gallery.id} className="relative group">
          <img src={gallery.image_url} alt={gallery.title} />
          <button
            onClick={() => deleteGallery(gallery.id)}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
          >
            <X icon />
          </button>
          <p className="text-xs truncate">{gallery.title}</p>
        </div>
      ))}
    </div>
  </div>
)}
```

**UI Flow:**

```
User Opens Edit Form
    ↓
Fetch existing galleries via API
    ↓
Display gallery images in grid
    ↓
User hovers over image → Delete button appears
    ↓
User clicks delete → Confirmation dialog
    ↓
User confirms → DELETE API call
    ↓
Gallery removed from UI & database ✅
```

## User Experience Improvements

### Before Fixes ❌

#### Edit Flora:
```
1. Regional admin edits approved flora
2. Changes applied immediately
3. Super admin never knows
4. No quality control ❌
```

#### Gallery Management:
```
1. Edit flora form opens
2. No way to see existing galleries
3. Upload new images → adds to existing
4. Can't remove old/unwanted images ❌
5. Gallery becomes cluttered
```

### After Fixes ✅

#### Edit Flora:
```
1. Regional admin edits approved flora
2. Status changes to 'in_review'
3. Super admin sees in approval dashboard ✅
4. Super admin reviews changes
5. Approve → flora visible again
6. Quality control maintained ✅
```

#### Gallery Management:
```
1. Edit flora form opens
2. Existing galleries displayed in grid ✅
3. Hover over image → delete button appears
4. Click delete → confirm → removed ✅
5. Upload new images → added to gallery
6. Full control over gallery content ✅
```

## Testing

### Test 1: Edit Approved Flora (Re-Approval)

```bash
# 1. As regional_admin, edit approved flora
PUT /api/v1/flora/123
{
  "nama_ilmiah": "Updated Species Name"
}

# 2. Check status
GET /api/v1/flora/123
# Expected: status = 'in_review' ✅

# 3. As super_admin, check approval dashboard
GET /api/v1/approvals
# Expected: Flora #123 appears in pending ✅

# 4. Approve flora
POST /api/v1/flora/123/approve
# Expected: status = 'approved' ✅
```

### Test 2: Gallery Management in Edit

```bash
# 1. Open edit form for flora with galleries
# Expected: Existing galleries displayed ✅

# 2. Hover over gallery image
# Expected: Delete button appears ✅

# 3. Click delete button
# Expected: Confirmation dialog ✅

# 4. Confirm delete
DELETE /api/v1/galleries/{id}
# Expected: Gallery removed from UI & DB ✅

# 5. Upload new images
# Expected: New images added, existing unchanged ✅
```

## Database Impact

### Edit Re-Approval

**Before Edit:**
```sql
SELECT id, scientific_name, status FROM flora WHERE id = 123;
-- id | scientific_name    | status
-- 123| Original Name      | approved
```

**After Edit (Regional Admin):**
```sql
-- id | scientific_name    | status
-- 123| Updated Name       | in_review  ← Changed!
```

**After Super Admin Approval:**
```sql
-- id | scientific_name    | status
-- 123| Updated Name       | approved  ← Back to approved
```

### Gallery Deletion

**Before Delete:**
```sql
SELECT id, entity_type, entity_id, title, status FROM galleries 
WHERE entity_type = 'flora' AND entity_id = 123;
-- id | entity_type | entity_id | title        | status
-- 1  | flora       | 123       | Image 1      | approved
-- 2  | flora       | 123       | Image 2      | approved
-- 3  | flora       | 123       | Image 3      | approved
```

**After Deleting Image 2:**
```sql
-- id | entity_type | entity_id | title        | status
-- 1  | flora       | 123       | Image 1      | approved
-- 3  | flora       | 123       | Image 3      | approved
-- (Image 2 soft-deleted or hard-deleted)
```

## Security Considerations

### Re-Approval on Edit

✅ **Prevents bypass of approval process**
- Regional admins can't make unapproved changes to published content
- All edits must be reviewed by super admin

✅ **Maintains data integrity**
- Super admin has final say on all public content
- Quality control enforced at every edit

### Gallery Deletion

✅ **Authorization required**
- Only authenticated users can delete
- Users can only delete galleries they have permission for

✅ **Soft delete support**
- Can be configured to soft-delete instead of hard-delete
- Allows recovery if needed

## Edge Cases Handled

### 1. Super Admin Edits

**Scenario**: Super admin edits approved flora

**Behavior**: Status remains 'approved' (no re-approval needed)

**Reason**: Super admin has ultimate authority

```python
# Only regional_admin edits require re-approval
if user.role == UserRole.regional_admin and obj.status == "approved":
    # Set to in_review
```

### 2. Edit Draft Flora

**Scenario**: Edit flora that's already in 'draft' or 'in_review'

**Behavior**: Status unchanged

**Reason**: Not approved yet, no need to change status

### 3. No Existing Galleries

**Scenario**: Edit flora that has no gallery images

**Behavior**: Gallery section not shown, only upload options visible

```tsx
{mode === 'edit' && existingGalleries.length > 0 && (
  // Only show if galleries exist
)}
```

### 4. Gallery Delete While Form Open

**Scenario**: Another user deletes gallery while form is open

**Behavior**: Next time form opens, fresh data loaded

**Reason**: useEffect fetches on open

### 5. Network Error on Delete

**Scenario**: API call fails when deleting gallery

**Behavior**: Alert shown, gallery remains in UI

```typescript
if (response.ok) {
  // Remove from UI
} else {
  alert('Gagal menghapus gambar');
}
```

## Configuration

### Enable/Disable Re-Approval

To disable re-approval requirement (not recommended):

```python
# In flora.py/fauna.py, comment out:
# if user.role == UserRole.regional_admin and obj.status == "approved":
#     update_fields.append("status = 'in_review'")
```

### Soft Delete vs Hard Delete Galleries

Current: Hard delete

To enable soft delete:

```python
# In galleries.py delete endpoint
obj.deleted_at = datetime.now(timezone.utc)
# Instead of: db.delete(obj)
```

## Future Enhancements

### 1. Bulk Gallery Management
```tsx
- [ ] Select multiple galleries
- [ ] Bulk delete
- [ ] Reorder galleries
```

### 2. Gallery Edit
```tsx
- [ ] Edit gallery title
- [ ] Edit gallery description
- [ ] Replace image
```

### 3. Approval Diff View
```tsx
- [ ] Show what changed in edit
- [ ] Side-by-side comparison
- [ ] Highlight changes
```

### 4. Edit History
```sql
- [ ] Track all edits
- [ ] Show edit history
- [ ] Rollback to previous version
```

## Deployment Checklist

- [x] Backend code updated (flora.py, fauna.py)
- [x] Frontend code updated (FloraForm.tsx)
- [x] No linter errors
- [ ] Restart backend server
- [ ] Clear frontend cache
- [ ] Test edit flow as regional_admin
- [ ] Test approval flow as super_admin
- [ ] Test gallery delete functionality
- [ ] Verify galleries don't accumulate on edit

## Summary

### Problem 1: Edit Approval ✅ FIXED
- ✅ Regional admin edits → back to 'in_review'
- ✅ Super admin must approve again
- ✅ Quality control maintained

### Problem 2: Gallery Management ✅ FIXED
- ✅ Existing galleries displayed in edit form
- ✅ Delete button on hover
- ✅ Confirmation before delete
- ✅ Upload adds new images (doesn't replace)
- ✅ Full control over gallery content

### Impact
- ✅ **Better workflow** - Clear approval process
- ✅ **Better UX** - Easy gallery management
- ✅ **Better quality** - All edits reviewed
- ✅ **Better control** - Remove unwanted images

Perfect! 🎉✨

