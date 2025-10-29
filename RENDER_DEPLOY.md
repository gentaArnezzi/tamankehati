# 🎯 Step-by-Step: Deploy Backend ke Render

## Persiapan Sebelum Deploy

### 1. Data dari Railway (Database)

Dari Railway Dashboard, copy credentials ini:

```bash
# Example Railway Database URL:
postgresql://postgres:abcd1234@containers-us-west-xx.railway.app:5432/railway

# Convert untuk backend:
DATABASE_URL (async): postgresql+asyncpg://postgres:abcd1234@containers-us-west-xx.railway.app:5432/railway
DATABASE_URL_SYNC: postgresql://postgres:abcd1234@containers-us-west-xx.railway.app:5432/railway
```

### 2. Generate Secret Key

```bash
# Di terminal, generate secret key yang aman:
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Atau:
openssl rand -base64 32
```

Copy hasilnya, nanti akan dipakai di environment variables.

---

## 📝 Langkah Deploy di Render

### Step 1: Buka Render Dashboard

1. Pergi ke https://dashboard.render.com/
2. Login atau Sign Up (bisa dengan GitHub)

### Step 2: Create New Web Service

1. Click tombol **"New +"** di kanan atas
2. Pilih **"Web Service"**
3. Ada 2 pilihan:
   - **Connect GitHub repository** (recommended)
   - **Deploy from Git URL**

#### Jika pakai GitHub:
1. Click "Connect GitHub"
2. Authorize Render
3. Pilih repository: `tamankehati_new`
4. Click "Connect"

#### Jika pakai Git URL:
1. Paste URL repository Anda
2. Click "Continue"

### Step 3: Configure Web Service

Isi form dengan data ini:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BASIC INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: tamankehati-backend
Region: Singapore (closest to Indonesia)
Branch: main
Root Directory: apps/backend

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUNTIME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Runtime: Python 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUILD & START COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build Command:
pip install -r requirements.txt

Start Command:
uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTANCE TYPE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Free (untuk testing)
atau
Starter ($7/month - recommended untuk production)
```

### Step 4: Add Environment Variables

Scroll down ke bagian **"Environment Variables"**.

Click **"Add Environment Variable"** dan masukkan satu per satu:

```bash
# 1. DATABASE (dari Railway)
KEY: DATABASE_URL
VALUE: postgresql+asyncpg://postgres:[PASSWORD]@[HOST].railway.app:[PORT]/railway

KEY: DATABASE_URL_SYNC
VALUE: postgresql://postgres:[PASSWORD]@[HOST].railway.app:[PORT]/railway

# 2. SECURITY
KEY: SECRET_KEY
VALUE: [hasil generate dari step persiapan]

KEY: ALGORITHM
VALUE: HS256

KEY: ACCESS_TOKEN_EXPIRE_MINUTES
VALUE: 30

# 3. ENVIRONMENT
KEY: ENVIRONMENT
VALUE: production

KEY: DEBUG
VALUE: false

# 4. CORS (sementara pakai wildcard, nanti update)
KEY: CORS_ORIGINS
VALUE: https://your-frontend.vercel.app

# 5. UPLOAD
KEY: UPLOAD_DIRECTORY
VALUE: /opt/render/project/src/uploads

KEY: MAX_FILE_SIZE
VALUE: 10485760

# 6. LOGGING
KEY: LOG_LEVEL
VALUE: INFO

KEY: LOG_FORMAT
VALUE: json
```

### Step 5: Advanced Settings (Optional)

Scroll ke **"Advanced"** section:

```
Auto-Deploy: Yes (deploy otomatis saat push ke GitHub)
Health Check Path: /api/health
```

### Step 6: Create Web Service

1. Click **"Create Web Service"** di bawah
2. Render akan mulai build & deploy
3. Progress bisa dilihat di tab **"Logs"**

### Step 7: Tunggu Deploy Selesai

Build biasanya 2-5 menit:

```
==> Installing dependencies
==> Building...
==> Starting server...
==> Service live at https://tamankehati-backend.onrender.com
```

---

## ✅ Verifikasi Backend Sudah Jalan

### 1. Test Health Endpoint

Buka browser atau curl:

```bash
curl https://tamankehati-backend.onrender.com/api/health

# Response seharusnya:
{
  "status": "healthy",
  "timestamp": "2025-10-29T..."
}
```

### 2. Test API Docs

Buka di browser:

```
https://tamankehati-backend.onrender.com/docs
```

Seharusnya muncul Swagger UI dengan semua endpoints.

### 3. Test Database Connection

Check logs di Render:

```
Dashboard → Service → Logs

# Cari line seperti:
✓ Database connected successfully
✓ Server started on 0.0.0.0:10000
```

---

## 🔄 Run Database Migration

Setelah backend jalan, jalankan migration:

### Option 1: Via Render Shell

1. Render Dashboard → Service
2. Click tab **"Shell"**
3. Tunggu shell terbuka
4. Run command:

```bash
alembic upgrade head
```

### Option 2: Via Local Terminal

```bash
# Set DATABASE_URL ke Railway
export DATABASE_URL="postgresql+asyncpg://[railway-credentials]"

# Run migration
cd apps/backend
alembic upgrade head
```

---

## 📋 Copy Backend URL

Setelah deploy sukses, copy URL backend Anda:

```
https://tamankehati-backend.onrender.com
```

**SIMPAN URL INI** - Nanti dipakai untuk frontend di Vercel.

---

## 🐛 Troubleshooting

### ❌ Build Failed

**Check logs untuk error:**

```
Dashboard → Logs → Build Logs
```

**Common issues:**
- Missing `requirements.txt` → Pastikan di folder `apps/backend`
- Python version → Render default Python 3.11
- Dependencies error → Check requirements.txt syntax

### ❌ Deploy Failed

**Check logs:**

```
Dashboard → Logs → Deploy Logs
```

**Common issues:**
- Wrong start command
- Port not binding → Must use `--host 0.0.0.0 --port $PORT`
- Missing environment variables

### ❌ Service Crashes

**Check logs:**

```
Dashboard → Logs → Real-time logs
```

**Common issues:**
- Database connection failed → Check DATABASE_URL
- Missing SECRET_KEY
- CORS misconfigured

### ❌ Cannot Connect to Database

**Verify:**
1. Railway database is running
2. DATABASE_URL format correct (must include `+asyncpg`)
3. Railway allows external connections (default: yes)

**Test connection:**

```bash
# In Render Shell
python -c "import asyncpg; print('OK')"
```

---

## 🎯 Next Steps

Setelah backend berhasil:

1. ✅ Backend deployed di Render
2. 📋 Copy backend URL
3. ➡️ **Next: Deploy Frontend ke Vercel**

Lanjut ke: [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

---

## 📊 Free Tier Limitations

Render Free Tier:
- ✅ 750 hours/month (cukup untuk 1 service 24/7)
- ⚠️ Spin down setelah 15 menit tidak ada traffic
- ⚠️ Cold start ~30 detik
- ✅ 100 GB bandwidth/month

**Recommendation:**
- Untuk production → Upgrade ke Starter ($7/month)
- Tidak ada spin down
- Faster performance
- More resources

---

## 💡 Tips

1. **Enable Auto-Deploy** → Deploy otomatis saat push ke GitHub
2. **Set up Notifications** → Email alert jika deploy failed
3. **Monitor Logs** → Check regularly untuk errors
4. **Use Health Checks** → Render auto-restart jika service down
5. **Setup Alerts** → Render dapat kirim alert via email/Slack

---

Selesai! Backend Anda sudah live di Render 🎉

