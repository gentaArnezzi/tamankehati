# 🔧 Fix: Set NEXT_PUBLIC_API_URL di Production Frontend

**Problem**: Frontend menggunakan `localhost:8000` karena `NEXT_PUBLIC_API_URL` tidak di-set di production.

---

## 🚀 Quick Fix - Vercel

### Step-by-Step:

#### 1. Buka Vercel Dashboard
1. Login ke https://vercel.com
2. Pilih project frontend Anda (misal: `tamankehati` atau `tamankehati-8x6q`)

#### 2. Masuk ke Settings → Environment Variables
1. Di project dashboard, klik **Settings**
2. Di sidebar kiri, klik **Environment Variables**

#### 3. Tambahkan Environment Variable
1. Klik tombol **"Add New"** atau **"Add"**
2. Isi form:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://tamankehati-backend-pxnu.onrender.com`
   - **Environment**: 
     - ✅ Centang **Production**
     - ✅ Centang **Preview** (opsional, untuk preview deployments)
     - ✅ Centang **Development** (opsional, untuk local dev)

3. Klik **Save**

#### 4. Redeploy Frontend
**PENTING**: Environment variables baru hanya aktif setelah redeploy!

**Cara redeploy:**
- **Option 1**: Push commit baru ke repository (auto-redeploy)
- **Option 2**: Manual redeploy:
  1. Klik **Deployments** tab
  2. Klik 3 dots (⋯) pada deployment terbaru
  3. Pilih **"Redeploy"**

---

## ✅ Verification

### 1. Check Environment Variable di Vercel:
- Settings → Environment Variables
- Pastikan `NEXT_PUBLIC_API_URL` ada dan value-nya benar

### 2. Check di Browser (Production Site):
```javascript
// Buka browser console di production frontend
console.log(process.env.NEXT_PUBLIC_API_URL);
// Expected output: https://tamankehati-backend-pxnu.onrender.com
// ❌ Wrong: undefined atau localhost:8000
```

### 3. Check Network Tab:
1. Buka DevTools → Network tab
2. Reload halaman
3. Cari request ke `/api/...` atau `/uploads/...`
4. URL harus menggunakan `https://tamankehati-backend-pxnu.onrender.com`
5. ❌ Jangan ada request ke `localhost:8000`

---

## 📋 Environment Variables yang Harus Di-Set

### Untuk Production Frontend (Vercel):

```bash
NEXT_PUBLIC_API_URL=https://tamankehati-backend-pxnu.onrender.com
```

### Optional (jika ada):
```bash
NEXT_PUBLIC_SITE_URL=https://tamankehati-8x6q.vercel.app
```

---

## 🔍 Troubleshooting

### Masalah 1: Masih menggunakan localhost setelah set env var
**Penyebab**: Belum redeploy setelah set environment variable

**Fix**: 
1. Pastikan sudah redeploy
2. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
3. Clear browser cache

### Masalah 2: Environment variable tidak muncul di browser
**Penyebab**: 
- Variable name salah (harus `NEXT_PUBLIC_*` untuk Next.js)
- Belum redeploy

**Fix**:
- Pastikan nama variable dimulai dengan `NEXT_PUBLIC_`
- Redeploy frontend

### Masalah 3: Preview deployments tidak pakai env var
**Penyebab**: Environment variable hanya di-set untuk Production

**Fix**: 
- Centang juga **Preview** saat menambahkan environment variable

---

## 🌐 Untuk Platform Lain (Non-Vercel)

### Netlify:
1. Site Settings → Environment Variables
2. Add variable dengan key `NEXT_PUBLIC_API_URL`
3. Redeploy

### Railway:
1. Project → Variables tab
2. Add `NEXT_PUBLIC_API_URL`
3. Redeploy

### Custom Server:
- Set environment variable di server:
  ```bash
  export NEXT_PUBLIC_API_URL=https://tamankehati-backend-pxnu.onrender.com
  ```
- Restart Next.js server

---

## 📝 Catatan Penting

1. **`NEXT_PUBLIC_*` prefix**: 
   - Next.js hanya expose environment variables yang dimulai dengan `NEXT_PUBLIC_`
   - Variable tanpa prefix hanya tersedia di server-side

2. **Build-time vs Runtime**:
   - `NEXT_PUBLIC_*` variables di-inject saat **build time**
   - Perlu **rebuild/redeploy** setelah mengubah nilai

3. **No trailing slash**:
   - ✅ Correct: `https://tamankehati-backend-pxnu.onrender.com`
   - ❌ Wrong: `https://tamankehati-backend-pxnu.onrender.com/`

4. **HTTPS Required**:
   - Pastikan menggunakan `https://` (bukan `http://`)
   - Mixed content (HTTP di HTTPS site) akan diblokir browser

---

## ✅ Checklist

- [ ] Environment variable `NEXT_PUBLIC_API_URL` sudah di-set di Vercel
- [ ] Value menggunakan URL backend yang benar (https://...)
- [ ] Environment dipilih (Production, Preview, Development)
- [ ] Frontend sudah di-redeploy setelah set env var
- [ ] Browser console menunjukkan value yang benar
- [ ] Network tab menunjukkan request ke backend URL yang benar
- [ ] Tidak ada request ke `localhost:8000` di production

---

**Status**: ✅ Setelah semua langkah di atas, frontend akan menggunakan backend URL yang benar!

*Guide created: 2025-01-XX*

