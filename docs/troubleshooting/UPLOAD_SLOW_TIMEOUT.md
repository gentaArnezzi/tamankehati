# 🐌 Upload Gambar Lambat & Timeout - Troubleshooting Guide

**Masalah**: Upload gambar gallery loading lama sampai bad request atau timeout.

---

## 🔍 Penyebab Masalah

### 1. **File Size Terlalu Besar**
- Default limit: **10MB** per file
- File besar membutuhkan waktu upload lebih lama
- Render.com free tier punya timeout (60-90 detik)

### 2. **Memory Issue di Backend**
- Sebelumnya: Backend membaca seluruh file ke memory sekaligus (`await file.read()`)
- Untuk file 5-10MB, ini bisa menyebabkan:
  - High memory usage
  - Slow processing
  - Timeout

### 3. **Network Speed**
- Upload speed tergantung koneksi internet
- File 5MB dengan upload speed 1Mbps = ~40 detik
- Jika server lambat atau koneksi buruk = timeout

### 4. **Render.com Free Tier Limitations**
- Request timeout: ~60-90 detik
- Jika upload > 60 detik = timeout error
- Server mungkin "sleep" setelah idle (cold start)

---

## ✅ Solusi yang Sudah Diimplementasikan

### **Backend Optimizations** ✅

1. **Streaming Upload (Chunked Reading)**
   ```python
   # SEBELUM (❌ Bad):
   file_content = await file.read()  # Load seluruh file ke memory
   await f.write(file_content)
   
   # SESUDAH (✅ Good):
   while True:
       chunk = await file.read(8192)  # Read 8KB chunks
       if not chunk:
           break
       await f.write(chunk)  # Write immediately
   ```
   
   **Manfaat:**
   - ✅ Tidak load seluruh file ke memory
   - ✅ Lebih efisien untuk file besar
   - ✅ Mengurangi risiko timeout

2. **Size Check Before Processing**
   - Check file size dari header sebelum baca file
   - Fail fast untuk file terlalu besar

3. **Better Error Handling**
   - Clean up partial file jika upload gagal
   - Error messages lebih jelas

### **Frontend Improvements** ✅

1. **Client-side Size Validation**
   ```typescript
   // Check size sebelum upload
   if (file.size > maxSizeBytes) {
     throw new Error("File terlalu besar...");
   }
   ```

2. **Timeout Handling**
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min
   
   fetch(url, {
     signal: controller.signal,
     // ...
   });
   ```

3. **Better Error Messages**
   - Specific errors untuk 413 (too large)
   - Specific errors untuk timeout
   - User-friendly messages dalam Bahasa Indonesia

---

## 🛠️ Langkah Troubleshooting

### **Step 1: Check File Size**
- Pastikan file < **10MB**
- Jika > 10MB, kompres dulu

### **Step 2: Kompres Gambar**
**Before Upload:**
- Tool online: [TinyPNG](https://tinypng.com/), [Squoosh](https://squoosh.app/)
- Target: < 5MB per file
- Format: JPG untuk foto, PNG untuk grafik

### **Step 3: Check Network**
- Test upload di koneksi yang lebih cepat
- Coba upload file kecil dulu untuk test

### **Step 4: Check Browser Console**
- Buka DevTools → Console
- Lihat error messages
- Check network tab untuk melihat request yang failed

### **Step 5: Check Server Logs (Render)**
- Dashboard Render → Logs
- Lihat apakah ada timeout atau error

---

## 📊 Expected Upload Times

**Dengan optimizations baru:**

| File Size | Upload Speed | Expected Time |
|-----------|-------------|---------------|
| 1MB       | 5Mbps       | ~2 seconds    |
| 2MB       | 5Mbps       | ~4 seconds    |
| 5MB       | 5Mbps       | ~10 seconds   |
| 10MB      | 5Mbps       | ~20 seconds   |

**Jika masih lambat:**
- Kemungkinan server Render.com sedang slow (free tier)
- Coba upload di waktu berbeda
- Pertimbangkan upgrade ke paid tier untuk better performance

---

## 🔧 Konfigurasi yang Bisa Diubah

### **Backend (render.yaml)**
```yaml
envVars:
  - key: MAX_FILE_SIZE
    value: 10485760  # 10MB in bytes
```

### **Jika Perlu File Lebih Besar:**
1. Update `MAX_FILE_SIZE` di backend
2. Update `RequestSizeLimitMiddleware` di `main.py`
3. **PENTING**: Render.com free tier mungkin masih timeout untuk file > 10MB

---

## 💡 Tips & Best Practices

### **1. Kompres Gambar Sebelum Upload**
- Target size: 2-5MB per foto
- Gunakan JPG untuk foto (lebih kecil dari PNG)
- Resize ke max 1920x1080 untuk web

### **2. Upload Satu per Satu**
- Jangan upload banyak file sekaligus jika file besar
- Upload satu file, tunggu selesai, baru upload berikutnya

### **3. Monitor Upload Progress**
- Frontend sudah ada loading indicator
- Jika stuck > 2 menit, cancel dan coba lagi

### **4. Fallback untuk File Besar**
- Jika sering timeout, pertimbangkan:
  - Upload ke external storage (S3, Cloudinary)
  - Atau gunakan CDN untuk static files

---

## ❓ FAQ

**Q: Kenapa masih timeout padahal file cuma 5MB?**  
A: Kemungkinan:
1. Network upload speed lambat (< 1Mbps)
2. Render.com server sedang slow (free tier)
3. Try again di waktu berbeda

**Q: Bisa naikkan limit file size?**  
A: Bisa, tapi perlu:
1. Update `MAX_FILE_SIZE` di backend
2. Update middleware `RequestSizeLimitMiddleware`
3. **Warning**: File lebih besar = lebih lama upload = lebih mungkin timeout

**Q: Alternatif untuk file besar?**  
A: Pertimbangkan:
1. External storage (AWS S3, Cloudinary)
2. Direct upload dari frontend ke storage
3. Atau compress file sebelum upload

---

## ✅ Status Perbaikan

- [x] Backend: Streaming upload (chunked reading)
- [x] Backend: Better error handling
- [x] Frontend: Client-side size validation
- [x] Frontend: Timeout handling (2 minutes)
- [x] Frontend: Better error messages
- [x] **✅ DONE**: Image compression di frontend sebelum upload (automatic untuk file > 3MB)
- [ ] **TODO**: Progress indicator untuk upload (optional)

---

**Last Updated**: 2025-01-XX  
**Status**: ✅ Optimizations implemented - Upload should be faster and more reliable now!

---

## 🎉 **NEW: Automatic Image Compression** ✅

### **How It Works:**
- ✅ **Automatic**: Images > 3MB are compressed automatically before upload
- ✅ **Smart**: Only compresses when needed (keeps original for small files)
- ✅ **Optimized**: Target size 2MB, max dimension 1920px, 80% quality
- ✅ **Fast**: Compression happens in browser (no server load)
- ✅ **Fallback**: If compression fails, uses original file

### **Compression Settings:**
- **Max Size**: 2MB (target)
- **Max Dimension**: 1920px (width or height)
- **Quality**: 80% (good balance between size and quality)
- **Format**: Keeps original format (JPG/PNG/WebP)

### **Benefits:**
- 🚀 **Faster Upload**: Smaller files = faster upload
- 💾 **Less Bandwidth**: Reduces data usage
- ⚡ **Fewer Timeouts**: Smaller files less likely to timeout
- 🎯 **Better UX**: Users don't need to compress manually

### **Example:**
```
Original: 8MB photo (4000x3000px)
↓ Compression
Result: ~1.8MB (1920x1440px)
Upload time: 8 seconds → 2 seconds ✅
```

---

**Status**: ✅ Complete - Upload with automatic compression is ready!

