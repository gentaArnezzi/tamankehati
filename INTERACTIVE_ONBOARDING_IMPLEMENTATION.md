# 🎯 Interactive Onboarding Tour - Implementation Guide

**Tanggal**: 27 Oktober 2025  
**Status**: 🚧 In Progress - Needs Data-Tour Attributes

---

## 📋 Overview

Interactive onboarding tour yang memandu regional admin baru **langkah demi langkah** membuat:
1. ✅ Taman pertama mereka (hands-on)
2. ✅ Mengenal cara tambah Flora
3. ✅ Mengenal cara tambah Fauna  
4. ✅ Mengenal cara tambah Kegiatan

**Key Feature**: Tour ini AUTO-TRIGGER untuk regional admin yang belum memiliki taman (user baru).

---

## 🎭 User Flow

```
Regional Admin Baru Login
  ↓
Auto-detect: Belum punya taman?
  ↓
  YES → Auto-trigger Interactive Tour
  ↓
Welcome Screen
  ↓
Navigate ke Taman Menu
  ↓
Klik Tombol "Tambah Taman"
  ↓
Guide Isi Form (Step by step)
  - Nama Taman ✍️
  - Deskripsi ✍️
  - Lokasi (opsional)
  - Detail (opsional)
  ↓
Klik Submit
  ↓
Success! Taman Created 🎉
  ↓
Navigate ke Flora Menu
  ↓
Overview Flora Features
  ↓
Navigate ke Fauna Menu
  ↓
Overview Fauna Features
  ↓
Navigate ke Kegiatan Menu
  ↓
Overview Kegiatan Features
  ↓
Tour Complete! 🎊
```

---

## 📁 Files Created

### 1. **useNewUserDetection.ts** (Hook)
**Path**: `/apps/frontend/src/hooks/useNewUserDetection.ts`

**Purpose**: Detect apakah regional admin adalah user baru (belum punya taman)

**Features**:
- Check jika user punya parks via API
- Check localStorage untuk tour completion status
- Return `isNewUser: boolean`
- Provide `markTourAsCompleted()` function

**Usage**:
```typescript
const { isNewUser, loading, markTourAsCompleted } = useNewUserDetection();

if (isNewUser) {
  // Trigger tour
}
```

### 2. **InteractiveOnboardingTour.tsx** (Component)
**Path**: `/apps/frontend/src/components/InteractiveOnboardingTour.tsx`

**Purpose**: Main interactive tour component

**Features**:
- 16 interactive steps
- Auto-navigation between pages
- Step-by-step form guidance
- Button click triggers
- Beautiful popovers with HTML content

**Steps**:
1. Welcome & Introduction
2. Navigate to Taman Menu
3. Click Add Taman Button
4. Form Introduction
5. Nama Taman Field
6. Deskripsi Field
7. Lokasi Section
8. Submit Button
9. Success & Next Steps
10. Navigate to Flora
11. Flora Page Overview
12. Navigate to Fauna
13. Fauna Page Overview
14. Navigate to Activities
15. Activities Page Overview
16. Final - Completion

---

## 🎨 Data-Tour Attributes Needed

Untuk tour berfungsi dengan baik, kita perlu menambahkan `data-tour` attributes ke elemen-elemen UI berikut:

### ✅ Already Added (in CollapsibleDashboardLayout.tsx):
- `[data-tour="nav-taman"]` - Menu Taman di sidebar
- `[data-tour="nav-flora"]` - Menu Flora di sidebar
- `[data-tour="nav-fauna"]` - Menu Fauna di sidebar
- `[data-tour="nav-kegiatan"]` - Menu Kegiatan di sidebar

### ⚠️ NEED TO ADD:

#### A. Taman Page (`/dashboard/taman`)
- `[data-tour="add-taman-button"]` - Tombol "Tambah Taman" / "+ Taman Baru"

#### B. Taman Form (Dialog/Modal)
- `[data-tour="taman-form"]` - Form container
- `[data-tour="field-nama-taman"]` - Input field Nama Taman
- `[data-tour="field-deskripsi"]` - Textarea Deskripsi
- `[data-tour="section-lokasi"]` - Section Lokasi (Provinsi, Kabupaten, dll)
- `[data-tour="submit-taman-button"]` - Tombol Submit/Simpan

#### C. Flora Page (`/dashboard/taman/flora`)
- `[data-tour="add-flora-button"]` - Tombol "+ Flora Baru"

#### D. Fauna Page (`/dashboard/taman/fauna`)
- `[data-tour="add-fauna-button"]` - Tombol "+ Fauna Baru"

#### E. Activities Page (`/dashboard/taman/activities`)
- `[data-tour="add-activity-button"]` - Tombol "+ Kegiatan Baru"

---

## 🔧 Integration Steps

### Step 1: Add Hook to Dashboard Layout

In `CollapsibleDashboardLayout.tsx`:

```typescript
import { useNewUserDetection } from '../hooks/useNewUserDetection';
import { InteractiveOnboardingTour } from './InteractiveOnboardingTour';

export function CollapsibleDashboardLayout({ ... }) {
  const { isNewUser, markTourAsCompleted } = useNewUserDetection();
  const [runTour, setRunTour] = useState(false);

  // Auto-trigger for new users
  useEffect(() => {
    if (isNewUser) {
      setRunTour(true);
    }
  }, [isNewUser]);

  const handleTourFinish = () => {
    setRunTour(false);
    markTourAsCompleted();
  };

  return (
    <>
      {user?.role === 'regional_admin' && (
        <InteractiveOnboardingTour 
          run={runTour} 
          onFinish={handleTourFinish} 
        />
      )}
      {/* Rest of layout */}
    </>
  );
}
```

### Step 2: Add Data-Tour Attributes to UI Elements

**Need to modify these files**:

1. **TamanSubmissionPage.tsx** or **TamanZonaDashboard.tsx**
   - Add `data-tour="add-taman-button"` to Add button
   - Add `data-tour="taman-form"` to form container
   - Add `data-tour="field-nama-taman"` to name input
   - Add `data-tour="field-deskripsi"` to description textarea
   - Add `data-tour="section-lokasi"` to location section
   - Add `data-tour="submit-taman-button"` to submit button

2. **FloraPage.tsx**
   - Add `data-tour="add-flora-button"` to Add Flora button

3. **FaunaPage.tsx**
   - Add `data-tour="add-fauna-button"` to Add Fauna button

4. **ActivitiesPage.tsx**
   - Add `data-tour="add-activity-button"` to Add Activity button

---

## 💡 Tour Features

### 1. **Auto-Detection**
- Automatically detects new users (no parks yet)
- Auto-triggers on first login
- One-time tour (saved in localStorage)

### 2. **Interactive Guidance**
- Not just tooltips - actual hands-on guidance
- User must click buttons to proceed
- Auto-navigation between pages
- Wait for user actions

### 3. **Smart Navigation**
- Auto-navigate ke halaman yang benar
- Smooth transitions
- Context-aware popovers

### 4. **Progress Tracking**
- Shows current step (e.g., "Langkah 5 dari 16")
- Can go back to previous steps
- Can skip/close tour

### 5. **Beautiful UI**
- Rich HTML descriptions
- Color-coded sections (success, info, warning)
- Icons and emojis
- Responsive layout

---

## 🎨 Custom Styling

The tour uses custom CSS from `/apps/frontend/src/styles/product-tour.css`:

- Brand colors (#356447)
- Beautiful popovers
- Smooth animations
- Dark overlay
- Mobile-responsive

---

## 📊 Success Criteria

Tour is considered successful if:

✅ Auto-triggers for new regional admin (no parks)  
✅ User can navigate through all 16 steps  
✅ User successfully creates first taman  
✅ User understands how to add flora/fauna/activities  
✅ Tour completion is saved (doesn't repeat)  
✅ User can re-run tour from "Panduan" button  

---

## 🐛 Troubleshooting

### Issue: Tour doesn't auto-trigger
**Solution**: Check if user has `role: 'regional_admin'` and no parks

### Issue: Tour step tidak highlight element
**Solution**: Ensure data-tour attribute exists on target element

### Issue: Tour navigation tidak bekerja
**Solution**: Check router.push() URLs are correct

### Issue: Form fields tidak terdeteksi
**Solution**: Add data-tour attributes to all form fields

---

## 🚀 Next Steps

### TODO:
1. ✅ Create useNewUserDetection hook
2. ✅ Create InteractiveOnboardingTour component
3. ⚠️ Add data-tour attributes to Taman page/form
4. ⚠️ Add data-tour attributes to Flora page
5. ⚠️ Add data-tour attributes to Fauna page
6. ⚠️ Add data-tour attributes to Activities page
7. ⚠️ Integrate hook & tour into CollapsibleDashboardLayout
8. ⚠️ Test tour flow end-to-end
9. ⚠️ Fix any navigation issues
10. ⚠️ Polish styling & UX

### Testing Checklist:
- [ ] Login as new regional admin (no parks)
- [ ] Tour auto-triggers
- [ ] Can navigate through all steps
- [ ] Form fields are highlighted correctly
- [ ] Can create taman during tour
- [ ] Tour completes successfully
- [ ] Tour doesn't repeat on next login
- [ ] Can manually re-run tour from Panduan button

---

## 📝 Notes

- Tour is designed to be **hands-on** - user actually creates a taman
- All content in **Bahasa Indonesia**
- **React 18 compatible** using driver.js
- **Mobile responsive**
- **Accessibility friendly**

---

**Status**: ⚠️ Waiting for data-tour attributes to be added to UI elements  
**Next Action**: Add data-tour attributes to taman/flora/fauna/activities pages  
**ETA**: 30-60 minutes

---

## 🎓 User Experience Goals

1. **Reduce Onboarding Time**: From 2 hours → 15 minutes
2. **Increase Confidence**: 90%+ users feel confident after tour
3. **Reduce Support Tickets**: 50% reduction in "how to" questions
4. **Improve Data Quality**: Better initial submissions
5. **Higher Engagement**: Users more likely to submit data regularly

---

**Last Updated**: 27 Oktober 2025  
**Version**: 1.0.0  
**Maintained by**: Development Team

