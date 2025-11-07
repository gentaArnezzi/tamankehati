# 🔧 Fix DMARC Alignment Error di SendGrid

## ❌ Error yang Terjadi

```
421 4.7.32 Your email has been rate limited because the From: header (RFC5322) 
in this message isn't aligned with either the authenticated SPF or DKIM 
organizational domain.
```

## 🔍 Penjelasan Masalah

**DMARC Alignment Error** terjadi ketika:
- Email `From:` header tidak sesuai dengan domain yang ter-authenticate di SendGrid
- Misalnya: `From: noreply@tamankehati.id` tapi domain `tamankehati.id` belum ter-authenticate
- Atau menggunakan email yang belum di-verify sebagai Single Sender

## ✅ Solusi

### Solusi 1: Gunakan Email yang Sudah Ter-Verify (Paling Mudah)

**Untuk SendGrid dengan API Key:**

1. **Verifikasi Single Sender di SendGrid:**
   - Login ke SendGrid Dashboard
   - Settings → Sender Authentication → Single Sender Verification
   - Klik "Create New Sender"
   - Masukkan email yang ingin digunakan (misalnya: `noreply@tamankehati.id` atau email Gmail Anda)
   - Verifikasi email tersebut (cek inbox dan klik link verifikasi)

2. **Update `.env` file:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   SMTP_FROM=noreply@tamankehati.id  # ← Harus sama dengan email yang ter-verify
   ```

3. **Restart backend server**

### Solusi 2: Domain Authentication (Paling Profesional)

**Untuk production dengan domain sendiri:**

1. **Authenticate Domain di SendGrid:**
   - Settings → Sender Authentication → Domain Authentication
   - Klik "Authenticate Your Domain"
   - Masukkan domain Anda (misalnya: `tamankehati.id`)
   - Follow instruksi untuk menambahkan DNS records:
     - CNAME records untuk DKIM
     - TXT record untuk SPF
     - TXT record untuk DMARC (opsional)

2. **Setelah domain ter-authenticate:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   SMTP_FROM=noreply@tamankehati.id  # ← Bisa menggunakan email apapun di domain yang ter-authenticate
   ```

### Solusi 3: Gunakan Email Gmail/Outlook (Untuk Development)

**Jika tidak punya domain sendiri:**

1. **Verifikasi email Gmail/Outlook di SendGrid:**
   - Settings → Sender Authentication → Single Sender Verification
   - Create sender dengan email Gmail/Outlook Anda
   - Verifikasi email tersebut

2. **Update `.env`:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   SMTP_FROM=your-email@gmail.com  # ← Harus sama dengan email yang ter-verify
   ```

## 🔍 Cara Cek Email yang Ter-Verify

1. **Login ke SendGrid Dashboard**
2. **Settings → Sender Authentication**
3. **Cek "Single Sender Verification"**:
   - List semua email yang sudah ter-verify
   - Email yang ter-verify bisa digunakan sebagai `SMTP_FROM`

4. **Cek "Domain Authentication"**:
   - List semua domain yang sudah ter-authenticate
   - Setelah domain ter-authenticate, bisa menggunakan email apapun di domain tersebut

## ⚠️ Penting!

**Aturan DMARC Alignment:**
- `SMTP_FROM` **HARUS** menggunakan email yang:
  - Sudah ter-verify sebagai Single Sender, ATAU
  - Berada di domain yang sudah ter-authenticate

**Contoh yang BENAR:**
```env
# Single Sender Verification
SMTP_FROM=noreply@tamankehati.id  # ← Email ini sudah ter-verify di SendGrid

# Domain Authentication
SMTP_FROM=otp@tamankehati.id  # ← Domain tamankehati.id sudah ter-authenticate
```

**Contoh yang SALAH:**
```env
# Email belum ter-verify
SMTP_FROM=noreply@tamankehati.id  # ← Email ini BELUM ter-verify di SendGrid ❌

# Domain belum ter-authenticate
SMTP_FROM=otp@tamankehati.id  # ← Domain tamankehati.id BELUM ter-authenticate ❌
```

## 🚀 Quick Fix

### Langkah 1: Cek Email yang Ter-Verify
1. Login SendGrid Dashboard
2. Settings → Sender Authentication
3. Lihat list email/domain yang ter-verify

### Langkah 2: Update `.env`
Gunakan email yang ter-verify sebagai `SMTP_FROM`:

```env
SMTP_FROM=email-yang-sudah-ter-verify@domain.com
```

### Langkah 3: Restart Backend
```bash
# Restart backend server agar perubahan .env diterapkan
```

## 📋 Checklist

- [ ] Login ke SendGrid Dashboard
- [ ] Cek Settings → Sender Authentication
- [ ] Verifikasi email sebagai Single Sender (jika belum)
- [ ] Atau authenticate domain (untuk production)
- [ ] Update `SMTP_FROM` di `.env` dengan email yang ter-verify
- [ ] Pastikan `SMTP_FROM` sesuai dengan email/domain yang ter-verify
- [ ] Restart backend server
- [ ] Test kirim OTP lagi

## 🔗 Referensi

- [SendGrid Single Sender Verification](https://docs.sendgrid.com/ui/sending-email/sender-verification)
- [SendGrid Domain Authentication](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)
- [DMARC Alignment Explained](https://support.google.com/a/answer/2466563)
- [Gmail Requirements for Bulk Senders](https://support.google.com/a/answer/81126)

