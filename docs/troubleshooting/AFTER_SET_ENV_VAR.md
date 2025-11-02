# ✅ Setelah Set NEXT_PUBLIC_API_URL di Vercel

**Status**: Environment variable sudah di-set ✅  
**Next Steps**: Pastikan sudah redeploy dan fix hardcoded localhost

---

## ✅ Yang Sudah Di-Set (Confirmed)

Dari Vercel dashboard:
- ✅ `NEXT_PUBLIC_API_URL` = `https://tamankehati-backend-pxnu.onrender.com`
- ✅ Updated 3 days ago
- ✅ All Environments

---

## ⚠️ ACTION REQUIRED

### 1. 🔄 REDEPLOY Frontend

**PENTING**: Environment variable hanya aktif setelah redeploy!

**Cara:**
1. Vercel Dashboard → **Deployments** tab
2. Klik 3 dots (⋯) pada deployment terbaru
3. Pilih **"Redeploy"**
4. Tunggu selesai (2-5 menit)

**Atau:**
- Push commit baru ke repository (auto-redeploy)

### 2. 🧹 Clear Browser Cache

Setelah redeploy:
- **Hard Refresh**: `Cmd + Shift + R` (Mac) atau `Ctrl + Shift + R` (Windows)
- **Or**: Test di incognito window (no cache)

### 3. ✅ Fix Hardcoded localhost (Already Done)

Sudah diperbaiki di code:
- ✅ `SettingsPage.tsx` - API endpoint display
- ✅ `layout.tsx` - metadataBase URL

**Butuh rebuild** setelah fix code.

---

## 🧪 Verifikasi

### Test di Browser Console (Production):

```javascript
// 1. Check env var
console.log(process.env.NEXT_PUBLIC_API_URL);
// Expected: https://tamankehati-backend-pxnu.onrender.com

// 2. Test API call
fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
  .then(r => r.json())
  .then(data => console.log("✅ API works:", data))
  .catch(e => console.error("❌ API error:", e));
```

### Check Network Tab:
1. DevTools → Network
2. Reload page
3. Cari request ke `/api/...` atau `/uploads/...`
4. URL harus: `https://tamankehati-backend-pxnu.onrender.com/...`
5. ❌ Jangan ada: `http://localhost:8000/...`

---

## 📋 Checklist

- [x] `NEXT_PUBLIC_API_URL` sudah di-set di Vercel ✅
- [ ] Frontend sudah di-redeploy SETELAH set env var ⚠️
- [ ] Hard refresh browser setelah redeploy
- [ ] Test di incognito window
- [ ] Browser console show correct API URL
- [ ] Network tab show requests ke backend URL (bukan localhost)
- [ ] Hardcoded localhost sudah di-fix di code ✅
- [ ] Code fix sudah di-deploy ⚠️

---

## 🔍 Troubleshooting

### Masih pakai localhost setelah redeploy?

1. **Check Deployment Time:**
   - Deployment harus dibuat SETELAH set env var (3 days ago)
   - Jika lebih lama → perlu redeploy

2. **Clear All Cache:**
   - Browser cache
   - Service Worker (jika ada)
   - CDN cache (Vercel edge cache)

3. **Test di Different Browser:**
   - Chrome, Firefox, Safari
   - Pastikan bukan browser cache issue

---

**Next Action**: 
1. Redeploy frontend ✅ (jika belum)
2. Hard refresh browser
3. Test di production

*Guide updated: 2025-01-XX*

