#!/usr/bin/env python3
"""
Comprehensive test for User-based Access Control Migration
This script tests all aspects of the migration to ensure nothing is missed
"""

import asyncio
import sys
from sqlalchemy import text
from core.database.session import get_session

async def test_user_based_access_control():
    print("🧪 Testing User-based Access Control Migration...")
    
    async with get_session() as db:
        try:
            # Test 1: Check if regions table still exists
            print("\n1️⃣ Testing regions table removal...")
            result = await db.execute(text("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_name = 'regions'
            """))
            regions_exists = result.fetchone()
            
            if regions_exists:
                print("❌ FAIL: regions table still exists")
                return False
            else:
                print("✅ PASS: regions table successfully removed")
            
            # Test 2: Check for remaining region-related columns
            print("\n2️⃣ Testing region-related columns removal...")
            result = await db.execute(text("""
                SELECT table_name, column_name FROM information_schema.columns 
                WHERE column_name IN ('region_id', 'region_code', 'wilayah')
                AND table_name IN ('parks', 'users', 'flora', 'fauna', 'activities')
            """))
            remaining_columns = result.fetchall()
            
            if remaining_columns:
                print(f"❌ FAIL: Found remaining region-related columns: {remaining_columns}")
                return False
            else:
                print("✅ PASS: All region-related columns successfully removed")
            
            # Test 3: Check parks table structure
            print("\n3️⃣ Testing parks table structure...")
            result = await db.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'parks' 
                ORDER BY ordinal_position
            """))
            parks_columns = result.fetchall()
            
            print("Parks table columns:")
            for col in parks_columns:
                print(f"  - {col[0]} ({col[1]}, nullable: {col[2]})")
            
            # Check if submitted_by exists
            submitted_by_exists = any(col[0] == 'submitted_by' for col in parks_columns)
            if submitted_by_exists:
                print("✅ PASS: submitted_by column exists in parks table")
            else:
                print("❌ FAIL: submitted_by column missing from parks table")
                return False
            
            # Test 4: Check users table structure
            print("\n4️⃣ Testing users table structure...")
            result = await db.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                ORDER BY ordinal_position
            """))
            users_columns = result.fetchall()
            
            print("Users table columns:")
            for col in users_columns:
                print(f"  - {col[0]} ({col[1]}, nullable: {col[2]})")
            
            # Check if region_code and wilayah are removed
            region_code_exists = any(col[0] == 'region_code' for col in users_columns)
            wilayah_exists = any(col[0] == 'wilayah' for col in users_columns)
            
            if not region_code_exists and not wilayah_exists:
                print("✅ PASS: region_code and wilayah columns removed from users table")
            else:
                print("❌ FAIL: region_code or wilayah columns still exist in users table")
                return False
            
            # Test 5: Check foreign key constraints
            print("\n5️⃣ Testing foreign key constraints...")
            result = await db.execute(text("""
                SELECT constraint_name, table_name, column_name 
                FROM information_schema.key_column_usage 
                WHERE constraint_name LIKE '%region%' 
                AND table_name IN ('parks', 'users', 'flora', 'fauna', 'activities')
            """))
            region_fks = result.fetchall()
            
            if region_fks:
                print(f"❌ FAIL: Found region-related foreign keys: {region_fks}")
                return False
            else:
                print("✅ PASS: No region-related foreign keys found")
            
            # Test 6: Check indexes
            print("\n6️⃣ Testing indexes...")
            result = await db.execute(text("""
                SELECT indexname, tablename 
                FROM pg_indexes 
                WHERE indexname LIKE '%region%' 
                AND tablename IN ('parks', 'users', 'flora', 'fauna', 'activities')
            """))
            region_indexes = result.fetchall()
            
            if region_indexes:
                print(f"❌ FAIL: Found region-related indexes: {region_indexes}")
                return False
            else:
                print("✅ PASS: No region-related indexes found")
            
            # Test 7: Check data integrity
            print("\n7️⃣ Testing data integrity...")
            
            # Check if there are any parks with NULL submitted_by
            result = await db.execute(text("""
                SELECT COUNT(*) FROM parks WHERE submitted_by IS NULL
            """))
            null_submitted_by = result.scalar()
            
            if null_submitted_by > 0:
                print(f"⚠️ WARNING: Found {null_submitted_by} parks with NULL submitted_by")
            else:
                print("✅ PASS: All parks have submitted_by values")
            
            # Test 8: Check flora and fauna tables
            print("\n8️⃣ Testing flora and fauna tables...")
            
            # Check flora table
            result = await db.execute(text("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'flora' AND column_name = 'submitted_by'
            """))
            flora_submitted_by = result.fetchone()
            
            if flora_submitted_by:
                print("✅ PASS: flora table has submitted_by column")
            else:
                print("❌ FAIL: flora table missing submitted_by column")
                return False
            
            # Check fauna table
            result = await db.execute(text("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'fauna' AND column_name = 'submitted_by'
            """))
            fauna_submitted_by = result.fetchone()
            
            if fauna_submitted_by:
                print("✅ PASS: fauna table has submitted_by column")
            else:
                print("❌ FAIL: fauna table missing submitted_by column")
                return False
            
            print("\n🎉 ALL TESTS PASSED! User-based Access Control Migration is successful!")
            return True
            
        except Exception as e:
            print(f"❌ TEST FAILED: {e}")
            return False

async def main():
    success = await test_user_based_access_control()
    if success:
        print("\n✅ Migration verification completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Migration verification failed!")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
