# ✅ Verifikasi: NEXT_PUBLIC_API_URL Sudah Aktif

**Status**: Environment variable sudah di-set di Vercel ✅  
**Masalah**: Masih ada request ke `localhost:8000` ❌

---

## 🔍 Verifikasi Langkah demi Langkah

### 1. ✅ Check Environment Variable di Vercel
Dari screenshot, sudah terkonfirmasi:
- `NEXT_PUBLIC_API_URL` = `https://tamankehati-backend-pxnu.onrender.com`
- Terakhir di-update: 3 hari lalu
- Environment: All Environments ✅

### 2. ⚠️ PASTIKAN SUDAH REDEPLOY

**Environment variable hanya aktif setelah redeploy!**

#### Check Deployment Terakhir:
1. Di Vercel Dashboard → **Deployments** tab
2. Lihat deployment terakhir:
   - **Jika dibuat sebelum 3 hari lalu** → Perlu redeploy!
   - **Jika dibuat setelah set env var** → OK ✅

#### Cara Redeploy:
**Option 1: Manual Redeploy (Cepat)**
1. Deployments tab
2. Klik 3 dots (⋯) pada deployment terbaru
3. Pilih **"Redeploy"**
4. Tunggu selesai (2-5 menit)

**Option 2: Push Commit (Auto-redeploy)**
```bash
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

### 3. 🧪 Test di Browser (Production)

Setelah redeploy selesai, test di production site:

```javascript
// Di browser console (F12)
console.log(process.env.NEXT_PUBLIC_API_URL);
// Expected: https://tamankehati-backend-pxnu.onrender.com
// ❌ Wrong: undefined
```

### 4. 🔍 Check Network Tab

1. Buka DevTools → **Network** tab
2. Reload halaman (Cmd+R / Ctrl+R)
3. Cari request ke:
   - `/api/...`
   - `/uploads/...`
4. Check **Request URL**:
   - ✅ **Correct**: `https://tamankehati-backend-pxnu.onrender.com/api/...`
   - ❌ **Wrong**: `http://localhost:8000/api/...`

### 5. 🧹 Clear Browser Cache

Jika masih pakai localhost, kemungkinan cache:

**Hard Refresh:**
- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`

**Or Clear Cache:**
- Chrome: Settings → Privacy → Clear browsing data → Cached images
- Firefox: Settings → Privacy → Clear Data → Cached Web Content

---

## 🔍 Troubleshooting

### Masalah 1: Masih pakai localhost setelah redeploy

**Penyebab kemungkinan:**
1. Build cache di Vercel
2. Browser cache
3. Service Worker cache (jika ada)

**Fix:**
1. **Invalidate Vercel Build Cache:**
   - Settings → Build & Development Settings
   - Scroll ke "Build Command"
   - Add flag untuk clear cache (opsional)

2. **Hard Refresh Browser:**
   - `Cmd + Shift + R` (Mac)
   - `Ctrl + Shift + R` (Windows)

3. **Test di Incognito/Private Window:**
   - Buka production site di incognito
   - Tidak ada cache → test lebih akurat

### Masalah 2: Environment variable tidak muncul di browser

**Check:**
```javascript
// Di browser console
console.log(process.env.NEXT_PUBLIC_API_URL);
// Jika undefined:
```

**Kemungkinan:**
1. Belum redeploy setelah set env var
2. Variable name salah (harus `NEXT_PUBLIC_*`)
3. Build error (check Vercel logs)

**Fix:**
- Redeploy frontend
- Check build logs di Vercel untuk error

### Masalah 3: Sebagian request pakai localhost, sebagian pakai backend URL

**Penyebab:** Ada hardcoded `localhost:8000` di code

**Fix:**
- Cari semua hardcoded localhost di code
- Replace dengan `process.env.NEXT_PUBLIC_API_URL`

---

## ✅ Checklist Verifikasi

- [ ] `NEXT_PUBLIC_API_URL` sudah di-set di Vercel ✅ (Confirmed from screenshot)
- [ ] Frontend sudah di-redeploy **SETELAH** set env var
- [ ] Deployment terakhir dibuat setelah update env var
- [ ] Browser console show correct API URL
- [ ] Network tab show request ke backend URL (bukan localhost)
- [ ] Hard refresh sudah dilakukan
- [ ] Test di incognito window (no cache)

---

## 🎯 Next Steps

1. **Redeploy frontend** (jika belum)
2. **Hard refresh browser** setelah redeploy
3. **Test di incognito** untuk pastikan tidak ada cache
4. **Check Network tab** untuk verify actual requests

---

**Status**: Environment variable sudah di-set ✅  
**Action Required**: Pastikan sudah redeploy dan clear cache!

*Guide created: 2025-01-XX*

