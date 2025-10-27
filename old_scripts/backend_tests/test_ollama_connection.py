#!/usr/bin/env python3
"""
Simple script to test Ollama connection and debug issues
"""

import asyncio
import httpx
import json
import sys

async def test_ollama_connection():
    """Test basic Ollama connection"""
    print("🔍 Testing Ollama connection...")
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Test basic connection
            print("1. Testing basic connection...")
            response = await client.get("http://localhost:11434/api/tags")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                models = response.json()
                print(f"   Available models: {[m['name'] for m in models.get('models', [])]}")
                
                # Check if qwen2:1.5b is available
                qwen_available = any('qwen2:1.5b' in m['name'] for m in models.get('models', []))
                if qwen_available:
                    print("   ✅ Qwen2:1.5b model is available")
                else:
                    print("   ❌ Qwen2:1.5b model not found")
                    print("   Run: ollama pull qwen2:1.5b")
                    return False
            else:
                print(f"   ❌ Connection failed: {response.status_code}")
                return False
            
            # Test generate API
            print("\n2. Testing generate API...")
            test_payload = {
                "model": "qwen2:1.5b",
                "prompt": "Hello, how are you?",
                "stream": False
            }
            
            response = await client.post("http://localhost:11434/api/generate", json=test_payload)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   Response: {result.get('response', 'No response')[:100]}...")
                print("   ✅ Generate API working")
            else:
                print(f"   ❌ Generate API failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
            
            # Test chat API
            print("\n3. Testing chat API...")
            chat_payload = {
                "model": "qwen2:1.5b",
                "messages": [
                    {"role": "user", "content": "Hello, how are you?"}
                ],
                "stream": False
            }
            
            response = await client.post("http://localhost:11434/api/chat", json=chat_payload)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   Response: {result.get('message', {}).get('content', 'No response')[:100]}...")
                print("   ✅ Chat API working")
            else:
                print(f"   ❌ Chat API failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
            
            print("\n🎉 All Ollama tests passed!")
            return True
            
    except httpx.ConnectError:
        print("❌ Cannot connect to Ollama")
        print("   Make sure Ollama is running: ollama serve")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    print("🤖 Ollama Connection Test")
    print("=" * 30)
    
    success = await test_ollama_connection()
    
    if not success:
        print("\n🔧 Troubleshooting:")
        print("1. Install Ollama: https://ollama.ai/download")
        print("2. Start Ollama: ollama serve")
        print("3. Pull Qwen model: ollama pull qwen2:1.5b")
        print("4. Check if Ollama is running: curl http://localhost:11434/api/tags")
    else:
        print("\n✅ Ollama is ready for AI Flora Fauna system!")

if __name__ == "__main__":
    asyncio.run(main())
