# 🚀 Panduan Deployment Taman Kehati

## 📋 Arsitektur Deployment

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Vercel    │────▶ │    Render    │────▶ │   Railway    │
│  (Frontend) │      │  (Backend)   │      │  (Database)  │
└─────────────┘      └──────────────┘      └──────────────┘
```

## 1️⃣ Setup Database di Railway (Sudah Selesai ✅)

Anda sudah memiliki database PostgreSQL di Railway. Pastikan Anda menyimpan:
- `DATABASE_URL` (format async untuk SQLAlchemy)
- Host, Port, User, Password, Database Name

## 2️⃣ Deploy Backend ke Render

### A. Persiapan File Backend

File-file yang dibutuhkan sudah ada:
- ✅ `requirements.txt`
- ✅ `Dockerfile` 
- ✅ `render.yaml`

### B. Langkah Deploy di Render

1. **Buka Render Dashboard** → https://dashboard.render.com/

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository Anda
   - Atau gunakan "Deploy from Git"

3. **Konfigurasi Service**
   ```
   Name: tamankehati-backend
   Region: Singapore (recommended untuk Indonesia)
   Branch: main
   Root Directory: apps/backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **Environment Variables di Render**
   
   Masuk ke tab "Environment" dan tambahkan:
   
   ```bash
   # Database dari Railway
   DATABASE_URL=postgresql+asyncpg://[user]:[password]@[railway-host]:[port]/[database]
   DATABASE_URL_SYNC=postgresql://[user]:[password]@[railway-host]:[port]/[database]
   
   # Security
   SECRET_KEY=your-production-secret-key-minimum-32-characters
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # Environment
   ENVIRONMENT=production
   DEBUG=false
   
   # CORS - Update setelah deploy frontend
   CORS_ORIGINS=https://your-frontend-domain.vercel.app,https://tamankehati.vercel.app
   
   # Optional: Redis (bisa pakai Railway atau Upstash)
   REDIS_URL=redis://[redis-host]:[port]
   
   # Upload
   UPLOAD_DIRECTORY=/opt/render/project/src/uploads
   MAX_FILE_SIZE=10485760
   
   # Logging
   LOG_LEVEL=INFO
   LOG_FORMAT=json
   ```

5. **Simpan URL Backend Anda**
   ```
   https://tamankehati-backend.onrender.com
   ```

### C. Testing Backend

Setelah deploy, test endpoint:
```bash
curl https://tamankehati-backend.onrender.com/api/health
curl https://tamankehati-backend.onrender.com/docs
```

## 3️⃣ Deploy Frontend ke Vercel

### A. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### B. Deploy via Vercel Dashboard (Recommended)

1. **Buka Vercel Dashboard** → https://vercel.com/

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import GitHub repository
   - Pilih repository Anda

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: apps/frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Environment Variables di Vercel**
   
   Masuk ke "Settings" → "Environment Variables":
   
   ```bash
   # API Backend (ganti dengan URL Render Anda)
   NEXT_PUBLIC_API_URL=https://tamankehati-backend.onrender.com
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=Taman Kehati
   NEXT_PUBLIC_APP_VERSION=2.1.0
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   
   # Map Configuration
   NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
   NEXT_PUBLIC_MAP_ATTRIBUTION=© OpenStreetMap contributors
   NEXT_PUBLIC_DEFAULT_LAT=-6.2088
   NEXT_PUBLIC_DEFAULT_LNG=106.8456
   NEXT_PUBLIC_DEFAULT_ZOOM=10
   
   # Feature Flags
   NEXT_PUBLIC_ENABLE_AI=true
   NEXT_PUBLIC_ENABLE_MAPS=true
   NEXT_PUBLIC_ENABLE_UPLOADS=true
   NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
   ```

5. **Deploy**
   - Click "Deploy"
   - Tunggu proses build selesai (~2-5 menit)

6. **Simpan URL Frontend Anda**
   ```
   https://tamankehati.vercel.app
   atau
   https://[project-name]-[random].vercel.app
   ```

### C. Deploy via CLI

```bash
cd apps/frontend
vercel
# Follow prompts
vercel --prod  # Deploy to production
```

## 4️⃣ Update CORS Configuration

Setelah frontend deployed, **update CORS di Backend**:

1. Buka Render Dashboard → Backend Service
2. Go to "Environment" tab
3. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://your-actual-frontend.vercel.app
   ```
4. Save & Redeploy

## 5️⃣ Setup Custom Domain (Optional)

### Frontend (Vercel)
1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `tamankehati.com`)
3. Follow DNS configuration instructions

### Backend (Render)
1. Render Dashboard → Service → Settings → Custom Domain
2. Add subdomain (e.g., `api.tamankehati.com`)
3. Configure DNS records

## 6️⃣ Database Migration

Jalankan migration ke database Railway:

```bash
# Local terminal dengan DATABASE_URL dari Railway
export DATABASE_URL="postgresql+asyncpg://[railway-credentials]"
cd apps/backend
alembic upgrade head
```

Atau buat migration script di Render:
1. Dashboard → Service → Shell
2. Run: `alembic upgrade head`

## 7️⃣ Monitoring & Logs

### Render Logs
```
Dashboard → Service → Logs
```

### Vercel Logs
```
Dashboard → Project → Deployments → [Latest] → Logs
```

### Railway Database
```
Dashboard → Database → Metrics
```

## 8️⃣ Troubleshooting

### ❌ CORS Error
**Problem:** Frontend tidak bisa connect ke backend

**Solution:**
1. Pastikan `CORS_ORIGINS` di backend include domain frontend
2. Check browser console untuk error message
3. Test API langsung: `curl https://backend-url.onrender.com/api/health`

### ❌ Database Connection Error
**Problem:** Backend tidak bisa connect ke Railway

**Solution:**
1. Check Railway database status
2. Verify `DATABASE_URL` format: `postgresql+asyncpg://...`
3. Check Railway database allows external connections
4. Verify IP whitelist (Railway biasanya allow all)

### ❌ Build Failed di Vercel
**Problem:** Frontend build error

**Solution:**
1. Check build logs di Vercel
2. Verify `package.json` scripts
3. Check Node version compatibility
4. Clear cache & redeploy

### ❌ 502 Bad Gateway di Render
**Problem:** Backend tidak respond

**Solution:**
1. Check Render logs
2. Verify start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Check database connection
4. Verify all environment variables set

## 9️⃣ Environment Variables Checklist

### ✅ Railway (Database)
- [x] PostgreSQL Database Created
- [x] Connection URL copied

### ✅ Render (Backend)
- [ ] `DATABASE_URL` (async format)
- [ ] `DATABASE_URL_SYNC` (sync format)
- [ ] `SECRET_KEY` (min 32 chars)
- [ ] `CORS_ORIGINS` (frontend URL)
- [ ] `ENVIRONMENT=production`
- [ ] `DEBUG=false`
- [ ] `REDIS_URL` (if using Redis)

### ✅ Vercel (Frontend)
- [ ] `NEXT_PUBLIC_API_URL` (backend URL)
- [ ] `NEXT_PUBLIC_APP_NAME`
- [ ] `NODE_ENV=production`
- [ ] Map configuration variables

## 🔟 Post-Deployment

1. **Test All Features**
   - Login/Register
   - Submit flora/fauna
   - Upload images
   - View maps
   - Admin dashboard

2. **Create Admin User**
   ```bash
   # Via Render shell
   python init_admin.py
   ```

3. **Monitor Performance**
   - Render: Response time, CPU, Memory
   - Vercel: Core Web Vitals
   - Railway: Database connections

4. **Setup Backups**
   - Railway: Automatic daily backups
   - Backend uploads: Consider AWS S3 or Cloudinary

## 📊 Cost Estimation

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **Vercel** | 100GB bandwidth/month | $20/month (Pro) |
| **Render** | 750 hours/month | $7/month (Starter) |
| **Railway** | $5 credit/month | Pay-as-you-go |

## 🎯 Quick Deploy Checklist

- [ ] Railway Database ready
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] CORS configured
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Admin user created
- [ ] All endpoints tested
- [ ] Custom domains configured (optional)

## 📞 Support

Jika ada masalah:
1. Check logs di masing-masing platform
2. Verify environment variables
3. Test API endpoints langsung
4. Check database connection

---

**Good luck with your deployment! 🚀**

