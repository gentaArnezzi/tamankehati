# 🔐 Setup Bot Permissions untuk Telegram Group

Panduan untuk memberikan permission bot agar bisa mengirim notifikasi ke grup.

---

## ❌ Error: "Bot has no access to message"

Error ini terjadi karena bot tidak punya permission untuk mengirim pesan di grup.

---

## ✅ Solusi: Berikan Permission ke Bot

### Method 1: Make Bot Admin (Recommended)

**Paling mudah dan reliable:**

1. **Buka grup Telegram** "Taman Kehati CI/CD"
2. **Klik nama grup** di bagian atas
3. **Klik "Administrators"** atau "Pengelola"
4. **Klik "Add Administrator"**
5. **Pilih bot** `tamankehati_cicd_bot`
6. **Enable permissions:**
   - ✅ **Post Messages** (penting!)
   - ✅ **Edit Messages** (optional)
   - ✅ **Delete Messages** (optional)
7. **Klik "Save"**

**Setelah ini, bot bisa mengirim pesan ke grup.**

---

### Method 2: Unrestrict Bot (Jika tidak mau jadi admin)

**Jika tidak mau membuat bot jadi admin:**

1. **Buka grup Telegram**
2. **Klik nama grup** → **"Group Settings"** atau "Pengaturan Grup"
3. **Klik "Permissions"** atau "Izin"
4. **Scroll ke "Restrict Members"** atau "Batasi Anggota"
5. **Pastikan bot tidak di-restrict:**
   - Bot harus bisa mengirim pesan
   - Bot harus bisa mengirim media (optional)

**Note:** Method ini kurang reliable, lebih baik pakai Method 1 (make bot admin).

---

## 🔍 Cara Cek Bot Permissions

### Test Manual:

1. **Di grup, kirim command** `/start` atau `/help` ke bot
2. **Bot harus bisa reply** (jika tidak bisa, berarti permission belum benar)

### Test via API:

```bash
# Test apakah bot bisa kirim pesan
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
  -d "chat_id=-5018129194" \
  -d "text=Test message"
```

**Jika berhasil:** Bot bisa kirim pesan
**Jika error:** Perlu fix permissions

---

## 🛠️ Troubleshooting

### Issue 1: Bot masih tidak bisa kirim pesan setelah jadi admin

**Solution:**
1. Remove bot dari grup
2. Add bot lagi ke grup
3. Make bot admin lagi
4. Test kirim pesan

### Issue 2: Bot bisa kirim pesan manual, tapi notifikasi tidak muncul

**Solution:**
1. Check GitHub Secret `TELEGRAM_CHAT_ID` sudah benar (`-5018129194`)
2. Check GitHub Secret `TELEGRAM_BOT_TOKEN` sudah benar
3. Trigger deployment dan check GitHub Actions logs

### Issue 3: "Bot was blocked by the user"

**Solution:**
1. Bot tidak perlu di-unblock
2. Pastikan bot sudah di-add ke grup
3. Pastikan bot sudah jadi admin atau punya permission

---

## 📋 Checklist Setup Bot

- [ ] Bot sudah di-create via BotFather
- [ ] Bot sudah di-add ke grup
- [ ] Bot sudah jadi admin (atau punya permission)
- [ ] Bot bisa kirim pesan manual (test)
- [ ] GitHub Secret `TELEGRAM_BOT_TOKEN` sudah di-set
- [ ] GitHub Secret `TELEGRAM_CHAT_ID` sudah di-set dengan Chat ID grup (`-5018129194`)
- [ ] Test deployment untuk verify notifikasi

---

## 🎯 Quick Fix

**Jika masih error, coba ini:**

1. **Remove bot dari grup**
   - Klik nama grup → Members → Pilih bot → Remove

2. **Add bot lagi ke grup**
   - Add Members → Search `tamankehati_cicd_bot` → Add

3. **Make bot admin**
   - Group Settings → Administrators → Add Administrator → Pilih bot
   - Enable "Post Messages"
   - Save

4. **Test**
   - Kirim `/start` ke bot di grup
   - Bot harus reply (jika bisa, berarti sudah OK)

---

## ✅ Setelah Setup Berhasil

Bot sekarang bisa:
- ✅ Mengirim notifikasi deployment ke grup
- ✅ Semua anggota grup akan melihat notifikasi
- ✅ Notifikasi muncul real-time saat deployment

---

## 📝 Notes

- **Bot admin** = Paling reliable untuk notifikasi
- **Bot member biasa** = Bisa error jika grup restrict members
- **Test manual** = Pastikan bot bisa kirim pesan sebelum deploy

---

**Last Updated:** November 2025
