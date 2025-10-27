#!/usr/bin/env python3
"""
Test script to verify database operations work with Railway database
"""

import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent / "apps" / "backend"
sys.path.insert(0, str(backend_dir))

from core.database.engine import SessionLocal
from sqlalchemy import text

async def test_database_operations():
    """Test database operations"""
    print("🚀 Testing database operations with Railway database...")
    print("=" * 60)
    
    try:
        async with SessionLocal() as session:
            # Test 1: Check all tables exist
            print("📊 Checking table existence...")
            result = await session.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """))
            tables = result.fetchall()
            print(f"✅ Found {len(tables)} tables:")
            for table in tables:
                print(f"   - {table[0]}")
            
            # Test 2: Check system settings
            print("\n⚙️ Testing system settings...")
            result = await session.execute(text("SELECT COUNT(*) FROM system_settings"))
            settings_count = result.scalar()
            print(f"✅ System settings count: {settings_count}")
            
            # Test 3: Test regions table
            print("\n🌍 Testing regions table...")
            result = await session.execute(text("SELECT COUNT(*) FROM regions"))
            regions_count = result.scalar()
            print(f"✅ Regions count: {regions_count}")
            
            # Test 4: Test parks table
            print("\n🏞️ Testing parks table...")
            result = await session.execute(text("SELECT COUNT(*) FROM parks"))
            parks_count = result.scalar()
            print(f"✅ Parks count: {parks_count}")
            
            # Test 5: Test articles table
            print("\n📰 Testing articles table...")
            result = await session.execute(text("SELECT COUNT(*) FROM articles"))
            articles_count = result.scalar()
            print(f"✅ Articles count: {articles_count}")
            
            # Test 6: Test fauna table
            print("\n🐾 Testing fauna table...")
            result = await session.execute(text("SELECT COUNT(*) FROM fauna"))
            fauna_count = result.scalar()
            print(f"✅ Fauna count: {fauna_count}")
            
            # Test 7: Test flora table
            print("\n🌱 Testing flora table...")
            result = await session.execute(text("SELECT COUNT(*) FROM flora"))
            flora_count = result.scalar()
            print(f"✅ Flora count: {flora_count}")
            
            # Test 8: Test galleries table
            print("\n🖼️ Testing galleries table...")
            result = await session.execute(text("SELECT COUNT(*) FROM galleries"))
            galleries_count = result.scalar()
            print(f"✅ Galleries count: {galleries_count}")
            
            # Test 9: Test new tables
            print("\n🆕 Testing new tables...")
            new_tables = ['announcements', 'news', 'audit_log', 'notifications']
            for table in new_tables:
                result = await session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"✅ {table}: {count} records")
            
            # Test 10: Test insert operation
            print("\n➕ Testing insert operation...")
            await session.execute(text("""
                INSERT INTO system_settings (key, value, description, is_public) 
                VALUES ('test_migration', 'success', 'Test migration success', false)
                ON CONFLICT (key) DO NOTHING
            """))
            await session.commit()
            print("✅ Insert test successful!")
            
            # Test 11: Test update operation
            print("\n🔄 Testing update operation...")
            await session.execute(text("""
                UPDATE system_settings 
                SET value = 'updated_success' 
                WHERE key = 'test_migration'
            """))
            await session.commit()
            print("✅ Update test successful!")
            
            # Test 12: Test delete operation
            print("\n🗑️ Testing delete operation...")
            await session.execute(text("""
                DELETE FROM system_settings 
                WHERE key = 'test_migration'
            """))
            await session.commit()
            print("✅ Delete test successful!")
            
        print("\n🎉 All database operations successful!")
        return True
        
    except Exception as e:
        print(f"❌ Database operation failed: {e}")
        return False

async def main():
    """Main test function"""
    success = await test_database_operations()
    
    if success:
        print("\n✅ Railway database is fully functional!")
        print("📝 Your application is ready to use the new database.")
    else:
        print("\n❌ Database operations failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
