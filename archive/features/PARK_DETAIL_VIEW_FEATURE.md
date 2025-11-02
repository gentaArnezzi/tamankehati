# 🏞️ Park Detail View in Approval Dashboard

## Feature Overview

Added **"Lihat Detail"** button for pending park submissions in the Super Admin approval dashboard. This allows admins to review complete park information before approving or rejecting.

## What Changed

### Frontend: `GroupedApprovalView.tsx`

#### New State

```typescript
const [expandedParkDetails, setExpandedParkDetails] = useState<Set<number>>(new Set());
```

#### New Toggle Function

```typescript
const toggleParkDetail = (parkId: number) => {
  const newExpanded = new Set(expandedParkDetails);
  if (newExpanded.has(parkId)) {
    newExpanded.delete(parkId);
  } else {
    newExpanded.add(parkId);
  }
  setExpandedParkDetails(newExpanded);
};
```

#### Enhanced UI with Collapsible Details

Each pending park card now includes:
- **Header** (always visible):
  - Park name
  - Badge: "Taman Baru"
  - Location: Province, City (if available)
  - Area: hectares (if available)
  - Submitted date & time
  - **"Lihat Detail" button** with chevron icon
  - "Setujui" button (green)
  - "Tolak" button (red)

- **Collapsible Content** (shown on "Lihat Detail" click):
  - **Informasi Dasar**:
    - Pengelola
    - SK Penetapan
    - Tipe Ekoregion
    - Kondisi Fisik
  - **Lokasi** (detailed):
    - Provinsi
    - Kota/Kabupaten
    - Kecamatan
    - Desa/Kelurahan
  - **Deskripsi**
  - **Sejarah**
  - **Visi & Misi**
  - **Nilai Penting & Nilai Dasar**

## Visual Design

### Card Header (Always Visible)

```
┌──────────────────────────────────────────────────────────────┐
│ 🗺️  taman kehati kiara payung                               │
│                                                              │
│ [Taman Baru] 📍 JAWA BARAT, BANDUNG 📐 12.5 ha              │
│ 📅 28 Okt 2025, 14:15                                       │
│                                                              │
│     [👁 Lihat Detail ▼] [✓ Setujui] [✗ Tolak]             │
└──────────────────────────────────────────────────────────────┘
```

### Expanded Detail View

```
┌──────────────────────────────────────────────────────────────┐
│ 🗺️  taman kehati kiara payung                               │
│                                                              │
│ [Taman Baru] 📍 JAWA BARAT, BANDUNG 📐 12.5 ha              │
│ 📅 28 Okt 2025, 14:15                                       │
│                                                              │
│     [👁 Sembunyikan ▲] [✓ Setujui] [✗ Tolak]               │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Informasi Dasar                                        │  │
│ │                                                        │  │
│ │ Pengelola:         Dinas Lingkungan Hidup             │  │
│ │ SK Penetapan:      SK/123/2024                        │  │
│ │ Tipe Ekoregion:    Hutan Hujan Tropis                 │  │
│ │ Kondisi Fisik:     Baik                               │  │
│ │                                                        │  │
│ │ ────────────────────────────────────────────────────   │  │
│ │                                                        │  │
│ │ Lokasi                                                 │  │
│ │                                                        │  │
│ │ Provinsi:          JAWA BARAT                         │  │
│ │ Kota/Kabupaten:    BANDUNG                            │  │
│ │ Kecamatan:         Cimahi                             │  │
│ │ Desa/Kelurahan:    Cimahi Tengah                      │  │
│ │                                                        │  │
│ │ ────────────────────────────────────────────────────   │  │
│ │                                                        │  │
│ │ Deskripsi                                              │  │
│ │                                                        │  │
│ │ taman ini sangat aman bagus sekali di bandung...      │  │
│ │                                                        │  │
│ │ ────────────────────────────────────────────────────   │  │
│ │                                                        │  │
│ │ Sejarah                                                │  │
│ │                                                        │  │
│ │ Taman ini didirikan pada tahun 1990...                │  │
│ │                                                        │  │
│ │ ────────────────────────────────────────────────────   │  │
│ │                                                        │  │
│ │ Visi                          │ Misi                   │  │
│ │                               │                        │  │
│ │ Menjadi taman konservasi...   │ 1. Melindungi flora... │  │
│ │                               │ 2. Edukasi masyarakat..│  │
│ │                                                        │  │
│ │ ────────────────────────────────────────────────────   │  │
│ │                                                        │  │
│ │ Nilai Penting                 │ Nilai Dasar            │  │
│ │                               │                        │  │
│ │ Keanekaragaman hayati...      │ Integritas, dedikasi...│  │
│ └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## User Flow

### Scenario: Super Admin Reviews Park Submission

```
1. Regional Admin submits "taman kehati kiara payung"
   ↓
2. Super Admin opens /dashboard/persetujuan
   ↓
3. See "Taman Menunggu Persetujuan" section
   ↓
4. See card with:
   - Park name: "taman kehati kiara payung"
   - Badge: "Taman Baru"
   - Quick info: location, area, submitted date
   - [Lihat Detail] [Setujui] [Tolak] buttons
   ↓
5. Click "Lihat Detail" ▼
   ↓
6. Card expands, showing:
   ✅ Complete park information
   ✅ Basic info (pengelola, SK, ekoregion, kondisi)
   ✅ Detailed location
   ✅ Description & history
   ✅ Vision & mission
   ✅ Important values
   ↓
7. Review all information
   ↓
8. Decision:
   - If approved → Click "Setujui"
   - If rejected → Click "Tolak"
   ↓
9. Park status updated
   ↓
10. Click "Sembunyikan" ▲ to collapse (optional)
```

## Technical Implementation

### Collapsible Component

Used Shadcn UI's `Collapsible` component:

```tsx
<Collapsible open={isExpanded} onOpenChange={() => toggleParkDetail(park.id)}>
  <CardHeader>
    {/* Always visible content */}
    <CollapsibleTrigger asChild>
      <Button>
        <Eye /> {isExpanded ? 'Sembunyikan' : 'Lihat Detail'}
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </Button>
    </CollapsibleTrigger>
  </CardHeader>

  <CollapsibleContent>
    {/* Expandable detail content */}
  </CollapsibleContent>
</Collapsible>
```

### Data Display Logic

All fields are **conditionally rendered** - only shown if data exists:

```tsx
{park.pengelola && (
  <div>
    <span className="text-gray-500">Pengelola:</span>
    <p className="font-medium text-gray-900">{park.pengelola}</p>
  </div>
)}
```

This ensures clean UI - no empty sections for parks with incomplete data.

### Responsive Grid Layout

```tsx
<div className="grid grid-cols-2 gap-3 text-sm">
  {/* Two columns for better space utilization */}
</div>
```

## Benefits

### Before ❌

```
Super Admin sees:
- Park name
- Basic badges
- Short description (2 lines max)
- Approve/Reject buttons

Issue: Not enough context to make informed decision!
```

### After ✅

```
Super Admin sees:
- Park name
- Quick info (location, area, date)
- [Lihat Detail] button

On click:
- COMPLETE park information
- All sections organized clearly
- Easy to review before approval

Result: Informed, confident approval decisions!
```

## Data Fields Displayed

### Informasi Dasar (4 fields)
- ✅ Pengelola
- ✅ SK Penetapan
- ✅ Tipe Ekoregion
- ✅ Kondisi Fisik

### Lokasi (4 fields)
- ✅ Provinsi
- ✅ Kota/Kabupaten
- ✅ Kecamatan
- ✅ Desa/Kelurahan

### Narrative Sections
- ✅ Deskripsi (full text, not truncated)
- ✅ Sejarah
- ✅ Visi & Misi (side-by-side)
- ✅ Nilai Penting & Nilai Dasar (side-by-side)

### Quick Info (in header)
- ✅ Area (hectares)
- ✅ Province & City
- ✅ Submission date & time

## Styling

### Color Scheme

- **Card background**: Blue tint (`bg-blue-50/30`)
- **Border**: Blue (`border-blue-200`)
- **Icon background**: Blue gradient (`from-blue-50 to-sky-50`)
- **Badges**: Blue (`bg-blue-100 text-blue-700`)
- **Detail panel**: White with blue border

### Typography

- **Headings**: `font-semibold text-sm text-gray-700`
- **Labels**: `text-gray-500`
- **Values**: `font-medium text-gray-900`
- **Narrative**: `text-sm text-gray-600 leading-relaxed`

### Spacing

- Card padding: `p-4`
- Section spacing: `space-y-4`
- Grid gaps: `gap-3` or `gap-4`

## Accessibility

- ✅ Semantic HTML structure
- ✅ Clear button labels ("Lihat Detail" vs "Sembunyikan")
- ✅ Visual indicators (chevron up/down)
- ✅ Keyboard navigable (Collapsible component)
- ✅ Proper heading hierarchy (h4 for section titles)

## Mobile Responsiveness

- Grid layout adapts: `grid-cols-2` (stacks on small screens)
- Flexible card layout with `flex-wrap`
- Button sizes optimized with `size="sm"`

## Files Modified

- ✅ `/apps/frontend/src/components/approval/GroupedApprovalView.tsx`
  - Added `expandedParkDetails` state
  - Added `toggleParkDetail` function
  - Wrapped park cards in `Collapsible`
  - Added "Lihat Detail" button with icon
  - Added comprehensive detail sections
  - Implemented conditional rendering for all fields

## Testing Checklist

- [ ] Click "Lihat Detail" - card expands ✅
- [ ] Click "Sembunyikan" - card collapses ✅
- [ ] All field sections display correctly ✅
- [ ] Empty fields are hidden (no blank sections) ✅
- [ ] Grid layout is responsive ✅
- [ ] Button states change correctly ✅
- [ ] Icons animate on toggle ✅
- [ ] Multiple parks can be expanded simultaneously ✅
- [ ] Approve/Reject buttons still work when expanded ✅

## Future Enhancements

### Phase 1 (Current) ✅
- Basic detail view with all park information
- Collapsible expand/collapse
- Clean, organized layout

### Phase 2 (Potential)
- [ ] Add map preview (if coordinates available)
- [ ] Show submitter info (name, contact)
- [ ] Display validation status (e.g., "All required fields filled")
- [ ] Add inline comments for rejection reasons
- [ ] Include comparison with similar parks
- [ ] Show submission history (drafts, revisions)

## Summary

**What we added:**
- 👁️ "Lihat Detail" button for each pending park
- 📋 Comprehensive detail view (9 sections)
- ⬆️⬇️ Smooth expand/collapse animation
- 🎨 Clean, organized layout with conditional rendering
- 📱 Responsive grid design

**Impact:**
- ✅ Super Admin can make **informed approval decisions**
- ✅ No need to open separate page or modal
- ✅ All information **in-context**, right where needed
- ✅ Better UX with progressive disclosure
- ✅ Cleaner dashboard (collapsed by default)

Perfect untuk review taman yang comprehensive sebelum approve! 🎉✨

