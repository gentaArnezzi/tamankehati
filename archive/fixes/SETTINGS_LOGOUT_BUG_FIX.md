# Fix: Settings Page Auto-Logout Bug

## 🐛 Masalah

User di-logout secara otomatis setiap kali mencoba:
- Update foto profil
- Update password
- Update data profil
- Update notifikasi

Di halaman `/dashboard/settings`, dengan notifikasi error: **"Anda harus login terlebih dahulu"**

## 🔍 Root Cause

**Inkonsistensi nama localStorage key untuk token authentication:**

### Token Disimpan Dengan Nama: `auth_token`

Di beberapa file, token disimpan dengan key `'auth_token'`:

1. **`apps/frontend/src/lib/useAuth.tsx`** (Line 93, 158):
```typescript
const storedToken = localStorage.getItem('auth_token');
```

2. **`apps/frontend/src/lib/api-client.ts`** (Line 7, 14):
```typescript
const AUTH_TOKEN_KEY = 'auth_token';
const privateClient = new HttpClient(API_BASE_URL, {
  getAuthToken: () => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(AUTH_TOKEN_KEY); // 'auth_token'
  },
  ...
});
```

### Bug: Settings Page Mencari Token Dengan Nama Salah

Di **`apps/frontend/src/app/dashboard/settings/page.tsx`**, kode mencari token dengan key yang **SALAH**:

```typescript
// ❌ SALAH - mencari 'token' (tidak ada!)
const token = localStorage.getItem('token');
if (!token) {
  toast.error('Anda harus login terlebih dahulu');
  router.push('/login');  // <- Langsung redirect ke login!
  return;
}
```

Karena `localStorage.getItem('token')` return `null` (key-nya tidak ada), maka langsung redirect ke `/login`.

## ✅ Solusi

Ubah semua referensi dari `'token'` menjadi `'auth_token'` di settings page:

### File yang Diperbaiki

**`apps/frontend/src/app/dashboard/settings/page.tsx`**

4 tempat yang diperbaiki:

1. **Line 68** - `handleUpdateProfile()`:
```typescript
- const token = localStorage.getItem('token');
+ const token = localStorage.getItem('auth_token');
```

2. **Line 131** - `handleChangePassword()`:
```typescript
- const token = localStorage.getItem('token');
+ const token = localStorage.getItem('auth_token');
```

3. **Line 174** - `handleUpdateNotifications()`:
```typescript
- const token = localStorage.getItem('token');
+ const token = localStorage.getItem('auth_token');
```

4. **Line 229** - `handleUploadPhoto()`:
```typescript
- const token = localStorage.getItem('token');
+ const token = localStorage.getItem('auth_token');
```

## 🧪 Testing

### Cara Test:

1. **Login** ke aplikasi
2. Buka **Developer Console** (F12) → Tab **Application** → **Local Storage**
3. Verifikasi ada key `auth_token` dengan value JWT token
4. Pergi ke `/dashboard/settings`
5. Coba:
   - ✅ Update nama/email profil
   - ✅ Upload foto profil
   - ✅ Ubah password
   - ✅ Update preferensi notifikasi

### Expected Behavior:

- ✅ User **TIDAK** di-logout
- ✅ Operasi berhasil dengan toast success
- ✅ Data ter-update di UI
- ✅ User tetap di halaman settings

### Before Fix:

- ❌ User langsung di-logout begitu klik tombol simpan/update
- ❌ Muncul notifikasi "Anda harus login terlebih dahulu"
- ❌ Redirect ke `/login`

## 📝 Lessons Learned

### Best Practice untuk Token Storage:

1. **Konsistensi Naming**: Gunakan satu konstanta untuk token key
2. **Centralized Auth Logic**: Jangan hardcode localStorage key di banyak tempat
3. **Use Auth Hook**: Lebih baik pakai `useAuth()` hook daripada direct `localStorage.getItem()`

### Rekomendasi Refactor (Optional):

Alih-alih menggunakan `localStorage.getItem('auth_token')` di setiap fungsi, lebih baik:

```typescript
// ❌ Sebelum (manual check di setiap fungsi)
const token = localStorage.getItem('auth_token');
if (!token) {
  toast.error('Anda harus login terlebih dahulu');
  router.push('/login');
  return;
}

// ✅ Sesudah (pakai auth client yang sudah ada)
import { privateClient } from '@/lib/api-client';

// privateClient sudah otomatis handle token dan error 401
const response = await privateClient.patch('/api/v1/users/me/profile', {
  nama: formData.nama,
  email: formData.email,
});
```

## 🐛 Build Error (Secondary Issue)

### Error Message:
```
Error: x Expected ',', got 'Bearer'
./src/app/dashboard/settings/page.tsx:242:1
```

### Root Cause:
Next.js 15.5.6 parser issue dengan **template literals di dalam object literals** pada headers.

**Masalah**:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,  // ❌ Template literal
}
```

**Solusi**:
```typescript
headers: {
  'Authorization': 'Bearer ' + token,  // ✅ String concatenation
}
```

### Perbaikan:
Ubah **semua template literals** di file ke string concatenation:

**Headers Authorization (4 lokasi):**
- Line 79: `handleUpdateProfile()` 
- Line 142: `handleChangePassword()`
- Line 185: `handleUpdateNotifications()`
- Line 242: `handleUploadPhoto()`

**JSX className (9 lokasi):**
- Line 543-552: Password strength indicator bars
- Line 652-657: Email notifications toggle
- Line 668-673: Push notifications toggle
- Line 684-689: Announcement alerts toggle
- Line 700-705: Approval alerts toggle

## ✨ Status

**FIXED** - Semua bugs sudah diperbaiki:
- ✅ localStorage key inconsistency (4 lokasi)
- ✅ Template literal build errors (13 lokasi total)
  - Headers Authorization: 4 lokasi
  - JSX className: 9 lokasi
- ✅ No linter errors
- ✅ No template literals remaining in file
- ✅ Build successful
- ✅ Ready to deploy

---

**Date Fixed**: October 27, 2025  
**Fixed By**: AI Assistant  
**Issue Type**: Authentication Bug + Build Error  
**Severity**: High (Users completely locked out of settings features)

