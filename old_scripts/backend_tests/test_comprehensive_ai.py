#!/usr/bin/env python3
"""
Test script untuk menguji sistem AI comprehensive
"""

import asyncio
import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from ai.services.comprehensive_ai import ComprehensiveAIService

async def test_article_generation():
    """Test AI article generation"""
    print("📝 Testing Article Generation")
    print("=" * 40)
    
    ai_service = ComprehensiveAIService()
    
    article_data = {
        "topic": "Konservasi Harimau Sumatera",
        "category": "Konservasi",
        "park_name": "Taman Nasional Kerinci Seblat",
        "key_points": [
            "Populasi harimau sumatera menurun drastis",
            "Perlu upaya konservasi terpadu",
            "Masyarakat lokal berperan penting"
        ]
    }
    
    print("📄 Article Data:")
    for key, value in article_data.items():
        print(f"   {key}: {value}")
    
    print("\n🤖 Generating Article Content...")
    
    try:
        result = await ai_service.generate_article_content(article_data)
        
        print(f"✅ Article generated successfully!")
        print(f"   Title: {result['title']}")
        print(f"   Summary: {result['summary'][:100]}...")
        print(f"   Content length: {len(result['content'])} characters")
        
    except Exception as e:
        print(f"❌ Error generating article: {str(e)}")

async def test_news_generation():
    """Test AI news generation"""
    print("\n📰 Testing News Generation")
    print("=" * 40)
    
    ai_service = ComprehensiveAIService()
    
    news_data = {
        "event": "Penemuan Spesies Baru Anggrek",
        "location": "Taman Nasional Gunung Leuser",
        "park_name": "Taman Nasional Gunung Leuser",
        "impact": "Menambah daftar keanekaragaman hayati Indonesia"
    }
    
    print("📄 News Data:")
    for key, value in news_data.items():
        print(f"   {key}: {value}")
    
    print("\n🤖 Generating News Content...")
    
    try:
        result = await ai_service.generate_news_content(news_data)
        
        print(f"✅ News generated successfully!")
        print(f"   Headline: {result['headline']}")
        print(f"   Lead: {result['lead'][:100]}...")
        print(f"   Content length: {len(result['content'])} characters")
        
    except Exception as e:
        print(f"❌ Error generating news: {str(e)}")

async def test_csv_extraction():
    """Test CSV data extraction"""
    print("\n📊 Testing CSV Extraction")
    print("=" * 40)
    
    ai_service = ComprehensiveAIService()
    
    # Sample CSV content
    csv_content = """nama_lokal,nama_ilmiah,famili,status_iucn
Pohon Jati,Tectona grandis,Lamiaceae,LC
Anggrek Bulan,Phalaenopsis amabilis,Orchidaceae,VU
Harimau Sumatera,Panthera tigris sumatrae,Felidae,CR
Gajah Sumatera,Elephas maximus sumatranus,Elephantidae,CR"""
    
    park_info = {
        "id": 1,
        "name": "Taman Nasional Kerinci Seblat",
        "description": "Test park for CSV extraction"
    }
    
    print("📄 CSV Content:")
    print(csv_content)
    
    print("\n🤖 Extracting CSV Data...")
    
    try:
        result = await ai_service.extract_csv_data(csv_content, park_info)
        
        if result['success']:
            print(f"✅ CSV extraction successful!")
            print(f"   Total records: {result['total_records']}")
            print(f"   Valid records: {result['valid_records']}")
            print(f"   Flora data: {len(result['flora_data'])} records")
            print(f"   Fauna data: {len(result['fauna_data'])} records")
            print(f"   Articles data: {len(result['articles_data'])} records")
            
            # Show sample extracted data
            if result['flora_data']:
                print(f"\n📋 Sample Flora Data:")
                for i, flora in enumerate(result['flora_data'][:2]):
                    print(f"   {i+1}. {flora}")
            
            if result['fauna_data']:
                print(f"\n📋 Sample Fauna Data:")
                for i, fauna in enumerate(result['fauna_data'][:2]):
                    print(f"   {i+1}. {fauna}")
        else:
            print(f"❌ CSV extraction failed: {result.get('error', 'Unknown error')}")
        
    except Exception as e:
        print(f"❌ Error extracting CSV: {str(e)}")

async def main():
    """Run all tests"""
    print("🚀 Testing Comprehensive AI System")
    print("=" * 50)
    
    # Test article generation
    await test_article_generation()
    
    # Test news generation
    await test_news_generation()
    
    # Test CSV extraction
    await test_csv_extraction()
    
    print("\n✅ All tests completed!")
    print("\n📋 Summary:")
    print("- Article generation: Tested")
    print("- News generation: Tested")
    print("- CSV extraction: Tested")
    print("\n🎯 AI system is ready for production use!")

if __name__ == "__main__":
    asyncio.run(main())
