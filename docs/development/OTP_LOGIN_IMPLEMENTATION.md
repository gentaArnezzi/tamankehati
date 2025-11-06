# 🔐 Implementasi OTP Login

## 📋 Ringkasan

Sistem OTP (One-Time Password) telah diimplementasikan untuk memberikan alternatif login yang lebih aman tanpa menggunakan password. User dapat memilih antara login dengan password atau dengan OTP yang dikirim via email.

## 🏗️ Arsitektur

### Backend

1. **Model OTP** (`apps/backend/users/models_otp.py`)
   - Tabel `otps` untuk menyimpan kode OTP
   - Fields: `id`, `email`, `code`, `used`, `expires_at`, `created_at`
   - Index untuk performa lookup

2. **OTP Service** (`apps/backend/users/services/otp_service.py`)
   - `create_otp()`: Generate dan simpan OTP baru
   - `verify_otp()`: Verifikasi kode OTP
   - `invalidate_otps_for_email()`: Invalidate OTP lama
   - `cleanup_expired_otps()`: Cleanup OTP yang sudah expired

3. **Email Service** (`apps/backend/users/services/email_service.py`)
   - `send_otp_email()`: Kirim OTP via email menggunakan SMTP
   - Support HTML dan plain text email
   - Fallback ke console log jika SMTP tidak dikonfigurasi

4. **API Endpoints** (`apps/backend/api/v1/routes/auth.py`)
   - `POST /api/v1/auth/request-otp`: Request OTP code
   - `POST /api/v1/auth/login-with-otp`: Login menggunakan OTP

### Frontend

1. **OTP Login Form** (`apps/frontend/src/components/auth/OTPLoginForm.tsx`)
   - UI untuk input OTP
   - Request OTP dan verify OTP
   - Countdown timer untuk resend
   - Auto-format input (hanya angka, max 6 digit)

2. **Login Page** (`apps/frontend/src/app/login/page.tsx`)
   - Toggle antara password login dan OTP login
   - Integrasi dengan OTPLoginForm

## 🔧 Setup & Konfigurasi

### 1. Database Migration

Jalankan migration untuk membuat tabel OTP:

```bash
cd apps/backend
alembic upgrade head
```

Atau jika migration belum dibuat, buat manual:

```bash
alembic revision -m "add_otp_table"
# Edit file migration yang dibuat
alembic upgrade head
```

### 2. Konfigurasi Email (SMTP)

Tambahkan variabel berikut ke `apps/backend/.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@tamankehati.id
```

**Catatan:**
- Untuk Gmail, gunakan [App Password](https://support.google.com/accounts/answer/185833)
- Untuk provider lain, sesuaikan `SMTP_HOST` dan `SMTP_PORT`

### 3. Development Mode

Jika SMTP belum dikonfigurasi, OTP akan di-log ke console:
```
⚠️ SMTP not configured. OTP for user@example.com: 123456
```

## 📝 Flow Login dengan OTP

1. **User memilih "Masuk dengan OTP"**
   - Email harus sudah diisi
   - Frontend switch ke OTP mode

2. **Request OTP**
   - Frontend: `POST /api/v1/auth/request-otp` dengan `{ email }`
   - Backend:
     - Validasi user exists dan active
     - Generate 6-digit OTP code
     - Simpan ke database dengan expiry 10 menit
     - Kirim email dengan OTP code
     - Invalidate OTP lama untuk email yang sama

3. **User input OTP**
   - Frontend: Input 6 digit kode
   - Auto-format: hanya angka, max 6 digit

4. **Verify OTP**
   - Frontend: `POST /api/v1/auth/login-with-otp` dengan `{ email, otp_code }`
   - Backend:
     - Verify OTP code (valid, not used, not expired)
     - Mark OTP as used
     - Generate JWT token
     - Return token untuk login

5. **Login Success**
   - Frontend: Save token dan redirect ke dashboard

## 🔒 Security Features

1. **Rate Limiting**
   - Max 5 attempts per 60 seconds per IP
   - Mencegah brute force attack

2. **OTP Expiration**
   - OTP berlaku 10 menit
   - Auto-invalidate setelah digunakan

3. **One-Time Use**
   - Setiap OTP hanya bisa digunakan sekali
   - OTP lama otomatis di-invalidate saat request baru

4. **User Enumeration Prevention**
   - Response sama untuk email yang tidak ada (security best practice)

5. **Email Validation**
   - Hanya user yang terdaftar dan aktif yang bisa request OTP

## 🧪 Testing

### Manual Testing

1. **Request OTP:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

2. **Login dengan OTP:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login-with-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp_code": "123456"}'
```

### Frontend Testing

1. Buka `/login`
2. Masukkan email
3. Klik "Masuk dengan OTP"
4. Klik "Kirim Kode OTP"
5. Cek email atau console log untuk kode OTP
6. Input kode OTP (6 digit)
7. Klik "Verifikasi & Masuk"

## 📊 Database Schema

```sql
CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX ix_otps_email ON otps(email);
CREATE INDEX idx_otp_email_code ON otps(email, code);
CREATE INDEX idx_otp_email_active ON otps(email, used, expires_at);
```

## 🧹 Maintenance

### Cleanup Expired OTPs

Jalankan cleanup secara berkala (misalnya via cron job):

```python
from users.services.otp_service import cleanup_expired_otps
from core.database.session import get_session

async def cleanup():
    async for db in get_session():
        await cleanup_expired_otps(db, days_old=7)
```

## 🚀 Production Checklist

- [ ] Konfigurasi SMTP dengan benar
- [ ] Test email delivery
- [ ] Setup rate limiting yang lebih robust (Redis-based)
- [ ] Monitor OTP usage dan failed attempts
- [ ] Setup cleanup job untuk expired OTPs
- [ ] Review security logs
- [ ] Test dengan berbagai email provider

## 📚 API Documentation

### POST /api/v1/auth/request-otp

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP code has been sent to your email.",
  "expires_in_minutes": 10
}
```

### POST /api/v1/auth/login-with-otp

**Request:**
```json
{
  "email": "user@example.com",
  "otp_code": "123456"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

## 🔄 Future Enhancements

- [ ] SMS OTP support (via Twilio/other provider)
- [ ] OTP via WhatsApp
- [ ] Remember device untuk skip OTP
- [ ] Backup codes
- [ ] OTP untuk 2FA (Two-Factor Authentication)

