# 🚨 BACKEND MUST BE RESTARTED MANUALLY

**Status**: Backend has been stopped. You need to restart it manually.

---

## ⚠️ CRITICAL: Backend Restart Required

Backend auto-reload (`--reload`) tidak mendeteksi perubahan yang baru saja dilakukan.

**Backend sudah saya STOP**. Silakan restart dengan langkah berikut:

---

## 🚀 LANGKAH RESTART BACKEND

### Terminal 1: Start Backend

```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_23/tamankehati_21/apps/backend
uvicorn main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Will watch for changes in these directories: ['/Users/irgyaarnezzi/Desktop/...']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx]
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Terminal 2: Test Endpoint

Setelah backend running, test dengan:

```bash
# Di terminal baru
curl http://localhost:8000/health
```

**Expected:** `{"status":"ok"}`

---

## 🧪 Test Create Artikel

### Via Terminal (cURL):

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kehati.org","password":"password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# 2. Create artikel
curl -X POST http://localhost:8000/api/v1/articles/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Artikel",
    "content": "Konten test",
    "summary": "Ringkasan",
    "category": "Berita",
    "status": "draft"
  }'
```

**Expected:** `201 Created` dengan JSON artikel yang baru dibuat

### Via Frontend:

1. **Restart frontend juga** (optional tapi disarankan):
   ```bash
   # Terminal frontend: Ctrl+C lalu:
   cd /Users/irgyaarnezzi/Desktop/tamankehati_23/tamankehati_21/apps/frontend
   npm run dev
   ```

2. Buka browser: http://localhost:3000

3. Login: `admin@kehati.org` / `password`

4. Dashboard → Taman → Berita → **Buat Artikel**

5. Isi form dan klik **Simpan**

6. ✅ **Seharusnya berhasil!**

---

## 📋 Checklist Sebelum Test

- [ ] Backend sudah direstart dan running di port 8000
- [ ] `curl http://localhost:8000/health` return `{"status":"ok"}`
- [ ] Frontend running di port 3000
- [ ] Browser cache sudah di-clear (Ctrl+Shift+R)
- [ ] File `.env` ada di `apps/frontend/`

---

## 🐛 Troubleshooting

### Backend tidak mau start?

**Check error message** di terminal. Common issues:

1. **Port already in use:**
   ```bash
   # Kill process yang pakai port 8000
   lsof -ti:8000 | xargs kill -9
   # Lalu restart backend
   ```

2. **Database connection error:**
   ```bash
   # Check DATABASE_URL
   cd apps/backend
   grep DATABASE_URL .env
   ```

3. **Import error atau syntax error:**
   - Look at traceback di terminal
   - Fix the error, then restart

### Masih 500 Error?

**Check backend console** untuk error traceback. Biasanya akan tampil detail error di terminal backend.

### CORS Error Masih Muncul?

Pastikan CORS config di `apps/backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

---

## ✅ Verification

Setelah restart, verify semua berfungsi:

```bash
# 1. Health check
curl http://localhost:8000/health
# ✅ {"status":"ok"}

# 2. Check articles endpoint (should return empty list initially)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/articles/
# ✅ {"items":[],"total":0,...}

# 3. Create article (command di atas)
# ✅ Should return 201 with article JSON

# 4. List articles again
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/articles/
# ✅ Should show the article you just created
```

---

## 📊 Summary of Changes

All code changes have been applied:

1. ✅ `apps/backend/api/v1/routes/articles.py` - Fixed region_code access
2. ✅ `apps/backend/api/v1/serializers/articles.py` - Added fields
3. ✅ `apps/backend/domains/articles/models.py` - Added columns
4. ✅ Database migration - Columns added
5. ✅ Frontend components - Updated to call real API

**Only thing left: RESTART BACKEND!**

---

**Date**: October 25, 2024  
**Status**: ⏳ **Waiting for Manual Backend Restart**

🚀 **After restart, everything should work!**

