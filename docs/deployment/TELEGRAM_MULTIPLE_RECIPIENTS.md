# 👥 Setup Telegram Notifications untuk Multiple Recipients

Panduan untuk mengirim notifikasi ke beberapa orang/teman.

---

## 🎯 Opsi 1: Pakai Telegram Group (Paling Mudah & Recommended)

### Keuntungan:
- ✅ Setup sekali, semua anggota grup dapat notifikasi
- ✅ Mudah menambah/hapus anggota
- ✅ Tidak perlu modifikasi workflow
- ✅ Semua anggota bisa lihat notifikasi di satu tempat

### Step-by-Step:

#### 1. Buat Telegram Group

1. Buka Telegram
2. Klik menu (☰) → **New Group**
3. Tambahkan teman-teman yang ingin menerima notifikasi
4. Beri nama grup (contoh: "Taman Kehati CI/CD Notifications")
5. Klik **Create**

#### 2. Tambahkan Bot ke Group

1. Di grup, klik nama grup di bagian atas
2. Klik **Add Members**
3. Search bot Anda: `tamankehati_cicd_bot`
4. Pilih bot dan klik **Add**

**Penting:** Bot harus di-add ke grup dulu sebelum mengambil Chat ID grup!

#### 3. Dapatkan Chat ID Grup

**Method 1: Pakai Helper Bot**
1. Di grup, tambahkan **[@userinfobot](https://t.me/userinfobot)**
2. Bot akan reply dengan informasi grup, termasuk Chat ID
3. Chat ID grup biasanya negatif (contoh: `-1001234567890`)

**Method 2: Pakai API**
1. Kirim pesan apapun di grup (bisa dari bot atau anggota lain)
2. Buka browser: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Cari `"chat":{"id":-1001234567890}` - ini Chat ID grup
4. Copy angka tersebut (biasanya negatif)

#### 4. Update GitHub Secret

1. Go to GitHub → Settings → Secrets and variables → Actions
2. Edit secret `TELEGRAM_CHAT_ID`
3. Ganti value dengan Chat ID grup (contoh: `-1001234567890`)
4. Save

**Selesai!** Sekarang semua anggota grup akan mendapat notifikasi.

---

## 🔧 Opsi 2: Multiple Individual Chat IDs (Modifikasi Workflow)

Jika tidak mau pakai grup, bisa modifikasi workflow untuk kirim ke beberapa chat ID sekaligus.

### Step 1: Tambahkan Multiple Chat IDs ke Secrets

Tambahkan secrets untuk setiap orang:
- `TELEGRAM_CHAT_ID_1` - Chat ID orang pertama
- `TELEGRAM_CHAT_ID_2` - Chat ID orang kedua
- `TELEGRAM_CHAT_ID_3` - Chat ID orang ketiga
- dst...

### Step 2: Modifikasi Workflow

Workflow perlu dimodifikasi untuk loop melalui semua chat IDs. Saya bisa bantu modifikasi jika Anda mau.

**Contoh struktur:**
```yaml
- name: Notify to multiple recipients
  run: |
    CHAT_IDS=(
      "${{ secrets.TELEGRAM_CHAT_ID }}"
      "${{ secrets.TELEGRAM_CHAT_ID_1 }}"
      "${{ secrets.TELEGRAM_CHAT_ID_2 }}"
    )
    
    for chat_id in "${CHAT_IDS[@]}"; do
      if [ -n "$chat_id" ]; then
        # Send notification
      fi
    done
```

---

## 📊 Perbandingan

| Aspek | Opsi 1: Group | Opsi 2: Multiple IDs |
|-------|---------------|---------------------|
| **Setup** | ⭐ Mudah | ⚠️ Perlu modifikasi workflow |
| **Maintenance** | ⭐ Mudah (add/remove anggota) | ⚠️ Perlu update secrets |
| **Scalability** | ⭐ Unlimited anggota | ⚠️ Terbatas jumlah secrets |
| **Visibility** | ✅ Semua lihat di satu tempat | ❌ Masing-masing lihat sendiri |
| **Recommended** | ✅ **YES** | ❌ Tidak (kecuali ada kebutuhan khusus) |

---

## 🎯 Rekomendasi

**Pakai Opsi 1 (Telegram Group)** karena:
1. Lebih mudah setup
2. Lebih mudah maintain
3. Semua anggota bisa diskusi tentang deployment di grup
4. Tidak perlu modifikasi workflow

---

## 📝 Quick Setup (Group)

1. ✅ Buat grup Telegram
2. ✅ Tambahkan teman-teman
3. ✅ Tambahkan bot `tamankehati_cicd_bot` ke grup
4. ✅ Dapatkan Chat ID grup (biasanya negatif)
5. ✅ Update `TELEGRAM_CHAT_ID` di GitHub Secrets dengan Chat ID grup

**Done!** 🎉

---

## 🔍 Verifikasi

1. Trigger deployment (push ke main)
2. Check grup Telegram
3. Semua anggota harus melihat notifikasi

---

**Last Updated:** November 2025
