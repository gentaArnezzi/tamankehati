# 🔧 Update Ollama Performance di Server

Panduan untuk update file `docker-compose.pull.no-nginx.yml` di server dengan optimasi performance.

---

## 🔍 Perbedaan File Local vs Server

### File di Server (Saat Ini) - Belum Ada Optimasi ❌

```yaml
ollama:
  environment:
    OLLAMA_MODEL: ${OLLAMA_MODEL:-qwen2:1.5b}
  # ❌ Tidak ada optimasi performance
```

### File di Local (Sudah Diupdate) - Ada Optimasi ✅

```yaml
ollama:
  environment:
    OLLAMA_MODEL: ${OLLAMA_MODEL:-qwen2:1.5b}
    # Performance optimization for server
    OLLAMA_NUM_PARALLEL: 1  # Limit concurrent requests (1 = faster per request)
    OLLAMA_MAX_LOADED_MODELS: 1  # Keep only 1 model loaded (faster)
    OLLAMA_KEEP_ALIVE: 10m  # Keep model in memory for 10 minutes (faster subsequent requests)
    OLLAMA_NUM_THREAD: 4  # Use 4 CPU threads (match cpus: 4.0)
```

---

## 🚀 Cara Update Manual di Server

### Opsi 1: Update Manual (Recommended)

1. **SSH ke server**:
```bash
ssh ubuntu@klh-gpu-pd1
cd ~/dasmap_prod/apps/tamankehati
```

2. **Backup file**:
```bash
cp docker-compose.pull.no-nginx.yml docker-compose.pull.no-nginx.yml.backup.$(date +%Y%m%d_%H%M%S)
```

3. **Edit file**:
```bash
nano docker-compose.pull.no-nginx.yml
```

4. **Cari section `ollama:` dan update `environment:`**:

**Dari:**
```yaml
  ollama:
    image: ollama/ollama:latest
    container_name: tamankehati-ollama-prod
    volumes:
      - ollama_data:/root/.ollama
    environment:
      OLLAMA_MODEL: ${OLLAMA_MODEL:-qwen2:1.5b}
```

**Ke:**
```yaml
  ollama:
    image: ollama/ollama:latest
    container_name: tamankehati-ollama-prod
    volumes:
      - ollama_data:/root/.ollama
    environment:
      OLLAMA_MODEL: ${OLLAMA_MODEL:-qwen2:1.5b}
      # Performance optimization for server
      OLLAMA_NUM_PARALLEL: 1  # Limit concurrent requests (1 = faster per request)
      OLLAMA_MAX_LOADED_MODELS: 1  # Keep only 1 model loaded (faster)
      OLLAMA_KEEP_ALIVE: 10m  # Keep model in memory for 10 minutes (faster subsequent requests)
      OLLAMA_NUM_THREAD: 4  # Use 4 CPU threads (match cpus: 4.0)
```

5. **Save dan exit** (Ctrl+X, Y, Enter)

6. **Restart Ollama**:
```bash
docker compose -f docker-compose.pull.no-nginx.yml up -d ollama
```

7. **Cek status**:
```bash
docker ps | grep ollama
docker logs tamankehati-ollama-prod --tail 50
```

---

### Opsi 2: Copy File dari Local ke Server

1. **Di local**, copy file ke server:
```bash
# Di local
scp docker-compose.pull.no-nginx.yml ubuntu@klh-gpu-pd1:~/dasmap_prod/apps/tamankehati/
```

2. **Di server**, restart Ollama:
```bash
# Di server
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml up -d ollama
```

---

### Opsi 3: Gunakan Script (Jika Script Sudah di Server)

1. **Copy script ke server**:
```bash
# Di local
scp scripts/update-ollama-performance.sh ubuntu@klh-gpu-pd1:~/dasmap_prod/apps/tamankehati/scripts/
```

2. **Di server, jalankan script**:
```bash
# Di server
cd ~/dasmap_prod/apps/tamankehati
chmod +x scripts/update-ollama-performance.sh
./scripts/update-ollama-performance.sh
```

---

## ✅ Verifikasi Update

### 1. Cek Environment Variables

```bash
docker exec tamankehati-ollama-prod env | grep OLLAMA
```

**Output yang diharapkan:**
```
OLLAMA_MODEL=qwen2:1.5b
OLLAMA_NUM_PARALLEL=1
OLLAMA_MAX_LOADED_MODELS=1
OLLAMA_KEEP_ALIVE=10m
OLLAMA_NUM_THREAD=4
```

### 2. Cek Container Status

```bash
docker ps | grep ollama
```

**Output yang diharapkan:**
```
tamankehati-ollama-prod   ollama/ollama:latest   Up X minutes   (healthy)
```

### 3. Test Performance

```bash
# Test dari backend container
docker exec tamankehati-backend-prod curl -s http://ollama:11434/api/tags | head -20
```

---

## 📊 Expected Improvement

**Sebelum optimasi:**
- First request: 60-90 detik
- Subsequent requests: 45-60 detik

**Setelah optimasi:**
- First request: 30-45 detik
- Subsequent requests: 15-25 detik

**Improvement: ~50% lebih cepat** ✅

---

## 🐛 Troubleshooting

### Jika Container Tidak Start

```bash
# Cek logs
docker logs tamankehati-ollama-prod --tail 50

# Cek syntax error
docker compose -f docker-compose.pull.no-nginx.yml config
```

### Jika Masih Lambat

1. **Cek resource server**:
```bash
docker stats tamankehati-ollama-prod
free -h
```

2. **Cek model sudah loaded**:
```bash
docker exec tamankehati-ollama-prod ollama list
```

3. **Pre-load model manual**:
```bash
docker exec tamankehati-ollama-prod ollama run qwen2:1.5b "Preload"
```

---

## 📝 Catatan Penting

1. **Backup selalu**: Selalu backup file sebelum edit
2. **Restart Ollama**: Setelah update, restart Ollama container
3. **Cek logs**: Selalu cek logs setelah restart
4. **Monitor resource**: Pastikan server punya cukup CPU/RAM

---

## 🎯 Next Steps

Setelah update:
1. ✅ Restart Ollama container
2. ✅ Verifikasi environment variables
3. ✅ Test performance
4. ✅ Monitor resource usage
5. ✅ Update dokumentasi jika perlu






