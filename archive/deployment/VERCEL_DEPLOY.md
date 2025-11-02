# 🎯 Step-by-Step: Deploy Frontend ke Vercel

## Persiapan

### Data yang Dibutuhkan:

1. ✅ **Backend URL dari Render**
   ```
   https://tamankehati-backend.onrender.com
   ```

2. ✅ **GitHub Repository** (recommended)
   Atau bisa deploy via Vercel CLI

---

## 📝 Langkah Deploy di Vercel

### Step 1: Buka Vercel Dashboard

1. Pergi ke https://vercel.com/
2. Login atau Sign Up
   - **Recommended:** Sign up with GitHub
   - Benefit: Auto-deploy saat push ke GitHub

### Step 2: Import Project

1. Click **"Add New..."** atau **"New Project"**
2. Pilih **"Import Git Repository"**

#### Jika belum connect GitHub:
1. Click **"Continue with GitHub"**
2. Authorize Vercel
3. Pilih repositories (All atau Select)

#### Pilih Repository:
1. Cari repository: `tamankehati_new`
2. Click **"Import"**

### Step 3: Configure Project

Vercel akan auto-detect Next.js. Configure seperti ini:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project Name: tamankehati
(atau nama lain yang Anda inginkan)

Framework Preset: Next.js (auto-detected)

Root Directory: apps/frontend
(PENTING! Browse dan pilih folder ini)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUILD SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build Command: npm run build
(auto-filled)

Output Directory: .next
(auto-filled)

Install Command: npm install
(auto-filled)

Node Version: 18.x
(auto-detected from package.json)
```

### Step 4: Add Environment Variables

Click **"Environment Variables"** section.

Tambahkan variables ini satu per satu:

```bash
# ========================================
# CRITICAL: BACKEND API
# ========================================
KEY: NEXT_PUBLIC_API_URL
VALUE: https://tamankehati-backend.onrender.com
(Ganti dengan URL backend Anda dari Render)

# ========================================
# APP CONFIGURATION
# ========================================
KEY: NEXT_PUBLIC_APP_NAME
VALUE: Taman Kehati

KEY: NEXT_PUBLIC_APP_VERSION
VALUE: 2.1.0

KEY: NODE_ENV
VALUE: production

KEY: NEXT_TELEMETRY_DISABLED
VALUE: 1

# ========================================
# MAP CONFIGURATION
# ========================================
KEY: NEXT_PUBLIC_MAP_TILE_URL
VALUE: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

KEY: NEXT_PUBLIC_MAP_ATTRIBUTION
VALUE: © OpenStreetMap contributors

KEY: NEXT_PUBLIC_DEFAULT_LAT
VALUE: -6.2088

KEY: NEXT_PUBLIC_DEFAULT_LNG
VALUE: 106.8456

KEY: NEXT_PUBLIC_DEFAULT_ZOOM
VALUE: 10

# ========================================
# FEATURE FLAGS
# ========================================
KEY: NEXT_PUBLIC_ENABLE_AI
VALUE: true

KEY: NEXT_PUBLIC_ENABLE_MAPS
VALUE: true

KEY: NEXT_PUBLIC_ENABLE_UPLOADS
VALUE: true

KEY: NEXT_PUBLIC_ENABLE_NOTIFICATIONS
VALUE: true
```

**Tips:**
- Pastikan semua yang diawali `NEXT_PUBLIC_` ditulis dengan benar
- Jangan ada spasi di awal/akhir value
- Case-sensitive!

### Step 5: Deploy

1. Review semua settings
2. Click **"Deploy"**
3. Vercel akan:
   - Install dependencies
   - Build Next.js app
   - Deploy to CDN
   - Assign URL

Build time: ~2-5 menit ☕

### Step 6: Tunggu Build Selesai

Progress bisa dilihat real-time:

```
Installing dependencies...
✓ Dependencies installed

Building...
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Deploying...
✓ Deployment ready

🎉 Success! Your site is live at:
https://tamankehati-xyz123.vercel.app
```

---

## ✅ Verifikasi Frontend Sudah Jalan

### 1. Buka URL Frontend

Vercel akan provide URL otomatis:

```
https://tamankehati-[random].vercel.app
atau
https://tamankehati.vercel.app (jika nama available)
```

### 2. Test Koneksi ke Backend

1. Buka browser DevTools (F12)
2. Go to Network tab
3. Navigate di website
4. Check API calls ke backend:

```
Request URL: https://tamankehati-backend.onrender.com/api/...
Status: 200 OK
```

### 3. Test Features

Coba features utama:
- ✅ Homepage load
- ✅ Login/Register
- ✅ Dashboard
- ✅ Maps
- ✅ Upload images

---

## 🔄 Update CORS di Backend

**PENTING!** Sekarang update CORS di Render backend:

### Step 1: Copy Frontend URL

```
https://tamankehati.vercel.app
```

### Step 2: Update di Render

1. Buka Render Dashboard
2. Go to backend service
3. Click **"Environment"** tab
4. Edit `CORS_ORIGINS`:

```
KEY: CORS_ORIGINS
VALUE: https://tamankehati.vercel.app
```

**Multiple domains** (jika ada custom domain nanti):
```
VALUE: https://tamankehati.vercel.app,https://www.tamankehati.com
```

### Step 3: Redeploy Backend

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Atau push perubahan ke GitHub (auto-deploy)

---

## 🎯 Setup Custom Domain (Optional)

### Option 1: Vercel Subdomain (Free)

Default sudah dapat:
```
https://tamankehati.vercel.app
```

### Option 2: Custom Domain

Jika punya domain sendiri (e.g., `tamankehati.com`):

#### A. Add Domain di Vercel

1. Project → Settings → **Domains**
2. Click **"Add"**
3. Enter domain: `tamankehati.com`
4. Click **"Add"**

#### B. Configure DNS

Vercel akan minta setup DNS records:

**Option A - Nameservers (Recommended):**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B - A Record + CNAME:**
```
Type  Name  Value
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

#### C. Configure di Domain Registrar

Example (Namecheap, GoDaddy, dll):
1. Login to domain registrar
2. DNS Management
3. Add records dari Vercel
4. Save & wait propagation (5-60 menit)

#### D. Verify

Vercel akan auto-verify domain.

---

## 🔧 Post-Deployment Settings

### 1. Environment Variables per Environment

Vercel support multiple environments:

```
Production  → Branch: main
Preview     → Pull requests
Development → Branch: develop
```

Bisa set different env vars per environment.

### 2. Auto-Deploy Settings

```
Project → Settings → Git

✓ Auto-deploy on push (main branch)
✓ Auto-deploy Preview (pull requests)
✓ Ignore build step (jika perlu skip deploy)
```

### 3. Build & Output Settings

```
Project → Settings → General

Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 4. Function Settings (for API routes if any)

```
Max Duration: 10s (default)
Memory: 1024 MB (default)
```

---

## 🐛 Troubleshooting

### ❌ Build Failed

**Check Build Logs:**

```
Deployment → [Latest] → Build Logs
```

**Common Issues:**

1. **Wrong Root Directory**
   - Must be: `apps/frontend`
   - Fix: Settings → General → Root Directory

2. **Missing Dependencies**
   ```
   Error: Cannot find module 'next'
   ```
   - Check `package.json` exists in `apps/frontend`
   - Verify npm install runs correctly

3. **TypeScript Errors**
   ```
   Type error: ...
   ```
   - Fix TypeScript errors locally first
   - Or temporarily disable: `next.config.js`:
   ```js
   typescript: {
     ignoreBuildErrors: true
   }
   ```

4. **Environment Variable Not Found**
   ```
   NEXT_PUBLIC_API_URL is undefined
   ```
   - Check spelling (case-sensitive!)
   - Must start with `NEXT_PUBLIC_`
   - Redeploy after adding env vars

### ❌ CORS Error in Browser

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

1. Check backend `CORS_ORIGINS` include frontend URL
2. No trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`
3. Exact match required
4. Redeploy backend after CORS change

**Test CORS:**

```bash
curl -H "Origin: https://tamankehati.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://tamankehati-backend.onrender.com/api/health
```

Should return:
```
Access-Control-Allow-Origin: https://tamankehati.vercel.app
```

### ❌ API Calls Failing

**Check Network Tab:**

1. Open DevTools (F12)
2. Network tab
3. Look for failed requests
4. Check:
   - Request URL correct?
   - Status code? (404, 500, CORS?)
   - Response body?

**Verify API URL:**

```javascript
// In browser console:
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should output: https://tamankehati-backend.onrender.com
```

### ❌ Environment Variables Not Working

**Important:**
- Changes to env vars require REDEPLOY
- Build-time vars frozen at build
- Runtime vars (API routes) update without rebuild

**Force redeploy:**
```
Deployments → [Latest] → ⋯ → Redeploy
```

### ❌ Slow Initial Load

**Causes:**
1. Render backend cold start (~30s)
2. Large bundle size
3. Many API calls

**Solutions:**
- Upgrade Render to paid plan (no cold starts)
- Optimize bundle (lazy loading, code splitting)
- Cache API responses
- Add loading states

---

## 📊 Monitoring & Analytics

### Vercel Analytics

```
Project → Analytics

View:
- Page views
- Visitors
- Performance metrics
- Core Web Vitals
```

### Real-time Logs

```
Project → Deployments → [Latest] → Functions

See real-time logs for API routes
```

### Performance Insights

```
Project → Speed Insights

- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
```

---

## 💡 Pro Tips

### 1. Preview Deployments

Every pull request gets a unique URL:
```
https://tamankehati-git-feature-branch.vercel.app
```

Perfect untuk testing sebelum merge!

### 2. Instant Rollback

If deployment breaks:
```
Deployments → [Previous working] → ⋯ → Promote to Production
```

Instant rollback dalam detik!

### 3. Environment Variables per Branch

```
Production:  NEXT_PUBLIC_API_URL = https://api.production.com
Preview:     NEXT_PUBLIC_API_URL = https://api.staging.com
Development: NEXT_PUBLIC_API_URL = http://localhost:8000
```

### 4. Deploy Hooks

Auto-deploy from external triggers:
```
Settings → Git → Deploy Hooks
```

### 5. Password Protection (Pro Plan)

Protect staging environments:
```
Settings → Deployment Protection
```

---

## 🎉 Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend URL configured in env vars
- [ ] Website accessible at Vercel URL
- [ ] API calls working (check Network tab)
- [ ] CORS updated in backend
- [ ] All features tested
- [ ] Custom domain configured (optional)
- [ ] Auto-deploy enabled
- [ ] Team members invited (if any)

---

## 📞 Next Steps

Setelah frontend & backend deployed:

1. ✅ **Create Admin User**
   ```bash
   # Via Render Shell:
   python init_admin.py
   ```

2. ✅ **Run Database Migrations**
   ```bash
   alembic upgrade head
   ```

3. ✅ **Test Full Flow**
   - Register user
   - Login
   - Submit data
   - Upload images
   - View dashboard

4. ✅ **Monitor Logs**
   - Vercel: Deployment logs
   - Render: Backend logs
   - Railway: Database metrics

---

Selamat! Aplikasi Anda sudah live 🚀🎉

Frontend: https://tamankehati.vercel.app
Backend: https://tamankehati-backend.onrender.com

