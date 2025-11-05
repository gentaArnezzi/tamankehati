# AI Timeout Fix untuk Identifikasi Flora/Fauna

## Masalah

Saat menggunakan fitur AI untuk identifikasi flora atau fauna, proses sering timeout setelah beberapa puluh detik. Ini terjadi terutama ketika menggunakan model AI yang besar seperti `llama3.1:8b`.

## Penyebab

1. **Model AI Terlalu Besar**: Model `llama3.1:8b` memiliki 8 billion parameters, membutuhkan waktu lebih lama untuk generate response dibanding model kecil seperti `qwen2:1.5b` (1.5B parameters).

2. **Timeout Terlalu Pendek**: 
   - Backend timeout: 60 detik (tidak cukup untuk model besar)
   - Frontend timeout: 70 detik (tidak cukup untuk model besar)

3. **Resource Server**: Model besar membutuhkan lebih banyak RAM dan mungkin GPU. Jika server tidak memiliki resource yang cukup, proses akan lebih lambat.

## Solusi yang Diterapkan

### 1. Timeout Dinamis Berdasarkan Model

Backend sekarang secara otomatis menyesuaikan timeout berdasarkan ukuran model:

- **Model besar** (8b, 7b, 13b, 14b): Timeout 180 detik (3 menit)
- **Model kecil** (1.5b, 3b, dll): Timeout 60 detik (1 menit)

### 2. Frontend Timeout Diperpanjang

Frontend timeout diperpanjang menjadi 190 detik untuk mengakomodasi model besar.

## Rekomendasi

### Opsi 1: Gunakan Model yang Lebih Kecil (DISARANKAN)

Model `qwen2:1.5b` lebih cepat dan cukup untuk identifikasi flora/fauna:

```bash
# Di server, ubah .env
OLLAMA_MODEL=qwen2:1.5b

# Pastikan model sudah di-pull
docker compose -f docker-compose.pull.no-nginx.yml exec ollama ollama pull qwen2:1.5b

# Restart backend
docker compose -f docker-compose.pull.no-nginx.yml restart backend
```

**Keuntungan:**
- ✅ Lebih cepat (biasanya < 30 detik)
- ✅ Menggunakan lebih sedikit RAM (~2GB vs ~6GB)
- ✅ Tidak timeout

### Opsi 2: Tetap Gunakan Model Besar dengan Timeout yang Diperpanjang

Jika ingin tetap menggunakan `llama3.1:8b` untuk kualitas yang lebih baik:

1. **Pastikan server memiliki resource yang cukup:**
   ```bash
   # Cek RAM
   free -h
   # Minimal 8GB RAM tersedia untuk llama3.1:8b
   
   # Cek apakah Ollama menggunakan GPU
   docker compose -f docker-compose.pull.no-nginx.yml exec ollama ollama list
   ```

2. **Timeout sudah diperpanjang otomatis** - tidak perlu konfigurasi tambahan.

3. **Monitor performance:**
   ```bash
   # Cek log Ollama
   docker compose -f docker-compose.pull.no-nginx.yml logs ollama
   
   # Cek resource usage
   docker stats
   ```

### Opsi 3: Gunakan Model Sedang

Model `qwen2.5:7b` atau `llama3.2:3b` merupakan kompromi antara kecepatan dan kualitas:

```bash
# Untuk qwen2.5:7b
OLLAMA_MODEL=qwen2.5:7b
docker compose -f docker-compose.pull.no-nginx.yml exec ollama ollama pull qwen2.5:7b

# Untuk llama3.2:3b
OLLAMA_MODEL=llama3.2:3b
docker compose -f docker-compose.pull.no-nginx.yml exec ollama ollama pull llama3.2:3b
```

## Troubleshooting

### Masih Timeout Setelah Perbaikan?

1. **Cek apakah model sudah di-pull:**
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml exec ollama ollama list
   ```

2. **Test koneksi Ollama:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. **Cek resource server:**
   ```bash
   # RAM usage
   free -h
   
   # CPU usage
   top
   
   # Disk space
   df -h
   ```

4. **Cek log Ollama untuk error:**
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml logs ollama | tail -50
   ```

5. **Cek log backend:**
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml logs backend | grep -i "ollama\|timeout\|ai" | tail -50
   ```

### Model Terlalu Lambat?

1. **Pastikan Ollama menggunakan GPU** (jika tersedia):
   ```bash
   # Cek apakah GPU tersedia
   nvidia-smi
   
   # Pastikan Ollama container menggunakan GPU
   # Di docker-compose.yml, tambahkan:
   # deploy:
   #   resources:
   #     reservations:
   #       devices:
   #         - driver: nvidia
   ```

2. **Kurangi parameter generation** di Ollama (advanced):
   - Edit prompt untuk lebih spesifik
   - Gunakan model yang lebih kecil

## Perbandingan Model

| Model | Size | RAM Needed | Speed | Quality | Recommended |
|-------|------|------------|-------|---------|-------------|
| `qwen2:1.5b` | 1.5B | ~2GB | ⚡⚡⚡ Very Fast | ⭐⭐ Good | ✅ **Yes** |
| `llama3.2:3b` | 3B | ~3GB | ⚡⚡ Fast | ⭐⭐⭐ Better | ✅ Yes |
| `qwen2.5:7b` | 7B | ~5GB | ⚡ Moderate | ⭐⭐⭐⭐ Very Good | ⚠️ If resources allow |
| `llama3.1:8b` | 8B | ~6GB | 🐌 Slow | ⭐⭐⭐⭐⭐ Excellent | ⚠️ Only if needed |

## Kesimpulan

**Untuk production, disarankan menggunakan `qwen2:1.5b`** karena:
- Cukup cepat untuk user experience yang baik
- Kualitas output cukup untuk identifikasi flora/fauna
- Tidak membebani server
- Tidak timeout

**Gunakan model besar hanya jika:**
- Server memiliki RAM dan GPU yang cukup
- Kualitas output sangat penting
- User dapat menerima waktu tunggu yang lebih lama (2-3 menit)

