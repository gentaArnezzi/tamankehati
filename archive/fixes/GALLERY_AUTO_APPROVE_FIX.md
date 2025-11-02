# 🖼️ Gallery Auto-Approve Fix

## Problem

User upload gambar untuk gallery flora, tapi gallery tidak muncul di halaman detail public meskipun cover image sudah masuk.

## Root Cause

Gallery images dibuat dengan status **`draft`**, tapi endpoint public gallery (`/api/public/flora/{id}/gallery`) hanya menampilkan gallery dengan status **`approved`**.

### Flow Sebelumnya:
```
User upload gambar tambahan
    ↓
Gallery records created with status='draft'
    ↓
Public endpoint filters: status='approved'
    ↓
❌ No galleries shown (status mismatch)
```

## Solution

Implementasi **auto-approve** untuk gallery images:
- Jika user adalah **super_admin** → auto-approve galleries
- Jika flora status **approved** → auto-approve galleries
- Jika regional_admin submit draft → galleries tetap draft

### Flow Setelah Fix:
```
User (super_admin) upload gambar tambahan
    ↓
Gallery records created with status='draft'
    ↓
Auto-approve API call: POST /galleries/{id}/approve
    ↓
Gallery status changed to 'approved'
    ↓
Public endpoint returns approved galleries
    ↓
✅ Galleries shown in detail page!
```

## Changes Made

### 1. Update `gallery-integration.ts`

#### Added `status` field to metadata:
```typescript
interface GalleryMetadata {
  entityType: 'flora' | 'fauna';
  entityId: number | string;
  title: string;
  description: string;
  parkId: number;
  status?: 'draft' | 'in_review' | 'approved';  // NEW ✨
}
```

#### Added auto-approve logic:
```typescript
export async function createGalleryForEntity(
  imageUrl: string,
  metadata: GalleryMetadata
): Promise<void> {
  // ... create gallery ...
  
  // Auto-approve if requested (for super_admin or when status is 'approved')
  if (metadata.status === 'approved' && result.id) {
    const approveResponse = await fetch(
      `${API_BASE_URL}/api/v1/galleries/${result.id}/approve`,
      { method: 'POST', headers: { ... } }
    );
    
    if (approveResponse.ok) {
      console.log('Gallery auto-approved successfully:', result.id);
    }
  }
}
```

### 2. Update `FloraForm.tsx`

#### Added auto-approve logic based on user role:
```typescript
// Auto-approve galleries if user is super_admin or flora status is approved
const galleryStatus = (
  user?.role === 'super_admin' || 
  floraResult.status === 'approved'
) ? 'approved' : 'draft';

// Pass status to gallery creation
await createGalleryForEntity(imageUrl, {
  entityType: 'flora',
  entityId: Number(floraResult.id),
  title: `${data.nama_umum || data.nama_ilmiah}`,
  description: data.deskripsi || '',
  parkId: Number(data.park_id) || 1,
  status: galleryStatus,  // NEW ✨
});
```

### 3. Created Approval Script

**`apps/backend/scripts/approve_all_galleries.py`**

Script untuk approve existing draft galleries:

```bash
# Approve ALL draft galleries
python apps/backend/scripts/approve_all_galleries.py approve-all

# Approve galleries for specific entity
python apps/backend/scripts/approve_all_galleries.py approve-entity --entity-type flora --entity-id 25

# List all galleries with status
python apps/backend/scripts/approve_all_galleries.py list
```

## Usage

### For New Uploads (Auto-approved ✅)

**Super Admin:**
```typescript
// Upload flora with gallery images
// → Flora status: 'approved'
// → Gallery status: 'approved' (auto-approved!)
// → Visible in public page immediately ✅
```

**Regional Admin:**
```typescript
// Upload flora as draft
// → Flora status: 'draft'
// → Gallery status: 'draft'
// → Not visible in public page yet

// Submit for review
// → Flora status: 'in_review'
// → Gallery status: 'draft'
// → Not visible in public page yet

// Super admin approves flora
// → Flora status: 'approved'
// → Gallery status: still 'draft' (needs manual approve)
// → Not visible in public page yet
```

### For Existing Galleries (Manual Approve)

#### Option 1: Use Script (Recommended)

```bash
cd apps/backend

# Activate venv if needed
source venv/bin/activate

# List all galleries
python scripts/approve_all_galleries.py list

# Approve all draft galleries
python scripts/approve_all_galleries.py approve-all

# Or approve specific entity
python scripts/approve_all_galleries.py approve-entity --entity-type flora --entity-id 25
```

#### Option 2: Via Dashboard (UI)

1. Login as **super_admin**
2. Go to **Approvals** page
3. Find gallery items dengan status "In Review" atau "Draft"
4. Click **Approve** button

#### Option 3: Via API (cURL)

```bash
# Get gallery ID from database
curl http://localhost:8000/api/v1/galleries?entity_type=flora&entity_id=25 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Approve gallery
curl -X POST http://localhost:8000/api/v1/galleries/GALLERY_ID/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing

### Step 1: Upload Gallery Images

1. Login as **super_admin** or **regional_admin**
2. Create or edit a flora
3. Upload **"Gambar Tambahan (Opsional)"**
4. Submit

### Step 2: Check Gallery Status

```bash
# Check if galleries were created
curl http://localhost:8000/api/v1/galleries?entity_type=flora&entity_id=25 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check public endpoint
curl http://localhost:8000/api/public/flora/25/gallery
```

### Step 3: View in Public Page

Open: `http://localhost:3000/flora/25`

Expected results:
- ✅ **Super Admin**: Gallery section shows immediately
- ⏳ **Regional Admin**: Gallery section shows "Belum ada foto galeri" (until approved)

### Step 4: Approve Draft Galleries (if needed)

```bash
cd apps/backend
python scripts/approve_all_galleries.py approve-all
```

Then refresh public page → Gallery should appear! 🎉

## Database Check

### Check Gallery Status in Database:

```sql
-- Check all galleries
SELECT id, entity_type, entity_id, title, status 
FROM galleries 
WHERE entity_type = 'flora';

-- Check specific flora galleries
SELECT id, title, status, created_at
FROM galleries 
WHERE entity_type = 'flora' AND entity_id = 25;

-- Update status manually if needed
UPDATE galleries 
SET status = 'approved' 
WHERE entity_type = 'flora' AND entity_id = 25 AND status = 'draft';
```

## Workflow Summary

### For Super Admin:
```
Upload Images
    ↓
✅ Gallery Auto-Approved
    ↓
✅ Visible Immediately in Public Page
```

### For Regional Admin:
```
Upload Images (Draft)
    ↓
Submit for Review
    ↓
Super Admin Approves Flora
    ↓
⚠️ Gallery Still Draft (needs manual approval)
    ↓
Super Admin Approves Gallery (manual/script)
    ↓
✅ Visible in Public Page
```

## Future Improvements

### 1. Cascade Approval
When flora is approved, auto-approve all its galleries:

```python
# In flora approval endpoint
if flora.status == 'approved':
    # Approve all gallery images for this flora
    await db.execute(
        update(Gallery)
        .where(Gallery.entity_type == 'flora', Gallery.entity_id == flora.id)
        .values(status='approved')
    )
```

### 2. Batch Approval UI
Add bulk approve button in galleries list:

```typescript
// In GalleriesPage.tsx
<Button onClick={approveAllDrafts}>
  Approve All Draft Galleries
</Button>
```

### 3. Status Indicator
Show gallery approval status in form:

```typescript
// In FloraForm.tsx
{galleryImages.length > 0 && (
  <div className="text-sm text-slate-600">
    {approvedCount} of {galleryImages.length} images approved
  </div>
)}
```

## Troubleshooting

### Gallery tidak muncul setelah upload?

1. **Check user role:**
   ```javascript
   console.log('User role:', user?.role);
   // Should be 'super_admin' for auto-approve
   ```

2. **Check gallery status:**
   ```bash
   curl http://localhost:8000/api/v1/galleries?entity_type=flora&entity_id=25 \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Check console logs:**
   ```
   ✅ "Gallery record created successfully"
   ✅ "Gallery auto-approved successfully"
   ```

4. **Run approval script:**
   ```bash
   python apps/backend/scripts/approve_all_galleries.py approve-all
   ```

### Error saat approve?

- Check user permissions (only super_admin can approve)
- Check backend logs for errors
- Try manual SQL update as fallback

## Result

✅ **Super admin** dapat upload dan langsung lihat gallery di public page
✅ **Regional admin** upload → perlu approval manual
✅ **Existing galleries** dapat di-approve dengan script
✅ **Public page** menampilkan approved galleries dengan smooth

Perfect workflow! 🖼️✨

