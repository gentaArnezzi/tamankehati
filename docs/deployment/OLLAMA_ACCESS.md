# 🔌 Ollama Access Guide

Guide untuk mengakses Ollama service yang running di Docker container.

---

## 🔍 Current Configuration

Ollama container **tidak expose port 11434 ke host** (untuk security). Port hanya accessible dari dalam Docker network.

**Current config:**
```yaml
ollama:
  image: ollama/ollama:latest
  container_name: tamankehati-ollama-prod
  # No ports section = not exposed to host
  networks:
    - tamankehati-network
```

---

## ✅ Method 1: Access from Inside Container (Recommended)

**Test Ollama command:**
```bash
docker exec tamankehati-ollama-prod ollama list
```

**Test API:**
```bash
docker exec tamankehati-ollama-prod curl -s http://localhost:11434/api/tags
```

**Or use wget if curl not available:**
```bash
docker exec tamankehati-ollama-prod wget -qO- http://localhost:11434/api/tags
```

---

## ✅ Method 2: Access from Backend Container (Correct for App Usage)

**Backend should access Ollama via Docker network:**
```bash
# From backend container
docker exec tamankehati-backend-prod curl -s http://ollama:11434/api/tags

# Test from backend Python
docker exec tamankehati-backend-prod python3 -c "
import requests
r = requests.get('http://ollama:11434/api/tags')
print(r.json())
"
```

**Backend configuration (.env):**
```bash
OLLAMA_URL=http://ollama:11434  # Use service name, not localhost
```

---

## ✅ Method 3: Expose Port to Host (Optional)

**Jika perlu akses dari host, update docker-compose:**

```bash
cd ~/dasmap_prod/apps/tamankehati
nano docker-compose.pull.no-nginx.yml
```

**Add ports section to ollama service:**
```yaml
ollama:
  image: ollama/ollama:latest
  container_name: tamankehati-ollama-prod
  ports:
    - "11434:11434"  # Expose to host
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
    start_period: 60s
```

**Restart:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml up -d ollama
```

**Then access from host:**
```bash
curl http://localhost:11434/api/tags
```

---

## 🔍 Verify Ollama is Working

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

### Test 3: Test API from Container

```bash
# Use wget (more reliable than curl in Ollama container)
docker exec tamankehati-ollama-prod wget -qO- http://localhost:11434/api/tags | head -20
```

### Test 4: Test from Backend

```bash
# Backend should be able to reach Ollama
docker exec tamankehati-backend-prod curl -s http://ollama:11434/api/tags
```

---

## 🎯 Why Port Not Exposed?

**Security reasons:**
- Ollama is only needed by backend, not external access
- Reduces attack surface
- Backend can access via Docker network (`http://ollama:11434`)

**Best practice:**
- Keep Ollama internal (no port exposure)
- Access via backend only
- Use Docker network for communication

---

## 🔧 Troubleshooting

### Problem: Can't access from host

**Solution:** Use Method 1 (from container) or Method 3 (expose port)

### Problem: Backend can't reach Ollama

**Check:**
```bash
# Test network connectivity
docker exec tamankehati-backend-prod ping -c 1 ollama

# Test API
docker exec tamankehati-backend-prod curl -s http://ollama:11434/api/tags
```

**Verify OLLAMA_URL in backend:**
```bash
docker exec tamankehati-backend-prod env | grep OLLAMA_URL
# Should show: OLLAMA_URL=http://ollama:11434
```

---

## 📝 Quick Reference

**Access from host (if port exposed):**
```bash
curl http://localhost:11434/api/tags
```

**Access from container (always works):**
```bash
docker exec tamankehati-ollama-prod ollama list
docker exec tamankehati-ollama-prod wget -qO- http://localhost:11434/api/tags
```

**Access from backend (correct for app):**
```bash
docker exec tamankehati-backend-prod curl -s http://ollama:11434/api/tags
```

---

**Last Updated:** 2025-11-05

