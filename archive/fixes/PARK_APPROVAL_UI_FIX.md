# 🏞️ Park Approval UI Fix

## Problem

**Issue**: Taman yang di-submit dengan status "Under Review" tidak muncul di approval dashboard super admin.

**Root Cause**: Approval dashboard hanya menampilkan KONTEN (flora/fauna/kegiatan) yang pending per taman, TIDAK menampilkan TAMAN yang pending approval!

## Analysis

### Existing Approval Dashboard Behavior

The approval page (`GroupedApprovalView`) was designed to show:
- **Grouped content approvals** - Flora, Fauna, Kegiatan grouped by park
- NOT park approvals themselves!

So when a NEW park is submitted with no content yet, it doesn't appear anywhere.

### API Structure

```typescript
// This returns CONTENT grouped by park
GET /api/v1/approvals/grouped
Response: {
  groups: [
    {
      parkId: 1,
      parkName: "Kos Mandala",
      items: [...flora/fauna/kegiatan...], // ← Content, not parks!
      floraCount: 1,
      faunaCount: 1,
      ...
    }
  ]
}

// This returns PARKS pending approval (was broken)
GET /api/v1/parks/pending-approval
Response: [
  {
    id: 35,
    name: "taman kehati kiara payung",
    status: "in_review",
    ...
  }
]
```

## Solution Implemented

### 1. Frontend: Updated `GroupedApprovalView.tsx`

**Added:**
- Import `parksApprovalApi` and `MapPin` icon
- State for `pendingParks` and `processingParks`
- Load pending parks in `loadGroupedData()`
- Handlers: `handleApprovePark()` and `handleRejectPark()`
- UI section to display pending parks with approve/reject buttons

**New UI Structure:**

```tsx
<div className="space-y-4">
  {/* Summary Cards */}
  <div className="grid gap-4 md:grid-cols-3">...</div>

  {/* NEW: Pending Parks Section */}
  {pendingParks.length > 0 && (
    <div className="space-y-3">
      <h3>Taman Menunggu Persetujuan</h3>
      {pendingParks.map(park => (
        <Card> {/* Blue-themed card for parks */}
          <CardHeader>
            <MapPin icon />
            <h4>{park.name}</h4>
            <Badge>Taman Baru</Badge>
            <Button onClick={() => handleApprovePark(...)}>
              Setujui Taman
            </Button>
            <Button onClick={() => handleRejectPark(...)}>
              Tolak
            </Button>
          </CardHeader>
        </Card>
      ))}
    </div>
  )}

  {/* Existing: Grouped Content Section */}
  {groups.length > 0 && (
    <div className="space-y-3">
      <h3>Konten Menunggu Persetujuan (per Taman)</h3>
      {groups.map(...)} {/* Existing flora/fauna/kegiatan */}
    </div>
  )}
</div>
```

### 2. Backend: Fixed `/api/v1/parks/pending-approval`

**Problem:**
- Endpoint was querying for status `"pending_approval"`
- But parks are submitted with status `"in_review"`

**Fixed:**

```python
# Before ❌
stmt = select(Park).where(Park.status == "pending_approval")

# After ✅
stmt = select(Park).where(Park.status == "in_review")
```

**Added:**
- `submitted_at` field to response (frontend needs it)

## Visual Design

### Pending Parks Card (Blue Theme)

```
┌──────────────────────────────────────────────────┐
│ 🗺️  taman kehati kiara payung                   │
│                                                  │
│ [Taman Baru] 📍 JAWA BARAT                      │
│ Submitted: 28 Okt 2025                          │
│                                                  │
│ taman ini sangat aman bagus sekali...           │
│                                                  │
│          [✓ Setujui Taman] [✗ Tolak]            │
└──────────────────────────────────────────────────┘
```

### Content Cards (Green Theme) - Existing

```
┌──────────────────────────────────────────────────┐
│ 🌲 Kos Mandala                                   │
│                                                  │
│ [2 Item Menunggu] 🌿 1 Flora 🦋 1 Fauna         │
│                                                  │
│ [👁 Lihat Detail] [✓ Setujui Semua (2)]        │
└──────────────────────────────────────────────────┘
```

## User Flow

### Scenario: New Park Submission

```
Regional Admin:
1. Create park "taman kehati kiara payung"
2. Click "Submit untuk Review"
3. Status → 'in_review'
4. See "Under Review" status ✅

Super Admin:
1. Login to dashboard
2. Go to "Persetujuan" page
3. See NEW SECTION: "Taman Menunggu Persetujuan" ✅
4. See "taman kehati kiara payung" with:
   - Name, location, submitted date
   - Description
   - [Setujui Taman] and [Tolak] buttons
5. Click "Setujui Taman"
6. Confirm approval
7. Park status → 'approved' ✅
8. Regional admin can now add flora/fauna/kegiatan
```

### Scenario: Content Approval (Unchanged)

```
Regional Admin:
1. Add flora to existing approved park
2. Submit for review

Super Admin:
1. Go to "Persetujuan" page
2. See in "Konten Menunggu Persetujuan" section ✅
3. See park with pending flora items
4. Approve individual items or bulk approve
```

## API Endpoints Used

### Frontend Calls

```typescript
// Load pending parks
GET /api/v1/parks/pending-approval
Authorization: Bearer {token}

// Approve park
POST /api/v1/parks/{id}/approve
Authorization: Bearer {token}

// Reject park
POST /api/v1/parks/{id}/reject
Authorization: Bearer {token}
Body: { rejection_reason: "..." }

// Load grouped content approvals (existing)
GET /api/v1/approvals/grouped
Authorization: Bearer {token}
```

## Files Modified

### Frontend

- ✅ `/apps/frontend/src/components/approval/GroupedApprovalView.tsx`
  - Added pending parks state and loading
  - Added approve/reject handlers
  - Added UI section for pending parks
  - Separated parks and content with clear headings

### Backend

- ✅ `/apps/backend/api/v1/routes/parks.py`
  - Fixed `/pending-approval` to use `status == "in_review"`
  - Added `submitted_at` to response

## Testing

### Test Case 1: View Pending Park

```bash
# 1. Submit a park (as regional_admin)
POST /api/v1/parks
{ "name": "Test Park", ... }
# Get id=123, status='draft'

POST /api/v1/parks/123/submit
# Status → 'in_review' ✅

# 2. Check pending-approval endpoint (as super_admin)
GET /api/v1/parks/pending-approval
# Expected: [ { id: 123, name: "Test Park", status: "in_review" } ] ✅

# 3. Check UI (as super_admin)
# Go to /dashboard/persetujuan
# Expected: See "Taman Menunggu Persetujuan" section ✅
# Expected: See "Test Park" with approve/reject buttons ✅
```

### Test Case 2: Approve Park

```bash
# 1. Click "Setujui Taman" button
# Frontend calls: POST /api/v1/parks/123/approve
# Backend changes: status → 'approved' ✅

# 2. Verify
GET /api/v1/parks/123
# Expected: { status: "approved" } ✅

# 3. UI refreshes
# Expected: Park removed from "Taman Menunggu Persetujuan" ✅
# Expected: Park now appears in regional admin's taman list as approved ✅
```

### Test Case 3: Reject Park

```bash
# 1. Click "Tolak" button
# Prompt for reason: "Lokasi tidak sesuai"
# Frontend calls: POST /api/v1/parks/123/reject
# Body: { rejection_reason: "Lokasi tidak sesuai" }

# 2. Verify
GET /api/v1/parks/123
# Expected: {
#   status: "rejected",
#   rejection_reason: "Lokasi tidak sesuai"
# } ✅

# 3. UI refreshes
# Expected: Park removed from pending list ✅
```

## Edge Cases Handled

### 1. No Pending Parks

```typescript
if (groups.length === 0 && pendingParks.length === 0) {
  // Show empty state ✅
}

if (pendingParks.length === 0) {
  // Don't show "Taman Menunggu Persetujuan" section ✅
}
```

### 2. Only Pending Parks (No Content)

```typescript
// Pending parks section shows ✅
// "Konten Menunggu Persetujuan" section doesn't show (groups.length === 0)
```

### 3. Processing State

```typescript
const [processingParks, setProcessingParks] = useState<Set<number>>(new Set());

// While processing, buttons show:
<Button disabled={isProcessing}>
  <Loader2 className="animate-spin" />
  Processing...
</Button>
```

### 4. API Error Handling

```typescript
const [groupData, parkData] = await Promise.all([
  approvalsApi.listGrouped(),
  parksApprovalApi.listPending().catch(() => []), // ← Graceful fallback
]);
```

If parks API fails, still show content approvals.

## Deployment

- [x] Frontend code updated
- [x] Backend code updated
- [x] No linter errors
- [ ] **Restart backend server**
- [ ] Clear browser cache / hard refresh
- [ ] Test park submission flow
- [ ] Test park approval flow

## Benefits

### Before Fix ❌

```
Regional Admin submits park → status 'in_review'
    ↓
Super Admin opens approval dashboard
    ↓
Park NOT VISIBLE (no UI for it!) ❌
    ↓
Park stuck in limbo, never gets approved ❌
```

### After Fix ✅

```
Regional Admin submits park → status 'in_review'
    ↓
Super Admin opens approval dashboard
    ↓
See "Taman Menunggu Persetujuan" section ✅
    ↓
See park with all details ✅
    ↓
Click "Setujui Taman" ✅
    ↓
Park approved and active ✅
```

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Park approval UI | ❌ None | ✅ Dedicated section |
| Backend endpoint | ❌ Wrong status filter | ✅ Correct filter |
| User experience | ❌ Confusing | ✅ Clear workflow |
| Visibility | ❌ Hidden | ✅ Prominent |
| Actions | ❌ None | ✅ Approve/Reject |

Perfect! 🎉✨

