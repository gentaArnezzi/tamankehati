#!/usr/bin/env python3
"""
Debug script to run the server and catch any errors
"""

import asyncio
import sys
import traceback
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent / "apps" / "backend"
sys.path.insert(0, str(backend_dir))

def run_server():
    """Run the server with error handling"""
    try:
        print("🚀 Starting Tamankehati server...")
        print("=" * 50)
        
        # Import uvicorn
        import uvicorn
        
        # Import the app
        from main import app
        print("✅ FastAPI app imported successfully")
        
        # Run the server
        print("🔄 Starting uvicorn server...")
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            reload=False,  # Disable reload for debugging
            log_level="info"
        )
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Installing required packages...")
        import subprocess
        subprocess.run([sys.executable, "-m", "pip", "install", "uvicorn[standard]"])
        
    except Exception as e:
        print(f"❌ Server error: {e}")
        print("\nFull traceback:")
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    run_server()
