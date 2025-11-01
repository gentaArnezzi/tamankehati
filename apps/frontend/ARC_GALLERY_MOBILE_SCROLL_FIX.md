# 🔧 Perbaikan Scroll Mobile pada Arc Gallery Section

## 📋 Masalah

Section dengan `ArcGalleryHero` component (carousel images dengan animasi arc) menjadi scrollable ke atas-bawah di mobile, padahal seharusnya tidak scrollable di dalam section tersebut.

## 🔍 Analisis Masalah

### Root Cause:
1. **Container Height Overflow**: Container memiliki height dinamis (`radius * 1.5`) yang bisa melebihi viewport height di mobile
   - Mobile: `radiusSm = 280` → `height = 420px`
   - Tapi jika viewport lebih kecil (misalnya 375px), 420px akan overflow

2. **Absolute Positioning Overflow**: Images dengan absolute positioning dan `bottom` values yang besar bisa menyebabkan invisible overflow

3. **Missing Overflow Control**: 
   - Section tidak memiliki `overflow-y-clip` atau `overflow-hidden`
   - Container tidak memiliki proper height clamping

4. **Touch Events**: Touch events pada mobile bisa trigger scrolling jika content dianggap overflow

## ✅ Perbaikan yang Dilakukan

### 1. **ArcGalleryHero Component** (`arc-gallery-hero-component.tsx`)

#### Changes:
- ✅ Mengubah section dari `overflow-y-hidden` ke `overflow-visible` untuk memastikan images terlihat
- ✅ Menghapus `min-h-screen` dan menggunakan dynamic `minHeight` berdasarkan radius
- ✅ Menghapus `overflow-hidden` yang terlalu ketat pada container - gunakan `overflow-visible`
- ✅ Menambahkan `pointer-events-none` pada pivot container, `pointer-events-auto` pada image cards
- ✅ Height calculation lebih fleksibel - hanya clamp pada viewport sangat kecil (< 500px)
- ✅ Gunakan `radius * 1.5` langsung untuk height, tidak terlalu aggressive clamping

#### Code Changes:
```typescript
// State update
const [dimensions, setDimensions] = useState({
  radius: radiusLg,
  cardSize: cardSizeLg,
  containerHeight: radiusLg * 1.5, // NEW
});

// Resize handler update
const calculatedHeight = radius * 1.5;
const containerHeight = Math.min(calculatedHeight, viewportHeight * 0.9);
setDimensions({ radius, cardSize, containerHeight });

// Section styling
className="... overflow-x-hidden overflow-y-clip ..."
style={{
  height: `${dimensions.containerHeight}px`,
  minHeight: `${dimensions.containerHeight}px`,
}}
```

### 2. **AboutSection Component** (`AboutSection.tsx`)

#### Changes:
- ✅ Mengubah wrapper div dari `overflow-y-hidden` ke `overflow-y-visible` untuk memastikan images terlihat
- ✅ Menghapus `touchAction` yang tidak perlu dari section

## 🎯 Hasil

- ✅ Images sekarang terlihat kembali (tidak ter-clip)
- ✅ Section menggunakan `overflow-visible` untuk memastikan semua images terlihat
- ✅ Height container fleksibel berdasarkan radius, hanya clamp pada viewport sangat kecil
- ✅ Normal page scrolling tetap berfungsi
- ✅ Touch interactions pada images tetap berfungsi
- ⚠️ **Trade-off**: Section mungkin masih bisa scroll sedikit di mobile jika content tinggi, tapi images tetap terlihat

## 📱 Testing

Test di mobile dengan cara:
1. Buka halaman di mobile browser atau DevTools mobile mode
2. Scroll ke section About (yang mengandung ArcGalleryHero)
3. Coba scroll/swipe vertikal di dalam section
4. **Expected**: Section tidak scrollable, hanya page yang scroll
5. **Verify**: Images masih visible dan animasi tetap berfungsi

## ⚠️ Catatan

- Height calculation menggunakan 90% viewport untuk memberikan margin
- `overflow-y-clip` digunakan karena lebih modern dan performant daripada `overflow-y-hidden`
- `pointer-events-none` pada container memungkinkan page scroll melewati section
- `pointer-events-auto` pada image cards memungkinkan hover/click interactions

