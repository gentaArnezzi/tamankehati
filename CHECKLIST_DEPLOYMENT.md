# ✅ Checklist Deployment Taman Kehati

## 🎯 Persiapan (10 menit)

### Railway Database
- [ ] Database PostgreSQL sudah dibuat di Railway
- [ ] Copy `DATABASE_URL` dari Railway
- [ ] Database bisa diakses dari luar
- [ ] Note credentials:
  ```
  Host: _______________________
  Port: _______________________
  User: _______________________
  Password: ___________________
  Database: ___________________
  ```

### Generate Secret Key
- [ ] Generate secret key dengan command:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- [ ] Copy dan simpan secret key: ____________________

### GitHub Repository
- [ ] Repository sudah di push ke GitHub
- [ ] Branch `main` up to date
- [ ] All files committed

---

## 🔧 Deploy Backend ke Render (20 menit)

### 1. Create Web Service
- [ ] Buka https://dashboard.render.com/
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select repository: `tamankehati_new`

### 2. Basic Configuration
- [ ] Name: `tamankehati-backend` (atau nama lain)
- [ ] Region: **Singapore**
- [ ] Branch: `main`
- [ ] Root Directory: `apps/backend`
- [ ] Runtime: **Python 3**

### 3. Build & Start Commands
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2`

### 4. Environment Variables
Input satu per satu di Render:

#### Database
- [ ] `DATABASE_URL` = `postgresql+asyncpg://[credentials dari Railway]`
- [ ] `DATABASE_URL_SYNC` = `postgresql://[credentials dari Railway]`

#### Security
- [ ] `SECRET_KEY` = `[hasil generate dari persiapan]`
- [ ] `ALGORITHM` = `HS256`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` = `30`

#### Environment
- [ ] `ENVIRONMENT` = `production`
- [ ] `DEBUG` = `false`

#### CORS (sementara)
- [ ] `CORS_ORIGINS` = `https://your-frontend.vercel.app` (update nanti)

#### Upload & Logging
- [ ] `UPLOAD_DIRECTORY` = `/opt/render/project/src/uploads`
- [ ] `MAX_FILE_SIZE` = `10485760`
- [ ] `LOG_LEVEL` = `INFO`
- [ ] `LOG_FORMAT` = `json`

### 5. Deploy
- [ ] Click "Create Web Service"
- [ ] Tunggu build selesai (2-5 menit)
- [ ] Check logs untuk errors

### 6. Verify Backend
- [ ] Test health endpoint:
  ```
  https://[backend-name].onrender.com/api/health
  ```
- [ ] Buka API docs:
  ```
  https://[backend-name].onrender.com/docs
  ```
- [ ] **SIMPAN URL BACKEND:** ____________________________

---

## 🎨 Deploy Frontend ke Vercel (15 menit)

### 1. Import Project
- [ ] Buka https://vercel.com/
- [ ] Click "New Project"
- [ ] Import dari GitHub
- [ ] Select repository: `tamankehati_new`

### 2. Configuration
- [ ] Framework: **Next.js** (auto-detect)
- [ ] Root Directory: `apps/frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`

### 3. Environment Variables
Input satu per satu di Vercel:

#### API Configuration
- [ ] `NEXT_PUBLIC_API_URL` = `https://[backend-url].onrender.com`

#### App Settings
- [ ] `NEXT_PUBLIC_APP_NAME` = `Taman Kehati`
- [ ] `NEXT_PUBLIC_APP_VERSION` = `2.1.0`
- [ ] `NODE_ENV` = `production`
- [ ] `NEXT_TELEMETRY_DISABLED` = `1`

#### Map Configuration
- [ ] `NEXT_PUBLIC_MAP_TILE_URL` = `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- [ ] `NEXT_PUBLIC_MAP_ATTRIBUTION` = `© OpenStreetMap contributors`
- [ ] `NEXT_PUBLIC_DEFAULT_LAT` = `-6.2088`
- [ ] `NEXT_PUBLIC_DEFAULT_LNG` = `106.8456`
- [ ] `NEXT_PUBLIC_DEFAULT_ZOOM` = `10`

#### Feature Flags
- [ ] `NEXT_PUBLIC_ENABLE_AI` = `true`
- [ ] `NEXT_PUBLIC_ENABLE_MAPS` = `true`
- [ ] `NEXT_PUBLIC_ENABLE_UPLOADS` = `true`
- [ ] `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` = `true`

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Tunggu build selesai (2-5 menit)
- [ ] Check logs untuk errors

### 5. Verify Frontend
- [ ] Buka frontend URL:
  ```
  https://[app-name].vercel.app
  ```
- [ ] Homepage load dengan baik
- [ ] **SIMPAN URL FRONTEND:** ____________________________

---

## 🔄 Update CORS (5 menit)

### Update Backend dengan Frontend URL
- [ ] Buka Render Dashboard
- [ ] Go to backend service
- [ ] Click tab "Environment"
- [ ] Edit `CORS_ORIGINS`:
  ```
  https://[frontend-url].vercel.app
  ```
- [ ] Save changes
- [ ] Click "Manual Deploy" → "Deploy latest commit"
- [ ] Tunggu redeploy selesai

---

## 🗄️ Database Migration (5 menit)

### Option A: Via Render Shell
- [ ] Render Dashboard → Service → Tab "Shell"
- [ ] Tunggu shell terbuka
- [ ] Run command:
  ```bash
  alembic upgrade head
  ```
- [ ] Check output untuk errors

### Option B: Via Local Terminal
- [ ] Set environment variable:
  ```bash
  export DATABASE_URL="postgresql+asyncpg://[railway-credentials]"
  ```
- [ ] Run migration:
  ```bash
  cd apps/backend
  alembic upgrade head
  ```

---

## 👤 Create Admin User (3 menit)

### Via Render Shell
- [ ] Render Dashboard → Service → Tab "Shell"
- [ ] Run:
  ```bash
  python init_admin.py
  ```
- [ ] Input admin details:
  - Email: ________________
  - Password: ________________
  - Nama: ________________
- [ ] **SIMPAN ADMIN CREDENTIALS!**

---

## 🧪 Testing (10 menit)

### Backend Testing
- [ ] API Health check works
- [ ] API Docs accessible
- [ ] Database connected (check logs)

### Frontend Testing
- [ ] Homepage loads
- [ ] No CORS errors (check browser console)
- [ ] API calls working (check Network tab)

### Full Flow Testing
- [ ] Login dengan admin credentials
- [ ] Dashboard accessible
- [ ] Maps loading
- [ ] Try submit flora/fauna
- [ ] Try upload image
- [ ] Check approval workflow

### Browser Console Check
- [ ] Buka DevTools (F12)
- [ ] Tab Console: No red errors
- [ ] Tab Network: API calls status 200

---

## 🎯 Post-Deployment

### URLs Summary
Simpan semua URLs penting:

```
DATABASE (Railway):
https://railway.app → Database

BACKEND (Render):
URL: https://[backend].onrender.com
Docs: https://[backend].onrender.com/docs
Dashboard: https://dashboard.render.com

FRONTEND (Vercel):
URL: https://[frontend].vercel.app
Dashboard: https://vercel.com/dashboard

ADMIN LOGIN:
Email: ________________
Password: ________________
```

### Monitoring Setup
- [ ] Enable email notifications di Render
- [ ] Enable email notifications di Vercel
- [ ] Bookmark dashboard URLs
- [ ] Setup uptime monitoring (optional):
  - UptimeRobot
  - Pingdom
  - StatusCake

### Team Access (jika ada tim)
- [ ] Invite team members ke Render
- [ ] Invite team members ke Vercel
- [ ] Share admin credentials securely

---

## 🔐 Security Checklist

- [ ] `SECRET_KEY` minimal 32 karakter
- [ ] `DEBUG` set ke `false`
- [ ] `CORS_ORIGINS` hanya include domain yang diperlukan
- [ ] Admin password kuat (min 8 karakter, kombinasi)
- [ ] Database credentials tidak di-commit ke Git
- [ ] `.env` file tidak di-commit ke Git

---

## 📊 Performance Check

### Render Backend
- [ ] Buka Metrics tab
- [ ] Check CPU usage
- [ ] Check Memory usage
- [ ] Check Response time

### Vercel Frontend
- [ ] Buka Analytics tab
- [ ] Check page views
- [ ] Check Core Web Vitals
- [ ] Check loading time

### Railway Database
- [ ] Buka Metrics tab
- [ ] Check connections
- [ ] Check queries
- [ ] Check storage

---

## 🐛 Troubleshooting Guide

### Jika Backend Error 502
1. Check Render logs
2. Verify DATABASE_URL correct
3. Check start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Verify all env vars set

### Jika CORS Error
1. Check browser console untuk exact error
2. Verify CORS_ORIGINS di backend = frontend URL exact match
3. No trailing slash di CORS_ORIGINS
4. Redeploy backend after CORS change

### Jika Build Failed
1. Check build logs
2. Verify Root Directory correct
3. Check requirements.txt / package.json
4. Verify all dependencies available

### Jika Database Connection Failed
1. Check DATABASE_URL format: `postgresql+asyncpg://...`
2. Verify Railway database running
3. Check credentials correct
4. Test connection manually

---

## 💰 Cost Tracking

### Monthly Cost Estimation

| Platform | Usage | Cost |
|----------|-------|------|
| Railway (Database) | ~1GB storage, minimal traffic | $5-10 |
| Render (Backend) | Free tier / Starter | $0-7 |
| Vercel (Frontend) | Free tier | $0 |
| **TOTAL** | | **$5-17/month** |

### Optimization Tips
- [ ] Monitor resource usage weekly
- [ ] Optimize database queries
- [ ] Enable caching
- [ ] Optimize image uploads
- [ ] Review logs regularly

---

## 📱 Custom Domain (Optional)

### Setup Custom Domain
- [ ] Beli domain (Namecheap, GoDaddy, dll)
- [ ] Configure DNS untuk frontend (Vercel)
  - Add A record: `@` → Vercel IP
  - Add CNAME: `www` → Vercel
- [ ] Configure DNS untuk backend (Render)
  - Add CNAME: `api` → Render
- [ ] Verify domain di Vercel
- [ ] Verify domain di Render
- [ ] Update CORS_ORIGINS di backend

---

## 🎉 Deployment Complete!

Selamat! Aplikasi Anda sudah live:

✅ Backend deployed di Render
✅ Frontend deployed di Vercel
✅ Database running di Railway
✅ CORS configured
✅ Migrations run
✅ Admin user created
✅ All features tested

### Next Steps:
1. Monitor logs dan metrics
2. Test semua features secara berkala
3. Setup backup strategy
4. Plan untuk scaling
5. Setup monitoring & alerting

---

## 📞 Support & Resources

### Documentation
- [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md) - Overview lengkap
- [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) - Detail backend deployment
- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) - Detail frontend deployment
- [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md) - Quick reference

### Platform Docs
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app

### Community
- Render Community: https://community.render.com
- Vercel Discussions: https://github.com/vercel/vercel/discussions
- Railway Discord: https://discord.gg/railway

---

**Last Updated:** 2025-10-29
**Version:** 1.0.0

Good luck! 🚀

