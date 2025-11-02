# 🔧 Production Environment Variables Setup

**Issue**: Images not loading, `ERR_CONNECTION_REFUSED`, files lost after restart

---

## ⚠️ CRITICAL: Render Backend Environment Variables

### Current Issues (from screenshot):
```
❌ UPLOAD_DIRECTORY: /tmp/upload  # Temporary - files will be lost!
❌ NEXT_PUBLIC_API_URL: not set in frontend
```

### ✅ CORRECT Setup for Render Backend:

```bash
# File Upload Directory (MUST be persistent, not /tmp)
UPLOAD_DIRECTORY=./uploads
# OR use absolute path that persists across restarts:
UPLOAD_DIRECTORY=/opt/render/project/src/uploads

# Remove or update UPLOAD_DIR if exists
# Keep only UPLOAD_DIRECTORY to avoid confusion

# Base URLs
BASE_URL=https://tamankehati-backend-pxnu.onrender.com
API_BASE_URL=https://tamankehati-backend-pxnu.onrender.com

# CORS (must include frontend domain)
CORS_ALLOW_ORIGINS=https://tamankehati-8x6q.vercel.app,https://tamankehati.vercel.app,http://localhost:3000

# Environment
ENVIRONMENT=production
DEBUG=false

# Database (Railway)
DATABASE_URL=postgresql+asyncpg://...
DATABASE_URL_SYNC=postgresql://...

# Security
SECRET_KEY=your-secret-key-here
FIREWALL_ENABLED=true
FIREWALL_MODE=blacklist
```

---

## ⚠️ CRITICAL: Frontend (Vercel) Environment Variables

### ✅ MUST SET:

```bash
NEXT_PUBLIC_API_URL=https://tamankehati-backend-pxnu.onrender.com
```

**⚠️ Without this**: Frontend will try to use `localhost:8000` and fail with `ERR_CONNECTION_REFUSED`

### 📖 Detailed Guide:
Lihat: [`SET_NEXT_PUBLIC_API_URL.md`](SET_NEXT_PUBLIC_API_URL.md) untuk panduan lengkap step-by-step.

### Quick Steps:
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://tamankehati-backend-pxnu.onrender.com`
   - Environment: Production, Preview, Development
4. **Redeploy** after adding environment variables (PENTING!)

---

## 📋 Complete Environment Variables Checklist

### Backend (Render):
- ✅ `UPLOAD_DIRECTORY` = `./uploads` (NOT `/tmp/upload`)
- ✅ `BASE_URL` = Backend Render URL
- ✅ `API_BASE_URL` = Backend Render URL
- ✅ `CORS_ALLOW_ORIGINS` = Frontend domains
- ✅ `DATABASE_URL` = Railway PostgreSQL URL
- ✅ `ENVIRONMENT` = `production`
- ✅ `DEBUG` = `false`
- ✅ `SECRET_KEY` = Strong random key
- ✅ `FIREWALL_ENABLED` = `true` (if needed)

### Frontend (Vercel):
- ✅ `NEXT_PUBLIC_API_URL` = Backend Render URL
- ✅ Other Next.js config (if any)

---

## 🔍 Verification Steps

### 1. Check Backend Upload Directory:
```bash
# SSH into Render or check logs
echo $UPLOAD_DIRECTORY
ls -la $UPLOAD_DIRECTORY
```

### 2. Test Image URL:
```bash
# Should return 200 OK, not 404
curl -I "https://tamankehati-backend-pxnu.onrender.com/uploads/your-image.jpg"
```

### 3. Check Frontend Environment:
```javascript
// In browser console (on your frontend site)
console.log(process.env.NEXT_PUBLIC_API_URL);
// Should show: https://tamankehati-backend-pxnu.onrender.com
// NOT: undefined or localhost:8000
```

### 4. Test Image Load:
```javascript
// In browser console
const testUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/test.jpg`;
fetch(testUrl).then(r => console.log("Status:", r.status));
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Using /tmp for uploads
```
UPLOAD_DIRECTORY=/tmp/upload  # Files lost on restart!
```
**Fix**: Use `./uploads` or persistent path

### ❌ Mistake 2: Not setting NEXT_PUBLIC_API_URL in frontend
```
# Frontend tries localhost:8000 → ERR_CONNECTION_REFUSED
```
**Fix**: Set `NEXT_PUBLIC_API_URL` in Vercel environment variables

### ❌ Mistake 3: Inconsistent UPLOAD_DIR vs UPLOAD_DIRECTORY
```
UPLOAD_DIR=./uploads
UPLOAD_DIRECTORY=/tmp/upload  # Conflict!
```
**Fix**: Use only `UPLOAD_DIRECTORY`, remove `UPLOAD_DIR`

### ❌ Mistake 4: Wrong CORS origins
```
CORS_ALLOW_ORIGINS=http://localhost:3000  # Only localhost, missing production
```
**Fix**: Include all frontend domains (dev + production)

---

## ✅ Action Items

### Immediate Actions:

1. **Update Render Backend**:
   - Change `UPLOAD_DIRECTORY` from `/tmp/upload` to `./uploads`
   - Remove `UPLOAD_DIR` if exists (keep only `UPLOAD_DIRECTORY`)
   - Restart service

2. **Update Vercel Frontend**:
   - Add `NEXT_PUBLIC_API_URL=https://tamankehati-backend-pxnu.onrender.com`
   - Redeploy frontend

3. **Verify**:
   - Test image upload
   - Check image loads in frontend
   - Verify files persist after service restart

---

**Status**: ⚠️ **ACTION REQUIRED** - Update environment variables

*Last updated: 2025-01-XX*

