# 🔧 Fix SendGrid Deferred 421 Error

## 📋 Masalah

Email OTP di SendGrid menunjukkan status **"Deferred"** dengan response code **421** dan pesan **"4.7.32 Your email ha..."**.

## 🔍 Penyebab Umum

### 1. **Rate Limiting (Paling Umum)**
- Terlalu banyak email dikirim dalam waktu singkat
- SendGrid membatasi jumlah email per detik/jam
- **Plan Gratis**: 100 email/hari, max 1 email/detik
- **Plan Berbayar**: Tergantung tier

### 2. **IP Warming Issues**
- IP baru belum "dipanaskan" dengan baik
- SendGrid membatasi volume email dari IP baru
- Butuh waktu beberapa hari/minggu untuk meningkatkan limit

### 3. **Sender Reputation**
- Reputasi pengirim masih rendah
- Bounce rate tinggi
- Spam complaints
- Email masuk ke spam folder

### 4. **Domain Authentication**
- SPF record belum dikonfigurasi dengan benar
- DKIM signature tidak valid
- DMARC policy terlalu ketat

### 5. **Temporary Server Issues**
- Server SendGrid sedang maintenance
- Network issues
- Temporary overload

## ✅ Solusi

### Solusi 1: Cek Rate Limiting di SendGrid

1. **Login ke SendGrid Dashboard**
2. **Cek Activity Feed**:
   - Lihat berapa banyak email yang dikirim
   - Cek apakah melebihi limit plan Anda

3. **Cek API Usage**:
   - Settings → API Keys
   - Lihat usage statistics

**Jika melebihi limit:**
- Upgrade plan SendGrid
- Atau implementasi rate limiting di aplikasi (delay antar email)

### Solusi 2: Implementasi Rate Limiting di Aplikasi

Tambahkan delay antar pengiriman email OTP:

```python
# apps/backend/users/services/email_service.py
import asyncio
from datetime import datetime, timedelta

# Track last email sent time
_last_email_time: dict[str, datetime] = {}
_min_email_interval = timedelta(seconds=2)  # Min 2 seconds between emails

async def send_otp_email(email: str, otp_code: str) -> bool:
    # Rate limiting: min 2 seconds between emails
    now = datetime.now()
    if email in _last_email_time:
        time_since_last = now - _last_email_time[email]
        if time_since_last < _min_email_interval:
            wait_time = (_min_email_interval - time_since_last).total_seconds()
            await asyncio.sleep(wait_time)
    
    _last_email_time[email] = datetime.now()
    
    # ... rest of email sending code
```

### Solusi 3: Verifikasi Domain Authentication

1. **Cek SPF Record**:
   ```bash
   dig TXT yourdomain.com | grep spf
   ```
   Harus ada: `v=spf1 include:sendgrid.net ~all`

2. **Cek DKIM**:
   - SendGrid Dashboard → Settings → Sender Authentication
   - Pastikan DKIM sudah verified

3. **Cek DMARC**:
   ```bash
   dig TXT _dmarc.yourdomain.com
   ```
   Policy tidak boleh terlalu ketat untuk testing

### Solusi 4: IP Warming (Untuk IP Dedicated)

Jika menggunakan IP dedicated:
1. Mulai dengan volume kecil (50-100 email/hari)
2. Tingkatkan secara bertahap setiap minggu
3. Monitor bounce rate dan spam complaints
4. Jaga bounce rate < 2%

### Solusi 5: Cek Sender Reputation

1. **SendGrid Dashboard** → Activity
2. Cek metrics:
   - **Bounce Rate**: Harus < 2%
   - **Spam Rate**: Harus < 0.1%
   - **Unsubscribe Rate**: Harus < 0.5%

3. **Jika bounce rate tinggi**:
   - Validasi email sebelum kirim
   - Hapus email invalid dari database
   - Gunakan email verification service

### Solusi 6: Retry Logic dengan Exponential Backoff

Tambahkan retry logic untuk email yang deferred:

```python
import asyncio
from typing import Optional

async def send_otp_email_with_retry(
    email: str, 
    otp_code: str, 
    max_retries: int = 3
) -> bool:
    """Send OTP email with exponential backoff retry"""
    for attempt in range(max_retries):
        success = await send_otp_email(email, otp_code)
        if success:
            return True
        
        if attempt < max_retries - 1:
            # Exponential backoff: 2^attempt seconds
            wait_time = 2 ** attempt
            print(f"Retrying in {wait_time} seconds... (attempt {attempt + 1}/{max_retries})")
            await asyncio.sleep(wait_time)
    
    return False
```

## 🔍 Debugging Steps

### 1. Cek SendGrid Activity Feed

1. Login ke SendGrid Dashboard
2. Activity → Email Activity
3. Cari email yang deferred
4. Klik untuk melihat detail error

### 2. Cek Response Code Detail

Response code **421** dengan **4.7.32** biasanya berarti:
- **4.7.32**: "Your email has been temporarily deferred due to an unexpected response from the recipient server"

**Kemungkinan penyebab:**
- Server penerima sedang overload
- Temporary network issues
- Rate limiting di server penerima

### 3. Cek Email Logs di Backend

```bash
# Cek logs backend
tail -f apps/backend/logs/app.log | grep OTP

# Atau cek console output
# Harus ada: "✅ OTP email sent to {email}" atau error message
```

### 4. Test Email Delivery

```bash
# Test kirim email langsung via SendGrid API
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{
      "to": [{"email": "test@example.com"}]
    }],
    "from": {"email": "noreply@tamankehati.id"},
    "subject": "Test Email",
    "content": [{
      "type": "text/plain",
      "value": "Test email"
    }]
  }'
```

## 🚀 Quick Fix untuk Development

Jika ini untuk development/testing, gunakan fallback:

```python
# apps/backend/users/services/email_service.py

async def send_otp_email(email: str, otp_code: str) -> bool:
    # ... existing code ...
    
    try:
        # ... send email code ...
        return True
    except Exception as e:
        print(f"❌ Failed to send OTP email to {email}: {e}")
        
        # FALLBACK: Log OTP to console for development
        print(f"⚠️ FALLBACK: OTP for {email}: {otp_code}")
        print("   (This is a fallback for development. Email sending failed.)")
        
        # Return True so login flow continues
        # In production, you might want to return False
        return True  # or False for production
```

## 📊 Monitoring

### Setup Alerts di SendGrid

1. **SendGrid Dashboard** → Settings → Alerts
2. Enable alerts untuk:
   - High bounce rate
   - High spam rate
   - Deferred emails
   - API errors

### Monitor Email Metrics

1. **Activity Feed**: Cek real-time email status
2. **Stats Dashboard**: Cek delivery rate, bounce rate, spam rate
3. **Suppression List**: Cek email yang di-suppress

## 🎯 Best Practices

1. **Validasi Email Sebelum Kirim**:
   - Gunakan email validation service
   - Hapus email invalid dari database

2. **Rate Limiting**:
   - Max 1 email per detik per user
   - Max 5 email per jam per user

3. **Retry Logic**:
   - Retry dengan exponential backoff
   - Max 3 retries

4. **Monitoring**:
   - Monitor bounce rate
   - Monitor spam complaints
   - Setup alerts

5. **Domain Authentication**:
   - Setup SPF, DKIM, DMARC
   - Verify domain di SendGrid

## 📝 Checklist

- [ ] Cek SendGrid Activity Feed untuk detail error
- [ ] Verifikasi rate limiting tidak melebihi limit
- [ ] Cek domain authentication (SPF, DKIM, DMARC)
- [ ] Monitor bounce rate dan spam rate
- [ ] Implementasi rate limiting di aplikasi
- [ ] Tambahkan retry logic dengan exponential backoff
- [ ] Setup alerts di SendGrid
- [ ] Test email delivery dengan API langsung

## 🔗 Referensi

- [SendGrid Error Codes](https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/errors)
- [SendGrid Rate Limiting](https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/rate-limits)
- [SendGrid IP Warming](https://docs.sendgrid.com/ui/account-and-settings/ip-warmup)
- [SendGrid Domain Authentication](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)

