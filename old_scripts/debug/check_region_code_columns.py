import sys
import asyncio
sys.path.insert(0, 'apps/backend')

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database.session import get_session

async def check_region_code_columns():
    print("🔍 Checking which tables have region_code column...")
    
    async for db in get_session():
        try:
            # Check all tables for region_code column
            result = await db.execute(text("""
                SELECT table_name, column_name, data_type 
                FROM information_schema.columns 
                WHERE column_name = 'region_code' 
                ORDER BY table_name
            """))
            columns = result.fetchall()
            
            if columns:
                print("\n📋 Tables with region_code column:")
                for col in columns:
                    print(f"  - {col.table_name}.{col.column_name}: {col.data_type}")
            else:
                print("\n✅ No tables have region_code column")
            
            # Also check for any references to region_code in foreign keys
            result = await db.execute(text("""
                SELECT 
                    tc.table_name, 
                    kcu.column_name, 
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name 
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND (kcu.column_name = 'region_code' OR ccu.column_name = 'region_code')
            """))
            fks = result.fetchall()
            
            if fks:
                print("\n🔗 Foreign key references to region_code:")
                for fk in fks:
                    print(f"  - {fk.table_name}.{fk.column_name} -> {fk.foreign_table_name}.{fk.foreign_column_name}")
            else:
                print("\n✅ No foreign key references to region_code")
                
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            break

if __name__ == "__main__":
    asyncio.run(check_region_code_columns())
