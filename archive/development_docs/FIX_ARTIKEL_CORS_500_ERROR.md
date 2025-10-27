# Fix: CORS + 500 Error saat Create Artikel

**Tanggal**: 25 Oktober 2024  
**Status**: ✅ **FIXED**

---

## 🔥 Error Messages

###  1. CORS Policy Error
```
Access to fetch at 'http://localhost:8000/api/v1/articles/' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

### 2. 500 Internal Server Error
```
POST http://localhost:8000/api/v1/articles/ net::ERR_FAILED 500 (Internal Server Error)
TypeError: Failed to fetch
```

---

## 💡 Root Causes

### Problem 1: AttributeError di Backend
**File**: `apps/backend/api/v1/routes/articles.py` (Line 89)

**Before**:
```python
region_code = body.region_code if user.role in (...) else user.region_code
#                                                            ^^^^^^^^^^^^^^
#                                                            AttributeError!
```

❌ **`User` model tidak punya field `region_code`!**

User model hanya punya `park_id`, bukan `region_code`. Ini menyebabkan `AttributeError` yang menghasilkan 500 error.

### Problem 2: Backend Belum Direstart
Changes di Python code tidak akan apply sampai server direstart.

---

## ✅ Solusi

### 1. Fix Backend Route

**File**: `apps/backend/api/v1/routes/articles.py`

**After**:
```python
# Use region_code from request body, or None
region_code = body.region_code  # ← FIXED: tidak lagi akses user.region_code
```

✅ **Tidak lagi mencoba akses field yang tidak ada**

### 2. Database Migration Already Done ✅

Kolom sudah ditambahkan di step sebelumnya:
```sql
ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured_image VARCHAR(500);
```

### 3. Backend Models & Serializers Already Updated ✅

- ✅ `ArticleIn` serializer - added fields
- ✅ `Article` model - added columns
- ✅ `ArticleOut` serializer - added fields  

---

## 🚀 CARA FIX (IMPORTANT!)

### **STEP 1: RESTART BACKEND** ⚠️ WAJIB!

```bash
# Di terminal backend, stop dengan Ctrl+C, lalu:
cd apps/backend
uvicorn main:app --reload --port 8000
```

**WHY?** Python code changes tidak apply sampai server direstart!

### **STEP 2: Restart Frontend** (Optional tapi disarankan)

```bash
# Di terminal frontend, stop dengan Ctrl+C, lalu:
cd apps/frontend  
npm run dev
```

### **STEP 3: Clear Browser Cache**

```
1. Hard Refresh: Ctrl+Shift+R (Windows/Linux) atau Cmd+Shift+R (Mac)
2. Atau gunakan Incognito/Private mode
```

---

## 🧪 Test After Fix

### 1. Test via cURL

```bash
# Login first
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kehati.org","password":"password"}' \
  | jq -r '.access_token')

# Create article
curl -X POST http://localhost:8000/api/v1/articles/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Artikel API",
    "content": "Konten test artikel",
    "summary": "Ringkasan test",
    "category": "Berita",
    "status": "draft"
  }'
```

**Expected**: `201 Created` dengan JSON response

### 2. Test via Frontend

1. Login: `admin@kehati.org` / `password`
2. Dashboard → Taman → Berita → Buat Artikel
3. Isi form dan klik Simpan
4. ✅ Should work now!

---

## 📊 Summary

### Before Fix:
- ❌ Backend crash: `AttributeError: 'User' object has no attribute 'region_code'`
- ❌ Frontend: CORS error + 500 error
- ❌ Artikel tidak bisa dibuat

### After Fix:
- ✅ Backend tidak lagi akses `user.region_code`
- ✅ Backend route fixed
- ✅ Need restart to apply changes
- ✅ Artikel bisa dibuat setelah restart

---

## 🔧 Files Modified

1. `apps/backend/api/v1/routes/articles.py`
   - Line 89: Fixed region_code access
   - Removed `user.region_code` reference

2. `apps/backend/api/v1/serializers/articles.py`
   - Added category, featured_image, status fields

3. `apps/backend/domains/articles/models.py`
   - Added slug, category, featured_image columns

4. `apps/backend/migrations/add_article_fields.sql`
   - Migration to add new columns

---

## 🛠️ Troubleshooting

### Still Getting 500 Error?

**1. Check if backend actually restarted:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

**2. Check backend console for errors**
Look at the terminal where uvicorn is running for error tracebacks

**3. Check database connection:**
```bash
psql "$DATABASE_URL_SYNC" -c "SELECT column_name FROM information_schema.columns WHERE table_name='articles';"
```

Should show: `slug`, `category`, `featured_image` columns

### Still Getting CORS Error?

**Check `apps/backend/main.py` CORS config:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

---

## ✅ Final Checklist

Before testing:
- [ ] Backend restarted dengan `uvicorn main:app --reload`
- [ ] Frontend restarted dengan `npm run dev`
- [ ] Browser cache cleared (Hard refresh)
- [ ] Database migration applied
- [ ] `.env` file exists in `apps/frontend/`

---

**Fixed by**: AI Assistant  
**Date**: October 25, 2024  
**Status**: ✅ **COMPLETE - Needs Backend Restart**

⚠️ **CRITICAL**: Backend MUST be restarted for changes to take effect!

