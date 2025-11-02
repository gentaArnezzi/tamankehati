# 🚀 Quick Start: Deploy Taman Kehati

> **Setup:** Backend (Render) + Frontend (Vercel) + Database (Railway)

---

## 📋 Pre-Deployment Checklist

### 1. Railway Database (✅ Sudah Ada)

Copy dari Railway Dashboard:

```
postgresql://postgres:[PASSWORD]@[HOST].railway.app:[PORT]/railway
```

### 2. Generate Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🎯 Step 1: Deploy Backend ke Render (15 menit)

### A. Buat Web Service

1. https://dashboard.render.com/ → **New +** → **Web Service**
2. Connect GitHub repository

### B. Configure

```yaml
Name:           tamankehati-backend
Region:         Singapore
Branch:         main
Root Directory: apps/backend
Runtime:        Python 3

Build Command:  pip install -r requirements.txt
Start Command:  uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2
```

### C. Environment Variables

Copy-paste ke Render Environment Variables:

```bash
DATABASE_URL=postgresql+asyncpg://[RAILWAY_CREDENTIALS]
DATABASE_URL_SYNC=postgresql://[RAILWAY_CREDENTIALS]
SECRET_KEY=[YOUR_GENERATED_SECRET_KEY]
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://your-frontend.vercel.app
UPLOAD_DIRECTORY=/opt/render/project/src/uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### D. Deploy & Verify

1. Click **Deploy**
2. Wait 2-5 menit
3. Test: https://[your-backend].onrender.com/docs

**✅ Copy backend URL untuk step berikutnya**

---

## 🎯 Step 2: Deploy Frontend ke Vercel (10 menit)

### A. Import Project

1. https://vercel.com/ → **New Project**
2. Import dari GitHub
3. Pilih repository `tamankehati_new`

### B. Configure

```yaml
Framework:      Next.js (auto-detected)
Root Directory: apps/frontend

Build Command:   npm run build
Output:          .next
Install Command: npm install
```

### C. Environment Variables

Copy-paste ke Vercel Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://[YOUR_BACKEND_URL].onrender.com
NEXT_PUBLIC_APP_NAME=Taman Kehati
NEXT_PUBLIC_APP_VERSION=2.1.0
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAP_ATTRIBUTION=© OpenStreetMap contributors
NEXT_PUBLIC_DEFAULT_LAT=-6.2088
NEXT_PUBLIC_DEFAULT_LNG=106.8456
NEXT_PUBLIC_DEFAULT_ZOOM=10

NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_MAPS=true
NEXT_PUBLIC_ENABLE_UPLOADS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### D. Deploy & Verify

1. Click **Deploy**
2. Wait 2-5 menit
3. Test: https://[your-app].vercel.app

**✅ Copy frontend URL untuk step berikutnya**

---

## 🔄 Step 3: Update CORS (5 menit)

### Update Backend CORS

1. Render Dashboard → Backend Service → **Environment**
2. Edit `CORS_ORIGINS`:
   ```
   https://[YOUR_FRONTEND_URL].vercel.app
   ```
3. **Manual Deploy** → Deploy latest commit

---

## 🗄️ Step 4: Database Migration (5 menit)

### Via Render Shell

1. Render Dashboard → Service → **Shell**
2. Run:
   ```bash
   alembic upgrade head
   ```

### Or via Local Terminal

```bash
export DATABASE_URL="postgresql+asyncpg://[RAILWAY_CREDENTIALS]"
cd apps/backend
alembic upgrade head
```

---

## 👤 Step 5: Create Admin User (2 menit)

### Via Render Shell

```bash
python init_admin.py
```

Follow prompts to create admin account.

---

## ✅ Verification Checklist

Test semua endpoints:

```bash
# Backend Health
curl https://[backend].onrender.com/api/health

# Backend API Docs
open https://[backend].onrender.com/docs

# Frontend
open https://[frontend].vercel.app

# Login
# Try login dengan admin credentials

# API Connection
# Check browser DevTools → Network tab
# Should see API calls to backend (status 200)
```

---

## 🐛 Quick Troubleshooting

### CORS Error
- ✅ Check `CORS_ORIGINS` di backend = frontend URL (exact match)
- ✅ No trailing slash
- ✅ Redeploy backend after CORS change

### Backend Connection Failed
- ✅ Check `DATABASE_URL` format: `postgresql+asyncpg://...`
- ✅ Railway database running
- ✅ Credentials correct

### Build Failed
- ✅ Check Root Directory: `apps/backend` atau `apps/frontend`
- ✅ Check logs untuk error message
- ✅ Verify requirements.txt / package.json

### Environment Variables Not Working
- ✅ No typos (case-sensitive!)
- ✅ `NEXT_PUBLIC_` prefix for frontend vars
- ✅ Redeploy after adding env vars

---

## 📊 URLs Summary

Simpan semua URLs:

```
Database (Railway):
https://railway.app → [Your Database]

Backend (Render):
https://[backend].onrender.com
https://[backend].onrender.com/docs

Frontend (Vercel):
https://[frontend].vercel.app
```

---

## 💰 Cost Summary

| Platform | Free Tier | Recommended |
|----------|-----------|-------------|
| Railway  | $5/month credit | $5-20/month |
| Render   | 750 hours/month | $7/month (Starter) |
| Vercel   | 100GB bandwidth | Free (adequate) |

**Total:** ~$12-27/month untuk production-ready deployment

---

## 📚 Detailed Guides

Need more details?

- 📖 [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md) - Overview lengkap
- 🎯 [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) - Step-by-step Backend
- 🎯 [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) - Step-by-step Frontend

---

## 🎉 Done!

Aplikasi Anda sudah live!

- ✅ Backend di Render
- ✅ Frontend di Vercel
- ✅ Database di Railway
- ✅ CORS configured
- ✅ Migrations run
- ✅ Admin user created

**Total Time:** ~30-40 menit

---

## 🔄 Future Updates

Untuk deploy updates:

### Backend
1. Push ke GitHub (auto-deploy)
2. Or: Render Dashboard → Manual Deploy

### Frontend
1. Push ke GitHub (auto-deploy)
2. Or: Vercel Dashboard → Redeploy

### Database
```bash
# New migration
cd apps/backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

---

**Questions?** Check detailed guides atau logs di masing-masing platform.

Good luck! 🚀

