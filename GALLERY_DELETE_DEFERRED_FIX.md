# 🔄 Gallery Delete - Deferred Deletion Fix

## Problem Report

### Issue
When editing flora and deleting gallery images:
1. User clicks **X** (delete) on gallery image
2. User confirms deletion
3. **Gallery immediately deleted from database** (permanent)
4. User clicks **"Batal"** (Cancel) to close form
5. **Expected**: All changes cancelled, gallery restored
6. **Actual**: Gallery ALREADY DELETED permanently ❌

### User Quote
> "harusnya ini tuh submit untuk review dulu baru ke hapus ga si?, ini saya coba cancel malah tetap kehapus"

### Root Cause
Gallery delete API was called **immediately** on button click, not deferred until form submission.

```tsx
// ❌ Old behavior
const deleteGallery = async (galleryId: number) => {
  if (!confirm('Apakah Anda yakin...')) return;
  
  // Immediately deletes from database!
  await fetch(`/api/v1/galleries/${galleryId}`, { method: 'DELETE' });
  
  // User clicks "Batal" → Too late! Already deleted!
};
```

## Solution: Deferred Deletion

### Concept

**Mark for Deletion** → **Delete on Submit**

```
User clicks X → Mark gallery for deletion (client-side only)
                ↓
User clicks "Submit untuk Review" → Actually delete from database
                ↓
User clicks "Batal" → Unmark all, nothing deleted
```

### Implementation

#### 1. Added State for Marked Galleries

```tsx
const [galleriesToDelete, setGalleriesToDelete] = useState<Set<number>>(new Set());
```

Tracks gallery IDs that are marked for deletion (not yet deleted from database).

#### 2. Mark/Unmark Functions

```tsx
const markGalleryForDeletion = (galleryId: number) => {
  if (!confirm('Tandai gambar ini untuk dihapus?\n\nGambar akan dihapus permanent saat Anda klik "Submit untuk Review".')) {
    return;
  }
  
  // Mark for deletion (will be deleted on form submit)
  setGalleriesToDelete(prev => new Set([...prev, galleryId]));
  console.log('Gallery marked for deletion:', galleryId);
};

const unmarkGalleryForDeletion = (galleryId: number) => {
  // Unmark (restore)
  setGalleriesToDelete(prev => {
    const newSet = new Set(prev);
    newSet.delete(galleryId);
    return newSet;
  });
  console.log('Gallery unmarked:', galleryId);
};
```

**Key Point**: No API call! Just client-side state change.

#### 3. Actual Deletion on Submit

```tsx
const deleteMarkedGalleries = async () => {
  // Actually delete galleries that were marked
  const deletePromises = Array.from(galleriesToDelete).map(async (galleryId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/galleries/${galleryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        return { success: true, id: galleryId };
      } else {
        return { success: false, id: galleryId };
      }
    } catch (error) {
      return { success: false, id: galleryId };
    }
  });

  const results = await Promise.all(deletePromises);
  return { 
    successCount: results.filter(r => r.success).length,
    failCount: results.filter(r => !r.success).length
  };
};
```

**Called during form submission**, before updating flora data:

```tsx
const handleSubmit = async (data, submitStatus) => {
  try {
    setUploading(true);
    
    // ✅ Delete marked galleries FIRST before submitting flora data
    if (galleriesToDelete.size > 0) {
      console.log(`🗑️ Deleting ${galleriesToDelete.size} marked galleries...`);
      const deleteResult = await deleteMarkedGalleries();
      console.log(`✅ Deleted ${deleteResult.successCount} galleries`);
    }
    
    // Then upload new images, update flora, etc.
    // ...
    
    // Clear deletion marks on successful submit
    setGalleriesToDelete(new Set());
  } catch (error) {
    // ...
  }
};
```

#### 4. Cancel Restoration

```tsx
const handleClose = () => {
  form.reset();
  setSelectedFile(null);
  setSelectedFiles([]);
  setGalleriesToDelete(new Set()); // ✅ Clear deletion marks on cancel
  onOpenChange(false);
};
```

**Key Point**: If user clicks "Batal", marked galleries are NOT deleted. State is reset.

### UI Visual Indicators

#### Gallery Card States

**Normal State:**
```tsx
<div className="relative group">
  <img src={imageUrl} className="w-full h-24 object-cover rounded" />
  <button onClick={() => markGalleryForDeletion(id)} className="...">
    <X icon /> {/* Delete icon */}
  </button>
  <p className="text-xs text-slate-600">{title}</p>
</div>
```

**Marked for Deletion:**
```tsx
<div className="relative group opacity-50"> {/* Faded */}
  <div className="border-2 border-red-500 rounded"> {/* Red border */}
    <img src={imageUrl} className="w-full h-24 object-cover rounded grayscale" /> {/* Grayscale */}
    
    {/* Red overlay with trash icon */}
    <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-70">
      <TrashIcon className="w-8 h-8 text-white" />
    </div>
  </div>
  
  {/* Undo button (green) */}
  <button onClick={() => unmarkGalleryForDeletion(id)} className="bg-green-500 ...">
    <UndoIcon /> {/* Restore icon */}
  </button>
  
  <p className="text-xs text-red-600 line-through">
    🗑️ Akan dihapus {/* Strikethrough text */}
  </p>
</div>
```

#### Counter Badge

```tsx
<div className="flex items-center gap-2">
  {galleriesToDelete.size > 0 && (
    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
      {galleriesToDelete.size} akan dihapus
    </span>
  )}
  <span className="text-xs text-slate-500">{existingGalleries.length} gambar</span>
</div>
```

#### Warning Message

```tsx
{galleriesToDelete.size > 0 && (
  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
    ⚠️ <strong>{galleriesToDelete.size} gambar</strong> ditandai untuk dihapus. 
    Klik <strong>"Submit untuk Review"</strong> untuk menghapus permanent, 
    atau klik <strong>"Batal"</strong> untuk membatalkan semua perubahan.
  </div>
)}
```

## User Flow Comparison

### Before Fix ❌

```
1. User opens edit flora form
   ↓
2. Sees existing gallery images
   ↓
3. Clicks X to delete image
   ↓
4. Confirms: "Apakah Anda yakin?"
   ↓
5. ❌ Gallery IMMEDIATELY deleted from database
   ↓
6. User thinks: "Oh wait, I didn't mean to delete that!"
   ↓
7. Clicks "Batal" to cancel
   ↓
8. Form closes
   ↓
9. ❌ Gallery STILL DELETED (permanent, irreversible)
```

**Problem**: User has no way to undo deletion!

### After Fix ✅

```
1. User opens edit flora form
   ↓
2. Sees existing gallery images
   ↓
3. Clicks X to delete image
   ↓
4. Confirms: "Tandai gambar ini untuk dihapus?"
   ↓
5. ✅ Gallery MARKED for deletion (not deleted yet)
   ↓
   Visual feedback:
   - Image becomes grayscale
   - Red border appears
   - Red trash overlay
   - Text: "🗑️ Akan dihapus"
   - Green "Undo" button appears
   ↓
6. User has TWO options:
   
   Option A: Submit
   ├─> Clicks "Submit untuk Review"
   ├─> ✅ Gallery ACTUALLY deleted from database
   └─> Flora submitted for review
   
   Option B: Cancel
   ├─> Clicks "Batal"
   ├─> ✅ Marked galleries RESTORED (undeleted)
   └─> No changes saved
```

**Benefit**: User can undo deletion before submitting!

### Additional Flow: Undo Individual Gallery

```
1. User marks 3 galleries for deletion
   ↓
2. Visual: All 3 show red overlay, grayscale
   ↓
3. User thinks: "Actually, I want to keep gallery #2"
   ↓
4. Clicks green "Undo" button on gallery #2
   ↓
5. ✅ Gallery #2 UNMARKED (restored)
   ↓
6. Visual: Gallery #2 back to normal
   ↓
7. Still have 2 galleries marked for deletion
   ↓
8. Clicks "Submit untuk Review"
   ↓
9. ✅ Only 2 galleries deleted (not #2)
```

## Visual Design

### Color Scheme

| State | Colors |
|-------|--------|
| Normal | Gray border, full color image |
| Marked for Deletion | Red border, grayscale image, red overlay |
| Undo Button | Green background, white icon |
| Warning Message | Yellow background, yellow border |
| Counter Badge | Red background, red text |

### Icons

| Action | Icon | Color |
|--------|------|-------|
| Delete | X (cross) | Red |
| Trash Overlay | Trash can | White on red |
| Undo | Undo arrow | White on green |

## State Management

### State Lifecycle

```
Form Open (Edit Mode)
↓
existingGalleries = [] (empty)
galleriesToDelete = Set() (empty)
↓
fetchExistingGalleries(floraId)
↓
existingGalleries = [gallery1, gallery2, gallery3]
galleriesToDelete = Set() (still empty)
↓
User clicks delete on gallery2
↓
galleriesToDelete = Set(gallery2.id)
↓
User clicks delete on gallery3
↓
galleriesToDelete = Set(gallery2.id, gallery3.id)
↓
User clicks undo on gallery2
↓
galleriesToDelete = Set(gallery3.id)
↓
--- Option A: Submit ---
User clicks "Submit untuk Review"
↓
deleteMarkedGalleries() → DELETE /api/v1/galleries/gallery3.id
↓
galleriesToDelete = Set() (cleared)
↓
Form closes
↓
--- Option B: Cancel ---
User clicks "Batal"
↓
galleriesToDelete = Set() (cleared)
↓
Form closes
↓
gallery3 still exists in database (not deleted)
```

## Testing

### Test Case 1: Mark and Submit

**Steps:**
1. Edit flora with 3 gallery images
2. Mark gallery #2 for deletion (click X)
3. Confirm mark
4. Verify: Gallery #2 shows red overlay, grayscale
5. Click "Submit untuk Review"
6. Verify: Form submits successfully
7. Check database: Gallery #2 deleted ✅
8. Check database: Gallery #1, #3 still exist ✅

### Test Case 2: Mark and Cancel

**Steps:**
1. Edit flora with 3 gallery images
2. Mark gallery #2 for deletion (click X)
3. Confirm mark
4. Verify: Gallery #2 shows red overlay, grayscale
5. Click "Batal" (Cancel)
6. Verify: Form closes
7. Re-open edit form
8. Check: Gallery #2 still exists ✅
9. Check database: Gallery #2 NOT deleted ✅

### Test Case 3: Mark, Undo, Submit

**Steps:**
1. Edit flora with 3 gallery images
2. Mark gallery #2 for deletion
3. Mark gallery #3 for deletion
4. Verify: 2 galleries marked (counter shows "2 akan dihapus")
5. Click undo (green button) on gallery #2
6. Verify: Gallery #2 restored (normal appearance)
7. Verify: Counter shows "1 akan dihapus"
8. Click "Submit untuk Review"
9. Check database: Gallery #3 deleted ✅
10. Check database: Gallery #2 still exists ✅

### Test Case 4: Mark All, Undo All, Cancel

**Steps:**
1. Edit flora with 3 gallery images
2. Mark all 3 galleries for deletion
3. Undo all 3 galleries
4. Verify: Counter shows "0 akan dihapus"
5. Verify: No warning message
6. Click "Batal"
7. Check database: All 3 galleries still exist ✅

## Files Modified

- ✅ `/apps/frontend/src/components/flora/FloraForm.tsx`
  - Added `galleriesToDelete` state
  - Added `markGalleryForDeletion()` function
  - Added `unmarkGalleryForDeletion()` function
  - Added `deleteMarkedGalleries()` function
  - Updated `handleSubmit()` to delete marked galleries
  - Updated `handleClose()` to clear marks on cancel
  - Updated gallery card UI with visual indicators
  - Added counter badge
  - Added warning message

## Benefits

### User Experience

| Aspect | Before | After |
|--------|--------|-------|
| Deletion timing | Immediate ❌ | Deferred ✅ |
| Undo capability | None ❌ | Full undo ✅ |
| Visual feedback | None ❌ | Rich indicators ✅ |
| Cancel behavior | Data lost ❌ | Data preserved ✅ |
| User confidence | Low ❌ | High ✅ |

### Safety

- ✅ **Prevents accidental deletions**
- ✅ **Allows bulk operations with review**
- ✅ **Provides clear visual feedback**
- ✅ **Enables granular undo**

### Workflow

```
Old: Click → Confirm → DELETED (irreversible)
New: Click → Mark → Review → Submit → DELETED (reversible until submit)
```

## Future Enhancements

### Phase 1 (Current) ✅
- Mark for deletion
- Visual indicators
- Undo capability
- Deferred deletion on submit

### Phase 2 (Potential)
- [ ] Bulk select (select multiple galleries at once)
- [ ] "Mark all" / "Unmark all" buttons
- [ ] Drag-to-reorder galleries before deletion
- [ ] Confirmation modal with preview before submit
- [ ] Deletion history/log

### Phase 3 (Advanced)
- [ ] Soft delete with restoration period (30 days)
- [ ] Trash bin / recycle bin for galleries
- [ ] "Permanently delete" vs "Move to trash"
- [ ] Batch operations (move, copy, archive)

## Summary

**Problem:**
- Gallery deletion was immediate and irreversible
- Users couldn't undo deletions
- Clicking "Cancel" didn't restore deleted galleries

**Solution:**
- Mark galleries for deletion (client-side)
- Actually delete on form submit
- Cancel restores marked galleries
- Rich visual feedback
- Individual undo capability

**Impact:**
- ✅ Better UX with undo capability
- ✅ Safer deletion workflow
- ✅ Clearer user intent
- ✅ Prevents data loss from accidental clicks
- ✅ Aligns with user expectations ("submit untuk review dulu baru ke hapus")

Perfect! Gallery deletion now works as users expect! 🎉✨

