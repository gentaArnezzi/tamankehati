# 🚂 Railway.app Deployment Guide
**Deploy Taman Kehati GRATIS tanpa Kartu Kredit**

---

## 🎯 Railway Free Tier
- **Credit**: $5/month (automatically renewed)
- **Includes**: Backend + Database + SSL
- **No Credit Card**: Required ✅
- **No Sleep**: Always active (as long as credit available)

---

## 📋 Step-by-Step Deployment

### **Step 1: Sign Up Railway**
1. Go to https://railway.app
2. Click "Login" → Sign in with GitHub
3. Authorize Railway to access your repos

### **Step 2: Push Code to GitHub**
```bash
cd /Users/irgyaarnezzi/Desktop/tamankehati_23/tamankehati_21

# Initialize git if not already
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### **Step 3: Deploy Backend**

#### **A. Create New Project**
1. Click "New Project" in Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose `tamankehati_21` repository
4. Railway will auto-detect Python app

#### **B. Configure Backend Service**

**Settings:**
- **Root Directory**: `apps/backend`
- **Build Command**: 
  ```bash
  pip install --upgrade pip && pip install -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
- **Python Version**: 3.10

**Environment Variables:**
```
DATABASE_URL=${DATABASE_URL}  # Auto-populated from database
SECRET_KEY=your-secret-key-here-generate-random-string
CORS_ORIGINS=*
ENVIRONMENT=production
```

#### **C. Add PostgreSQL Database**
1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway auto-creates database
3. DATABASE_URL automatically injected to backend service

#### **D. Get Backend URL**
- Railway generates URL: `https://tamankehati-backend.up.railway.app`
- Copy this URL for frontend env

### **Step 4: Deploy Frontend**

#### **A. Create Frontend Service**
1. Same Railway project → Click "New" → "GitHub Repo"
2. Select same repository
3. Configure as separate service

#### **B. Configure Frontend Service**

**Settings:**
- **Root Directory**: `apps/frontend`
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  npm start
  ```
- **Node Version**: 18.x

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://tamankehati-backend.up.railway.app
NODE_ENV=production
```

### **Step 5: Run Migrations**

**Option A: Via Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run python -m alembic upgrade head
```

**Option B: Via Railway Dashboard**
1. Go to Backend service
2. Click "Settings" → "Deploy"
3. Add one-time deploy command:
   ```bash
   cd apps/backend && python -m alembic upgrade head
   ```

### **Step 6: Test Deployment**

**Backend Health Check:**
```bash
curl https://your-backend-url.up.railway.app/health
# Expected: {"status":"ok"}
```

**Frontend:**
```
Open: https://your-frontend-url.up.railway.app
Login and test!
```

---

## 🔧 Railway Configuration Files (Optional)

### **railway.toml** (for Backend)
```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd apps/backend && pip install -r requirements.txt"

[deploy]
startCommand = "cd apps/backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
PYTHON_VERSION = "3.10"
```

### **nixpacks.toml** (Advanced)
```toml
[phases.setup]
nixPkgs = ["python310", "postgresql"]

[phases.install]
cmds = ["pip install --upgrade pip", "pip install -r requirements.txt"]

[phases.build]
cmds = ["echo 'Build complete'"]

[start]
cmd = "uvicorn main:app --host 0.0.0.0 --port $PORT"
```

---

## 💰 Cost Estimation (Free Tier)

**Monthly Usage:**
- Backend (512MB RAM, always on): ~$3/month
- Database (1GB storage): ~$1/month  
- Frontend (static): ~$1/month
- **Total**: ~$5/month (covered by free credit!)

**Tips to Stay Free:**
- Monitor usage in Railway dashboard
- Optimize backend to use < 512MB RAM
- Use database efficiently
- Delete unused services

---

## 🚀 Alternative: Deploy Only Backend to Railway

**If frontend is heavy:**
1. Deploy backend + database to Railway ($3-4/month)
2. Deploy frontend to **Vercel** (FREE unlimited)

**Vercel Frontend:**
```bash
npm i -g vercel
cd apps/frontend
vercel --prod
```

**Environment Variables in Vercel:**
```
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
```

---

## 🔒 Security Checklist

- ✅ Set strong SECRET_KEY
- ✅ Use HTTPS (Railway provides SSL)
- ✅ Limit CORS_ORIGINS in production
- ✅ Enable Railway's Private Networking (optional)
- ✅ Set up environment variables properly
- ✅ Don't commit .env files

---

## 📊 Monitoring

**Railway Dashboard:**
- View logs: Click service → "Deployments" → "View Logs"
- Metrics: CPU, Memory, Network usage
- Alerts: Set up usage alerts

**Health Endpoints:**
```bash
# Backend health
curl https://your-backend.up.railway.app/health

# Database connection
curl https://your-backend.up.railway.app/api/v1/health/db
```

---

## 🆘 Troubleshooting

### **Issue: Build Failed**
```bash
# Check logs in Railway dashboard
# Common fixes:
- Ensure requirements.txt is correct
- Check Python version compatibility
- Verify root directory path
```

### **Issue: Database Connection Error**
```bash
# Verify DATABASE_URL is set
railway run env | grep DATABASE_URL

# Test connection
railway run python -c "import psycopg2; print('OK')"
```

### **Issue: Frontend Can't Connect to Backend**
```bash
# Check NEXT_PUBLIC_API_URL
# Ensure CORS is configured
# Verify backend is running
```

---

## 📝 Summary

**Railway Deployment Steps:**
1. ✅ Push code to GitHub
2. ✅ Create Railway project
3. ✅ Deploy backend service
4. ✅ Add PostgreSQL database
5. ✅ Deploy frontend service
6. ✅ Run migrations
7. ✅ Test and verify

**Total Time:** ~15-30 minutes

**Cost:** **$0/month** (within free tier)

---

**Questions? Check:**
- Railway Docs: https://docs.railway.app
- Community: https://discord.gg/railway
- Status: https://status.railway.app
