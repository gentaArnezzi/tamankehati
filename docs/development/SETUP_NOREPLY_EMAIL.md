# 📧 Setup Email noreply@tamankehati.id untuk OTP

## ✅ Boleh Pakai noreply@tamankehati.id

**Ya, boleh!** Email `noreply@tamankehati.id` adalah pilihan yang bagus untuk OTP karena:
- ✅ Profesional
- ✅ User tahu ini dari sistem Taman Kehati
- ✅ Tidak perlu reply (noreply)
- ✅ Cocok untuk email otomatis seperti OTP

---

## 📋 Prasyarat

Untuk menggunakan `noreply@tamankehati.id`, Anda perlu:

1. **Domain `tamankehati.id` sudah aktif**
2. **Akses ke hosting/email server** untuk membuat email
3. **Akses ke email tersebut** untuk verifikasi di SendGrid

---

## 🔧 Step-by-Step Setup

### Step 1: Buat Email noreply@tamankehati.id

#### Jika Pakai cPanel/Hosting:

1. Login ke cPanel hosting
2. Buka **Email Accounts** atau **Email**
3. Klik **Create** atau **Add Email Account**
4. Isi form:
   - **Email**: `noreply`
   - **Domain**: `tamankehati.id`
   - **Password**: Buat password yang kuat (simpan untuk verifikasi)
   - **Mailbox Quota**: 100 MB (cukup untuk verifikasi)
5. Klik **Create Account**

**Catatan:** 
- Email akan dibuat: `noreply@tamankehati.id`
- Anda perlu akses ke email ini untuk verifikasi di SendGrid

---

#### Jika Pakai Google Workspace:

1. Login ke Google Admin Console
2. Buka **Users** → **Add new user**
3. Isi form:
   - **First name**: noreply
   - **Last name**: (kosongkan)
   - **Email**: `noreply@tamankehati.id`
   - **Password**: Buat password yang kuat
4. Klik **Add New User**

**Atau buat alias:**
1. Buka **Users** → Pilih user yang ada
2. Klik **Email aliases**
3. Tambahkan alias: `noreply@tamankehati.id`

---

#### Jika Pakai Microsoft 365:

1. Login ke Microsoft 365 Admin Center
2. Buka **Users** → **Active users**
3. Klik **Add a user**
4. Isi form:
   - **Display name**: noreply
   - **Username**: `noreply@tamankehati.id`
   - **Password**: Buat password yang kuat
5. Klik **Add**

---

### Step 2: Akses Email untuk Verifikasi

**Penting:** Anda perlu bisa akses email `noreply@tamankehati.id` untuk:
1. Verifikasi di SendGrid (menerima email verifikasi)
2. Test bahwa email bisa menerima email

**Cara akses:**

#### Via Webmail (cPanel):
1. Buka: `https://tamankehati.id/webmail` atau `https://mail.tamankehati.id`
2. Login dengan: `noreply@tamankehati.id` dan password
3. Cek inbox

#### Via Email Client:
- **IMAP Settings:**
  - Server: `mail.tamankehati.id` atau `imap.tamankehati.id`
  - Port: 993 (SSL) atau 143 (TLS)
  - Username: `noreply@tamankehati.id`
  - Password: password email

- **SMTP Settings:**
  - Server: `mail.tamankehati.id` atau `smtp.tamankehati.id`
  - Port: 465 (SSL) atau 587 (TLS)
  - Username: `noreply@tamankehati.id`
  - Password: password email

---

### Step 3: Verifikasi di SendGrid

1. Login ke SendGrid Dashboard: https://app.sendgrid.com/
2. Buka: **Settings** → **Sender Authentication** → **Single Sender Verification**
3. Klik **"Create a Sender"**
4. Isi form:
   - **From Email Address**: `noreply@tamankehati.id`
   - **From Name**: `Taman Kehati` (atau nama yang diinginkan)
   - **Reply To**: `noreply@tamankehati.id` (atau email support jika ada)
   - **Company Address**: Alamat perusahaan
   - **City**: Kota
   - **State**: Provinsi
   - **Country**: Indonesia
   - **Zip Code**: Kode pos
5. Klik **"Create"**
6. **Verifikasi email:**
   - Cek inbox `noreply@tamankehati.id`
   - Buka email dari SendGrid
   - Klik link verifikasi

**Catatan:** 
- Email verifikasi akan dikirim ke `noreply@tamankehati.id`
- Pastikan Anda bisa akses email tersebut

---

### Step 4: Konfigurasi di .env

Tambahkan ke `apps/backend/.env`:

```env
# SendGrid SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-api-key-here
SMTP_FROM=noreply@tamankehati.id
```

**Atau gunakan script:**
```bash
bash scripts/setup-sendgrid.sh
# Masukkan API Key dan noreply@tamankehati.id
```

---

### Step 5: Test

```bash
python scripts/test-smtp.py
```

Jika berhasil, akan muncul:
```
✅ SMTP connection successful!
```

---

## ⚠️ Jika Belum Punya Akses ke Email noreply@tamankehati.id

### Opsi 1: Minta Akses ke Admin

Jika domain `tamankehati.id` dikelola oleh admin/orang lain:
1. Minta admin untuk membuat email `noreply@tamankehati.id`
2. Minta akses ke email tersebut (password atau forward ke email Anda)
3. Gunakan untuk verifikasi di SendGrid

---

### Opsi 2: Pakai Email Alternatif Sementara

Jika belum bisa akses `noreply@tamankehati.id`, bisa pakai email alternatif:

**Contoh:**
- `otp@tamankehati.id`
- `system@tamankehati.id`
- `support@tamankehati.id`
- Email pribadi Anda (untuk testing)

**Setup sama seperti di atas**, hanya ganti email address-nya.

---

### Opsi 3: Pakai Email Pribadi Dulu (Testing)

Untuk testing/development, bisa pakai email pribadi dulu:

```env
SMTP_FROM=your-email@gmail.com  # Email pribadi untuk testing
```

**Nanti bisa ganti** ke `noreply@tamankehati.id` setelah email sudah dibuat dan diverifikasi.

---

## 🔄 Cara Ganti Email Sender Nanti

Jika sudah pakai email lain dan mau ganti ke `noreply@tamankehati.id`:

1. **Buat email** `noreply@tamankehati.id` (jika belum)
2. **Verifikasi** di SendGrid (Step 3 di atas)
3. **Update `.env`:**
   ```env
   SMTP_FROM=noreply@tamankehati.id
   ```
4. **Restart backend**
5. **Test** dengan `python scripts/test-smtp.py`

---

## 📝 Checklist

- [ ] Email `noreply@tamankehati.id` sudah dibuat di hosting
- [ ] Bisa akses email `noreply@tamankehati.id` (webmail atau email client)
- [ ] Email sudah diverifikasi di SendGrid
- [ ] SendGrid API Key sudah dibuat
- [ ] Konfigurasi SMTP sudah ditambahkan ke `.env`
- [ ] `SMTP_FROM=noreply@tamankehati.id` sudah di-set
- [ ] Test SMTP connection berhasil
- [ ] Test OTP flow berhasil (email terkirim dari noreply@tamankehati.id)

---

## 🆘 Troubleshooting

### Error: "Email tidak bisa diakses"

**Solusi:**
- Cek apakah email sudah dibuat di hosting
- Cek password email
- Cek webmail settings
- Hubungi admin hosting jika perlu

---

### Error: "Verifikasi email tidak masuk"

**Solusi:**
- Cek spam folder
- Pastikan email `noreply@tamankehati.id` aktif
- Cek email quota (jika penuh, hapus email lama)
- Coba kirim ulang verifikasi di SendGrid

---

### Error: "SMTP Authentication failed"

**Solusi:**
- Pastikan `SMTP_USER=apikey` (huruf kecil)
- Pastikan API Key benar
- Pastikan sender email sudah diverifikasi di SendGrid

---

## 💡 Tips

### 1. Email Forwarding (Opsional)

Jika tidak ingin akses langsung ke `noreply@tamankehati.id`, bisa setup forwarding:
- Forward semua email dari `noreply@tamankehati.id` ke email pribadi Anda
- Jadi verifikasi email dari SendGrid akan masuk ke email pribadi
- Tapi email tetap dikirim dari `noreply@tamankehati.id`

**Setup di cPanel:**
1. Buka **Email** → **Forwarders**
2. Add forwarder: `noreply@tamankehati.id` → `your-email@gmail.com`

---

### 2. Email Alias (Alternatif)

Jika tidak bisa buat email baru, bisa pakai alias:
- Buat alias `noreply@tamankehati.id` → forward ke email yang sudah ada
- Verifikasi di SendGrid menggunakan email yang di-forward
- Email tetap dikirim dari `noreply@tamankehati.id`

---

### 3. Auto-Reply (Opsional)

Setup auto-reply untuk `noreply@tamankehati.id`:
- Pesan: "Email ini tidak dipantau. Untuk bantuan, hubungi support@tamankehati.id"
- User tahu tidak perlu reply

---

## 📚 Referensi

- [SendGrid Single Sender Verification](https://docs.sendgrid.com/ui/sending-email/sender-verification)
- [cPanel Email Setup](https://docs.cpanel.net/cpanel/email/)
- [Google Workspace Email](https://support.google.com/a/answer/33313)

