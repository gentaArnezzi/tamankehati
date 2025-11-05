# 📱 Setup Telegram Notifications untuk CI/CD

Panduan lengkap untuk setup Telegram notifications agar Anda mendapat notifikasi real-time setiap kali ada deployment.

---

## 🎯 Overview

Setelah setup, Anda akan mendapat notifikasi Telegram untuk:
- 🚀 Deployment dimulai
- ✅ Build Docker images berhasil
- ❌ Build gagal
- ✅ Deployment berhasil
- ❌ Deployment gagal
- 🔄 Rollback otomatis

---

## 📋 Step-by-Step Setup

### Step 1: Buat Telegram Bot

1. **Buka Telegram** dan search **[@BotFather](https://t.me/botfather)**
2. **Start chat** dengan BotFather
3. **Kirim command:** `/newbot`
4. **Ikuti instruksi:**
   - **Bot name:** `Taman Kehati CI/CD` (atau nama lain)
   - **Bot username:** `tamankehati_cicd_bot` (harus diakhiri `bot`)
5. **Copy bot token** yang diberikan BotFather
   - Format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - ⚠️ **PENTING:** Simpan token ini, hanya muncul sekali!

**Contoh:**
```
BotFather: Alright, a new bot. How are we going to call it? Please choose a name for your bot.
You: Taman Kehati CI/CD
BotFather: Good. Now let's choose a username for your bot. It must end in 'bot'. Like this, for example: TetrisBot or tetris_bot.
You: tamankehati_cicd_bot
BotFather: Done! Congratulations on your new bot. You will find it at t.me/tamankehati_cicd_bot. Use this token to access the HTTP API:
        123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

---

### Step 2: Dapatkan Chat ID Anda

Ada 2 cara untuk mendapatkan Chat ID:

#### Method 1: Menggunakan Helper Bot (Paling Mudah)

1. **Search** **[@userinfobot](https://t.me/userinfobot)** di Telegram
2. **Start chat** dengan bot tersebut
3. Bot akan langsung reply dengan informasi Anda, termasuk **Chat ID**
   - Chat ID biasanya berupa angka panjang, contoh: `123456789`

#### Method 2: Menggunakan Telegram API

1. **Kirim pesan apapun** ke bot yang baru Anda buat (tamankehati_cicd_bot)
   - Contoh: "Hello" atau "Test"
2. **Buka browser** dan kunjungi:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
   - Ganti `<YOUR_BOT_TOKEN>` dengan token dari Step 1
   - Contoh: `https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/getUpdates`
3. **Cari** `"chat":{"id":` dalam JSON response
4. **Copy angka** setelah `"id":` (ini adalah Chat ID Anda)

**Contoh JSON response:**
```json
{
  "ok": true,
  "result": [
    {
      "update_id": 123456789,
      "message": {
        "chat": {
          "id": 987654321,  ← INI CHAT ID ANDA
          "first_name": "Your",
          "last_name": "Name",
          "username": "yourusername",
          "type": "private"
        },
        ...
      }
    }
  ]
}
```

---

### Step 3: Tambahkan GitHub Secrets

1. **Buka GitHub repository** Anda
2. **Klik Settings** → **Secrets and variables** → **Actions**
3. **Klik "New repository secret"**

#### Secret 1: TELEGRAM_BOT_TOKEN

1. **Name:** `TELEGRAM_BOT_TOKEN`
2. **Value:** (paste bot token dari Step 1)
   - Contoh: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
3. **Klik "Add secret"**

#### Secret 2: TELEGRAM_CHAT_ID

1. **Klik "New repository secret" lagi**
2. **Name:** `TELEGRAM_CHAT_ID`
3. **Value:** (paste chat ID dari Step 2)
   - Contoh: `987654321`
4. **Klik "Add secret"**

---

## ✅ Verifikasi Setup

### Test Manual

1. **Trigger deployment** dengan push ke `main` branch
2. **Check Telegram** - Anda harus mendapat notifikasi:
   - "🚀 CI/CD Deployment Started"
   - "✅ Docker Images Built Successfully"
   - "✅ Deployment Successful!"

### Test Bot Langsung

Anda bisa test bot dengan mengirim pesan langsung:
1. **Buka chat** dengan bot Anda (tamankehati_cicd_bot)
2. **Kirim pesan:** "Hello"
3. Bot seharusnya tidak reply (ini normal, bot hanya untuk notifikasi)

---

## 🔍 Troubleshooting

### Tidak Menerima Notifikasi

**Check 1: Secrets sudah ditambahkan?**
- Go to Settings → Secrets and variables → Actions
- Pastikan `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` ada

**Check 2: Token benar?**
- Pastikan token dari BotFather sudah benar
- Tidak ada spasi atau karakter tambahan
- Format: `angka:teks`

**Check 3: Chat ID benar?**
- Pastikan angka yang di-copy adalah chat ID Anda
- Harus berupa angka (bukan string)
- Tidak ada spasi

**Check 4: Bot sudah di-start?**
- Pastikan Anda sudah mengirim pesan ke bot minimal sekali
- Bot harus bisa "melihat" chat Anda

**Check 5: GitHub Actions logs**
- Go to Actions → Latest workflow run
- Check step "Notify deployment start" atau step notifikasi lainnya
- Lihat error message jika ada

### Bot Token Invalid

**Error:** "Unauthorized" atau "Invalid token"
**Solution:**
- Verifikasi token dari BotFather
- Pastikan tidak ada spasi di awal/akhir
- Regenerate token jika perlu: `/token` di BotFather

### Chat ID Tidak Ditemukan

**Error:** "Chat not found"
**Solution:**
- Pastikan Anda sudah mengirim pesan ke bot
- Verifikasi chat ID menggunakan Method 1 (userinfobot)
- Pastikan angka yang di-copy benar

---

## 🎯 Notifikasi yang Akan Diterima

### 1. Deployment Start
```
🚀 CI/CD Deployment Started

📦 Image Tag: abc123...
🔗 Commit: abc123def456
👤 Triggered by: yourusername

Building Docker images...
```

### 2. Build Success
```
✅ Docker Images Built Successfully

🐳 Backend: docker.io/arnezzi/tamankehati-backend:abc123...
🌐 Frontend: docker.io/arnezzi/tamankehati-frontend:abc123...

Deploying to server...
```

### 3. Build Failure
```
❌ Docker Build Failed

📦 Image Tag: abc123...
🔗 Commit: abc123def456

Check GitHub Actions for details: https://github.com/...
```

### 4. Deployment Success
```
✅ Deployment Successful!

📦 Image Tag: abc123...
🌐 Application URL: http://38.47.93.167:8080
🏥 Health Check: http://38.47.93.167:8080/api/health

✅ All services are running and healthy.
```

### 5. Deployment Failure
```
❌ Deployment Failed

📦 Image Tag: abc123...
🔗 Commit: abc123def456

⚠️ Deployment failed. Rollback will be attempted automatically.

Check GitHub Actions for details: https://github.com/...
```

### 6. Rollback Completed
```
🔄 Rollback Completed

⚠️ Previous deployment failed and has been rolled back.

The system has been restored to the previous working version.

Please check the deployment logs for details.
```

---

## 📝 Notes

- **Notifications are optional** - Jika secrets tidak di-set, deployment tetap berjalan normal
- **Bot token bersifat rahasia** - Jangan share ke publik
- **Chat ID unik per user** - Setiap anggota tim perlu chat ID sendiri (untuk notifikasi grup)
- **Bot tidak perlu reply** - Bot hanya untuk mengirim notifikasi, tidak perlu di-reply

---

## 🔒 Security

- ✅ GitHub Secrets terenkripsi
- ✅ Token hanya digunakan untuk mengirim notifikasi
- ✅ Bot tidak bisa membaca pesan (read-only)
- ✅ Tidak ada data sensitif yang dikirim ke Telegram

---

## 🎉 Selesai!

Setelah setup, setiap kali ada deployment:
1. ✅ Anda akan mendapat notifikasi real-time
2. ✅ Tidak perlu check GitHub Actions manual
3. ✅ Tim akan selalu aware dengan deployment status

**Happy deploying! 🚀**

---

**Last Updated:** November 2025
