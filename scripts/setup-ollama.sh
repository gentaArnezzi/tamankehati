#!/bin/bash
# Ollama Setup Script for Ubuntu Server
# Automated installation and configuration of Ollama

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }
log_error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"; }

echo "=========================================="
echo "🤖 Ollama Installation Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root or use sudo"
    exit 1
fi

# Check if Ollama already installed
if command -v ollama &> /dev/null; then
    log_warning "Ollama is already installed"
    ollama --version
    read -p "Do you want to reinstall? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Install Ollama
log "Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

if [ $? -eq 0 ]; then
    log_success "Ollama installed successfully"
else
    log_error "Ollama installation failed"
    exit 1
fi

# Verify installation
log "Verifying installation..."
if command -v ollama &> /dev/null; then
    VERSION=$(ollama --version)
    log_success "Ollama version: $VERSION"
else
    log_error "Ollama not found in PATH"
    exit 1
fi

# Create systemd service
log "Setting up systemd service..."

SERVICE_FILE="/etc/systemd/system/ollama.service"
if [ ! -f "$SERVICE_FILE" ]; then
    cat > "$SERVICE_FILE" << 'EOF'
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

[Install]
WantedBy=multi-user.target
EOF
    log_success "Systemd service file created"
else
    log_warning "Service file already exists, skipping"
fi

# Create ollama user if not exists
if ! id "ollama" &>/dev/null; then
    log "Creating ollama user..."
    useradd -r -s /bin/false -m -d /usr/share/ollama ollama || log_warning "User may already exist"
fi

# Start and enable service
log "Starting Ollama service..."
systemctl daemon-reload
systemctl enable ollama
systemctl start ollama

# Wait for service to start
sleep 5

# Check service status
if systemctl is-active --quiet ollama; then
    log_success "Ollama service is running"
else
    log_error "Ollama service failed to start"
    systemctl status ollama
    exit 1
fi

# Test connection
log "Testing Ollama connection..."
sleep 3
if curl -f http://localhost:11434/api/tags > /dev/null 2>&1; then
    log_success "Ollama is responding"
else
    log_warning "Ollama is not responding yet (may need more time)"
fi

# Download default model
log "Downloading default model (qwen2:1.5b)..."
log "This may take a few minutes..."
ollama pull qwen2:1.5b

if [ $? -eq 0 ]; then
    log_success "Model downloaded successfully"
else
    log_warning "Model download failed, you can download manually later"
fi

# List models
log "Available models:"
ollama list

echo ""
echo "=========================================="
log_success "Ollama setup completed!"
echo "=========================================="
echo ""
echo "Configuration:"
echo "  Service: systemctl status ollama"
echo "  Logs: journalctl -u ollama -f"
echo "  API: http://localhost:11434"
echo ""
echo "Next steps:"
echo "  1. Update .env file with:"
echo "     OLLAMA_URL=http://localhost:11434"
echo "     OLLAMA_MODEL=qwen2:1.5b"
echo ""
echo "  2. Test connection:"
echo "     curl http://localhost:11434/api/tags"
echo ""
echo "  3. Test model:"
echo "     ollama run qwen2:1.5b 'Hello, how are you?'"
echo ""

