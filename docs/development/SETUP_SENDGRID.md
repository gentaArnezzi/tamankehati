# 📧 Setup SendGrid untuk OTP Email

## 🎯 Overview

SendGrid adalah layanan email transaction yang populer. Plan gratis memberikan:
- ✅ **100 email/hari** (cukup untuk development & production kecil)
- ✅ **SMTP & API support**
- ✅ **Reliable delivery**
- ✅ **Free forever** (dengan limit)

---

## 📋 Step-by-Step Setup

### Step 1: Daftar SendGrid Account

1. Buka: https://signup.sendgrid.com/
2. Klik **"Start for free"**
3. Isi form:
   - Email
   - Password
   - Company name (bisa nama project: "Taman Kehati")
4. Verifikasi email
5. Selesaikan onboarding

---

### Step 2: Verifikasi Sender Identity

**Penting:** SendGrid memerlukan verifikasi sender sebelum bisa kirim email.

#### Option A: Single Sender Verification (Paling Mudah)

1. Login ke SendGrid Dashboard
2. Buka: **Settings** → **Sender Authentication** → **Single Sender Verification**
3. Klik **"Create a Sender"**
4. Isi form:
   - **From Email Address**: Email yang akan digunakan (misalnya: `noreply@tamankehati.id` atau email Gmail Anda)
   - **From Name**: Nama pengirim (misalnya: "Taman Kehati")
   - **Reply To**: Email yang sama atau email lain
   - **Company Address**: Alamat perusahaan
   - **City**: Kota
   - **State**: Provinsi
   - **Country**: Indonesia
   - **Zip Code**: Kode pos
5. Klik **"Create"**
6. **Verifikasi email**: Cek inbox email yang Anda daftarkan, klik link verifikasi

**Catatan:** 
- Email yang digunakan harus bisa diakses (untuk verifikasi)
- Bisa menggunakan email Gmail/Outlook pribadi untuk testing
- Untuk production, gunakan email domain sendiri (perlu domain verification)

---

### Step 3: Buat API Key

1. Buka: **Settings** → **API Keys**
2. Klik **"Create API Key"**
3. Pilih **"Full Access"** atau **"Restricted Access"**:
   - **Full Access**: Semua permission (untuk testing)
   - **Restricted Access**: Pilih "Mail Send" permission saja (lebih aman)
4. Masukkan **API Key Name**: "Taman Kehati OTP"
5. Klik **"Create & View"**
6. **⚠️ IMPORTANT:** Copy API key yang muncul (hanya muncul sekali!)
   - Format: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Simpan di tempat aman

**Jika lupa API key:**
- Buat API key baru (yang lama tidak bisa dilihat lagi)

---

### Step 4: Konfigurasi di .env

Tambahkan ke `apps/backend/.env`:

```env
# SendGrid SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=noreply@tamankehati.id
```

**Penjelasan:**
- `SMTP_USER`: Selalu gunakan `apikey` (bukan email Anda)
- `SMTP_PASSWORD`: API Key yang Anda buat di Step 3
- `SMTP_FROM`: Email yang sudah diverifikasi di Step 2

---

### Step 5: Test Konfigurasi

Jalankan script test:

```bash
python scripts/test-smtp.py
```

Atau test manual:

```bash
cd apps/backend
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
print('SMTP_HOST:', os.getenv('SMTP_HOST'))
print('SMTP_USER:', os.getenv('SMTP_USER'))
print('SMTP_FROM:', os.getenv('SMTP_FROM'))
print('SMTP_PASSWORD:', 'SG.' + '*' * 60 if os.getenv('SMTP_PASSWORD', '').startswith('SG.') else 'Not set')
"
```

---

### Step 6: Test OTP Flow

1. Start backend:
   ```bash
   cd apps/backend
   uvicorn main:app --reload
   ```

2. Start frontend:
   ```bash
   cd apps/frontend
   npm run dev
   ```

3. Test login:
   - Buka: http://localhost:3000/login
   - Masukkan email + password
   - Cek email inbox untuk kode OTP
   - Input OTP dan login

---

## 🔍 Troubleshooting

### Error: "SMTP Authentication failed"

**Penyebab:**
- API Key salah
- `SMTP_USER` bukan `apikey`

**Solusi:**
- Pastikan `SMTP_USER=apikey` (huruf kecil, tanpa spasi)
- Pastikan API Key benar (dimulai dengan `SG.`)
- Buat API Key baru jika perlu

---

### Error: "Email tidak terkirim"

**Penyebab:**
- Sender belum diverifikasi
- Email masuk spam
- Limit 100 email/hari tercapai

**Solusi:**
1. **Cek Sender Verification:**
   - Buka: Settings → Sender Authentication
   - Pastikan status "Verified" (hijau)

2. **Cek Spam Folder:**
   - Email mungkin masuk spam
   - Tambahkan sender ke contact untuk menghindari spam

3. **Cek Activity:**
   - Buka: Activity → Email Activity
   - Lihat status email (delivered, bounced, dll)

4. **Cek Limit:**
   - Buka: Settings → Account Details
   - Lihat "Email Send Quota" (100/day untuk free)

---

### Error: "Invalid sender"

**Penyebab:**
- `SMTP_FROM` tidak sama dengan verified sender

**Solusi:**
- Pastikan `SMTP_FROM` sama dengan email yang diverifikasi di Step 2
- Atau verifikasi email baru yang sesuai

---

## 📊 Monitoring SendGrid

### Dashboard Metrics

1. **Activity Feed:**
   - Buka: Activity → Email Activity
   - Lihat semua email yang dikirim
   - Status: Delivered, Bounced, Blocked, dll

2. **Stats:**
   - Buka: Stats → Overview
   - Lihat delivery rate, open rate, dll

3. **Email API:**
   - Buka: Settings → Mail Settings
   - Lihat konfigurasi email

---

## 🚀 Production Tips

### 1. Domain Authentication (Recommended)

Untuk production, verifikasi domain sendiri:

1. Buka: Settings → Sender Authentication → Domain Authentication
2. Klik "Authenticate Your Domain"
3. Ikuti instruksi untuk menambahkan DNS records
4. Setelah verified, bisa kirim dari email domain tersebut

**Keuntungan:**
- Email lebih terpercaya (tidak masuk spam)
- Bisa kirim dari berbagai email di domain
- Branding lebih baik

### 2. Rate Limiting

SendGrid free plan: **100 email/hari**

**Tips:**
- Monitor usage di dashboard
- Implement rate limiting di aplikasi
- Upgrade ke paid plan jika perlu lebih banyak

### 3. Email Templates

SendGrid mendukung email templates:

1. Buka: Email API → Dynamic Templates
2. Buat template untuk OTP email
3. Update `email_service.py` untuk menggunakan template

---

## 📝 Quick Reference

### SendGrid SMTP Settings

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-api-key-here
SMTP_FROM=verified-email@example.com
```

### SendGrid Dashboard Links

- **Dashboard**: https://app.sendgrid.com/
- **API Keys**: https://app.sendgrid.com/settings/api_keys
- **Sender Verification**: https://app.sendgrid.com/settings/sender_auth
- **Activity**: https://app.sendgrid.com/activity
- **Stats**: https://app.sendgrid.com/statistics

---

## ✅ Checklist

- [ ] SendGrid account sudah dibuat
- [ ] Sender email sudah diverifikasi
- [ ] API Key sudah dibuat dan disimpan
- [ ] Konfigurasi SMTP sudah ditambahkan ke `.env`
- [ ] Test SMTP connection berhasil (`python scripts/test-smtp.py`)
- [ ] Test OTP flow berhasil (email terkirim dan diterima)
- [ ] Monitoring dashboard sudah diakses

---

## 🆘 Need Help?

Jika masih ada masalah:

1. **Cek SendGrid Activity:**
   - Lihat apakah email dikirim
   - Cek status (delivered, bounced, dll)

2. **Cek Logs:**
   - Backend console untuk error messages
   - SendGrid dashboard untuk delivery status

3. **Test Manual:**
   ```bash
   python scripts/test-smtp.py
   ```

4. **SendGrid Support:**
   - Free plan: Community support
   - Paid plan: Email support

---

## 📚 Referensi

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid SMTP Settings](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
- [SendGrid API Keys](https://docs.sendgrid.com/ui/account-and-settings/api-keys)
- [SendGrid Sender Verification](https://docs.sendgrid.com/ui/sending-email/sender-verification)

