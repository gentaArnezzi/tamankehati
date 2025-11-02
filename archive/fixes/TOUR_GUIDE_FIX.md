# Tour Guide Fix - Mencegah Restart Saat Ganti Halaman

## Masalah
Tour guide terus mengulang dari awal (step 1) setiap kali berpindah halaman, bukan melanjutkan dari langkah terakhir.

## Penyebab
1. Tour tidak menyimpan progress dengan benar saat berpindah step
2. Tour selalu dimulai dari step 0 meskipun ada step yang tersimpan di localStorage
3. Saat navigasi halaman, tour mencoba me-restart dari step yang sama

## Solusi yang Diterapkan

### 1. Auto-save Progress pada Setiap Step
- Menambahkan penyimpanan otomatis di callback `onPopoverRender` dan `onHighlighted`
- Setiap kali popover ditampilkan atau step di-highlight, progress disimpan ke localStorage
- Key: `onboarding_current_step`

### 2. Resume dari Step Terakhir
- Tour sekarang dimulai dari step terakhir yang tersimpan: `driverObj.drive(savedStep)`
- Jika tidak ada step tersimpan, dimulai dari step 0 (welcome)

### 3. Handle Navigasi Halaman
- Menambahkan `pathname` sebagai dependency di useEffect
- Ketika pathname berubah, tour memastikan tetap di step yang benar
- Jika driver sudah ada, cek apakah perlu pindah ke saved step

### 4. Prevent Interference Saat Navigasi Programmatic
- Menambahkan flag `isNavigatingRef` untuk tracking navigasi programmatic
- Flag di-set `true` sebelum navigasi dan `false` setelah moveNext() selesai
- Mencegah useEffect mengganggu proses navigasi yang sedang berlangsung

### 5. Update Semua Navigation Callbacks
Setiap onNextClick callback sekarang:
```typescript
onNextClick: async () => {
  isNavigatingRef.current = true;  // Set flag
  router.push('/target-page');      // Navigate
  await waitForElement('[data-tour="element"]', 5000);  // Wait for element
  setTimeout(() => {
    if (driverRef.current) {
      driverRef.current.moveNext();  // Move to next step
      isNavigatingRef.current = false;  // Clear flag
    }
  }, 300);
}
```

## File yang Diubah
- `/apps/frontend/src/components/InteractiveOnboardingTour.tsx`

## Cara Kerja Sekarang

### Flow Normal (Tanpa Navigasi):
1. User di step N
2. onPopoverRender → save step N ke localStorage
3. User klik "Selanjutnya"
4. Move ke step N+1
5. onPopoverRender → save step N+1 ke localStorage

### Flow Dengan Navigasi:
1. User di step N (nav button)
2. User klik "Selanjutnya" (step dengan onNextClick)
3. `isNavigatingRef = true`
4. Router navigate ke page baru
5. Pathname berubah → useEffect triggered
6. useEffect melihat `isNavigatingRef = true` → tidak melakukan apa-apa
7. waitForElement menunggu target element ready
8. setTimeout → moveNext() ke step N+1
9. `isNavigatingRef = false`
10. onPopoverRender → save step N+1

### Flow Reload/Refresh Browser:
1. Browser refresh
2. Component mount
3. getSavedStep() → dapat step N dari localStorage
4. Create driver dengan savedStep = N
5. driverObj.drive(N) → tour lanjut dari step N

### Flow Manual Navigation:
1. User sedang di tour step N
2. User manual navigate (bukan via tour) ke page lain
3. Pathname berubah → useEffect triggered
4. Driver masih ada, savedStep = N, currentStep = N
5. Tidak ada action (sudah di step yang benar)
6. Jika user klik "Selanjutnya", tour lanjut normal

## Testing
1. Start tour → step 0 (welcome)
2. Klik next → step 1 (nav-taman)
3. Klik next → navigate ke /dashboard/taman → step 2 (taman-form)
4. Klik next → step 3 (nav-flora)
5. Klik next → navigate ke /dashboard/taman/flora → step 4 (add-flora)
6. Dan seterusnya...

Tour seharusnya TIDAK pernah kembali ke step 0 kecuali:
- User menutup tour (close button)
- Tour selesai (onDestroyed)
- Tour di-restart manual

## Catatan Penting
- localStorage key: `onboarding_current_step`
- Driver instance disimpan di `driverRef.current` (persists across renders)
- Flag `isNavigatingRef` mencegah race condition saat navigasi
- Semua console.log dibiarkan untuk debugging, bisa dihapus nanti

