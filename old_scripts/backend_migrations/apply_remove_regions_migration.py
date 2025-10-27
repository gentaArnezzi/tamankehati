#!/usr/bin/env python3
"""
Apply remove regions migration
This script removes the regions table and all region-related dependencies
"""

import asyncio
import os
from sqlalchemy import text
from core.database.session import get_session

async def apply_remove_regions_migration():
    print("🗑️ Applying remove regions migration...")
    
    async with get_session() as db:
        try:
            # Read the migration SQL file
            migration_file = "migrations/remove_regions_table.sql"
            if not os.path.exists(migration_file):
                print(f"❌ Migration file not found: {migration_file}")
                return
            
            with open(migration_file, 'r') as f:
                migration_sql = f.read()
            
            print("📋 Executing migration SQL...")
            await db.execute(text(migration_sql))
            await db.commit()
            
            print("✅ Migration completed successfully!")
            
            # Verify regions table is removed
            result = await db.execute(text("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_name = 'regions'
            """))
            regions_exists = result.fetchone()
            
            if regions_exists:
                print("⚠️ Warning: regions table still exists")
            else:
                print("✅ regions table successfully removed")
            
            # Check for remaining region-related columns
            result = await db.execute(text("""
                SELECT table_name, column_name FROM information_schema.columns 
                WHERE column_name IN ('region_id', 'region_code', 'wilayah')
                AND table_name IN ('parks', 'users', 'flora', 'fauna', 'activities')
            """))
            remaining_columns = result.fetchall()
            
            if remaining_columns:
                print(f"⚠️ Warning: Found remaining region-related columns: {remaining_columns}")
            else:
                print("✅ All region-related columns successfully removed")
                
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            await db.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(apply_remove_regions_migration())
