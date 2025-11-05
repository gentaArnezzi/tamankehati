# 🐛 Debug Ollama di Local

Panduan untuk debug masalah Ollama di development environment (local).

## 📋 Prerequisites

1. Ollama terinstall di local
2. Backend running (local atau Docker)
3. Model sudah di-pull: `ollama pull qwen2:1.5b`

## 🔍 Step 1: Cek Ollama Running

```bash
# Cek Ollama service
ollama list

# Test API langsung
curl http://localhost:11434/api/tags

# Test generate sederhana
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2:1.5b",
  "prompt": "Hello",
  "stream": false,
  "options": {"num_predict": 5}
}'
```

## 🔍 Step 2: Test dari Backend

### A. Test via Python REPL

```bash
# Masuk ke backend container (jika pakai Docker)
docker exec -it tamankehati-backend-prod python3

# Atau jika local
python3
```

```python
import httpx
import asyncio
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2:1.5b")

async def test():
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Test 1: Ping
        print("Testing ping...")
        try:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            print(f"Ping status: {r.status_code}")
            print(f"Models: {r.json()}")
        except Exception as e:
            print(f"Ping failed: {e}")

        # Test 2: Quick generate
        print("\nTesting generate...")
        try:
            r = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": "Hello",
                    "stream": False,
                    "options": {"num_predict": 5}
                },
                timeout=10.0
            )
            print(f"Generate status: {r.status_code}")
            print(f"Response: {r.json()}")
        except Exception as e:
            print(f"Generate failed: {e}")

asyncio.run(test())
```

### B. Test via API Endpoint

```bash
# Test test-ollama endpoint
curl http://localhost:8000/api/v1/ai/test-ollama

# Dengan verbose untuk lihat timing
curl -w "\nTime: %{time_total}s\n" http://localhost:8000/api/v1/ai/test-ollama
```

## 🔍 Step 3: Monitor Logs

### Backend Logs

```bash
# Docker
docker logs -f tamankehati-backend-prod | grep -i ollama

# Local (jika pakai uvicorn)
tail -f logs/backend.log | grep -i ollama
```

### Ollama Logs

```bash
# Jika Ollama di Docker
docker logs -f tamankehati-ollama-prod

# Jika Ollama local
journalctl -u ollama -f
```

## 🔍 Step 4: Debug Timeout Issues

### Test dengan timeout berbeda

```python
import httpx
import asyncio

async def test_timeout(timeout_seconds):
    async with httpx.AsyncClient(timeout=timeout_seconds) as client:
        try:
            start = asyncio.get_event_loop().time()
            r = await client.get("http://localhost:11434/api/tags")
            elapsed = asyncio.get_event_loop().time() - start
            print(f"Timeout {timeout_seconds}s: OK in {elapsed:.2f}s")
            return True
        except httpx.TimeoutException:
            print(f"Timeout {timeout_seconds}s: TIMEOUT")
            return False
        except Exception as e:
            print(f"Timeout {timeout_seconds}s: ERROR - {e}")
            return False

# Test dengan berbagai timeout
for timeout in [1, 3, 5, 10, 30]:
    asyncio.run(test_timeout(timeout))
```

## 🔍 Step 5: Cek Environment Variables

```bash
# Di backend container
docker exec tamankehati-backend-prod env | grep OLLAMA

# Atau test langsung
docker exec tamankehati-backend-prod python3 -c "
import os
print('OLLAMA_URL:', os.getenv('OLLAMA_URL', 'NOT SET'))
print('OLLAMA_MODEL:', os.getenv('OLLAMA_MODEL', 'NOT SET'))
"
```

## 🔍 Step 6: Test Network Connectivity

```bash
# Test dari backend ke Ollama
docker exec tamankehati-backend-prod curl -v http://ollama:11434/api/tags

# Test dari host ke Ollama (jika port exposed)
curl -v http://localhost:11434/api/tags
```

## 🚀 Quick Debug Script

Buat file `debug_ollama.py`:

```python
#!/usr/bin/env python3
"""Quick debug script for Ollama connection"""
import httpx
import asyncio
import os
import sys

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2:1.5b")

async def debug():
    print(f"🔍 Testing Ollama connection...")
    print(f"   URL: {OLLAMA_URL}")
    print(f"   Model: {OLLAMA_MODEL}\n")

    # Test 1: Ping
    print("1️⃣ Testing ping (5s timeout)...")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            if r.status_code == 200:
                models = r.json().get("models", [])
                print(f"   ✅ Ping OK - Found {len(models)} models")
                if models:
                    print(f"   Models: {[m.get('name') for m in models[:3]]}")
            else:
                print(f"   ❌ Ping failed - Status: {r.status_code}")
                sys.exit(1)
    except httpx.TimeoutException:
        print(f"   ❌ Ping TIMEOUT (>5s)")
        sys.exit(1)
    except httpx.ConnectError:
        print(f"   ❌ Ping CONNECTION ERROR - Cannot connect to {OLLAMA_URL}")
        sys.exit(1)
    except Exception as e:
        print(f"   ❌ Ping ERROR: {e}")
        sys.exit(1)

    # Test 2: Quick generate
    print("\n2️⃣ Testing quick generate (10s timeout, 5 tokens)...")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": "Hello",
                    "stream": False,
                    "options": {"num_predict": 5}
                }
            )
            if r.status_code == 200:
                result = r.json()
                response = result.get("response", "")
                print(f"   ✅ Generate OK - Response: {response[:50]}")
            else:
                print(f"   ❌ Generate failed - Status: {r.status_code}")
                print(f"   Response: {r.text[:200]}")
                sys.exit(1)
    except httpx.TimeoutException:
        print(f"   ❌ Generate TIMEOUT (>10s)")
        sys.exit(1)
    except Exception as e:
        print(f"   ❌ Generate ERROR: {e}")
        sys.exit(1)

    print("\n✅ All tests passed!")

if __name__ == "__main__":
    asyncio.run(debug())
```

Jalankan:

```bash
python3 debug_ollama.py
```

## 📝 Common Issues & Solutions

### Issue 1: Connection Refused

**Error:** `Connection refused` atau `Cannot connect to Ollama`

**Solutions:**

- Cek Ollama running: `ollama list` atau `docker ps | grep ollama`
- Cek OLLAMA_URL: Harus sesuai dengan network (Docker vs local)
  - Docker network: `http://ollama:11434` atau `http://tamankehati-ollama-prod:11434`
  - Local: `http://localhost:11434`
- Cek firewall: Port 11434 harus accessible

### Issue 2: Timeout

**Error:** Request timeout setelah beberapa detik

**Solutions:**

- Ollama mungkin overloaded - cek CPU/memory usage
- Model terlalu besar - coba model lebih kecil (`qwen2:1.5b`)
- Increase timeout di test connection (tapi untuk test, sebaiknya cukup ping saja)

### Issue 3: Model Not Found

**Error:** `model not found` atau `model qwen2:1.5b not found`

**Solutions:**

```bash
# Pull model
ollama pull qwen2:1.5b

# Atau di Docker
docker exec tamankehati-ollama-prod ollama pull qwen2:1.5b

# Verify
ollama list
```

### Issue 4: Slow Response

**Symptom:** Response OK tapi sangat lambat (>30 detik)

**Solutions:**

- Gunakan model lebih kecil (`qwen2:1.5b` bukan `llama3.1:8b`)
- Cek resource: CPU, RAM, disk I/O
- Untuk test connection, cukup ping saja (tidak perlu generate)

## 🎯 Best Practices

1. **Untuk test connection, cukup ping saja** - tidak perlu generate test yang lambat
2. **Monitor logs** - selalu cek logs saat debug
3. **Test incrementally** - ping dulu, baru generate
4. **Use appropriate timeout** - 5s untuk ping, 10s untuk quick generate
5. **Check environment variables** - pastikan OLLAMA_URL benar
