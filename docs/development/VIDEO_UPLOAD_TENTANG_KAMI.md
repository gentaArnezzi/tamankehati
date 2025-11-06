# 📹 Upload Video untuk Halaman Tentang Kami

## 📁 Lokasi File Video

Video untuk halaman "Tentang Kami" disimpan di:

```
apps/frontend/public/videos/tentang-kami/
```

## 📝 Nama File yang Didukung

Video akan otomatis terdeteksi jika menggunakan nama file berikut:

- **Format utama**: `taman-kehati.mp4` (recommended)
- **Format alternatif**: `taman-kehati.webm` (untuk browser yang support)

## 🎬 Format Video yang Disarankan

### Format File
- **MP4** (H.264) - Format utama, support semua browser
- **WebM** (VP9) - Format alternatif untuk browser modern

### Spesifikasi Video
- **Resolution**: 1920x1080 (Full HD) atau 1280x720 (HD)
- **Aspect Ratio**: 16:9 (recommended)
- **Bitrate**: 2-5 Mbps untuk kualitas baik
- **Duration**: Sesuai kebutuhan (tidak ada batasan)

### Poster/Thumbnail (Opsional)
- **Nama file**: `poster.jpg` atau `poster.png`
- **Lokasi**: `apps/frontend/public/videos/tentang-kami/poster.jpg`
- **Resolution**: 1920x1080 (sesuai aspect ratio video)

## 📤 Cara Upload Video

### Opsi 1: Manual Copy File

1. Siapkan file video dengan nama `taman-kehati.mp4`
2. Copy file ke folder:
   ```bash
   cp /path/to/your/video.mp4 apps/frontend/public/videos/tentang-kami/taman-kehati.mp4
   ```

### Opsi 2: Via File Manager

1. Buka folder `apps/frontend/public/videos/tentang-kami/`
2. Drag & drop file video ke folder tersebut
3. Rename file menjadi `taman-kehati.mp4`

### Opsi 3: Via Terminal

```bash
# Dari project root
cd apps/frontend/public/videos/tentang-kami/

# Copy video ke folder ini
cp ~/Downloads/video-taman-kehati.mp4 ./taman-kehati.mp4

# Atau jika sudah ada di folder lain
mv /path/to/video.mp4 ./taman-kehati.mp4
```

## ✅ Verifikasi

Setelah upload, video akan otomatis muncul di halaman `/tentang-kami` setelah:

1. **Development**: Restart Next.js dev server
   ```bash
   # Stop server (Ctrl+C)
   # Start lagi
   cd apps/frontend
   npm run dev
   ```

2. **Production**: Rebuild frontend
   ```bash
   cd apps/frontend
   npm run build
   ```

## 🎥 Alternatif: YouTube/Vimeo Embed

Jika video terlalu besar atau ingin menggunakan YouTube/Vimeo, bisa ganti dengan embed:

### YouTube Embed
```tsx
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  className="absolute inset-0 w-full h-full"
  allowFullScreen
/>
```

### Vimeo Embed
```tsx
<iframe
  src="https://player.vimeo.com/video/VIDEO_ID"
  className="absolute inset-0 w-full h-full"
  allowFullScreen
/>
```

## 📊 Ukuran File

- **Rekomendasi**: < 50 MB untuk loading cepat
- **Maksimal**: < 100 MB (untuk performa optimal)
- **Tips**: Gunakan video compression tool jika file terlalu besar

## 🔧 Tools untuk Optimasi Video

### Online Tools
- [HandBrake](https://handbrake.fr/) - Free video converter
- [CloudConvert](https://cloudconvert.com/) - Online converter
- [FFmpeg](https://ffmpeg.org/) - Command line tool

### FFmpeg Command (Contoh)
```bash
# Compress video ke MP4
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k taman-kehati.mp4

# Convert ke WebM
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -c:a libopus taman-kehati.webm
```

---

**Note**: File video di folder `public/` akan di-include dalam build Next.js, jadi pastikan ukuran file tidak terlalu besar untuk menghindari build yang lambat.

