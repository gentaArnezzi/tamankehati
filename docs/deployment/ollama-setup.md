# Ollama Setup Guide untuk Ubuntu Server

Panduan lengkap untuk install dan setup Ollama di Ubuntu server untuk AI functionality Taman Kehati.

## Overview

Ollama adalah LLM (Large Language Model) server yang berjalan secara lokal di server. Aplikasi backend akan menghubungi Ollama via HTTP API untuk:
- Chatbot functionality
- AI-powered flora/fauna analysis
- Intelligent data processing

## Prerequisites

- Ubuntu 20.04+ (22.04 LTS recommended)
- Minimum 8GB RAM (16GB+ recommended untuk model besar)
- Minimum 20GB disk space untuk models
- Root atau sudo access

## Installation Methods

### Method 1: Official Install Script (Recommended)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Verify installation
ollama --version
```

### Method 2: Manual Installation

```bash
# Download Ollama
curl -L https://ollama.com/download/ollama-linux-amd64 -o /usr/local/bin/ollama

# Make executable
chmod +x /usr/local/bin/ollama

# Create ollama user
useradd -r -s /bin/false -m -d /usr/share/ollama ollama

# Create directories
mkdir -p /usr/share/ollama
chown ollama:ollama /usr/share/ollama
```

### Method 3: Docker (Alternative)

Jika ingin menggunakan Docker:

```bash
# Pull Ollama Docker image
docker pull ollama/ollama

# Run Ollama container
docker run -d \
  --name ollama \
  -v ollama-data:/root/.ollama \
  -p 11434:11434 \
  --restart unless-stopped \
  ollama/ollama
```

## Setup Systemd Service

### Create Service File

```bash
sudo nano /etc/systemd/system/ollama.service
```

Add berikut:

```ini
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"

[Install]
WantedBy=multi-user.target
```

### Start and Enable Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Start service
sudo systemctl start ollama

# Enable on boot
sudo systemctl enable ollama

# Check status
sudo systemctl status ollama
```

## Download Models

### Default Model (Recommended untuk testing)

```bash
# Pull default model (qwen2:1.5b - small, fast)
ollama pull qwen2:1.5b

# Verify model downloaded
ollama list
```

### Alternative Models (Based on RAM)

**Untuk 8GB RAM:**
```bash
# Small models (1-3GB)
ollama pull qwen2:1.5b          # 1.5B parameters
ollama pull phi3:mini           # 3.8B parameters
ollama pull gemma:2b           # 2B parameters
```

**Untuk 16GB+ RAM:**
```bash
# Medium models (7-13GB)
ollama pull qwen2.5:7b         # 7B parameters
ollama pull llama3.2:3b        # 3B parameters
ollama pull mistral:7b         # 7B parameters
```

**Untuk 32GB+ RAM:**
```bash
# Large models (13GB+)
ollama pull qwen2.5:14b         # 14B parameters
ollama pull llama3.1:70b       # 70B parameters (requires 40GB+ RAM)
```

### Check Model Size

```bash
# List all models
ollama list

# Show model info
ollama show qwen2:1.5b
```

## Configuration

### Environment Variables

Update `.env` file di aplikasi:

```bash
# Ollama Configuration
OLLAMA_URL=http://localhost:11434
# Or if Ollama is on different server:
# OLLAMA_URL=http://192.168.1.100:11434

# Model name (must match downloaded model)
OLLAMA_MODEL=qwen2:1.5b
```

### Docker Network Configuration

Jika menggunakan Docker Compose, update `docker-compose.prod.yml`:

```yaml
  # Ollama Service
  ollama:
    image: ollama/ollama:latest
    container_name: kehati-ollama
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"
    networks:
      - kehati-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Dan update backend service:

```yaml
  backend:
    environment:
      # ... existing env vars ...
      OLLAMA_URL: http://ollama:11434  # Use service name in Docker network
      OLLAMA_MODEL: qwen2:1.5b
    depends_on:
      # ... existing dependencies ...
      ollama:
        condition: service_healthy
```

## Verification

### Test Ollama Connection

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test model response
ollama run qwen2:1.5b "Hello, how are you?"

# Test API endpoint
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2:1.5b",
  "prompt": "Hello, how are you?",
  "stream": false
}'
```

### Test from Backend

```bash
# From backend container or local machine
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2:1.5b",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "stream": false
  }'
```

## Security Considerations

### Firewall Configuration

```bash
# Allow Ollama port (if needed for external access)
sudo ufw allow 11434/tcp

# Or restrict to localhost only (recommended)
# Edit service file to use 127.0.0.1:11434 instead of 0.0.0.0:11434
```

### Network Isolation

Jika Ollama hanya digunakan oleh aplikasi backend:
- Bind ke `127.0.0.1:11434` (localhost only)
- Jangan expose port 11434 ke internet
- Gunakan Docker network untuk internal communication

## Performance Optimization

### System Limits

```bash
# Increase file descriptor limits
sudo nano /etc/security/limits.conf

# Add:
ollama soft nofile 65536
ollama hard nofile 65536

# Increase memory limits (if needed)
sudo nano /etc/systemd/system/ollama.service

# Add under [Service]:
MemoryLimit=16G
```

### GPU Support (Optional)

Jika server memiliki GPU NVIDIA:

```bash
# Install NVIDIA drivers
sudo apt update
sudo apt install nvidia-driver-535

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker

# Update Docker Compose
# Add to ollama service:
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

## Troubleshooting

### Ollama Not Starting

```bash
# Check logs
sudo journalctl -u ollama -f

# Check permissions
sudo chown -R ollama:ollama /usr/share/ollama

# Check if port is in use
sudo netstat -tulpn | grep 11434
```

### Model Not Found

```bash
# List available models
ollama list

# Re-download model
ollama pull qwen2:1.5b

# Check model directory
ls -la ~/.ollama/models/
```

### Connection Refused

```bash
# Check if Ollama is listening
sudo netstat -tulpn | grep 11434

# Check firewall
sudo ufw status

# Test connection
curl http://localhost:11434/api/tags
```

### Out of Memory

```bash
# Check memory usage
free -h

# Use smaller model
ollama pull qwen2:1.5b  # Instead of larger models

# Limit model context
# Set OLLAMA_NUM_CTX environment variable
```

## Monitoring

### Health Check Script

Create `/usr/local/bin/check-ollama.sh`:

```bash
#!/bin/bash
if curl -f http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is healthy"
    exit 0
else
    echo "❌ Ollama is not responding"
    exit 1
fi
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/check-ollama.sh
```

### Logs

```bash
# View service logs
sudo journalctl -u ollama -f

# View recent logs
sudo journalctl -u ollama -n 100

# View logs since boot
sudo journalctl -u ollama -b
```

## Integration with Application

### Update Backend Environment

```bash
# In .env file
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2:1.5b
```

### Test Integration

```bash
# Test chatbot endpoint
curl -X POST http://localhost:8000/api/v1/public/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa itu Taman Kehati?"}'
```

## Cost Comparison

### Ollama (Self-hosted)
- ✅ **Free** - No API costs
- ✅ **Privacy** - Data stays on your server
- ✅ **No rate limits** - Unlimited usage
- ❌ **Resource intensive** - Requires RAM/GPU
- ❌ **Maintenance** - You manage updates

### Alternative: Cloud LLM APIs
- OpenAI API: Pay per token
- Google Gemini: Free tier available
- Anthropic Claude: Pay per token

## Recommended Setup

Untuk production dengan budget terbatas:

1. **Start with Ollama** (qwen2:1.5b)
   - Free, private, good for Indonesian language
   - Requires 8GB+ RAM

2. **Fallback to Google Gemini Free Tier**
   - Already configured in application
   - Good backup option

3. **Upgrade to larger model** if needed
   - Monitor performance
   - Scale based on usage

## Next Steps

1. ✅ Install Ollama
2. ✅ Download model
3. ✅ Configure service
4. ✅ Update application .env
5. ✅ Test integration
6. ✅ Monitor performance

## Resources

- Ollama Official: https://ollama.com
- Ollama Models: https://ollama.com/library
- Ollama GitHub: https://github.com/ollama/ollama

