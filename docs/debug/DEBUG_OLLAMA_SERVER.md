# 🐛 Debug Ollama di Server

Panduan untuk debug masalah Ollama di production server.

## 🔍 Quick Check

```bash
# 1. Cek container running
docker ps | grep ollama

# 2. Cek logs
docker logs tamankehati-ollama-prod --tail 50

# 3. Test dari backend container
docker exec tamankehati-backend-prod curl -s http://ollama:11434/api/tags

# 4. Test dari host (jika port exposed)
curl http://localhost:11434/api/tags
```

## 🔧 Fix OLLAMA_URL Issue

### Problem
Backend mungkin menggunakan OLLAMA_URL yang salah:
- Docker network: Harus `http://ollama:11434` (service name)
- Atau: `http://tamankehati-ollama-prod:11434` (container name)

### Solution

**Option 1: Update docker-compose.yml (Recommended)**

```yaml
backend:
  environment:
    OLLAMA_URL: http://ollama:11434  # Use service name
    OLLAMA_MODEL: qwen2:1.5b
```

**Option 2: Update .env file**

```bash
# Edit .env di server
cd ~/dasmap_prod/apps/tamankehati
nano .env

# Set OLLAMA_URL
OLLAMA_URL=http://ollama:11434
# Or if using container name:
# OLLAMA_URL=http://tamankehati-ollama-prod:11434
```

**Option 3: Test Connection**

```bash
# Test dari backend container
docker exec tamankehati-backend-prod python3 -c "
import os
import httpx
import asyncio

async def test():
    url = os.getenv('OLLAMA_URL', 'http://localhost:11434')
    print(f'Testing: {url}')
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            r = await client.get(f'{url}/api/tags')
            print(f'Status: {r.status_code}')
            print(f'OK: {r.json()}')
        except Exception as e:
            print(f'Error: {e}')

asyncio.run(test())
"
```

## 🚀 Optimize Test Connection

Test connection sekarang sudah dioptimasi:
- ✅ **Hanya ping** - tidak ada generate test (lebih cepat)
- ✅ **Timeout 10 detik** - cukup untuk ping
- ✅ **Cek model availability** - verifikasi model ada

### Verify di Server

```bash
# Test endpoint
curl http://localhost:8000/api/v1/ai/test-ollama

# Atau dengan timing
curl -w "\nTime: %{time_total}s\n" http://localhost:8000/api/v1/ai/test-ollama
```

## 📊 Monitor Performance

```bash
# Monitor Ollama logs
docker logs -f tamankehati-ollama-prod

# Monitor backend logs
docker logs -f tamankehati-backend-prod | grep -i ollama

# Monitor resource usage
docker stats tamankehati-ollama-prod
```

## 🔧 Common Server Issues

### Issue 1: Container Name vs Service Name

**Problem:** Backend tidak bisa connect ke Ollama

**Check:**
```bash
# Cek service name di docker-compose
cat docker-compose.pull.no-nginx.yml | grep -A 5 "ollama:"

# Cek network
docker network inspect tamankehati_tamankehati-network

# Test connection
docker exec tamankehati-backend-prod ping -c 2 ollama
docker exec tamankehati-backend-prod ping -c 2 tamankehati-ollama-prod
```

**Fix:** Update OLLAMA_URL sesuai dengan yang bisa di-ping

### Issue 2: Model Not Found

**Problem:** Model tidak ada di Ollama

**Check:**
```bash
# List models
docker exec tamankehati-ollama-prod ollama list

# Pull model
docker exec tamankehati-ollama-prod ollama pull qwen2:1.5b
```

### Issue 3: Slow Response / Timeout

**Problem:** Ollama lambat atau timeout

**Check:**
```bash
# Cek resource
docker stats tamankehati-ollama-prod

# Cek model size
docker exec tamankehati-ollama-prod ollama list

# Consider using smaller model
docker exec tamankehati-ollama-prod ollama pull qwen2:1.5b
```

### Issue 4: Network Issue

**Problem:** Backend tidak bisa reach Ollama

**Check:**
```bash
# Test from backend
docker exec tamankehati-backend-prod curl -v http://ollama:11434/api/tags

# Check network
docker network ls
docker network inspect tamankehati_tamankehati-network
```

**Fix:**
- Pastikan backend dan Ollama di network yang sama
- Pastikan service name benar (`ollama` bukan `tamankehati-ollama-prod`)

## 🎯 Quick Fix Script

Buat file `fix-ollama.sh` di server:

```bash
#!/bin/bash
echo "🔧 Fixing Ollama Connection..."

# 1. Check containers
echo "1. Checking containers..."
docker ps | grep -E "(ollama|backend)"

# 2. Test connection
echo "2. Testing connection..."
docker exec tamankehati-backend-prod curl -s http://ollama:11434/api/tags || echo "❌ Connection failed"

# 3. Check environment
echo "3. Checking environment..."
docker exec tamankehati-backend-prod env | grep OLLAMA

# 4. Test endpoint
echo "4. Testing API endpoint..."
curl -s http://localhost:8000/api/v1/ai/test-ollama | jq .

echo "✅ Done!"
```

Jalankan:
```bash
chmod +x fix-ollama.sh
./fix-ollama.sh
```

## 📝 Notes

1. **Service name vs Container name:**
   - Service name: `ollama` (di docker-compose.yml)
   - Container name: `tamankehati-ollama-prod`
   - Di Docker network, gunakan **service name** (`http://ollama:11434`)

2. **Test connection sekarang:**
   - Hanya ping (no generate test)
   - Max 10 detik timeout
   - Return available models

3. **Jika masih timeout:**
   - Cek Ollama resource usage
   - Cek network connectivity
   - Cek firewall/security groups

