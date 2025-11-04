# 🔧 Ollama Troubleshooting Guide

Guide untuk troubleshooting Ollama container yang unhealthy.

---

## 🔍 Diagnose Problem

### Check Ollama Logs

```bash
# View recent logs
docker logs tamankehati-ollama-prod --tail=50

# Follow logs in real-time
docker logs tamankehati-ollama-prod -f
```

### Check Container Status

```bash
# Detailed container info
docker inspect tamankehati-ollama-prod | grep -A 20 Health

# Check if Ollama process is running
docker exec tamankehati-ollama-prod ps aux | grep ollama
```

### Test Ollama API

```bash
# Test from host
curl http://localhost:11434/api/tags

# Test from inside container
docker exec tamankehati-ollama-prod ollama list
```

---

## 🐛 Common Issues

### Issue 1: Health Check Failed (curl not found)

**Symptom:** Container shows "unhealthy" but Ollama is actually running

**Cause:** Health check uses `curl` which may not be available in Ollama container

**Solution:** Update health check to use `ollama` command instead:

```yaml
healthcheck:
  test: ["CMD-SHELL", "ollama list || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

**Apply fix:**
```bash
# Update docker-compose file
# Then restart container
docker compose -f docker-compose.pull.no-nginx.yml up -d ollama
```

### Issue 2: Ollama Not Starting

**Symptom:** Container exits immediately or Ollama service not running

**Check logs:**
```bash
docker logs tamankehati-ollama-prod --tail=100
```

**Common causes:**
- Port conflict (11434 already in use)
- Volume permission issues
- Insufficient memory

**Solution:**
```bash
# Check port
sudo lsof -i :11434

# Check volume permissions
docker volume inspect tamankehati_ollama_data

# Restart with more memory if needed
docker compose -f docker-compose.pull.no-nginx.yml up -d --force-recreate ollama
```

### Issue 3: Model Not Downloaded

**Symptom:** Ollama runs but can't load models

**Check models:**
```bash
docker exec tamankehati-ollama-prod ollama list
```

**Download model:**
```bash
# Download default model
docker exec tamankehati-ollama-prod ollama pull qwen2:1.5b

# Or other models
docker exec tamankehati-ollama-prod ollama pull llama3.2:3b
```

### Issue 4: Out of Memory

**Symptom:** Ollama crashes or can't load models

**Check memory:**
```bash
docker stats tamankehati-ollama-prod
```

**Solution:**
- Use smaller model (qwen2:1.5b instead of larger models)
- Increase Docker memory limit
- Use model with less memory requirements

---

## 🔧 Quick Fixes

### Fix 1: Restart Ollama

```bash
docker compose -f docker-compose.pull.no-nginx.yml restart ollama
```

### Fix 2: Recreate Container

```bash
docker compose -f docker-compose.pull.no-nginx.yml up -d --force-recreate ollama
```

### Fix 3: Remove and Recreate

```bash
# Stop and remove
docker compose -f docker-compose.pull.no-nginx.yml stop ollama
docker compose -f docker-compose.pull.no-nginx.yml rm -f ollama

# Start again
docker compose -f docker-compose.pull.no-nginx.yml up -d ollama
```

### Fix 4: Update Health Check

```bash
# Edit docker-compose file
nano docker-compose.pull.no-nginx.yml

# Change healthcheck to:
healthcheck:
  test: ["CMD-SHELL", "ollama list || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s

# Restart
docker compose -f docker-compose.pull.no-nginx.yml up -d ollama
```

---

## ✅ Verify Ollama is Working

### Test 1: Check Container Status

```bash
docker ps | grep ollama
# Should show: Up (healthy)
```

### Test 2: List Models

```bash
docker exec tamankehati-ollama-prod ollama list
# Should show downloaded models
```

### Test 3: Test API

```bash
# From host
curl http://localhost:11434/api/tags
# Should return JSON with models

# Test chat
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2:1.5b",
  "prompt": "Hello",
  "stream": false
}'
```

### Test 4: Test from Backend

```bash
# Check backend can reach Ollama
docker exec tamankehati-backend-prod curl -s http://ollama:11434/api/tags
```

---

## 🎯 Ollama is Optional

**Important:** Ollama is optional! If it's unhealthy but not critical:

1. **Disable health check** (container will still run):
   ```yaml
   ollama:
     # ... other config
     # Remove or comment out healthcheck section
   ```

2. **Or ignore unhealthy status** - Ollama container will still work, just shows unhealthy

3. **Or remove Ollama** if not needed:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml stop ollama
   docker compose -f docker-compose.pull.no-nginx.yml rm ollama
   ```

---

## 📝 Recommended Configuration

**For production with health check:**

```yaml
ollama:
  image: ollama/ollama:latest
  container_name: tamankehati-ollama-prod
  volumes:
    - ollama_data:/root/.ollama
  networks:
    - tamankehati-network
  restart: unless-stopped
  healthcheck:
    test: ["CMD-SHELL", "ollama list || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 60s  # Give more time for Ollama to start
```

**For production without health check (if Ollama is optional):**

```yaml
ollama:
  image: ollama/ollama:latest
  container_name: tamankehati-ollama-prod
  volumes:
    - ollama_data:/root/.ollama
  networks:
    - tamankehati-network
  restart: unless-stopped
  # No healthcheck - container will show as "running" not "healthy"
```

---

## 🔍 Debug Commands

```bash
# Full diagnostic
echo "=== Ollama Diagnostic ==="
echo ""
echo "Container Status:"
docker ps | grep ollama
echo ""
echo "Logs (last 50 lines):"
docker logs tamankehati-ollama-prod --tail=50
echo ""
echo "Health Check:"
docker inspect tamankehati-ollama-prod | grep -A 15 Health
echo ""
echo "Process Check:"
docker exec tamankehati-ollama-prod ps aux | grep ollama || echo "Ollama process not found"
echo ""
echo "API Test:"
curl -s http://localhost:11434/api/tags || echo "API not accessible"
echo ""
echo "Model List:"
docker exec tamankehati-ollama-prod ollama list 2>&1
```

---

## 💡 Tips

1. **Ollama takes time to start** - Give it 60+ seconds before checking health
2. **First model download is slow** - May take several minutes
3. **Memory requirements** - Small models (1.5b) need ~2GB RAM, larger models need more
4. **Network access** - Ollama needs internet to download models initially
5. **Optional service** - Backend will work without Ollama, just AI features won't work

---

**Last Updated:** 2025-11-05

