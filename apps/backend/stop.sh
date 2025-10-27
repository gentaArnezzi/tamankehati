#!/bin/bash

# Script untuk menghentikan backend server
# Usage: ./stop.sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${RED}🛑 Stopping Taman Kehati Backend...${NC}"

# Find and kill uvicorn processes
PIDS=$(pgrep -f "uvicorn main:app")

if [ -z "$PIDS" ]; then
    echo "✓ No running backend server found."
else
    echo "Found running processes: $PIDS"
    kill $PIDS
    echo -e "${GREEN}✓${NC} Backend server stopped successfully."
fi

