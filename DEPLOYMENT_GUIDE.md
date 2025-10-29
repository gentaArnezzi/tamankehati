# 🚀 Taman Kehati - Deployment Guide

## 📋 Overview
Aplikasi Taman Kehati terdiri dari:
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.10
- **Database**: PostgreSQL
- **Cache**: Redis

## 🎯 Platform Hosting yang Direkomendasikan

### 1. Railway.app (REKOMENDASI UTAMA) ⭐
- ✅ **GRATIS** dengan $5 credit/bulan
- ✅ Support full-stack deployment
- ✅ Auto-deployment dari GitHub
- ✅ SSL otomatis
- ✅ Database PostgreSQL gratis

### 2. Render.com
- ✅ **GRATIS** untuk tier free
- ✅ Support Python + Node.js
- ✅ Database PostgreSQL gratis

### 3. Vercel + Railway (Hybrid)
- ✅ Frontend di Vercel (GRATIS unlimited)
- ✅ Backend + Database di Railway

---

## 🚂 Railway.app Deployment (Step-by-Step)

### **Step 1: Persiapan**
```bash
# 1. Pastikan code sudah di GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main

# 2. Install Railway CLI (optional)
npm install -g @railway/cli
railway login
```

### **Step 2: Deploy Backend**

1. **Buka Railway Dashboard**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose repository: `tamankehati`

2. **Konfigurasi Backend Service**
   - Railway akan auto-detect Python app
   - **Root Directory**: `apps/backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**
   ```
   SECRET_KEY=your-secret-key-here-generate-random-string
   CORS_ORIGINS=*
   ENVIRONMENT=production
   ```

4. **Add Database**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway akan auto-inject `DATABASE_URL`

### **Step 3: Deploy Frontend**

1. **Create Frontend Service**
   - Same project → Click "New" → "GitHub Repo"
   - Select same repository

2. **Konfigurasi Frontend Service**
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
   NODE_ENV=production
   ```

### **Step 4: Run Database Migrations**

```bash
# Via Railway CLI
railway run --service backend python -m alembic upgrade head

# Atau via Railway Dashboard
# Go to Backend service → Settings → Deploy
# Add one-time command: python -m alembic upgrade head
```

### **Step 5: Test Deployment**

```bash
# Test Backend
curl https://your-backend-url.up.railway.app/health
# Expected: {"status":"ok"}

# Test Frontend
# Open: https://your-frontend-url.up.railway.app
```

---

## 🎨 Render.com Deployment (Alternative)

### **Step 1: Deploy Backend**

1. **Create New Web Service**
   - Go to https://render.com
   - Connect GitHub repository
   - **Root Directory**: `apps/backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables**
   ```
   SECRET_KEY=your-secret-key-here
   CORS_ORIGINS=*
   ENVIRONMENT=production
   ```

3. **Add Database**
   - Create PostgreSQL database
   - Copy connection string to `DATABASE_URL`

### **Step 2: Deploy Frontend**

1. **Create New Web Service**
   - **Root Directory**: `apps/frontend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

2. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NODE_ENV=production
   ```

---

## 🔧 Environment Variables Reference

### **Backend (.env)**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=*

# Environment
ENVIRONMENT=production
DEBUG=false
```

### **Frontend (.env.local)**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
API_BASE_URL=https://your-backend-url.up.railway.app

# Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

---

## 🚨 Troubleshooting

### **Build Failed**
- Check logs in platform dashboard
- Ensure all dependencies are in requirements.txt
- Verify Python/Node version compatibility

### **Database Connection Error**
- Verify DATABASE_URL is set correctly
- Check database service is running
- Run migrations: `alembic upgrade head`

### **Frontend Can't Connect to Backend**
- Check NEXT_PUBLIC_API_URL
- Verify CORS_ORIGINS includes frontend URL
- Ensure backend is running and accessible

### **CORS Issues**
- Set CORS_ORIGINS to include your frontend URL
- For development: `CORS_ORIGINS=*`
- For production: `CORS_ORIGINS=https://your-frontend-url.com`

---

## 💰 Cost Estimation

### **Railway.app (Free Tier)**
- Backend: ~$3/month
- Database: ~$1/month
- Frontend: ~$1/month
- **Total**: ~$5/month (covered by free credit!)

### **Render.com (Free Tier)**
- Backend: FREE (with sleep)
- Database: FREE (1GB)
- Frontend: FREE (static)
- **Total**: $0/month

### **Vercel + Railway**
- Frontend (Vercel): FREE
- Backend + DB (Railway): ~$4/month
- **Total**: ~$4/month

---

## 📊 Monitoring & Maintenance

### **Health Checks**
```bash
# Backend health
curl https://your-backend-url/health

# Database health
curl https://your-backend-url/api/v1/health/db
```

### **Logs**
- Railway: Dashboard → Service → Deployments → View Logs
- Render: Dashboard → Service → Logs

### **Updates**
- Code changes auto-deploy via GitHub
- Database migrations: `alembic upgrade head`
- Environment variables: Update in dashboard

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed and running
- [ ] Database created and connected
- [ ] Frontend deployed and running
- [ ] Migrations executed
- [ ] Environment variables set
- [ ] CORS configured
- [ ] SSL certificates active
- [ ] Health checks passing
- [ ] Application accessible

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Project Issues**: Create GitHub issue

---

**Happy Deploying! 🚀**
