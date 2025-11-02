# 🔧 Fix CORS Error - Clear Browser Cache

## Problem
Error di browser:
```
Access to fetch at 'http://localhost:8000/api/v1/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Response to preflight request doesn't pass access 
control check: It does not have HTTP ok status.
```

## Root Cause
Backend CORS sudah benar, tapi browser **menyimpan cache** dari error lama.

---

## ✅ Solusi Step-by-Step

### 1. Hard Reload Browser

**Chrome/Edge/Brave:**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

**Safari:**
- Mac: `Cmd + Option + E` (clear cache) lalu `Cmd + R`

### 2. Empty Cache and Hard Reload (Chrome)

1. Buka DevTools (`F12` atau `Cmd + Option + I`)
2. **Klik KANAN** pada refresh button (↻) di browser
3. Pilih: **"Empty Cache and Hard Reload"**

![Location: Browser toolbar, next to address bar]

### 3. Clear All Browser Data

**Chrome Settings:**
```
1. Settings → Privacy and security → Clear browsing data
2. Time range: "All time"
3. Centang:
   ✅ Browsing history
   ✅ Cookies and other site data
   ✅ Cached images and files
4. Click "Clear data"
```

**Quick shortcut:**
- Chrome: `Cmd + Shift + Delete` (Mac) / `Ctrl + Shift + Delete` (Windows)

### 4. Clear Service Workers

```
1. DevTools (F12)
2. Application tab
3. Service Workers → Click "Unregister" untuk semua workers
4. Storage → Clear storage → "Clear site data"
```

### 5. Disable Browser Cache (Development Mode)

**Chrome DevTools:**
```
1. F12 (DevTools)
2. Network tab
3. ✅ Centang "Disable cache"
4. Biarkan DevTools tetap terbuka saat development
```

Ini akan **disable cache selama DevTools terbuka** - perfect untuk development!

### 6. Restart Frontend Server

```bash
# Terminal frontend, tekan Ctrl+C untuk stop
# Lalu start ulang
cd apps/frontend
npm run dev
```

### 7. Test di Incognito/Private Window

**Chrome Incognito:**
- Mac: `Cmd + Shift + N`
- Windows: `Ctrl + Shift + N`

Buka `http://localhost:3000` di incognito - jika berhasil, berarti masalahnya cache!

---

## 🧪 Verify CORS Sudah Benar

Paste di Browser Console (F12 → Console):

```javascript
// Test preflight (OPTIONS)
fetch('http://localhost:8000/api/v1/notifications/', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'Authorization'
  }
})
.then(r => {
  console.log('✅ CORS Status:', r.status);
  console.log('✅ Headers:', [...r.headers.entries()]);
})
.catch(e => console.error('❌ Error:', e));
```

**Expected result:**
```
✅ CORS Status: 200
✅ Headers: [..., ["access-control-allow-origin", "http://localhost:3000"], ...]
```

---

## 🔍 Check Backend CORS Config

Pastikan file `apps/backend/main.py` punya ini:

```python
# Line ~143
DEFAULT_CORS_ORIGINS: List[str] = [
    "http://localhost:3000",      # ✅ Frontend dev
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Line ~154
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Content-Type",
        "Authorization",
        "X-Region-Scope",
        # ...
    ],
    max_age=86400,
)
```

---

## 🚀 Quick Fix (TL;DR)

```bash
# 1. Hard reload browser
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R

# 2. Clear cache
# Chrome: DevTools → Right-click refresh → "Empty Cache and Hard Reload"

# 3. Restart frontend
cd apps/frontend
npm run dev
```

Selesai! 🎉

---

## 💡 Prevention (Untuk Development)

### Disable Cache Permanently saat Development

**Chrome DevTools:**
1. F12 → Settings (gear icon)
2. Preferences → Network
3. ✅ Centang "Disable cache (while DevTools is open)"

Sekarang cache akan disabled otomatis saat DevTools terbuka!

---

## 🐛 Still Not Working?

### Check 1: Backend Running?
```bash
curl -I http://localhost:8000/api/v1/notifications/
# Expected: HTTP 200 atau 401/405 (bukan connection refused)
```

### Check 2: CORS Headers Present?
```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -i http://localhost:8000/api/v1/notifications/
  
# Expected headers:
# access-control-allow-origin: http://localhost:3000
# access-control-allow-credentials: true
```

### Check 3: Frontend Hitting Correct Backend?
Cek di `apps/frontend/.env.local` atau `apps/frontend/src/lib/config.ts`:
```typescript
const API_URL = 'http://localhost:8000';  // ✅ Correct
```

### Check 4: Multiple Backend Instances?
```bash
ps aux | grep uvicorn
# Harus cuma 1 instance di port 8000
```

Kill kalau ada lebih dari satu:
```bash
pkill -f uvicorn
cd apps/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ✅ Verification

Jika CORS bekerja, Anda akan lihat di Network tab (F12):
```
Request URL: http://localhost:8000/api/v1/...
Request Method: OPTIONS (preflight)
Status Code: 200 OK
Response Headers:
  access-control-allow-origin: http://localhost:3000
  access-control-allow-credentials: true
  access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

Lalu actual request (GET/POST/etc):
```
Request Method: GET
Status Code: 200 OK (atau 401/403 jika auth issue)
Response Headers:
  access-control-allow-origin: http://localhost:3000
  access-control-allow-credentials: true
```

**No more CORS errors!** 🎉

