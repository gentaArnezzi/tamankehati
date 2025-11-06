# ✅ Checklist Setup OTP Login

## 📋 Langkah-langkah Setup

### 1. Database Migration ⚠️ **WAJIB**

Jalankan migration untuk membuat tabel `otps`:

```bash
cd apps/backend
alembic upgrade head
```

**Verifikasi:**
```bash
# Cek apakah migration sudah dijalankan
alembic current

# Atau cek langsung di database
# Tabel `otps` harus ada dengan kolom: id, email, code, used, expires_at, created_at
```

**Jika migration belum dibuat:**
```bash
# Buat migration baru
alembic revision -m "add_otp_table"

# Edit file migration yang dibuat di migrations/versions/
# Copy isi dari migrations/versions/add_otp_table.py

# Jalankan migration
alembic upgrade head
```

---

### 2. Konfigurasi Email (SMTP) ⚠️ **WAJIB untuk Production**

Tambahkan variabel berikut ke `apps/backend/.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@tamankehati.id
```

#### Setup untuk Gmail:

1. **Aktifkan 2-Step Verification** di akun Google Anda
2. **Buat App Password:**
   - Buka: https://myaccount.google.com/apppasswords
   - Pilih "Mail" dan "Other (Custom name)"
   - Masukkan nama: "Taman Kehati OTP"
   - Copy 16-digit password yang dihasilkan
   - Gunakan password ini sebagai `SMTP_PASSWORD`

#### Setup untuk Provider Lain:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
```

---

### 3. Development Mode (Tanpa SMTP) ⚠️ **OPSIONAL**

Jika SMTP belum dikonfigurasi, OTP akan di-log ke console backend:

```
⚠️ SMTP not configured. OTP for user@example.com: 123456
```

**Cara melihat OTP di development:**
1. Jalankan backend server
2. Cek console/log backend saat request OTP
3. Copy kode OTP yang muncul

**Catatan:** Ini hanya untuk development. Production harus menggunakan SMTP yang benar.

---

### 4. Verifikasi Setup

#### Test Backend Endpoints:

**1. Test Request OTP:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Expected Response:**
```json
{
  "requires_otp": true,
  "message": "Password verified. OTP code has been sent to your email.",
  "email": "your-email@example.com"
}
```

**2. Cek Console Backend:**
- Jika SMTP tidak dikonfigurasi, OTP akan muncul di console
- Jika SMTP dikonfigurasi, cek email inbox

**3. Test Verify OTP:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-otp-after-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "otp_code": "123456"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user_id": 1,
  "email": "your-email@example.com",
  "role": "super_admin",
  "name": "Your Name"
}
```

#### Test Frontend:

1. Buka `http://localhost:3000/login`
2. Masukkan email dan password
3. Klik "Masuk"
4. Cek email atau console backend untuk OTP
5. Input 6 digit OTP
6. Klik "Verifikasi & Masuk"
7. Seharusnya redirect ke dashboard

---

## 🔍 Troubleshooting

### Problem: OTP tidak terkirim via email

**Solusi 1: Cek SMTP Configuration**
```bash
# Pastikan semua variabel ada di .env
cat apps/backend/.env | grep SMTP
```

**Solusi 2: Test SMTP Connection**
```python
# Buat file test_smtp.py di apps/backend/
import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

smtp_host = os.getenv("SMTP_HOST")
smtp_port = int(os.getenv("SMTP_PORT", "587"))
smtp_user = os.getenv("SMTP_USER")
smtp_password = os.getenv("SMTP_PASSWORD")

try:
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.starttls()
    server.login(smtp_user, smtp_password)
    print("✅ SMTP connection successful!")
    server.quit()
except Exception as e:
    print(f"❌ SMTP connection failed: {e}")
```

**Solusi 3: Cek Firewall/Network**
- Pastikan port 587 (SMTP) tidak diblokir
- Untuk production, pastikan server bisa akses SMTP

**Solusi 4: Cek Email Provider Settings**
- Gmail: Pastikan "Less secure app access" sudah diaktifkan (atau gunakan App Password)
- Outlook: Pastikan 2FA sudah diaktifkan dan gunakan App Password

### Problem: Migration error

**Solusi:**
```bash
# Cek status migration
cd apps/backend
alembic current

# Jika ada error, cek log
alembic upgrade head --sql  # Preview SQL

# Rollback jika perlu
alembic downgrade -1

# Coba lagi
alembic upgrade head
```

### Problem: OTP expired terlalu cepat

**Solusi:** Edit `apps/backend/api/v1/routes/auth.py`:
```python
# Ubah expiration_minutes dari 10 ke nilai yang lebih besar
otp = await create_otp(db, form_data.email, expiration_minutes=15)  # 15 menit
```

### Problem: Rate limiting terlalu ketat

**Solusi:** Edit `apps/backend/api/v1/routes/auth.py`:
```python
_rate_limit_max_attempts = 10  # Ubah dari 5 ke 10
_rate_limit_window = 120  # Ubah dari 60 ke 120 detik
```

---

## 📊 Checklist Final

- [ ] Database migration sudah dijalankan (`alembic upgrade head`)
- [ ] Tabel `otps` sudah ada di database
- [ ] SMTP configuration sudah ditambahkan ke `.env`
- [ ] SMTP connection sudah ditest (jika menggunakan email)
- [ ] Backend server sudah running
- [ ] Frontend server sudah running
- [ ] Test login flow berhasil
- [ ] OTP terkirim via email (atau muncul di console untuk dev)
- [ ] OTP verification berhasil
- [ ] Login berhasil dan redirect ke dashboard

---

## 🚀 Production Checklist

Sebelum deploy ke production:

- [ ] SMTP configuration sudah benar
- [ ] Test email delivery di production
- [ ] Rate limiting sudah disesuaikan
- [ ] OTP expiration time sudah sesuai kebutuhan
- [ ] Monitoring untuk failed OTP attempts
- [ ] Logging untuk audit trail
- [ ] Backup strategy untuk OTP data (jika perlu)

---

## 📝 Environment Variables Reference

```env
# Required for OTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@tamankehati.id

# Optional
ENVIRONMENT=production  # Untuk secure cookies
```

---

## 🆘 Need Help?

Jika masih ada masalah:

1. **Cek logs backend:**
   ```bash
   # Lihat console output saat request OTP
   # OTP akan muncul di console jika SMTP tidak dikonfigurasi
   ```

2. **Cek database:**
   ```sql
   -- Cek apakah OTP sudah dibuat
   SELECT * FROM otps WHERE email = 'your-email@example.com' ORDER BY created_at DESC LIMIT 5;
   ```

3. **Test endpoint langsung:**
   ```bash
   # Gunakan curl atau Postman untuk test endpoint
   # Lihat response dan error messages
   ```

4. **Cek network:**
   ```bash
   # Test SMTP connection dari server
   telnet smtp.gmail.com 587
   ```

