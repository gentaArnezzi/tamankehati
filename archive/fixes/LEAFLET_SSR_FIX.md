# 🗺️ Leaflet SSR Error Fix

## Problem

Error terjadi saat mengakses halaman detail flora/fauna:

```
ReferenceError: window is not defined
at (ssr)/./node_modules/leaflet/dist/leaflet-src.js
```

## Root Cause

**Leaflet** library mencoba mengakses `window` object saat **Server-Side Rendering (SSR)**, padahal `window` hanya tersedia di browser (client-side).

Next.js melakukan SSR by default, jadi komponen yang menggunakan Leaflet akan error jika di-import secara statis.

## Solution

Menggunakan **Next.js Dynamic Import** dengan `ssr: false` untuk memastikan LeafletMap hanya di-load di client-side.

### Before (❌ Error):

```typescript
import { LeafletMap } from '../map/LeafletMap';

export function FloraDetailView({ flora }) {
  return (
    <div>
      {/* ... */}
      <LeafletMap markers={...} />
    </div>
  );
}
```

### After (✅ Fixed):

```typescript
'use client';

import dynamic from 'next/dynamic';

// Dynamic import dengan ssr: false
const LeafletMap = dynamic(
  () => import('../map/LeafletMap').then((mod) => mod.LeafletMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-slate-500 text-sm">Memuat peta...</p>
      </div>
    )
  }
);

export function FloraDetailView({ flora }) {
  return (
    <div>
      {/* ... */}
      <LeafletMap markers={...} />
    </div>
  );
}
```

## Key Points

1. **`'use client'`** directive di top file - Menandakan ini client component
2. **`dynamic()`** dari `next/dynamic` - Load komponen secara dynamic
3. **`ssr: false`** - Skip SSR untuk komponen ini
4. **`loading`** component - Skeleton/placeholder saat loading peta

## Files Fixed

### 1. `FloraDetailView.tsx`
```diff
- import { LeafletMap } from '../map/LeafletMap';
+ import dynamic from 'next/dynamic';
+ 
+ const LeafletMap = dynamic(
+   () => import('../map/LeafletMap').then((mod) => mod.LeafletMap),
+   { ssr: false, loading: () => <LoadingSkeleton /> }
+ );
```

### 2. `FaunaDetailView.tsx`
```diff
+ 'use client';
+ 
- import { LeafletMap } from '../map/LeafletMap';
+ import dynamic from 'next/dynamic';
+ 
+ const LeafletMap = dynamic(
+   () => import('../map/LeafletMap').then((mod) => mod.LeafletMap),
+   { ssr: false, loading: () => <LoadingSkeleton /> }
+ );
```

## Benefits

### User Experience
- ✅ **No More Errors** - Halaman detail flora/fauna bisa diakses tanpa error
- ✅ **Loading State** - User melihat skeleton saat peta loading
- ✅ **Smooth Transition** - Peta muncul setelah page loaded

### Performance
- ✅ **Faster Initial Load** - Peta di-load setelah page render
- ✅ **Code Splitting** - Leaflet bundle tidak block initial render
- ✅ **Client-Only** - Library berat tidak di-process di server

### Developer Experience
- ✅ **Type Safe** - TypeScript tetap bekerja normal
- ✅ **Consistent Pattern** - Bisa digunakan untuk library browser lainnya
- ✅ **No Linter Errors** - Code clean dan sesuai best practices

## How It Works

```
Server Side (SSR):
┌──────────────────────────────────┐
│ 1. Next.js renders page          │
│ 2. Sees dynamic import           │
│ 3. Skips LeafletMap (ssr: false)│
│ 4. Sends HTML to browser         │
└──────────────────────────────────┘
              ↓
Client Side (Browser):
┌──────────────────────────────────┐
│ 1. Browser receives HTML         │
│ 2. Shows loading skeleton        │
│ 3. Downloads Leaflet bundle      │
│ 4. Mounts LeafletMap component   │
│ 5. Map renders successfully! ✅  │
└──────────────────────────────────┘
```

## When to Use This Pattern

Gunakan dynamic import dengan `ssr: false` untuk:

- 🗺️ **Map libraries** (Leaflet, Mapbox, Google Maps)
- 📊 **Chart libraries** yang akses `window` (Chart.js, D3)
- 🎨 **Canvas/WebGL** libraries
- 📷 **Image editors** browser-only
- 🎵 **Media players** dengan Web APIs
- 🎮 **Game engines** browser-based

## Alternative Solutions

### Option 1: Check window exists
```typescript
if (typeof window !== 'undefined') {
  // Use library here
}
```
❌ **Not recommended** - Messy code, hard to maintain

### Option 2: useEffect
```typescript
useEffect(() => {
  // Initialize library here
}, []);
```
❌ **Not ideal** - Still loads library bundle on server

### Option 3: Dynamic Import (RECOMMENDED ✅)
```typescript
const Component = dynamic(
  () => import('./Component'),
  { ssr: false }
);
```
✅ **Best practice** - Clean, performant, recommended by Next.js

## Testing

### Before Fix:
```bash
❌ ReferenceError: window is not defined
```

### After Fix:
```bash
✅ Page loads successfully
✅ Loading skeleton appears
✅ Map renders after page load
✅ No console errors
```

## References

- [Next.js Dynamic Imports](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-no-ssr)
- [Leaflet in Next.js](https://github.com/colbyfayock/next-leaflet-starter)
- [React Leaflet SSR](https://react-leaflet.js.org/docs/start-setup/)

## Related Files

- ✅ `apps/frontend/src/components/public/flora/FloraDetailView.tsx`
- ✅ `apps/frontend/src/components/public/fauna/FaunaDetailView.tsx`
- ✅ `apps/frontend/src/components/maps/LeafletMapWrapper.tsx` (already fixed)
- ✅ `apps/frontend/src/components/maps/LeafletPreview.tsx` (already fixed)

## Result

Halaman detail flora dan fauna sekarang:
- ✅ **No SSR errors**
- ✅ **Peta berfungsi dengan baik**
- ✅ **Loading state yang smooth**
- ✅ **Better performance**
- ✅ **Production ready**

Perfect! 🗺️✨

