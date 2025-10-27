#!/usr/bin/env python3
"""
Demo script untuk menguji AI Flora Fauna automation
Jalankan script ini untuk menguji koneksi Ollama dan generate deskripsi
"""

import asyncio
import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from ai.services.flora_fauna_ai import FloraFaunaAIService

async def test_ollama_connection():
    """Test koneksi ke Ollama"""
    print("🔍 Testing Ollama connection...")
    
    try:
        ai_service = FloraFaunaAIService()
        
        # Test data untuk flora
        flora_data = {
            "local_name": "Pohon Jati",
            "scientific_name": "Tectona grandis",
            "family": "Lamiaceae",
            "genus": "Tectona",
            "is_endemic": False,
            "iucn_status": "LC"
        }
        
        print("📝 Generating flora description...")
        flora_description = await ai_service.generate_flora_description(flora_data)
        print("✅ Flora description generated successfully!")
        print(f"📄 Description: {flora_description[:200]}...")
        print()
        
        # Test data untuk fauna
        fauna_data = {
            "local_name": "Harimau Sumatera",
            "scientific_name": "Panthera tigris sumatrae",
            "family": "Felidae",
            "genus": "Panthera",
            "is_endemic": True,
            "iucn_status": "CR"
        }
        
        print("🐅 Generating fauna description...")
        fauna_description = await ai_service.generate_fauna_description(fauna_data)
        print("✅ Fauna description generated successfully!")
        print(f"📄 Description: {fauna_description[:200]}...")
        print()
        
        # Test morphology untuk flora
        print("🌿 Generating morphology description...")
        morphology = await ai_service.generate_morphology_description(flora_data)
        print("✅ Morphology description generated successfully!")
        print(f"📄 Morphology: {morphology[:200]}...")
        print()
        
        # Test benefits untuk flora
        print("💡 Generating benefits description...")
        benefits = await ai_service.generate_benefits_description(flora_data)
        print("✅ Benefits description generated successfully!")
        print(f"📄 Benefits: {benefits[:200]}...")
        print()
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Pastikan Ollama sudah terinstall dan running")
        print("2. Pastikan model qwen sudah terdownload: ollama pull qwen2:1.5b")
        print("3. Cek koneksi ke http://localhost:11434")
        return False

async def demo_with_minimal_data():
    """Demo dengan data minimal"""
    print("\n🧪 Testing with minimal data...")
    
    try:
        ai_service = FloraFaunaAIService()
        
        # Test dengan data minimal
        minimal_flora = {
            "local_name": "Anggrek Bulan",
            "scientific_name": "Phalaenopsis amabilis"
        }
        
        print("🌺 Generating description with minimal data...")
        description = await ai_service.generate_flora_description(minimal_flora)
        print("✅ Description generated with minimal data!")
        print(f"📄 Description: {description[:300]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error with minimal data: {str(e)}")
        return False

async def main():
    """Main demo function"""
    print("🤖 AI Flora Fauna Automation Demo")
    print("=" * 50)
    
    # Test koneksi Ollama
    success = await test_ollama_connection()
    
    if success:
        print("🎉 All tests passed! AI system is working correctly.")
        
        # Test dengan data minimal
        await demo_with_minimal_data()
        
        print("\n📋 Next steps:")
        print("1. Start your FastAPI server: python main.py")
        print("2. Test API endpoints:")
        print("   - POST /api/v1/ai/generate-flora-description")
        print("   - POST /api/v1/ai/generate-fauna-description")
        print("   - GET /api/v1/ai/test-ollama")
        print("3. Use the AI in your frontend forms!")
        
    else:
        print("\n❌ Demo failed. Please check Ollama setup.")
        print("\n🔧 Setup instructions:")
        print("1. Install Ollama: https://ollama.ai/download")
        print("2. Pull Qwen model: ollama pull qwen2:1.5b")
        print("3. Start Ollama service: ollama serve")
        print("4. Run this demo again")

if __name__ == "__main__":
    asyncio.run(main())
