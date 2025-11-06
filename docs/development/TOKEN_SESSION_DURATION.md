# ⏱️ Rekomendasi Durasi Token Session

## 📊 Konfigurasi Saat Ini

**Current setting:**
- `ACCESS_TOKEN_EXPIRE_MINUTES = 60` (1 jam)
- Bisa diubah via environment variable: `ACCESS_TOKEN_EXPIRE_MINUTES`

**File:** `apps/backend/core/auth/config.py`

---

## 🎯 Rekomendasi Berdasarkan Tipe Aplikasi

### 1. Aplikasi Internal/Admin (Seperti Taman Kehati) ✅ **RECOMMENDED**

**Rekomendasi: 2-4 jam (120-240 menit)**

**Alasan:**
- ✅ Balance antara security dan user experience
- ✅ User tidak perlu login ulang terlalu sering
- ✅ Cukup aman untuk aplikasi internal
- ✅ Sesuai dengan best practice aplikasi enterprise/government

**Setup:**
```env
ACCESS_TOKEN_EXPIRE_MINUTES=240  # 4 jam
```

**Atau:**
```env
ACCESS_TOKEN_EXPIRE_MINUTES=120  # 2 jam (lebih aman)
```

---

### 2. Aplikasi High-Security (Financial, Healthcare)

**Rekomendasi: 15-30 menit**

**Alasan:**
- ✅ Security sangat penting
- ✅ Token yang lebih pendek = lebih aman
- ⚠️ User perlu login ulang lebih sering

**Setup:**
```env
ACCESS_TOKEN_EXPIRE_MINUTES=30  # 30 menit
```

---

### 3. Aplikasi Public/Consumer (Social Media, E-commerce)

**Rekomendasi: 7-30 hari (dengan refresh token)**

**Alasan:**
- ✅ User experience lebih penting
- ✅ Biasanya pakai refresh token mechanism
- ⚠️ Perlu implementasi refresh token

**Setup:**
```env
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 jam
# + Refresh token: 7-30 hari
```

---

### 4. Aplikasi Development/Testing

**Rekomendasi: 24 jam atau lebih**

**Alasan:**
- ✅ Memudahkan development
- ✅ Tidak perlu login ulang saat testing
- ⚠️ Hanya untuk development, jangan dipakai di production

**Setup:**
```env
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 jam
```

---

## 📋 Rekomendasi untuk Taman Kehati

### Opsi 1: Balanced (Recommended) ⭐

**4 jam (240 menit)**

```env
ACCESS_TOKEN_EXPIRE_MINUTES=240
```

**Kelebihan:**
- ✅ User bisa bekerja dalam waktu yang lama tanpa login ulang
- ✅ Cukup aman untuk aplikasi internal
- ✅ Sesuai dengan best practice aplikasi government

**Kekurangan:**
- ⚠️ Jika token dicuri, masih valid selama 4 jam

---

### Opsi 2: More Secure

**2 jam (120 menit)**

```env
ACCESS_TOKEN_EXPIRE_MINUTES=120
```

**Kelebihan:**
- ✅ Lebih aman (token lebih cepat expire)
- ✅ Masih cukup untuk session kerja normal

**Kekurangan:**
- ⚠️ User perlu login ulang lebih sering

---

### Opsi 3: More Convenient

**8 jam (480 menit)**

```env
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

**Kelebihan:**
- ✅ User bisa bekerja seharian tanpa login ulang
- ✅ Cocok untuk user yang bekerja dalam waktu lama

**Kekurangan:**
- ⚠️ Kurang aman (token valid lebih lama)

---

## 🔧 Cara Mengubah Durasi Token

### Step 1: Update Environment Variable

Tambahkan ke `apps/backend/.env`:

```env
# JWT Token Expiration (dalam menit)
ACCESS_TOKEN_EXPIRE_MINUTES=240  # 4 jam
```

**Pilihan:**
- `60` = 1 jam (default)
- `120` = 2 jam
- `240` = 4 jam (recommended)
- `480` = 8 jam
- `1440` = 24 jam

---

### Step 2: Restart Backend

```bash
# Stop backend (Ctrl+C)
# Start lagi
cd apps/backend
uvicorn main:app --reload
```

---

### Step 3: Test

1. Login ke aplikasi
2. Cek token expiration di browser console:
   ```javascript
   // Decode JWT token (di console browser)
   const token = localStorage.getItem('auth_token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Token expires at:', new Date(payload.exp * 1000));
   ```

---

## 🔒 Security Best Practices

### 1. Short-Lived Access Token + Refresh Token (Advanced)

**Ideal untuk production yang lebih secure:**

- **Access Token:** 15-30 menit
- **Refresh Token:** 7-30 hari
- User auto-refresh token tanpa perlu login ulang

**Implementasi:**
- Perlu tambah endpoint `/auth/refresh`
- Perlu tabel `refresh_tokens` di database
- Frontend perlu handle auto-refresh

**Status:** Belum diimplementasikan (bisa ditambahkan nanti)

---

### 2. Token Rotation

**Setiap kali refresh, generate token baru:**
- Token lama di-invalidate
- Token baru dibuat
- Mencegah token reuse

**Status:** Belum diimplementasikan

---

### 3. Remember Me Option

**User bisa pilih:**
- **Normal session:** 2-4 jam
- **Remember me:** 7-30 hari

**Implementasi:**
- Tambah checkbox "Remember me" di login
- Set expiration berbeda berdasarkan pilihan

**Status:** Belum diimplementasikan (bisa ditambahkan nanti)

---

## 📊 Perbandingan Durasi

| Durasi | Security | UX | Use Case |
|--------|----------|----|----------|
| 15-30 menit | ⭐⭐⭐⭐⭐ | ⭐⭐ | High-security apps |
| 1 jam | ⭐⭐⭐⭐ | ⭐⭐⭐ | Default, balanced |
| 2 jam | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Recommended** |
| 4 jam | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Recommended** |
| 8 jam | ⭐⭐ | ⭐⭐⭐⭐⭐ | Long work sessions |
| 24 jam | ⭐ | ⭐⭐⭐⭐⭐ | Development only |

---

## 💡 Tips

### 1. Monitor Token Usage

Cek di backend logs:
- Berapa lama user biasanya aktif
- Apakah user sering perlu login ulang
- Sesuaikan durasi berdasarkan usage

---

### 2. Environment-Specific Settings

**Development:**
```env
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 jam
```

**Production:**
```env
ACCESS_TOKEN_EXPIRE_MINUTES=240  # 4 jam
```

---

### 3. User Role-Based Expiration (Advanced)

**Token expiration berbeda per role:**
- Super Admin: 2 jam (lebih secure)
- Regional Admin: 4 jam (normal)
- User: 8 jam (lebih convenient)

**Implementasi:**
- Modify `create_access_token` untuk accept role
- Set expiration berbeda berdasarkan role

**Status:** Belum diimplementasikan (bisa ditambahkan nanti)

---

## ✅ Checklist

- [ ] Tentukan durasi yang sesuai dengan kebutuhan
- [ ] Update `ACCESS_TOKEN_EXPIRE_MINUTES` di `.env`
- [ ] Restart backend
- [ ] Test login dan cek token expiration
- [ ] Monitor user feedback
- [ ] Adjust jika perlu

---

## 🎯 Rekomendasi Final untuk Taman Kehati

**Saya rekomendasikan: 4 jam (240 menit)**

**Alasan:**
1. ✅ Balance antara security dan UX
2. ✅ User bisa bekerja dalam waktu yang lama
3. ✅ Cukup aman untuk aplikasi internal/government
4. ✅ Sesuai dengan best practice

**Setup:**
```env
ACCESS_TOKEN_EXPIRE_MINUTES=240
```

**Alternatif jika lebih mementingkan security:**
```env
ACCESS_TOKEN_EXPIRE_MINUTES=120  # 2 jam
```

---

## 📚 Referensi

- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Token Expiration Guidelines](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

