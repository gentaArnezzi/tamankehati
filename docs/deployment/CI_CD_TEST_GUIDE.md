# 🧪 Panduan Test CI/CD - Step by Step

Panduan lengkap untuk test CI/CD workflow dari awal sampai akhir.

---

## ✅ Pre-Checklist

Sebelum test, pastikan:

### 1. GitHub Secrets sudah di-setup
- [ ] `DEPLOY_HOST` = `38.47.93.167`
- [ ] `DEPLOY_USER` = `ubuntu`
- [ ] `DEPLOY_SSH_KEY` = (SSH private key)
- [ ] `DOCKER_PASSWORD` = (Docker Hub access token)
- [ ] `DOCKER_USERNAME` = `arnezzi` (optional)

### 2. SSH Key sudah di-copy ke server
```bash
# Test SSH connection
ssh -i ~/.ssh/github_actions_deploy ubuntu@38.47.93.167 "echo 'SSH OK'"
```

### 3. Server .env sudah ada
Di server, pastikan ada file `.env` dengan minimal:
```bash
DOCKER_USERNAME=arnezzi
IMAGE_TAG=v1.0.6
```

---

## 🚀 Step 1: Buat Test Commit

### 1.1 Check current status
```bash
# Di local machine
cd /Users/irgyaarnezzi/Desktop/tamankehati_new

# Check git status
git status

# Check current branch
git branch
```

### 1.2 Buat test commit kecil
```bash
# Buat file test atau update kecil
echo "# CI/CD Test - $(date)" >> TEST_CI_CD.md

# Atau bisa update file yang sudah ada
# Edit file kecil (misal: tambah comment di README.md)
```

### 1.3 Commit dan push
```bash
# Add perubahan
git add .

# Commit dengan message yang jelas
git commit -m "test: CI/CD auto deploy workflow"

# Push ke main branch
git push origin main
```

---

## 📊 Step 2: Monitor GitHub Actions

### 2.1 Buka GitHub Actions
1. Go to repository di GitHub
2. Click tab **Actions** (di top menu)
3. Klik workflow **CI/CD - Build and Deploy**

### 2.2 Monitor progress

**Job 1: Build and Push Docker Images**
- ✅ Checkout code
- ✅ Set up Docker Buildx
- ✅ Login to Docker Hub
- ✅ Build and push backend
- ✅ Build and push frontend
- ✅ Image summary

**Job 2: Deploy to Server** (setelah build selesai)
- ✅ Checkout code
- ✅ Setup SSH
- ✅ Test SSH connection
- ✅ Deploy to server
  - Update .env
  - Pull images
  - Restart containers
- ✅ Health checks

### 2.3 Check untuk error
- Jika ada error, klik step yang failed
- Lihat error message
- Fix sesuai error

---

## 🔍 Step 3: Verify di Server

### 3.1 SSH ke server
```bash
ssh ubuntu@38.47.93.167
cd ~/dasmap_prod/apps/tamankehati
```

### 3.2 Check IMAGE_TAG di .env
```bash
# Check apakah IMAGE_TAG sudah di-update
grep IMAGE_TAG .env

# Expected: IMAGE_TAG=<commit-sha> atau tag yang digunakan
```

### 3.3 Check containers
```bash
# Check container status
docker compose -f docker-compose.pull.no-nginx.yml ps

# Check images yang digunakan
docker compose -f docker-compose.pull.no-nginx.yml images
```

### 3.4 Check logs
```bash
# Backend logs
docker compose -f docker-compose.pull.no-nginx.yml logs backend --tail=50

# Frontend logs (jika ada)
docker compose -f docker-compose.pull.no-nginx.yml logs frontend --tail=50
```

### 3.5 Test health endpoint
```bash
# Test backend health
curl http://localhost:8000/health

# Expected: {"ok": true} atau {"status":"ok"}
```

---

## 🎯 Step 4: Test Manual Trigger (Optional)

Jika ingin test dengan tag custom:

### 4.1 Go to GitHub Actions
1. Tab **Actions**
2. Select workflow **CI/CD - Build and Deploy**
3. Click **Run workflow** (button di kanan)

### 4.2 Input tag
- **Image tag**: `v1.0.7` (atau tag yang diinginkan)
- Click **Run workflow**

### 4.3 Monitor sama seperti Step 2

### 4.4 Verify di server
```bash
# Check IMAGE_TAG
grep IMAGE_TAG .env
# Expected: IMAGE_TAG=v1.0.7

# Check images
docker images | grep tamankehati
# Should see images with tag v1.0.7
```

---

## ✅ Success Indicators

CI/CD berhasil jika:

1. ✅ **GitHub Actions:**
   - Build job completed (green checkmark)
   - Deploy job completed (green checkmark)
   - No errors di logs

2. ✅ **Server:**
   - IMAGE_TAG di .env sudah di-update
   - Containers running dengan image baru
   - Health checks passed

3. ✅ **Application:**
   - Backend accessible: `http://38.47.93.167:8080/health`
   - Frontend accessible: `http://38.47.93.167:8080`
   - No errors di browser console

---

## 🐛 Troubleshooting

### Issue: Build failed

**Check:**
```bash
# Di GitHub Actions logs, cari error message
# Common issues:
# - Docker Hub login failed → Check DOCKER_PASSWORD
# - Build error → Check Dockerfile syntax
```

**Fix:**
```bash
# Test build lokal
docker build -f apps/backend/Dockerfile -t test-backend apps/backend
```

### Issue: Deploy failed - SSH connection

**Check:**
```bash
# Test SSH manual
ssh -i ~/.ssh/github_actions_deploy ubuntu@38.47.93.167 "echo 'OK'"
```

**Fix:**
- Verify DEPLOY_SSH_KEY di GitHub Secrets
- Check public key di server: `cat ~/.ssh/authorized_keys`

### Issue: Images not pulled

**Check:**
```bash
# Di server, check IMAGE_TAG
grep IMAGE_TAG .env

# Manual pull untuk test
docker pull arnezzi/tamankehati-backend:v1.0.7
```

**Fix:**
- Verify IMAGE_TAG sudah di-update di .env
- Check Docker Hub apakah image sudah ada

### Issue: Containers not starting

**Check:**
```bash
# Check logs
docker compose -f docker-compose.pull.no-nginx.yml logs

# Check container status
docker compose -f docker-compose.pull.no-nginx.yml ps
```

**Fix:**
- Check .env file untuk missing variables
- Verify database connection
- Check port conflicts

---

## 📝 Quick Test Commands

### Test 1: Small change + push
```bash
echo "CI/CD test $(date)" >> TEST.md
git add TEST.md
git commit -m "test: CI/CD workflow"
git push origin main
```

### Test 2: Manual trigger dengan tag
1. GitHub Actions → Run workflow
2. Input tag: `v1.0.7`
3. Monitor progress

### Test 3: Verify di server
```bash
ssh ubuntu@38.47.93.167
cd ~/dasmap_prod/apps/tamankehati
grep IMAGE_TAG .env
docker compose -f docker-compose.pull.no-nginx.yml ps
```

---

## 🎉 Success!

Jika semua step berhasil, CI/CD sudah bekerja dengan baik!

**Next time:**
- Cukup push ke main → otomatis deploy
- Atau manual trigger dengan tag custom
- Tidak perlu build/push/deploy manual lagi!

