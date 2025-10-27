#!/usr/bin/env python3
"""
Simple test script untuk menguji setup AI Flora Fauna
"""

import asyncio
import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

async def test_imports():
    """Test apakah semua import berhasil"""
    print("🔍 Testing imports...")
    
    try:
        from ai.services.flora_fauna_ai import FloraFaunaAIService
        print("✅ FloraFaunaAIService imported successfully")
        
        from ai.providers.ollama_provider import OllamaProvider
        print("✅ OllamaProvider imported successfully")
        
        from ai.providers.base import ChatTurn
        print("✅ ChatTurn imported successfully")
        
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

async def test_ollama_connection():
    """Test koneksi ke Ollama"""
    print("\n🔍 Testing Ollama connection...")
    
    try:
        # First test basic Ollama connection
        import httpx
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get("http://localhost:11434/api/tags")
            if response.status_code != 200:
                print("❌ Ollama not running or not accessible")
                return False
            print("✅ Ollama is running")
        
        # Test AI service
        from ai.services.flora_fauna_ai import FloraFaunaAIService
        
        ai_service = FloraFaunaAIService()
        
        # Test dengan data minimal
        test_data = {
            "local_name": "Pohon Jati",
            "scientific_name": "Tectona grandis"
        }
        
        print("📝 Generating test description...")
        description = await ai_service.generate_flora_description(test_data)
        
        if description and len(description) > 50:
            print("✅ Ollama connection successful!")
            print(f"📄 Generated description (first 100 chars): {description[:100]}...")
            return True
        else:
            print("❌ Generated description too short or empty")
            return False
            
    except Exception as e:
        print(f"❌ Ollama connection failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure Ollama is installed and running")
        print("2. Pull the Qwen model: ollama pull qwen2:1.5b")
        print("3. Check if Ollama is accessible at http://localhost:11434")
        print("4. Run: python3 test_ollama_connection.py")
        return False

async def main():
    """Main test function"""
    print("🤖 AI Flora Fauna Setup Test")
    print("=" * 40)
    
    # Test imports
    imports_ok = await test_imports()
    
    if not imports_ok:
        print("\n❌ Import test failed. Check your Python environment.")
        return
    
    # Test Ollama connection
    ollama_ok = await test_ollama_connection()
    
    if ollama_ok:
        print("\n🎉 All tests passed! AI system is ready to use.")
        print("\n📋 Next steps:")
        print("1. Start your FastAPI server: python main.py")
        print("2. Visit the demo page: http://localhost:3000/demo-ai")
        print("3. Test the API endpoints with your frontend")
    else:
        print("\n❌ Setup incomplete. Please fix Ollama connection first.")

if __name__ == "__main__":
    asyncio.run(main())
