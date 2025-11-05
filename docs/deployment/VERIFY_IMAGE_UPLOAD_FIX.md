# Verifikasi Image Upload Fix

## Step 1: Check Backend Logs

```bash
# Check backend logs untuk memastikan tidak ada error
docker compose -f docker-compose.pull.no-nginx.yml logs backend | tail -50

# Check khusus untuk BASE_URL warning
docker compose -f docker-compose.pull.no-nginx.yml logs backend | grep -i "BASE_URL\|WARNING"
```

**Expected:**
- Tidak ada error
- Tidak ada warning tentang "No BASE_URL configured"

## Step 2: Verify Environment Variables

```bash
# Check apakah BASE_URL sudah ter-load
docker compose -f docker-compose.pull.no-nginx.yml exec backend env | grep BASE_URL

# Expected output:
# BASE_URL=http://38.47.93.167:8080
# API_BASE_URL=http://38.47.93.167:8080
# BACKEND_URL=http://38.47.93.167:8080
```

## Step 3: Test Backend Health

```bash
# Test backend health endpoint
curl http://38.47.93.167:8080/health

# Expected: {"ok": true}
```

## Step 4: Test Image Upload API

```bash
# Test upload endpoint (butuh token)
# Ganti YOUR_TOKEN dengan token dari login
curl -X POST http://38.47.93.167:8080/api/v1/upload/gallery-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg"

# Expected response:
# {
#   "success": true,
#   "filename": "20250101_120000_uuid.jpg",
#   "url": "http://38.47.93.167:8080/uploads/20250101_120000_uuid.jpg",
#   "size": 12345,
#   "message": "File uploaded successfully"
# }
```

**Check URL di response:**
- ✅ Harus menggunakan `http://38.47.93.167:8080/uploads/...`
- ❌ TIDAK boleh menggunakan `https://tamankehati-backend-pxnu.onrender.com/...`

## Step 5: Test di Frontend

1. **Login ke aplikasi** di `http://38.47.93.167:8080`

2. **Upload gambar taman:**
   - Buka halaman create/edit park
   - Upload gambar utama
   - Check preview → gambar harus muncul

3. **Upload gambar flora:**
   - Buka halaman create/edit flora
   - Upload gambar utama
   - Check preview → gambar harus muncul

4. **Check approval page:**
   - Buka halaman approval super admin
   - Preview park/flora yang di-upload
   - Gambar harus muncul di preview

5. **Check public page:**
   - Buka halaman public park/flora
   - Gambar yang sudah approved harus muncul

## Step 6: Verify Image URLs di Database (Optional)

```bash
# Connect ke database
docker compose -f docker-compose.pull.no-nginx.yml exec postgres psql -U kehati_user -d kehati_db

# Check park images
SELECT id, name, gambar_utama FROM parks WHERE gambar_utama IS NOT NULL LIMIT 5;

# Check flora images
SELECT id, local_name, gambar_utama FROM flora WHERE gambar_utama IS NOT NULL LIMIT 5;

# Expected:
# - URL harus relative path: /uploads/filename.jpg
# - ATAU full URL dengan server: http://38.47.93.167:8080/uploads/filename.jpg
# - TIDAK boleh ada Render URL: https://tamankehati-backend-pxnu.onrender.com/...
```

## Troubleshooting

### Issue: Images masih tidak muncul

**Check:**
1. Backend logs untuk error
2. Browser console untuk 404 errors
3. Network tab untuk melihat URL yang di-request

**Fix:**
```bash
# Restart backend
docker compose -f docker-compose.pull.no-nginx.yml restart backend

# Check logs lagi
docker compose -f docker-compose.pull.no-nginx.yml logs -f backend
```

### Issue: URL masih menggunakan Render

**Check environment variables:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml exec backend env | grep -E "BASE_URL|BACKEND_URL"
```

**Fix:**
- Pastikan `.env` file sudah di-update dengan `BASE_URL`, `API_BASE_URL`, `BACKEND_URL`
- Restart backend: `docker compose -f docker-compose.pull.no-nginx.yml restart backend`

### Issue: Images 404 Not Found

**Check:**
```bash
# Check apakah file ada di uploads directory
docker compose -f docker-compose.pull.no-nginx.yml exec backend ls -la /app/uploads

# Check permissions
docker compose -f docker-compose.pull.no-nginx.yml exec backend ls -la /app/uploads | head -10
```

**Fix:**
- Pastikan `UPLOAD_DIRECTORY=/app/uploads` di .env
- Check file permissions

## Success Criteria

✅ Backend logs tidak ada error  
✅ Environment variables ter-load dengan benar  
✅ Upload endpoint return URL dengan server IP (bukan Render)  
✅ Images muncul di preview  
✅ Images muncul di approval page  
✅ Images muncul di public page  

## Next Steps

Jika semua test berhasil:
1. ✅ Image upload fix sudah berhasil
2. Test dengan upload gambar baru
3. Monitor untuk beberapa hari untuk memastikan stabil

Jika ada masalah:
1. Check logs
2. Check environment variables
3. Restart backend
4. Test lagi

