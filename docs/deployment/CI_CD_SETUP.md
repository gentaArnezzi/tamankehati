# 🚀 CI/CD Setup Guide

Guide lengkap untuk setup CI/CD agar auto-deploy ke server saat push ke main branch.

---

## 📋 Overview

**CI/CD Flow:**
1. **Push ke main branch** → GitHub Actions triggered
2. **Build images** → Push ke Docker Hub (optional, bisa manual)
3. **Deploy ke server** → Pull images dan restart containers

**Current Setup:**
- ✅ Workflow file: `.github/workflows/deploy-pull.yml`
- ⚠️  GitHub Secrets perlu di-setup

---

## 🔧 Step 1: Setup GitHub Secrets

### 1.1 Generate SSH Key

**Di local machine atau server:**
```bash
# Generate SSH key untuk GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Jangan set password (tekan Enter untuk empty passphrase)
```

### 1.2 Copy Public Key ke Server

```bash
# Copy public key ke server
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub ubuntu@38.47.93.167

# Atau manual:
cat ~/.ssh/github_actions_deploy.pub
# Copy output, lalu paste ke server:
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

### 1.4 Add GitHub Secrets

**Di GitHub Repository:**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

**Secret 1: DEPLOY_HOST**
```
Name: DEPLOY_HOST
Value: 38.47.93.167
```

**Secret 2: DEPLOY_USER**
```
Name: DEPLOY_USER
Value: ubuntu
```

**Secret 3: DEPLOY_SSH_KEY**
```
Name: DEPLOY_SSH_KEY
Value: (paste entire private key content)
```

**Untuk mendapatkan private key:**
```bash
# Di local machine
cat ~/.ssh/github_actions_deploy
# Copy ENTIRE output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... (all lines)
# -----END OPENSSH PRIVATE KEY-----
```

**Secret 4: DEPLOY_PATH (Optional)**
```
Name: DEPLOY_PATH
Value: ~/dasmap_prod/apps/tamankehati
```

---

## 🔧 Step 2: Verify Workflow File

**File yang harus ada:**
- `.github/workflows/deploy-pull.yml` ✅ (sudah dibuat)

**Workflow ini akan:**
1. ✅ Pull latest Docker images dari Docker Hub
2. ✅ Stop existing containers
3. ✅ Start new containers
4. ✅ Run database migrations
5. ✅ Health checks

---

## 🔧 Step 3: Test Deployment

### 3.1 Manual Trigger

**Di GitHub:**
1. Go to **Actions** tab
2. Select **CD - Deploy to Ubuntu Server (Pull-based)**
3. Click **Run workflow**
4. Select branch: `main`
5. Click **Run workflow**

### 3.2 Auto Trigger (Push to main)

```bash
# Di local machine
git add .
git commit -m "Test CI/CD deployment"
git push origin main
```

**GitHub Actions akan otomatis:**
1. Trigger workflow
2. SSH ke server
3. Pull images
4. Restart containers
5. Health checks

---

## 🔧 Step 4: Verify Deployment

### 4.1 Check GitHub Actions

**Di GitHub:**
1. Go to **Actions** tab
2. Check latest workflow run
3. Semua steps harus ✅ (green)

### 4.2 Check Server

**SSH ke server:**
```bash
ssh ubuntu@38.47.93.167

# Check containers
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml ps

# Check logs
docker compose -f docker-compose.pull.no-nginx.yml logs --tail=50
```

### 4.3 Check Application

```bash
# Health check
curl http://38.47.93.167:8080/api/health

# Frontend
curl -I http://38.47.93.167:8080
```

---

## 📊 Workflow Details

### What Happens on Push to Main

1. **Checkout code** - GitHub Actions checkout repository
2. **Check prerequisites** - Verify GitHub Secrets configured
3. **Setup SSH** - Configure SSH connection to server
4. **Pull images** - Pull latest images from Docker Hub
5. **Stop containers** - Gracefully stop existing containers
6. **Start containers** - Start new containers
7. **Run migrations** - Apply database migrations
8. **Health checks** - Verify all services healthy
9. **Verify deployment** - Show container status

### Workflow File

**Location:** `.github/workflows/deploy-pull.yml`

**Key features:**
- ✅ Pull-based deployment (no build on server)
- ✅ Graceful shutdown/restart
- ✅ Database migrations
- ✅ Health checks
- ✅ Automatic rollback on failure (optional)

---

## 🆘 Troubleshooting

### Problem: Deployment Skipped

**Symptom:** Workflow shows "Deployment skipped"

**Solution:**
1. Check GitHub Secrets configured
2. Verify all 3 secrets added:
   - `DEPLOY_HOST`
   - `DEPLOY_USER`
   - `DEPLOY_SSH_KEY`

### Problem: SSH Connection Failed

**Symptom:** "SSH connection failed"

**Solution:**
1. Verify SSH key copied to server
2. Test SSH manually:
   ```bash
   ssh -i ~/.ssh/github_actions_deploy ubuntu@38.47.93.167
   ```
3. Check server firewall allows SSH
4. Verify DEPLOY_USER is correct

### Problem: Images Not Found

**Symptom:** "Failed to pull images"

**Solution:**
1. Verify images exist in Docker Hub
2. Check image tags match
3. Verify `docker-compose.pull.no-nginx.yml` has correct image names
4. Check Docker Hub credentials if images are private

### Problem: Container Won't Start

**Symptom:** Containers exit immediately

**Solution:**
1. Check logs:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml logs
   ```
2. Check environment variables in `.env`
3. Verify database connection
4. Check port conflicts

### Problem: Health Check Failed

**Symptom:** Health check step fails

**Solution:**
1. Check if services actually running:
   ```bash
   docker ps | grep tamankehati
   ```
2. Check service logs
3. Verify health endpoint accessible:
   ```bash
   curl http://localhost:8000/health
   ```

---

## 🔄 Update Workflow

### Add New Secrets

Jika perlu tambah secrets:
1. Add di GitHub Secrets
2. Update workflow file untuk menggunakan secret baru

### Change Deployment Path

1. Update `DEPLOY_PATH` secret di GitHub
2. Atau update workflow file:
   ```yaml
   env:
     DEPLOY_PATH: ${{ secrets.DEPLOY_PATH || '~/dasmap_prod/apps/tamankehati' }}
   ```

### Customize Deployment

Edit `.github/workflows/deploy-pull.yml` untuk:
- Add additional steps
- Change health check endpoints
- Add notifications (Slack, email, etc)
- Add rollback logic

---

## 📝 Best Practices

1. **Always test manually first** - Before enabling auto-deploy
2. **Use feature branches** - Only merge to main when ready
3. **Monitor deployments** - Check GitHub Actions regularly
4. **Keep backups** - Database backups before deployment
5. **Document changes** - Update deployment docs when workflow changes

---

## ✅ Checklist

- [ ] SSH key generated
- [ ] Public key copied to server
- [ ] SSH connection tested
- [ ] GitHub Secrets configured:
  - [ ] DEPLOY_HOST
  - [ ] DEPLOY_USER
  - [ ] DEPLOY_SSH_KEY
  - [ ] DEPLOY_PATH (optional)
- [ ] Workflow file exists (`.github/workflows/deploy-pull.yml`)
- [ ] Test workflow manually
- [ ] Push to main and verify auto-deploy works
- [ ] Health checks passing
- [ ] Application accessible

---

## 🎯 Quick Setup Command

**One-liner untuk setup SSH key:**
```bash
# Generate and copy SSH key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy -N ""
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub ubuntu@38.47.93.167

# Show private key (copy to GitHub Secret)
cat ~/.ssh/github_actions_deploy
```

---

**Last Updated:** 2025-11-05

