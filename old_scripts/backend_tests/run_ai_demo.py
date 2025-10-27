#!/usr/bin/env python3
"""
Complete AI Flora Fauna Demo Script
Run this to see the AI system in action
"""

import asyncio
import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from ai.services.flora_fauna_ai import FloraFaunaAIService

async def demo_flora_ai():
    """Demo AI untuk flora"""
    print("🌿 DEMO: AI Flora Description Generation")
    print("=" * 50)
    
    ai_service = FloraFaunaAIService()
    
    # Test data untuk Pohon Jati
    flora_data = {
        "local_name": "Pohon Jati",
        "scientific_name": "Tectona grandis",
        "family": "Lamiaceae",
        "genus": "Tectona",
        "is_endemic": False,
        "iucn_status": "LC"
    }
    
    print("📝 Input Data:")
    for key, value in flora_data.items():
        print(f"   {key}: {value}")
    
    print("\n🤖 Generating AI Description...")
    description = await ai_service.generate_flora_description(flora_data)
    print(f"\n📄 Generated Description:\n{description}")
    
    print("\n🔬 Generating Morphology...")
    morphology = await ai_service.generate_morphology_description(flora_data)
    print(f"\n📄 Generated Morphology:\n{morphology}")
    
    print("\n💡 Generating Benefits...")
    benefits = await ai_service.generate_benefits_description(flora_data)
    print(f"\n📄 Generated Benefits:\n{benefits}")

async def demo_fauna_ai():
    """Demo AI untuk fauna"""
    print("\n🐅 DEMO: AI Fauna Description Generation")
    print("=" * 50)
    
    ai_service = FloraFaunaAIService()
    
    # Test data untuk Harimau Sumatera
    fauna_data = {
        "local_name": "Harimau Sumatera",
        "scientific_name": "Panthera tigris sumatrae",
        "family": "Felidae",
        "genus": "Panthera",
        "is_endemic": True,
        "iucn_status": "CR"
    }
    
    print("📝 Input Data:")
    for key, value in fauna_data.items():
        print(f"   {key}: {value}")
    
    print("\n🤖 Generating AI Description...")
    description = await ai_service.generate_fauna_description(fauna_data)
    print(f"\n📄 Generated Description:\n{description}")

async def demo_minimal_data():
    """Demo dengan data minimal"""
    print("\n🧪 DEMO: Minimal Data Input")
    print("=" * 50)
    
    ai_service = FloraFaunaAIService()
    
    # Test dengan data minimal
    minimal_data = {
        "local_name": "Anggrek Bulan",
        "scientific_name": "Phalaenopsis amabilis"
    }
    
    print("📝 Minimal Input Data:")
    for key, value in minimal_data.items():
        print(f"   {key}: {value}")
    
    print("\n🤖 Generating AI Description with minimal data...")
    description = await ai_service.generate_flora_description(minimal_data)
    print(f"\n📄 Generated Description:\n{description}")

async def main():
    """Main demo function"""
    print("🤖 AI Flora Fauna Automation - Complete Demo")
    print("=" * 60)
    print("This demo shows how the AI system generates descriptions")
    print("for flora and fauna based on minimal input data.")
    print("=" * 60)
    
    try:
        # Demo 1: Complete flora data
        await demo_flora_ai()
        
        # Demo 2: Complete fauna data
        await demo_fauna_ai()
        
        # Demo 3: Minimal data
        await demo_minimal_data()
        
        print("\n🎉 DEMO COMPLETED SUCCESSFULLY!")
        print("\n📋 What you've seen:")
        print("✅ AI generates comprehensive flora descriptions")
        print("✅ AI generates detailed morphology information")
        print("✅ AI generates benefits and uses information")
        print("✅ AI generates fauna descriptions")
        print("✅ AI works with minimal input data")
        
        print("\n🚀 Next Steps:")
        print("1. Start your FastAPI server: python3 main.py")
        print("2. Open frontend demo: http://localhost:3000/demo-ai")
        print("3. Test API endpoints with your frontend")
        print("4. Integrate AI into your flora/fauna forms")
        
        print("\n💡 Integration Tips:")
        print("- Use the AI service in your existing forms")
        print("- Add 'Generate with AI' buttons to description fields")
        print("- Copy-paste AI generated content into your forms")
        print("- Customize prompts in flora_fauna_ai.py if needed")
        
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure Ollama is running: ollama serve")
        print("2. Check if Qwen model is available: ollama list")
        print("3. Test connection: python3 test_ollama_connection.py")

if __name__ == "__main__":
    asyncio.run(main())
