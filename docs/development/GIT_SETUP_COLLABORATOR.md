# Git Setup untuk Collaborator

Panduan untuk setup Git identity di local environment agar bisa push commit tanpa error.

---

## ❌ Error yang Terjadi

Jika collaborator mendapat error seperti ini saat push:

```
Committer identity unknown

*** Please tell me who you are.

Run

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"

to set your account's default identity.

fatal: empty ident name not allowed
```

Ini berarti Git belum dikonfigurasi dengan identitas user di komputer local.

---

## ✅ Solusi

### Opsi 1: Global Configuration (Recommended)

Set identitas Git untuk semua repository di komputer ini:

```bash
# Set email (gunakan email GitHub account)
git config --global user.email "your.email@example.com"

# Set name (nama yang akan muncul di commit)
git config --global user.name "Your Name"
```

**Contoh:**
```bash
git config --global user.email "genta@example.com"
git config --global user.name "Genta Arnezzi"
```

### Opsi 2: Repository-Specific Configuration

Jika hanya ingin set untuk repository ini saja (tidak global):

```bash
# Masuk ke directory project
cd /path/to/tamankehati_new

# Set email untuk repository ini saja
git config user.email "your.email@example.com"

# Set name untuk repository ini saja
git config user.name "Your Name"
```

---

## ✅ Verifikasi Konfigurasi

Setelah setup, verifikasi dengan:

```bash
# Cek global config
git config --global user.name
git config --global user.email

# Atau cek semua config
git config --list
```

**Expected output:**
```
user.name=Your Name
user.email=your.email@example.com
```

---

## 📝 Tips

1. **Gunakan email GitHub account** untuk memastikan commit terhubung dengan GitHub profile
2. **Email bisa di-private** di GitHub Settings → Emails → "Keep my email addresses private"
3. **Global config** lebih praktis karena tidak perlu setup per repository

---

## 🔍 Troubleshooting

### Masih Error Setelah Setup?

1. **Cek apakah config sudah tersimpan:**
   ```bash
   git config --list | grep user
   ```

2. **Jika masih error, coba set ulang:**
   ```bash
   git config --global --unset user.name
   git config --global --unset user.email
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Pastikan tidak ada karakter khusus** di nama atau email

---

## 📚 Referensi

- [Git Documentation - First-Time Git Setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)
- [GitHub - Setting your commit email address](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-email-preferences/setting-your-commit-email-address)

---

**Last Updated:** 2025-11-06

