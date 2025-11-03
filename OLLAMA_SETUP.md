# 🤖 Ollama AI Setup Guide

## ✅ Yang Sudah Ditambahkan

Ollama sudah ditambahkan ke:
- ✅ `docker-compose.yml` (Development)
- ✅ `docker-compose.prod.yml` (Production)

## 🚀 Cara Setup Ollama di Server

### 1. Via Docker Compose (Recommended)

**Development:**
```bash
# Start semua services termasuk Ollama
docker-compose up -d

# Check Ollama status
docker-compose ps ollama
docker-compose logs ollama
```

**Production:**
```bash
# Start production dengan Ollama
docker-compose -f docker-compose.prod.yml up -d

# Check Ollama status
docker-compose -f docker-compose.prod.yml ps ollama
docker-compose -f docker-compose.prod.yml logs ollama
```

### 2. Download Model AI

Setelah Ollama container running, download model yang akan digunakan:

```bash
# Development - dari host
docker-compose exec ollama ollama pull qwen2:1.5b

# Production - dari host
docker-compose -f docker-compose.prod.yml exec ollama ollama pull qwen2:1.5b

# Atau masuk ke container
docker exec -it kehati-ollama ollama pull qwen2:1.5b
```

### 3. Model yang Tersedia

**Model kecil (Recommended untuk server dengan RAM terbatas):**
- `qwen2:1.5b` - 1.5B parameters, ~1GB RAM (default)
- `qwen2:0.5b` - 0.5B parameters, ~500MB RAM
- `phi3:mini` - 3.8B parameters, ~2GB RAM
- `llama3.2:1b` - 1B parameters, ~700MB RAM

**Model sedang:**
- `qwen2:7b` - 7B parameters, ~5GB RAM
- `llama3.2:3b` - 3B parameters, ~2GB RAM

**Model besar (Hanya untuk server dengan RAM besar):**
- `qwen2:14b` - 14B parameters, ~10GB RAM
- `llama3.1:8b` - 8B parameters, ~6GB RAM

### 4. Ganti Model

Edit environment variable di `.env` atau docker-compose:

```bash
# Development
OLLAMA_MODEL=qwen2:7b

# Production
export OLLAMA_MODEL=qwen2:7b
docker-compose -f docker-compose.prod.yml up -d
```

Atau langsung di docker-compose.yml:
```yaml
environment:
  OLLAMA_MODEL: ${OLLAMA_MODEL:-qwen2:1.5b}  # Ganti default model
```

### 5. Test Ollama

```bash
# Test dari host
curl http://localhost:11434/api/tags

# Test generate response
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2:1.5b",
  "prompt": "Halo, apa kabar?",
  "stream": false
}'

# Test dari backend container
docker-compose exec backend curl http://ollama:11434/api/tags
```

## 📊 Resource Requirements

### Minimum (Model Kecil seperti qwen2:1.5b)
- **RAM:** 2GB+ (1GB untuk model + 1GB untuk system)
- **Disk:** 5GB+ (untuk model dan data)
- **CPU:** 2 cores (lebih baik 4 cores)

### Recommended (Model Sedang seperti qwen2:7b)
- **RAM:** 8GB+ (5GB untuk model + 3GB untuk system)
- **Disk:** 15GB+
- **CPU:** 4+ cores

### GPU (Optional)
Jika server punya GPU (NVIDIA), Ollama bisa auto-detect dan menggunakan GPU:
- **NVIDIA GPU:** CUDA compatible
- **VRAM:** Minimal 4GB untuk model kecil, 8GB+ untuk model sedang

## 🔧 Konfigurasi Advanced

### Limit Resource Usage

Edit `docker-compose.prod.yml`:

```yaml
ollama:
  # ... existing config ...
  deploy:
    resources:
      limits:
        memory: 4G      # Limit max RAM
        cpus: '2.0'     # Limit CPU cores
      reservations:
        memory: 2G     # Reserve minimum RAM
        cpus: '1.0'    # Reserve minimum CPU
```

### Environment Variables

```yaml
environment:
  - OLLAMA_HOST=0.0.0.0           # Listen on all interfaces
  - OLLAMA_NUM_PARALLEL=1          # Limit concurrent requests
  - OLLAMA_MAX_LOADED_MODELS=1     # Limit loaded models
  - OLLAMA_KEEP_ALIVE=5m           # Keep model in memory for 5 minutes
```

## 🛠️ Maintenance

### List Downloaded Models
```bash
docker-compose exec ollama ollama list
```

### Remove Model
```bash
docker-compose exec ollama ollama rm qwen2:1.5b
```

### View Model Info
```bash
docker-compose exec ollama ollama show qwen2:1.5b
```

### Backup Model Data
```bash
# Backup volume
docker run --rm -v kehati_ollama_data:/data -v $(pwd):/backup alpine tar czf /backup/ollama_backup.tar.gz /data
```

### Restore Model Data
```bash
# Restore volume
docker run --rm -v kehati_ollama_data:/data -v $(pwd):/backup alpine tar xzf /backup/ollama_backup.tar.gz -C /
```

## ⚠️ Troubleshooting

### Ollama tidak start?
```bash
# Check logs
docker-compose logs ollama

# Check resource usage
docker stats kehati-ollama

# Restart
docker-compose restart ollama
```

### Model tidak ditemukan?
```bash
# List models
docker-compose exec ollama ollama list

# Download model
docker-compose exec ollama ollama pull qwen2:1.5b
```

### Out of Memory?
```bash
# Gunakan model yang lebih kecil
OLLAMA_MODEL=qwen2:0.5b

# Atau limit memory di docker-compose
deploy:
  resources:
    limits:
      memory: 2G
```

### Backend tidak bisa connect ke Ollama?
```bash
# Test connection dari backend
docker-compose exec backend curl http://ollama:11434/api/tags

# Check network
docker network inspect kehati_kehati-network

# Check OLLAMA_URL environment variable
docker-compose exec backend env | grep OLLAMA
```

## 📝 Notes

1. **Model pertama kali download:** Model akan otomatis download saat pertama kali digunakan, tapi lebih baik download manual dulu
2. **GPU Support:** Ollama akan otomatis detect GPU jika ada, tidak perlu config khusus
3. **Security:** Di production, Ollama tidak exposed ke luar (hanya accessible via Docker network)
4. **Performance:** Model kecil lebih cepat tapi kurang akurat, model besar lebih akurat tapi lebih lambat

## 🎯 Quick Start

```bash
# 1. Start services
docker-compose up -d

# 2. Wait for Ollama to be ready (30-60 seconds)
docker-compose logs -f ollama

# 3. Download model
docker-compose exec ollama ollama pull qwen2:1.5b

# 4. Test
docker-compose exec backend curl http://ollama:11434/api/tags

# 5. Ready to use! Backend akan otomatis connect ke Ollama
```

