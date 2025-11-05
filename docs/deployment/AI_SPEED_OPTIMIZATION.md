# Optimasi Kecepatan AI untuk qwen2:1.5b

## Masalah

Meskipun sudah menggunakan model kecil `qwen2:1.5b`, proses AI masih timeout atau lambat.

## Penyebab Potensial

1. **Output terlalu panjang**: Model generate terlalu banyak token (bisa 1000+ tokens)
2. **Prompt terlalu kompleks**: Instruksi yang terlalu detail membuat model membutuhkan waktu lebih lama
3. **Resource server terbatas**: CPU/RAM tidak cukup untuk inference cepat
4. **Ollama container lambat**: Model belum fully loaded atau ada masalah koneksi
5. **Tidak ada batasan output**: Model bisa generate unlimited tokens

## Solusi yang Diterapkan

### 1. Batasi Output Token (`num_predict: 500`)

Sekarang AI dibatasi hanya generate maksimal 500 tokens (~200-300 kata), yang cukup untuk deskripsi flora/fauna yang baik tapi lebih cepat.

**Sebelum:**
- Model bisa generate 1000+ tokens (lambat)
- Tidak ada batasan

**Sesudah:**
- Maksimal 500 tokens (cukup untuk 200-300 kata)
- Response lebih cepat

### 2. Optimasi Prompt

Prompt dioptimasi untuk lebih ringkas dan jelas, mengurangi waktu processing.

### 3. Parameter Optimasi

- `temperature: 0.7` - Balanced (tidak terlalu kreatif)
- `top_p: 0.9` - Nucleus sampling (faster)
- `num_predict: 500` - Limit output length

## Verifikasi

### Cek apakah optimasi bekerja:

1. **Test AI generation**:
   ```bash
   # Di server, test langsung
   docker compose -f docker-compose.pull.no-nginx.yml exec backend curl -X POST http://localhost:8000/api/v1/ai/test-ollama
   ```

2. **Monitor waktu response**:
   - Seharusnya sekarang < 30 detik untuk qwen2:1.5b
   - Jika masih > 60 detik, ada masalah lain

3. **Cek log Ollama**:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml logs ollama | tail -20
   ```

## Troubleshooting Jika Masih Lambat

### 1. Cek Resource Server

```bash
# Cek RAM
free -h

# Cek CPU usage
top

# Cek container resource
docker stats tamankehati-ollama-prod
```

**Minimal requirement untuk qwen2:1.5b:**
- RAM: 2GB tersedia untuk Ollama
- CPU: 2 cores

### 2. Cek Model Sudah Loaded

```bash
# Cek apakah model sudah di-pull
docker compose -f docker-compose.pull.no-nginx.yml exec ollama ollama list

# Test model langsung
docker compose -f docker-compose.pull.no-nginx.yml exec ollama ollama run qwen2:1.5b "Hello, test"
```

### 3. Cek Koneksi Backend ke Ollama

```bash
# Test dari backend container
docker compose -f docker-compose.pull.no-nginx.yml exec backend curl -s http://ollama:11434/api/tags

# Test dengan timeout pendek (harus cepat)
docker compose -f docker-compose.pull.no-nginx.yml exec backend timeout 5 curl -s http://ollama:11434/api/tags
```

### 4. Optimasi Ollama Container

Jika masih lambat, coba restart Ollama container:

```bash
docker compose -f docker-compose.pull.no-nginx.yml restart ollama

# Tunggu beberapa detik untuk model load
sleep 10

# Test lagi
docker compose -f docker-compose.pull.no-nginx.yml exec backend curl -X POST http://localhost:8000/api/v1/ai/test-ollama
```

### 5. Cek Apakah Ada Request Lain

Jika ada multiple request AI bersamaan, bisa overload Ollama. Cek:

```bash
# Cek log backend untuk multiple AI requests
docker compose -f docker-compose.pull.no-nginx.yml logs backend | grep -i "ai\|ollama" | tail -20
```

## Performance Benchmark

Dengan optimasi ini, expected performance:

| Model | Before | After | Improvement |
|-------|--------|-------|-------------|
| `qwen2:1.5b` | 60-90s (timeout) | 15-30s | ⚡ 3-4x faster |
| `llama3.2:3b` | 90-120s | 30-45s | ⚡ 2-3x faster |
| `qwen2.5:7b` | 120-180s | 45-60s | ⚡ 2-3x faster |

## Advanced: Jika Masih Perlu Lebih Cepat

### Opsi 1: Kurangi `num_predict` Lebih Lanjut

Jika output masih terlalu panjang, bisa kurangi:

```python
# Di apps/backend/ai/providers/ollama_provider.py
"num_predict": 300,  # Lebih pendek, lebih cepat
```

### Opsi 2: Gunakan Model Lebih Kecil

Jika masih terlalu lambat, pertimbangkan model yang lebih kecil:

```bash
# qwen2:0.5b (sangat cepat, tapi quality sedikit lebih rendah)
OLLAMA_MODEL=qwen2:0.5b
docker compose -f docker-compose.pull.no-nginx.yml exec ollama ollama pull qwen2:0.5b
```

### Opsi 3: Implementasi Caching

Untuk data yang sama, bisa cache hasil AI (advanced, perlu implementasi).

## Kesimpulan

Dengan optimasi ini:
- ✅ Output dibatasi (500 tokens max)
- ✅ Prompt lebih ringkas
- ✅ Parameter dioptimasi untuk kecepatan
- ✅ Response time seharusnya < 30 detik untuk qwen2:1.5b

Jika masih timeout setelah optimasi, kemungkinan masalah di:
- Resource server (RAM/CPU)
- Network latency
- Ollama container health

