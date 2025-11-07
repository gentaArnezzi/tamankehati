# ⚡ Ollama Performance: Local vs Server

Panduan untuk memahami perbedaan performa Ollama di local (laptop) vs server dan cara optimasi.

---

## 🔍 Perbedaan Local vs Server

### Local (Laptop) - Cepat ✅

**Alasan cepat:**
1. **Resource langsung**: CPU/RAM langsung dari host, tidak ada overhead Docker
2. **Model sudah loaded**: Model biasanya sudah di-memory dari penggunaan sebelumnya
3. **Network lokal**: `localhost:11434` - zero latency
4. **CPU lebih powerful**: Laptop modern biasanya punya CPU yang lebih cepat
5. **Tidak ada resource limit**: Tidak dibatasi oleh Docker container

### Server (Docker) - Lambat ⚠️

**Alasan lambat:**
1. **Resource dibatasi**: Docker container dibatasi CPU/RAM (cpus: 4.0, mem_limit: 6g)
2. **Model perlu load**: Setiap restart, model perlu di-load ke memory
3. **Network overhead**: Docker network menambah sedikit latency
4. **CPU server mungkin lebih lambat**: Server mungkin punya CPU yang lebih tua/lambat
5. **Resource sharing**: Server menjalankan banyak service (postgres, redis, backend, frontend, ollama)

---

## 🚀 Optimasi yang Sudah Diterapkan

### 1. Environment Variables untuk Performance

**Di `docker-compose.pull.no-nginx.yml`:**
```yaml
environment:
  OLLAMA_MODEL: qwen2:1.5b
  OLLAMA_NUM_PARALLEL: 1  # Limit concurrent requests (1 = faster per request)
  OLLAMA_MAX_LOADED_MODELS: 1  # Keep only 1 model loaded (faster)
  OLLAMA_KEEP_ALIVE: 10m  # Keep model in memory for 10 minutes (faster subsequent requests)
  OLLAMA_NUM_THREAD: 4  # Use 4 CPU threads (match cpus: 4.0)
```

### 2. Optimasi Request Parameters

**Di `apps/backend/ai/providers/ollama_provider.py`:**
```python
"options": {
    "num_predict": 500,  # Limit output to ~500 tokens (faster)
    "temperature": 0.7,  # Balanced creativity
    "top_p": 0.9,  # Nucleus sampling
    "num_thread": 4,  # Use 4 CPU threads for faster inference
    "numa": False,  # Disable NUMA for better performance
}
```

### 3. Resource Allocation

**Di `docker-compose.pull.no-nginx.yml`:**
```yaml
mem_limit: 6g  # 6GB RAM untuk Ollama
cpus: 4.0  # 4 CPU cores untuk Ollama
```

### 4. Model Pre-loading

Model di-pre-load saat container start untuk faster first request:
```yaml
command: >
  ollama serve &
  sleep 15 &&
  ollama pull qwen2:1.5b &&
  ollama run qwen2:1.5b "Preload"
```

---

## 🔧 Optimasi Tambahan untuk Server

### 1. Pastikan Model Pre-loaded

```bash
# Di server, cek apakah model sudah loaded
docker exec tamankehati-ollama-prod ollama list

# Jika belum, pre-load model
docker exec tamankehati-ollama-prod ollama run qwen2:1.5b "Preload"
```

### 2. Cek Resource Server

```bash
# Cek CPU usage
docker stats tamankehati-ollama-prod

# Cek RAM usage
free -h

# Cek CPU info
lscpu | grep "CPU(s)"
```

### 3. Optimasi CPU Threads

Jika server punya lebih dari 4 cores, bisa increase:

```yaml
# Di docker-compose.pull.no-nginx.yml
cpus: 6.0  # Increase jika server punya lebih banyak cores
environment:
  OLLAMA_NUM_THREAD: 6  # Match dengan cpus
```

Dan di `ollama_provider.py`:
```python
"num_thread": 6,  # Match dengan cpus di docker-compose
```

### 4. Gunakan Model Lebih Kecil (Jika Masih Lambat)

```bash
# Di server, ubah .env
OLLAMA_MODEL=qwen2:0.5b  # Model lebih kecil, lebih cepat

# Pull model baru
docker exec tamankehati-ollama-prod ollama pull qwen2:0.5b

# Restart backend
docker compose -f docker-compose.pull.no-nginx.yml restart backend
```

### 5. Kurangi num_predict (Jika Output Terlalu Panjang)

```python
# Di apps/backend/ai/providers/ollama_provider.py
"num_predict": 300,  # Kurangi dari 500 ke 300 (lebih cepat)
```

---

## 📊 Expected Performance

### Local (Laptop)
- **qwen2:1.5b**: 5-15 detik
- **qwen2.5:7b**: 15-30 detik

### Server (Docker) - Setelah Optimasi
- **qwen2:1.5b**: 15-30 detik (target: < 30 detik)
- **qwen2.5:7b**: 30-60 detik

**Catatan**: Server akan selalu lebih lambat dari local karena:
- Docker overhead
- Resource sharing dengan service lain
- Network latency (meskipun kecil)

---

## 🐛 Troubleshooting Jika Masih Lambat

### 1. Cek Model Sudah Loaded

```bash
# Di server
docker exec tamankehati-ollama-prod ollama list
# Harus show: qwen2:1.5b

# Test model langsung
docker exec tamankehati-ollama-prod ollama run qwen2:1.5b "Test"
# Harus cepat (< 10 detik)
```

### 2. Cek Resource Usage

```bash
# Monitor resource real-time
docker stats tamankehati-ollama-prod

# Cek apakah CPU/RAM terbatas
# CPU harus < 100% (jika 100%, berarti overloaded)
# RAM harus < 6GB (jika > 6GB, berarti perlu lebih banyak RAM)
```

### 3. Cek Apakah Ada Request Lain

```bash
# Cek log untuk multiple requests
docker logs tamankehati-ollama-prod --tail 50 | grep -i "request\|generate"

# Jika ada multiple requests bersamaan, bisa overload Ollama
# Solusi: Pastikan OLLAMA_NUM_PARALLEL=1
```

### 4. Test Performance Langsung

```bash
# Test dari backend container
docker exec tamankehati-backend-prod python3 -c "
import asyncio
import httpx
import time

async def test():
    start = time.time()
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post('http://ollama:11434/api/chat', json={
            'model': 'qwen2:1.5b',
            'messages': [{'role': 'user', 'content': 'Hello'}],
            'stream': False,
            'options': {'num_predict': 100, 'num_thread': 4}
        })
        print(f'Status: {r.status_code}')
        print(f'Time: {time.time() - start:.2f}s')
        print(f'Response: {r.json()[\"message\"][\"content\"][:100]}')

asyncio.run(test())
"
```

---

## 💡 Tips untuk Performa Terbaik

1. **Gunakan model kecil**: `qwen2:1.5b` sudah cukup untuk flora/fauna
2. **Pre-load model**: Pastikan model di-load saat container start
3. **Limit output**: `num_predict: 500` sudah cukup
4. **Use CPU threads**: `num_thread: 4` untuk match CPU allocation
5. **Keep model in memory**: `OLLAMA_KEEP_ALIVE: 10m` untuk faster subsequent requests
6. **Monitor resource**: Pastikan server tidak overloaded

---

## 🎯 Target Performance

**Setelah optimasi, target performance di server:**
- **qwen2:1.5b**: < 30 detik per request
- **First request**: 30-45 detik (model perlu load)
- **Subsequent requests**: 15-25 detik (model sudah loaded)

**Jika masih > 60 detik:**
- Cek resource server (CPU/RAM)
- Pastikan model sudah pre-loaded
- Pertimbangkan model lebih kecil (`qwen2:0.5b`)




