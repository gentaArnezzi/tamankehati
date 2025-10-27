# Fix "Failed to Fetch" di Halaman Pengumuman

## Status Backend ✅
- ✅ Table `announcements` sudah ada di database (27 kolom)
- ✅ API endpoint `/api/v1/announcements/` berfungsi dengan baik
- ✅ Sudah ada 5 sample data pengumuman
- ✅ Authentication berfungsi normal

## Masalah di Frontend

Frontend tidak bisa fetch data karena **file `.env` tidak ada**, sehingga `NEXT_PUBLIC_API_URL` tidak terset.

## Solusi - Langkah demi Langkah

### 1. Buat File Environment untuk Frontend

```bash
cd apps/frontend
cp env.example .env
```

**Isi file `.env`:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Taman Kehati
NEXT_PUBLIC_APP_VERSION=1.0.0

# Environment
NODE_ENV=development

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### 2. Restart Frontend Server

Setelah membuat file `.env`, restart frontend server:

```bash
# Stop server (Ctrl+C jika sedang running)

# Start ulang
cd apps/frontend
npm run dev
```

Frontend akan berjalan di: http://localhost:3000

### 3. Pastikan Backend Running

Backend harus running di port 8000:

```bash
cd apps/backend
source venv/bin/activate  # atau: . venv/bin/activate
uvicorn main:app --reload --port 8000
```

Backend akan berjalan di: http://localhost:8000

### 4. Test di Browser

1. Buka browser: http://localhost:3000
2. Login sebagai super admin:
   - Email: `admin@kehati.org`
   - Password: `password`
3. Buka Dashboard → Pengumuman
4. Seharusnya muncul 5 pengumuman sample

## Verifikasi Endpoint

Anda bisa test endpoint langsung:

```bash
# Test endpoint (dari root project)
python3 test_announcements_endpoint.py
```

Output yang benar:
```
✅ Table 'announcements' exists
   Records: 5

✅ Endpoint working!
   Total announcements: 5
```

## Troubleshooting

### Still "Failed to Fetch"?

1. **Cek Console Browser (F12 → Console)**
   - Lihat error message lengkapnya
   - Cek apakah ada CORS error

2. **Cek Network Tab (F12 → Network)**
   - Apakah request ke backend tercatat?
   - Status code berapa yang muncul?
   - URL yang dipanggil apa?

3. **Cek Backend Logs**
   - Apakah ada request masuk ke backend?
   - Apakah ada error di backend logs?

4. **Hard Refresh Browser**
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

5. **Clear Browser Cache**
   - Clear cache dan cookies
   - Atau gunakan Incognito/Private mode

### CORS Error?

Pastikan di `apps/backend/main.py` ada CORS middleware:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

### Port Conflict?

- Frontend default: port 3000
- Backend default: port 8000

Jika port sudah terpakai, ganti di command:
```bash
# Frontend dengan port berbeda
npm run dev -- -p 3001

# Backend dengan port berbeda
uvicorn main:app --reload --port 8001

# Jangan lupa update .env:
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## API Endpoints Available

### Announcements Endpoints

| Method | Endpoint | Role Required | Description |
|--------|----------|--------------|-------------|
| GET | `/api/v1/announcements/` | Super Admin, Regional Admin | List all announcements |
| GET | `/api/v1/announcements/{id}` | Super Admin, Regional Admin | Get single announcement |
| POST | `/api/v1/announcements/` | Super Admin | Create announcement |
| PUT | `/api/v1/announcements/{id}` | Super Admin | Update announcement |
| DELETE | `/api/v1/announcements/{id}` | Super Admin | Delete announcement |
| POST | `/api/v1/announcements/{id}/publish` | Super Admin | Publish announcement |
| POST | `/api/v1/announcements/{id}/archive` | Super Admin | Archive announcement |

### Sample Request

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kehati.org","password":"password"}'

# Get announcements (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/v1/announcements/ \
  -H "Authorization: Bearer TOKEN"
```

## Summary

✅ **Backend**: Fully functional dengan 5 sample data
❌ **Frontend**: Perlu file `.env` dan restart server

**Quick Fix:**
```bash
# 1. Buat .env
cd apps/frontend
cp env.example .env

# 2. Restart frontend
npm run dev

# 3. Buka browser
# http://localhost:3000
```

**Test Account:**
- Super Admin: `admin@kehati.org` / `password`
- Regional Admin KALTIM: `kaltim.admin@kehati.org` / `password`
- Regional Admin SUMUT: `sumut.admin@kehati.org` / `password`

---

**Created**: October 25, 2024
**Status**: Backend ✅ | Frontend needs `.env` file

