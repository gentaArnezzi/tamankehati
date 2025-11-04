# 🔧 Fix Ollama Healthcheck - Quick Guide

## Problem

Ollama container shows "unhealthy" but logs show it's actually running.

**Root cause:** Health check uses `curl` which doesn't exist in Ollama container.

## Solution

### Method 1: Manual Edit (Recommended)

**SSH ke server:**
```bash
ssh ubuntu@38.47.93.167
cd ~/dasmap_prod/apps/tamankehati
nano docker-compose.pull.no-nginx.yml
```

**Find section `ollama:` (around line 127-141) and update:**

**FROM:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**TO:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "ollama list || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

**Save (Ctrl+O, Enter, Ctrl+X)**

### Method 2: Using sed (if manual edit fails)

**With proper escaping:**
```bash
cd ~/dasmap_prod/apps/tamankehati

# Backup first
cp docker-compose.pull.no-nginx.yml docker-compose.pull.no-nginx.yml.backup

# Fix using sed with proper escaping
sed -i 's/test: \["CMD", "curl", "-f", "http:\/\/localhost:11434\/api\/tags"\]/test: \["CMD-SHELL", "ollama list || exit 1"\]/g' docker-compose.pull.no-nginx.yml

# Also update start_period
sed -i 's/start_period: 40s/start_period: 60s/g' docker-compose.pull.no-nginx.yml
```

### Method 3: Using Python Script

**Create and run:**
```bash
cd ~/dasmap_prod/apps/tamankehati

cat > fix_ollama.py << 'PYTHON'
import re

with open('docker-compose.pull.no-nginx.yml', 'r') as f:
    content = f.read()

# Replace healthcheck
content = re.sub(
    r'test: \["CMD", "curl", "-f", "http://localhost:11434/api/tags"\]',
    r'test: ["CMD-SHELL", "ollama list || exit 1"]',
    content
)

# Update start_period
content = re.sub(r'start_period: 40s', 'start_period: 60s', content)

with open('docker-compose.pull.no-nginx.yml', 'w') as f:
    f.write(content)

print("✅ Fixed!")
PYTHON

python3 fix_ollama.py
rm fix_ollama.py
```

---

## After Fix: Restart Ollama

```bash
# Restart dengan config baru
docker compose -f docker-compose.pull.no-nginx.yml up -d ollama

# Wait 60 seconds for health check
sleep 60

# Check status (should show healthy now)
docker ps | grep ollama

# Verify
docker exec tamankehati-ollama-prod ollama list
```

---

## Quick All-in-One Command

**Copy-paste this entire block:**
```bash
cd ~/dasmap_prod/apps/tamankehati && \
cp docker-compose.pull.no-nginx.yml docker-compose.pull.no-nginx.yml.backup && \
python3 << 'PYTHON'
import re
with open('docker-compose.pull.no-nginx.yml', 'r') as f:
    content = f.read()
content = re.sub(
    r'test: \["CMD", "curl", "-f", "http://localhost:11434/api/tags"\]',
    r'test: ["CMD-SHELL", "ollama list || exit 1"]',
    content
)
content = re.sub(r'start_period: 40s', 'start_period: 60s', content)
with open('docker-compose.pull.no-nginx.yml', 'w') as f:
    f.write(content)
print("✅ Fixed!")
PYTHON
docker compose -f docker-compose.pull.no-nginx.yml up -d ollama && \
echo "✅ Restarted! Wait 60 seconds then check: docker ps | grep ollama"
```

---

## Verify Fix

```bash
# Check if healthy
docker ps | grep ollama
# Should show: Up (healthy)

# Test Ollama
docker exec tamankehati-ollama-prod ollama list

# Check health check config
docker inspect tamankehati-ollama-prod | grep -A 10 Health
```

---

## Why This Works

1. **Ollama container doesn't have `curl`** - So health check fails
2. **`ollama list` command exists** - This is the proper way to check if Ollama is running
3. **Longer start_period** - Ollama needs more time to initialize (especially when downloading models)

---

## Current Status from Logs

- ✅ Ollama is running (listening on port 11434)
- ✅ Ollama is downloading models (normal behavior)
- ✅ Server responding with 200 OK
- ❌ Health check fails because `curl` not found

**After fix:** Health check will pass because it uses `ollama list` instead of `curl`.
