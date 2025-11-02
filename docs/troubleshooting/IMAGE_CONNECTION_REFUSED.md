# 🔧 Fix: ERR_CONNECTION_REFUSED for Uploaded Images

**Error**: `20251030_032050_60ce485a-c900-40de-a59d-235b7c0d1d6d.jpg:1 Failed to load resource: net::ERR_CONNECTION_REFUSED`

---

## 🔍 Root Cause

Error `ERR_CONNECTION_REFUSED` terjadi ketika:

1. **URL relatif tidak di-resolve dengan benar** - Browser mencoba akses gambar dengan URL relatif yang tidak lengkap
2. **UPLOAD_DIR tidak konsisten** - `upload.py` menggunakan `UPLOAD_DIR` berbeda dengan `main.py` yang menggunakan `UPLOAD_DIRECTORY`
3. **File path mismatch** - File disimpan di satu lokasi tapi URL mengarah ke lokasi lain

---

## ✅ Fix Applied

### 1. Konsistensi UPLOAD_DIRECTORY ✅
**File**: `apps/backend/api/v1/routes/upload.py`

**Changed**:
```python
# Before
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

# After
# Use UPLOAD_DIRECTORY to match main.py static files mount
UPLOAD_DIR = os.getenv("UPLOAD_DIRECTORY") or os.getenv("UPLOAD_DIR") or os.path.join(...)
```

### 2. Frontend URL Handling ✅
Frontend sudah menggunakan helper function `getImageUrl` yang menambahkan `NEXT_PUBLIC_API_URL` untuk URL relatif.

---

## 🧪 Verification

### Check Upload Directory:
```bash
# Di backend, file harus disimpan di:
./uploads/{filename}
# Bukan di:
./uploads/gallery/{filename}  # ❌
./uploads/avatars/{filename}   # ❌ (kecuali untuk profile photos)
```

### Test Image URL:
```bash
# Test dengan full URL
curl -I "https://tamankehati-backend-pxnu.onrender.com/uploads/20251030_032050_60ce485a-c900-40de-a59d-235b7c0d1d6d.jpg"

# Expected: 200 OK atau 404 Not Found (jika file tidak ada)
```

### Check Browser Network Tab:
1. Buka DevTools → Network tab
2. Reload halaman
3. Cari request untuk file `.jpg`
4. Cek URL yang digunakan - harus full URL dengan domain backend

---

## 📝 URL Format

### Correct URL Format:
```
✅ https://tamankehati-backend-pxnu.onrender.com/uploads/20251030_032050_60ce485a-c900-40de-a59d-235b7c0d1d6d.jpg
✅ https://tamankehati-backend-pxnu.onrender.com/uploads/avatars/1_uuid.jpg
```

### Incorrect (will cause ERR_CONNECTION_REFUSED):
```
❌ /uploads/20251030_032050_60ce485a-c900-40de-a59d-235b7c0d1d6d.jpg
❌ uploads/20251030_032050_60ce485a-c900-40de-a59d-235b7c0d1d6d.jpg
❌ 20251030_032050_60ce485a-c900-40de-a59d-235b7c0d1d6d.jpg
```

---

## 🔍 Debugging Steps

### 1. Check Image URL in Frontend:
```javascript
// Di browser console
const imageUrl = "/uploads/20251030_032050_60ce485a-c900-40de-a59d-235b7c0d1d6d.jpg";
const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://tamankehati-backend-pxnu.onrender.com"}${imageUrl}`;
console.log("Full URL:", fullUrl);
```

### 2. Check File Exists on Server:
```bash
# Di backend server, cek apakah file ada
ls -la uploads/ | grep "20251030"
```

### 3. Check Upload Response:
Upload endpoint harus return:
```json
{
  "success": true,
  "filename": "20251030_032050_60ce485a-c900-40de-a59d-235b7c0d1d6d.jpg",
  "url": "/uploads/20251030_032050_60ce485a-c900-40de-a59d-235b7c0d1d6d.jpg",
  ...
}
```

Frontend harus menambahkan `NEXT_PUBLIC_API_URL` prefix.

---

## ⚠️ Common Issues

### Issue 1: Relative URL tidak di-resolve
**Symptom**: Browser mencoba load `localhost:3000/uploads/...` atau URL relatif lainnya

**Fix**: Pastikan semua component menggunakan helper function yang menambahkan API URL:
```typescript
const getImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
};
```

### Issue 2: Upload directory mismatch
**Symptom**: File disimpan di `./uploads/` tapi URL mencoba akses `./uploads/gallery/`

**Fix**: ✅ Fixed - menggunakan `UPLOAD_DIRECTORY` yang sama dengan `main.py`

### Issue 3: File tidak ada di server
**Symptom**: 404 Not Found (bukan ERR_CONNECTION_REFUSED)

**Fix**: Check file existence di server atau re-upload file

---

## 🚀 Solution Summary

**Fix Applied**:
1. ✅ Konsistensi `UPLOAD_DIRECTORY` antara `upload.py` dan `main.py`
2. ✅ Frontend helper functions sudah ada untuk handle relative URLs
3. ✅ Backend endpoint `/uploads/{file_path:path}` sudah ada dengan CORS headers

**If Still Having Issues**:
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Check `NEXT_PUBLIC_API_URL` environment variable di frontend
3. Verify file exists di backend server
4. Check browser Network tab untuk actual URL yang digunakan

---

---

## ⚠️ PRODUCTION ENVIRONMENT SETUP (IMPORTANT!)

### ❌ WRONG - Current Render Setup:
```
UPLOAD_DIR: ./uploads
UPLOAD_DIRECTORY: /tmp/upload  ❌ Temporary directory - files will be lost!
```

### ✅ CORRECT - Production Setup:
```
UPLOAD_DIRECTORY: ./uploads  ✅ Persistent directory
# Or use absolute path that persists:
UPLOAD_DIRECTORY: /opt/render/project/src/uploads
```

**⚠️ Critical**: `/tmp/upload` adalah temporary directory yang akan **dihapus setiap kali service restart**! Gunakan path yang persistent.

### Frontend Environment Variables:
```
NEXT_PUBLIC_API_URL: https://tamankehati-backend-pxnu.onrender.com
```

**⚠️ Must Set**: Pastikan `NEXT_PUBLIC_API_URL` di-set di **Vercel** (atau hosting frontend) dengan nilai backend URL yang benar.

---

**Status**: ✅ Fixed (UPLOAD_DIRECTORY consistency)

**⚠️ Action Required**: Update Render environment variables!

*Fix applied: 2025-01-XX*

