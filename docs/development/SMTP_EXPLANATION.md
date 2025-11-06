# 📧 Apa itu SMTP?

## Penjelasan Sederhana

**SMTP** (Simple Mail Transfer Protocol) adalah protokol yang digunakan untuk **mengirim email** dari satu server ke server lain.

### Analogi Sederhana:
- **SMTP** = seperti **kantor pos** untuk email
- Ketika Anda mengirim email, aplikasi menggunakan SMTP untuk mengirim email ke server email (Gmail, Outlook, dll)
- Server email kemudian mengirimkan email ke penerima

---

## Kenapa Butuh SMTP untuk OTP?

Ketika user login dengan OTP:
1. User memasukkan email + password ✅
2. Backend generate kode OTP (misalnya: `123456`)
3. **Backend perlu mengirim kode OTP ke email user** 📧
4. Untuk mengirim email, backend butuh **SMTP server**

**Tanpa SMTP:**
- OTP tidak bisa dikirim ke email user
- User tidak akan menerima kode OTP
- Login dengan OTP tidak bisa berfungsi

**Dengan SMTP:**
- Backend bisa mengirim email berisi kode OTP
- User menerima email dengan kode OTP
- User bisa login dengan kode OTP ✅

---

## SMTP Configuration

Untuk menggunakan SMTP, Anda perlu konfigurasi berikut:

```env
SMTP_HOST=smtp.gmail.com      # Alamat server SMTP
SMTP_PORT=587                  # Port untuk koneksi (biasanya 587 untuk TLS)
SMTP_USER=your-email@gmail.com # Email pengirim
SMTP_PASSWORD=your-password    # Password untuk autentikasi
SMTP_FROM=noreply@example.com  # Email yang muncul sebagai pengirim
```

### Penjelasan Setiap Field:

1. **SMTP_HOST**: Alamat server SMTP
   - Gmail: `smtp.gmail.com`
   - Outlook: `smtp-mail.outlook.com`
   - SendGrid: `smtp.sendgrid.net`

2. **SMTP_PORT**: Port untuk koneksi
   - `587` = TLS (Transport Layer Security) - **disarankan**
   - `465` = SSL (Secure Sockets Layer)
   - `25` = Plain (tidak aman, biasanya diblokir)

3. **SMTP_USER**: Email yang digunakan untuk login ke SMTP server
   - Bisa email Gmail, Outlook, atau email custom domain

4. **SMTP_PASSWORD**: Password untuk autentikasi
   - **Untuk Gmail**: Gunakan **App Password** (bukan password biasa)
   - **Untuk Outlook**: Gunakan **App Password** atau password biasa
   - **Untuk provider lain**: Sesuai dengan kebijakan provider

5. **SMTP_FROM**: Email yang muncul sebagai pengirim
   - Bisa sama dengan SMTP_USER atau email lain (jika didukung)

---

## Provider SMTP Populer

### 1. Gmail (Gratis)

**Konfigurasi:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # ⚠️ Gunakan App Password!
SMTP_FROM=your-email@gmail.com
```

**Setup App Password:**
1. Buka: https://myaccount.google.com/apppasswords
2. Pilih "Mail" dan "Other (Custom name)"
3. Masukkan nama: "Taman Kehati OTP"
4. Copy 16-digit password yang dihasilkan
5. Gunakan sebagai `SMTP_PASSWORD`

**Limit:**
- 500 email/hari untuk akun gratis
- Cocok untuk development dan production kecil

---

### 2. Outlook/Hotmail (Gratis)

**Konfigurasi:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@outlook.com
```

**Limit:**
- 300 email/hari untuk akun gratis

---

### 3. SendGrid (Gratis & Berbayar)

**Konfigurasi:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

**Limit:**
- 100 email/hari untuk plan gratis
- Cocok untuk production

**Setup:**
1. Daftar di: https://sendgrid.com
2. Buat API Key
3. Gunakan API Key sebagai `SMTP_PASSWORD`

---

### 4. Mailgun (Gratis & Berbayar)

**Konfigurasi:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
SMTP_FROM=noreply@yourdomain.com
```

**Limit:**
- 5,000 email/bulan untuk plan gratis
- Cocok untuk production

---

## Development vs Production

### Development (Tanpa SMTP)

Jika SMTP belum dikonfigurasi, OTP akan muncul di **console backend**:

```
⚠️ SMTP not configured. OTP for user@example.com: 123456
```

**Cara melihat OTP:**
1. Jalankan backend server
2. Cek console/log saat request OTP
3. Copy kode OTP yang muncul

**Cocok untuk:**
- Testing lokal
- Development
- Tidak perlu kirim email real

---

### Production (Dengan SMTP)

**WAJIB** menggunakan SMTP yang benar untuk production.

**Alasan:**
- User tidak bisa akses console server
- User perlu menerima email real
- Security dan reliability

**Rekomendasi:**
- Gmail (untuk volume kecil)
- SendGrid (untuk volume sedang)
- Mailgun (untuk volume besar)
- AWS SES (untuk enterprise)

---

## Test SMTP Connection

Gunakan script test yang sudah disediakan:

```bash
python scripts/test-smtp.py
```

Script ini akan:
1. Test koneksi ke SMTP server
2. Test autentikasi
3. (Opsional) Kirim test email

---

## Troubleshooting SMTP

### Error: "SMTP Authentication failed"

**Penyebab:**
- Password salah
- Untuk Gmail: tidak menggunakan App Password

**Solusi:**
- Pastikan menggunakan App Password untuk Gmail
- Cek password di `.env`

---

### Error: "SMTP Connection failed"

**Penyebab:**
- SMTP_HOST atau SMTP_PORT salah
- Firewall memblokir port 587
- Koneksi internet bermasalah

**Solusi:**
- Cek SMTP_HOST dan SMTP_PORT
- Test koneksi: `telnet smtp.gmail.com 587`
- Cek firewall settings

---

### Error: "Email tidak terkirim"

**Penyebab:**
- Limit email tercapai (Gmail: 500/hari)
- Email masuk spam folder
- SMTP configuration salah

**Solusi:**
- Cek limit provider
- Cek spam folder
- Test dengan `python scripts/test-smtp.py`

---

## Kesimpulan

**SMTP = Protokol untuk mengirim email**

**Untuk OTP:**
- Backend butuh SMTP untuk kirim kode OTP ke email user
- Tanpa SMTP, OTP tidak bisa dikirim
- Development bisa tanpa SMTP (OTP muncul di console)
- Production **WAJIB** menggunakan SMTP

**Setup SMTP:**
1. Pilih provider (Gmail, SendGrid, dll)
2. Dapatkan credentials (email, password/API key)
3. Tambahkan ke `.env`
4. Test dengan `python scripts/test-smtp.py`

---

## Referensi

- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [SendGrid SMTP](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
- [Mailgun SMTP](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)

