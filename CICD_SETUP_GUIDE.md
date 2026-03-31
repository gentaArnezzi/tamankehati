# 🚀 CI/CD Setup Guide — Taman Kehati

## Gambaran Pipeline

```
Push ke main → Test → Build Docker Images → Push ke ghcr.io → Deploy ke Server → Patch JS Bundles → Health Check
```

---

## 🔑 GitHub Secrets yang Wajib Dikonfigurasi

Buka: `https://github.com/gentaArnezzi/tamankehati/settings/secrets/actions`

Klik **"New repository secret"** untuk masing-masing secret berikut:

### 1. `DEPLOY_HOST`
```
103.125.91.16
```

### 2. `DEPLOY_PORT`
```
5617
```

### 3. `DEPLOY_USER`
```
ubuntu
```

### 4. `DEPLOY_SSH_KEY` ⚠️ PALING PENTING
Copy seluruhnya termasuk `-----BEGIN` dan `-----END`:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACAEgPvKGOKi+0ixksR0Ub1Aq2ySCuwu+yrsO9OTF988cQAAAKDgYu8m4GLv
JgAAAAtzc2gtZWQyNTUxOQAAACAEgPvKGOKi+0ixksR0Ub1Aq2ySCuwu+yrsO9OTF988cQ
AAAEATu5lfUmYJezsbcB0GwBeS8+SO7r/X2MqMWMiy0ZmvBASA+8oY4qL7SLGSxHRRvUCr
bJIK7C77Kuw705MX3zxxAAAAGmdpdGh1Yi1hY3Rpb25zLXRhbWFua2VoYXRpAQID
-----END OPENSSH PRIVATE KEY-----
```
> Public key-nya sudah dipasang di `/home/ubuntu/.ssh/authorized_keys` di server.

### 5. `DEPLOY_PATH`
```
/opt/tamankehati
```

### 6. `GHCR_NAMESPACE`
```
gentaarnezzi
```
> Huruf kecil semua (lowercase)

### 7. `NEXT_PUBLIC_API_URL`
```
http://103.125.91.16
```

### 8. `NEXT_PUBLIC_SITE_URL`
```
http://103.125.91.16
```

### 9. `APP_BASE_URL`
```
http://103.125.91.16
```

### 10. `GHCR_TOKEN` (Opsional)
Jika package GHCR private: buat GitHub PAT dengan scope `read:packages` di https://github.com/settings/tokens

### 11. `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` (Opsional)
Notifikasi deployment via Telegram.

---

## 📋 Cara Menambahkan Secret di GitHub

1. Buka repo → **Settings** → **Secrets and variables** → **Actions**
2. Klik **"New repository secret"**
3. Isi **Name** dan **Secret** → klik **"Add secret"**
4. Ulangi untuk semua secret

---

## 🔄 Alur Pipeline

| Job | Fungsi |
|-----|--------|
| `test` | Unit test backend + verifikasi build frontend |
| `build-and-push` | Build Docker image backend & frontend, push ke ghcr.io |
| `deploy` | SSH → pull image baru → restart container → **patch JS bundles** |
| `verify-deployment` | Health check dari GitHub runner ke server |
| `rollback-deployment` | Auto rollback jika deploy gagal |

### ✨ Patch JS Bundles (Auto-fix setelah deploy)
Setelah container di-pull ulang, frontend dibangun ulang dengan URL lama di bundle.
Pipeline otomatis:
- Replace `103.125.91.16:8080` → `103.125.91.16` di semua file JS/HTML
- Update timestamp file agar browser tidak cache versi lama

---

## 🚀 Cara Push & Trigger Pipeline

```bash
git add .github/workflows/build-and-deploy.yml
git commit -m "fix: update CI/CD to use port 80 and add JS bundle patch"
git push origin main
```

Pantau di: `https://github.com/gentaArnezzi/tamankehati/actions`

---

## 🔧 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Permission denied (publickey)` | Copy `DEPLOY_SSH_KEY` lengkap dengan baris BEGIN dan END |
| `Connection timed out / refused` | Cek `DEPLOY_HOST=103.125.91.16` dan `DEPLOY_PORT=5617` |
| Frontend masih fetch ke `:8080` | Cek step "Patch frontend JS bundles" di logs Actions |
| `Failed to pull images` | `GHCR_NAMESPACE` harus huruf kecil: `gentaarnezzi` |
| Build gagal di `npm run build` | Cek error di job `test` → langkah "Build frontend" |
