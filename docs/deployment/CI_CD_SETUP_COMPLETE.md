# 🚀 CI/CD Setup Lengkap - Auto Build & Deploy

Setup CI/CD agar otomatis build images → push ke Docker Hub → deploy ke server saat push ke main branch.

---

## 📋 Flow CI/CD

```
Push ke main branch
    ↓
GitHub Actions triggered
    ↓
Build Backend Image → Push ke Docker Hub
    ↓
Build Frontend Image → Push ke Docker Hub
    ↓
SSH ke Server
    ↓
Pull Images → Restart Containers
    ↓
Health Check
    ↓
✅ Deploy Success!
```

---

## 🔧 Step 1: Setup GitHub Secrets

### 1.1 Generate SSH Key untuk Server Access

**Di local machine:**

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Jangan set password (tekan Enter untuk empty passphrase)
```

### 1.2 Copy Public Key ke Server

```bash
# Copy public key ke server
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub ubuntu@38.47.93.167

# Atau manual:
cat ~/.ssh/github_actions_deploy.pub
# Copy output, lalu SSH ke server dan paste:
ssh ubuntu@38.47.93.167
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 1.3 Test SSH Connection

```bash
# Test SSH dengan private key
ssh -i ~/.ssh/github_actions_deploy ubuntu@38.47.93.167 "echo 'SSH connection OK'"
```

### 1.4 Generate Docker Hub Access Token

**Di Docker Hub:**
1. Login ke https://hub.docker.com
2. Go to **Account Settings** → **Security** → **New Access Token**
3. Create token dengan permission: **Read, Write, Delete**
4. Copy token (hanya muncul sekali!)

### 1.5 Add GitHub Secrets

**Di GitHub Repository:**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add secrets berikut:

#### Secret 1: DEPLOY_HOST
```
Name: DEPLOY_HOST
Value: 38.47.93.167
```

#### Secret 2: DEPLOY_USER
```
Name: DEPLOY_USER
Value: ubuntu
```

#### Secret 3: DEPLOY_SSH_KEY
```
Name: DEPLOY_SSH_KEY
Value: (paste entire private key content)
```

**Untuk mendapatkan private key:**
```bash
cat ~/.ssh/github_actions_deploy
# Copy ENTIRE output termasuk:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... (all lines)
# -----END OPENSSH PRIVATE KEY-----
```

#### Secret 4: DOCKER_PASSWORD
```
Name: DOCKER_PASSWORD
Value: (paste Docker Hub access token)
```

#### Secret 5: DOCKER_USERNAME (Optional)
```
Name: DOCKER_USERNAME
Value: arnezzi
```
*Default: arnezzi, bisa skip jika username sudah benar*

#### Secret 6: DEPLOY_PATH (Optional)
```
Name: DEPLOY_PATH
Value: ~/dasmap_prod/apps/tamankehati
```
*Default: ~/dasmap_prod/apps/tamankehati*

#### Secret 7: NEXT_PUBLIC_API_URL (Optional)
```
Name: NEXT_PUBLIC_API_URL
Value: http://38.47.93.167:8080
```
*Default: http://38.47.93.167:8080*

---

## 📝 Step 2: Verify Workflow File

Workflow file sudah dibuat di: `.github/workflows/build-and-deploy.yml`

**Workflow ini akan:**
1. ✅ Build backend image saat push ke main
2. ✅ Build frontend image saat push ke main
3. ✅ Push images ke Docker Hub dengan tag commit SHA
4. ✅ Deploy otomatis ke server
5. ✅ Update IMAGE_TAG di .env file di server
6. ✅ Pull images dan restart containers
7. ✅ Health check setelah deploy

---

## 🚀 Step 3: Test CI/CD

### 3.1 Push ke Main Branch

```bash
# Commit perubahan
git add .
git commit -m "Setup CI/CD auto deploy"

# Push ke main
git push origin main
```

### 3.2 Monitor GitHub Actions

1. Go to **Actions** tab di GitHub
2. Klik workflow **CI/CD - Build and Deploy**
3. Monitor progress:
   - ✅ Build and Push Docker Images
   - ✅ Deploy to Server
   - ✅ Health checks

### 3.3 Manual Trigger (Optional)

Jika ingin deploy manual dengan tag tertentu:

1. Go to **Actions** → **CI/CD - Build and Deploy**
2. Click **Run workflow**
3. Input image tag (e.g., `v1.0.7`)
4. Click **Run workflow**

---

## 🔍 Step 4: Verify Deployment

### 4.1 Check GitHub Actions Logs

Pastikan semua step berhasil:
- ✅ Build and push backend
- ✅ Build and push frontend
- ✅ Deploy to server
- ✅ Health checks passed

### 4.2 Check Server

```bash
# SSH ke server
ssh ubuntu@38.47.93.167

# Check containers
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml ps

# Check logs
docker compose -f docker-compose.pull.no-nginx.yml logs --tail=50

# Check IMAGE_TAG di .env
grep IMAGE_TAG .env
```

---

## 📦 Image Tagging Strategy

### Automatic Tagging (saat push ke main)
- Tag: **Commit SHA** (e.g., `a1b2c3d4e5f6...`)
- Latest: **latest** (jika main branch)

### Manual Tagging (via workflow_dispatch)
- Tag: **Custom** (yang Anda input, e.g., `v1.0.7`)

### Rekomendasi
Gunakan semantic versioning untuk manual:
- `v1.0.6` - Backend fix
- `v1.0.7` - Frontend fix
- `v1.1.0` - Feature baru
- `v2.0.0` - Major update

---

## 🛠️ Troubleshooting

### Issue: Build failed

**Check:**
1. GitHub Actions logs untuk error detail
2. Docker Hub credentials (DOCKER_PASSWORD)
3. Dockerfile syntax

**Fix:**
```bash
# Test build lokal
docker build -f apps/backend/Dockerfile -t test-backend apps/backend
docker build -f apps/frontend/Dockerfile -t test-frontend apps/frontend
```

### Issue: Deploy failed

**Check:**
1. SSH connection (DEPLOY_SSH_KEY)
2. Server path (DEPLOY_PATH)
3. Docker permissions di server

**Fix:**
```bash
# Test SSH
ssh -i ~/.ssh/github_actions_deploy ubuntu@38.47.93.167 "echo 'OK'"

# Check Docker permissions di server
ssh ubuntu@38.47.93.167 "docker ps"
```

### Issue: Images not pulled

**Check:**
1. IMAGE_TAG di .env file di server
2. Docker Hub credentials
3. Network connectivity dari server ke Docker Hub

**Fix:**
```bash
# Di server, manual pull
docker pull arnezzi/tamankehati-backend:v1.0.7
docker pull arnezzi/tamankehati-frontend:v1.0.7
```

---

## ✅ Success Criteria

Setelah setup, setiap push ke main akan:

1. ✅ **Otomatis build** backend & frontend images
2. ✅ **Otomatis push** ke Docker Hub
3. ✅ **Otomatis deploy** ke server
4. ✅ **Otomatis restart** containers
5. ✅ **Otomatis health check**

**Anda tidak perlu lagi:**
- ❌ Build manual di local
- ❌ Push manual ke Docker Hub
- ❌ SSH ke server
- ❌ Pull images manual
- ❌ Restart containers manual

---

## 📝 Summary

**Workflow File:** `.github/workflows/build-and-deploy.yml`

**Required Secrets:**
- `DEPLOY_HOST` - Server IP
- `DEPLOY_USER` - SSH user
- `DEPLOY_SSH_KEY` - SSH private key
- `DOCKER_PASSWORD` - Docker Hub access token

**Optional Secrets:**
- `DOCKER_USERNAME` - Docker Hub username (default: arnezzi)
- `DEPLOY_PATH` - Server path (default: ~/dasmap_prod/apps/tamankehati)
- `NEXT_PUBLIC_API_URL` - Frontend API URL

**Trigger:**
- Push ke `main` branch
- Manual via workflow_dispatch

---

## 🎯 Next Steps

1. ✅ Setup GitHub Secrets
2. ✅ Test dengan push ke main
3. ✅ Monitor GitHub Actions
4. ✅ Verify deployment di server
5. ✅ Enjoy auto-deploy! 🎉

