# 🔄 CI/CD Flow Lengkap - Step by Step

Dokumentasi lengkap tentang alur CI/CD pipeline dari push code sampai deployment.

---

## 📋 Flow Saat Ini (Otomatis Penuh)

### Trigger: Push ke `main` branch

```
1. Push Code ke Main
   ↓
2. Test Stage (test job)
   ├─ Backend health test
   ├─ Frontend build verification
   └─ ✅ Semua test harus PASS
   ↓
3. Build & Push (build-and-push job)
   ├─ Build Docker images (backend & frontend)
   ├─ Push ke Docker Hub
   └─ 🚀 Notifikasi: "Deployment Started"
   ↓
4. Deploy (deploy job)
   ├─ SSH ke server
   ├─ Save previous IMAGE_TAG
   ├─ Update IMAGE_TAG di .env
   ├─ Pull Docker images
   ├─ Stop containers
   ├─ Start containers dengan image baru
   ├─ Run database migrations
   ├─ Health check (backend & frontend)
   └─ ✅ Notifikasi: "Deployment Successful"
   ↓
5. Verify Deployment (verify-deployment job)
   ├─ Test backend health (external URL)
   ├─ Test public API endpoints
   ├─ Test frontend accessibility
   └─ ✅ Semua verifikasi PASS
   ↓
6. Rollback (rollback-deployment job) - HANYA jika deploy gagal
   ├─ Restore previous IMAGE_TAG
   ├─ Pull previous images
   ├─ Restart containers
   └─ 🔄 Notifikasi: "Rollback Completed"

✅ SELESAI - Application Live!
```

---

## ⚠️ Manual Approval (Optional)

Saat ini workflow **TIDAK memerlukan manual approval** - semua otomatis. Jika ingin menambahkan manual approval sebelum deploy:

### Opsi 1: Environment Protection Rules (Recommended)

**Setup di GitHub:**
1. Go to **Settings** → **Environments**
2. Create new environment: `production`
3. Enable **Required reviewers**
4. Add reviewers (minimal 1 orang)
5. Update workflow untuk menggunakan environment

**Keuntungan:**
- ✅ Approval via GitHub UI
- ✅ Reviewers bisa approve/reject
- ✅ Audit trail (siapa yang approve)
- ✅ Bisa set timeout (auto-approve setelah X jam)

**Contoh Workflow:**
```yaml
deploy:
  name: Deploy to Server
  runs-on: ubuntu-latest
  environment: production  # ← Ini yang trigger approval
  needs: build-and-push
```

### Opsi 2: Workflow Dispatch dengan Input

**Setup:**
- Workflow hanya jalan jika di-trigger manual
- Bisa add input untuk confirm deployment

**Keuntungan:**
- ✅ Full control
- ✅ Manual trigger setiap kali

**Kekurangan:**
- ❌ Tidak otomatis (harus trigger manual)

---

## 📊 Comparison: Auto vs Manual Approval

| Aspek | Auto Deploy (Saat Ini) | Manual Approval |
|-------|------------------------|-----------------|
| **Speed** | ⚡ Cepat (instant) | ⏳ Perlu tunggu approval |
| **Safety** | ⚠️ Less safe (no review) | ✅ Safer (ada review) |
| **Convenience** | ✅ Sangat mudah | ⚠️ Perlu action manual |
| **Best For** | Development/Staging | Production critical |
| **Rollback** | ✅ Auto rollback jika gagal | ✅ Auto rollback jika gagal |

---

## 🎯 Rekomendasi Flow

### Untuk Development/Staging:
**Pakai Auto Deploy (saat ini)**
- ✅ Cepat
- ✅ Tidak perlu tunggu approval
- ✅ Auto rollback jika gagal

### Untuk Production:
**Tambahkan Manual Approval**
- ✅ Safety net
- ✅ Review sebelum deploy
- ✅ Prevent accidental deployments

---

## 🔧 Cara Menambahkan Manual Approval

### Step 1: Setup GitHub Environment

1. Go to repository → **Settings** → **Environments**
2. Click **New environment**
3. Name: `production`
4. Enable **Required reviewers**
5. Add reviewers (anggota tim yang bisa approve)
6. Save

### Step 2: Update Workflow

Tambahkan `environment: production` di job `deploy`:

```yaml
deploy:
  name: Deploy to Server
  runs-on: ubuntu-latest
  environment: production  # ← Tambahkan ini
  needs: build-and-push
  if: github.ref == 'refs/heads/main'
```

### Step 3: Test

1. Push ke `main`
2. Workflow akan pause di step "Deploy to Server"
3. Reviewer akan mendapat notification
4. Reviewer approve/reject di GitHub
5. Deployment lanjut setelah approve

---

## 📱 Flow dengan Manual Approval

```
1. Push Code ke Main
   ↓
2. Test Stage
   └─ ✅ PASS
   ↓
3. Build & Push
   └─ ✅ Images built & pushed
   ↓
4. ⏸️ PAUSE - Waiting for Approval
   ├─ 🔔 Notifikasi ke reviewers
   ├─ 👤 Reviewer review code changes
   └─ ✅ Reviewer approve
   ↓
5. Deploy
   └─ ✅ Deployment
   ↓
6. Verify
   └─ ✅ Verification
   ↓
✅ SELESAI
```

---

## 🚨 Rollback tetap Otomatis

**Penting:** Rollback mechanism tetap otomatis, bahkan dengan manual approval:

- Jika deployment gagal setelah approval → Auto rollback
- Rollback tidak perlu approval lagi
- Rollback langsung jalan untuk minimize downtime

---

## 📝 Summary

### Flow Saat Ini:
- ✅ **Fully Automatic** - No approval needed
- ✅ **Fast** - Instant deployment
- ✅ **Safe** - Auto rollback on failure
- ✅ **Good for:** Development/Staging

### Flow dengan Manual Approval:
- ✅ **Controlled** - Review before deploy
- ✅ **Safer** - Human verification
- ✅ **Auditable** - Track who approved
- ✅ **Good for:** Production critical apps

---

## 🎯 Rekomendasi untuk Taman Kehati

**Karena ini aplikasi web nasional:**

1. **Tetap pakai auto deploy** (saat ini) karena:
   - ✅ Sudah ada test stage (quality gate)
   - ✅ Sudah ada auto rollback (safety net)
   - ✅ Sudah ada verification (double check)
   - ✅ Notifikasi real-time (tim aware)

2. **Atau tambahkan manual approval** jika:
   - ⚠️ Ingin extra safety layer
   - ⚠️ Ada tim yang perlu review sebelum deploy
   - ⚠️ Ada policy yang mengharuskan approval

**Pilihan terserah kebutuhan tim!**

---

## 📞 Butuh Bantuan?

Jika ingin setup manual approval, saya bisa bantu:
1. Setup GitHub Environment
2. Update workflow file
3. Test approval flow

Tinggal bilang! 🚀

---

**Last Updated:** November 2025
