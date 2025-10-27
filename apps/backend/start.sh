#!/bin/bash

# Script untuk menjalankan backend dengan benar menggunakan venv
# Usage: ./start.sh

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Taman Kehati Backend...${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found! Please create it first:"
    echo "   python3 -m venv venv"
    exit 1
fi

# Activate venv
echo -e "${GREEN}✓${NC} Activating virtual environment..."
source venv/bin/activate

# Check if greenlet is installed
if ! python -c "import greenlet" 2>/dev/null; then
    echo "⚠️  Installing missing dependency: greenlet"
    pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org greenlet
fi

# Display Python info
echo -e "${GREEN}✓${NC} Python: $(which python)"
echo -e "${GREEN}✓${NC} Version: $(python --version)"

# Run uvicorn
echo -e "${BLUE}🌐 Starting server on http://0.0.0.0:8000${NC}"
echo -e "${BLUE}📚 API Docs: http://localhost:8000/docs${NC}"
echo ""

# Use python -m uvicorn to ensure using venv's Python
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

