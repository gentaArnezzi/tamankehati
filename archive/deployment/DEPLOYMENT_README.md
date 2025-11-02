# 📚 Deployment Documentation Guide

Panduan lengkap untuk deploy aplikasi Taman Kehati ke production.

## 🗂️ File Documentation yang Tersedia

### 1️⃣ **DEPLOYMENT_QUICKSTART.md** ⚡
**Untuk:** Anda yang ingin deploy cepat tanpa banyak detail

**Isi:**
- Quick reference semua steps
- Copy-paste ready configurations
- Timeline: ~30-40 menit
- Paling cocok untuk: "Langsung deploy, less talk!"

📖 **Buka file ini jika:** Anda sudah familiar dengan deployment atau mau cepat-cepat

---

### 2️⃣ **CHECKLIST_DEPLOYMENT.md** ✅
**Untuk:** Follow step-by-step dengan checklist

**Isi:**
- Checklist lengkap yang bisa di-tick
- Organized per section
- Space untuk note URLs dan credentials
- Troubleshooting guide
- Timeline tracking

📖 **Buka file ini jika:** Anda suka checklist dan mau memastikan tidak ada yang terlewat

---

### 3️⃣ **RENDER_DEPLOY.md** 🔧
**Untuk:** Detail lengkap deploy backend ke Render

**Isi:**
- Step-by-step dengan screenshots guidance
- Penjelasan setiap environment variable
- Common errors & solutions
- Monitoring & optimization tips
- Render-specific configurations

📖 **Buka file ini jika:** Anda stuck di backend deployment atau butuh detail Render

---

### 4️⃣ **VERCEL_DEPLOY.md** 🎨
**Untuk:** Detail lengkap deploy frontend ke Vercel

**Isi:**
- Step-by-step Vercel deployment
- Environment variables explained
- Custom domain setup
- Performance monitoring
- Vercel-specific features

📖 **Buka file ini jika:** Anda stuck di frontend deployment atau butuh detail Vercel

---

### 5️⃣ **DEPLOYMENT_SETUP.md** 📋
**Untuk:** Overview lengkap semua platform

**Isi:**
- Arsitektur deployment
- Semua platform (Railway + Render + Vercel)
- Post-deployment checklist
- Cost estimation
- Monitoring setup

📖 **Buka file ini jika:** Anda mau overview complete atau reference lengkap

---

## 🎯 Pilih Dokumentasi Sesuai Kebutuhan

### Scenario 1: Baru Pertama Deploy
```
1. Baca: DEPLOYMENT_QUICKSTART.md (get overview)
2. Follow: CHECKLIST_DEPLOYMENT.md (tick items satu per satu)
3. Referensi: RENDER_DEPLOY.md & VERCEL_DEPLOY.md (jika butuh detail)
```

### Scenario 2: Sudah Pernah Deploy
```
1. Langsung: DEPLOYMENT_QUICKSTART.md
2. Check: CHECKLIST_DEPLOYMENT.md (final verification)
```

### Scenario 3: Ada Error/Problem
```
1. Check: Section "Troubleshooting" di CHECKLIST_DEPLOYMENT.md
2. Detail: RENDER_DEPLOY.md atau VERCEL_DEPLOY.md (sesuai platform)
```

### Scenario 4: Mau Deep Understanding
```
1. Start: DEPLOYMENT_SETUP.md (understand architecture)
2. Detail: RENDER_DEPLOY.md (backend specifics)
3. Detail: VERCEL_DEPLOY.md (frontend specifics)
```

---

## 📊 Deployment Flow

```
START
  │
  ├─→ 1. Railway Database (sudah ada ✅)
  │
  ├─→ 2. Deploy Backend (Render)
  │     ├─ Create web service
  │     ├─ Configure environment
  │     ├─ Set env variables
  │     └─ Deploy & verify
  │
  ├─→ 3. Deploy Frontend (Vercel)
  │     ├─ Import project
  │     ├─ Configure build
  │     ├─ Set env variables
  │     └─ Deploy & verify
  │
  ├─→ 4. Update CORS
  │     └─ Add frontend URL to backend
  │
  ├─→ 5. Database Migration
  │     └─ Run alembic upgrade head
  │
  └─→ 6. Create Admin User
        └─ Run init_admin.py

DONE! 🎉
```

---

## 🚀 Quick Start (TL;DR)

Jika Anda mau langsung mulai sekarang:

### 1. Persiapan (5 menit)
```bash
# Generate secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Copy Railway database URL
# https://railway.app → Database → Connect
```

### 2. Deploy Backend (15 menit)
```
https://dashboard.render.com/
→ New Web Service
→ Connect GitHub
→ Configure (see DEPLOYMENT_QUICKSTART.md)
→ Deploy
```

### 3. Deploy Frontend (10 menit)
```
https://vercel.com/
→ New Project
→ Import from GitHub
→ Configure (see DEPLOYMENT_QUICKSTART.md)
→ Deploy
```

### 4. Finalize (10 menit)
```
→ Update CORS di backend
→ Run database migration
→ Create admin user
→ Test everything
```

**Total: ~40 menit**

---

## 🛠️ Tools & Scripts

### verify-env.py
Script helper untuk verify environment variables:

```bash
# Check backend env vars
python scripts/verify-env.py render

# Check frontend env vars
python scripts/verify-env.py vercel

# Check database
python scripts/verify-env.py railway

# Check all
python scripts/verify-env.py all
```

---

## 📋 Environment Variables Summary

### Backend (Render)
```bash
DATABASE_URL                    # Railway database (async)
DATABASE_URL_SYNC               # Railway database (sync)
SECRET_KEY                      # Generated secret
ALGORITHM                       # HS256
ACCESS_TOKEN_EXPIRE_MINUTES     # 30
ENVIRONMENT                     # production
DEBUG                           # false
CORS_ORIGINS                    # Frontend URL
UPLOAD_DIRECTORY                # /opt/render/project/src/uploads
MAX_FILE_SIZE                   # 10485760
LOG_LEVEL                       # INFO
LOG_FORMAT                      # json
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL             # Backend URL
NEXT_PUBLIC_APP_NAME            # Taman Kehati
NEXT_PUBLIC_APP_VERSION         # 2.1.0
NODE_ENV                        # production
NEXT_TELEMETRY_DISABLED         # 1

# Map configs
NEXT_PUBLIC_MAP_TILE_URL
NEXT_PUBLIC_MAP_ATTRIBUTION
NEXT_PUBLIC_DEFAULT_LAT
NEXT_PUBLIC_DEFAULT_LNG
NEXT_PUBLIC_DEFAULT_ZOOM

# Feature flags
NEXT_PUBLIC_ENABLE_AI
NEXT_PUBLIC_ENABLE_MAPS
NEXT_PUBLIC_ENABLE_UPLOADS
NEXT_PUBLIC_ENABLE_NOTIFICATIONS
```

---

## ❓ FAQ

### Q: Berapa lama proses deployment?
**A:** Total ~40 menit untuk pertama kali. Deployment berikutnya ~5 menit (auto-deploy).

### Q: Berapa biaya per bulan?
**A:** 
- Railway (Database): $5-10/bulan
- Render (Backend): $0-7/bulan (free tier atau starter)
- Vercel (Frontend): $0/bulan (free tier cukup)
- **Total: $5-17/bulan**

### Q: Apakah harus pakai custom domain?
**A:** Tidak. Bisa pakai:
- Frontend: `https://[nama].vercel.app`
- Backend: `https://[nama].onrender.com`

### Q: Bagaimana cara update setelah deploy?
**A:** 
1. Push code ke GitHub
2. Auto-deploy akan jalan otomatis
3. Atau manual deploy dari dashboard

### Q: Apa yang terjadi jika ada error?
**A:** 
1. Check logs di dashboard masing-masing platform
2. Baca section Troubleshooting di dokumentasi
3. Rollback ke deployment sebelumnya (instant)

### Q: Apakah data aman?
**A:** 
Ya, semua platform menggunakan:
- HTTPS/SSL encryption
- Secure environment variables
- Regular backups (Railway)
- Industry-standard security

---

## 🆘 Getting Help

### Check Documentation
1. README files (this and others)
2. Platform official docs
3. Troubleshooting sections

### Check Logs
1. Render: Dashboard → Logs
2. Vercel: Deployment → Logs
3. Railway: Database → Metrics

### Common Issues
- **CORS Error:** Update CORS_ORIGINS di backend
- **Build Failed:** Check Root Directory setting
- **DB Connection:** Verify DATABASE_URL format
- **Env Vars:** Must redeploy after adding vars

---

## 📞 Support Resources

### Official Docs
- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs
- **Railway:** https://docs.railway.app

### Community
- **Render Community:** https://community.render.com
- **Vercel Discussions:** GitHub discussions
- **Railway Discord:** https://discord.gg/railway

### Status Pages
- **Render Status:** https://status.render.com
- **Vercel Status:** https://www.vercel-status.com
- **Railway Status:** https://status.railway.app

---

## 🎯 Success Checklist

Deployment successful jika:

- ✅ Backend URL accessible: `https://[backend].onrender.com/docs`
- ✅ Frontend URL accessible: `https://[frontend].vercel.app`
- ✅ No CORS errors in browser console
- ✅ API calls working (check Network tab)
- ✅ Login/Register working
- ✅ Dashboard accessible
- ✅ Maps loading
- ✅ Image upload working
- ✅ Database queries fast

---

## 🎓 Best Practices

### Pre-Deployment
- [ ] Test locally terlebih dahulu
- [ ] Commit semua changes
- [ ] Push to GitHub
- [ ] Generate strong secret key

### During Deployment
- [ ] Use checklist
- [ ] Double-check environment variables
- [ ] Test each stage before continue
- [ ] Save all URLs and credentials

### Post-Deployment
- [ ] Monitor logs untuk errors
- [ ] Test all major features
- [ ] Setup monitoring/alerts
- [ ] Document any customizations
- [ ] Share access dengan tim

---

## 📈 Next Steps After Deployment

1. **Monitoring**
   - Setup uptime monitoring
   - Enable error tracking
   - Monitor performance metrics

2. **Optimization**
   - Optimize database queries
   - Enable caching
   - Compress images
   - Code splitting

3. **Backup**
   - Database backups (Railway auto)
   - Document configurations
   - Export environment variables

4. **Scaling**
   - Monitor traffic
   - Upgrade plans if needed
   - Consider CDN for static assets

5. **Security**
   - Regular security audits
   - Update dependencies
   - Rotate secrets periodically
   - Enable 2FA on accounts

---

## 📝 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-29 | 1.0.0 | Initial deployment documentation |

---

## 🎉 You're Ready!

Semua dokumentasi sudah siap. Pilih file yang sesuai kebutuhan Anda dan mulai deployment!

**Recommended untuk mulai:**
1. 📖 **DEPLOYMENT_QUICKSTART.md** - Quick overview
2. ✅ **CHECKLIST_DEPLOYMENT.md** - Follow step-by-step

**Good luck dengan deployment! 🚀**

---

**Questions?** Check troubleshooting sections atau platform documentation.

