# 🔧 Cara Set Environment Variables

Panduan lengkap untuk set environment variables di terminal.

---

## 📋 Method 1: Set untuk Sesi Terminal Saat Ini (Temporary)

**Cara termudah - hanya berlaku untuk terminal yang sedang dibuka:**

```bash
# Set Docker Hub username
export DOCKER_USERNAME=arnezzi

# Set image tag version
export IMAGE_TAG=latest
# atau untuk version baru:
# export IMAGE_TAG=v1.0.1
```

**Cek apakah sudah ter-set:**
```bash
echo $DOCKER_USERNAME
echo $IMAGE_TAG
```

**Expected output:**
```
arnezzi
latest
```

---

## 📋 Method 2: Set dalam Satu Command

**Bisa set semua sekaligus:**
```bash
export DOCKER_USERNAME=arnezzi && export IMAGE_TAG=latest
```

**Atau dalam satu baris:**
```bash
export DOCKER_USERNAME=arnezzi IMAGE_TAG=latest
```

---

## 📋 Method 3: Set Permanen (Untuk Semua Terminal)

**Jika ingin set permanen agar tidak perlu set ulang setiap kali buka terminal:**

### Untuk Zsh (macOS default):
```bash
# Edit file ~/.zshrc
nano ~/.zshrc

# Tambahkan di akhir file:
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=latest

# Save: Ctrl+X, Y, Enter

# Reload config
source ~/.zshrc
```

**Atau langsung dengan command:**
```bash
echo 'export DOCKER_USERNAME=arnezzi' >> ~/.zshrc
echo 'export IMAGE_TAG=latest' >> ~/.zshrc
source ~/.zshrc
```

### Untuk Bash:
```bash
# Edit file ~/.bashrc atau ~/.bash_profile
nano ~/.bashrc

# Tambahkan di akhir file:
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=latest

# Save dan reload
source ~/.bashrc
```

---

## 🚀 Quick Start untuk Build

**Copy-paste command berikut di terminal:**

```bash
# Set environment variables
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=latest

# Verify
echo "Docker Username: $DOCKER_USERNAME"
echo "Image Tag: $IMAGE_TAG"

# Build dan push
cd /Users/irgyaarnezzi/Desktop/tamankehati_new
./scripts/build-and-push-images.sh
```

---

## ✅ Checklist

- [ ] Set `DOCKER_USERNAME=arnezzi`
- [ ] Set `IMAGE_TAG=latest` (atau version lain)
- [ ] Verify dengan `echo $DOCKER_USERNAME` dan `echo $IMAGE_TAG`
- [ ] Pastikan sudah login ke Docker Hub: `docker login`
- [ ] Jalankan build script: `./scripts/build-and-push-images.sh`

---

## 🔍 Troubleshooting

### Variable tidak ter-set:
```bash
# Cek apakah variable ada
echo $DOCKER_USERNAME

# Jika kosong, set ulang:
export DOCKER_USERNAME=arnezzi
```

### Variable hilang setelah tutup terminal:
- Ini normal jika pakai Method 1 (temporary)
- Gunakan Method 3 untuk set permanen

### Variable tidak jalan di script:
- Pastikan sudah di-export (bukan hanya `DOCKER_USERNAME=value`)
- Gunakan `export DOCKER_USERNAME=arnezzi`

---

## 📝 Contoh Lengkap

```bash
# 1. Set variables
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=latest

# 2. Verify
echo "Username: $DOCKER_USERNAME"
echo "Tag: $IMAGE_TAG"

# 3. Navigate to project
cd /Users/irgyaarnezzi/Desktop/tamankehati_new

# 4. Login Docker Hub (jika belum)
docker login

# 5. Build and push
./scripts/build-and-push-images.sh
```

---

**Last Updated:** 2025-11-04

