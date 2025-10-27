#!/usr/bin/env python3
"""
Script to remove regions table from database
"""
import asyncio
import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/kehati")

async def remove_regions_table():
    print("🗑️ Removing regions table from database...")
    
    # Create async engine
    engine = create_async_engine(DATABASE_URL)
    
    try:
        async with engine.begin() as conn:
            # Check if regions table exists
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'regions';
            """))
            tables = result.fetchall()
            
            if tables:
                print("❌ Regions table found, removing...")
                
                # Drop foreign key constraint from parks table if exists
                await conn.execute(text("""
                    DO $$
                    BEGIN
                        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                                   WHERE constraint_name = 'parks_region_id_fkey' AND table_name = 'parks') THEN
                            ALTER TABLE parks DROP CONSTRAINT parks_region_id_fkey;
                            RAISE NOTICE 'Dropped foreign key parks_region_id_fkey from parks table.';
                        END IF;
                    END $$;
                """))
                
                # Drop the region_id column from parks table if exists
                await conn.execute(text("""
                    DO $$
                    BEGIN
                        IF EXISTS (SELECT 1 FROM information_schema.columns 
                                   WHERE table_name = 'parks' AND column_name = 'region_id') THEN
                            ALTER TABLE parks DROP COLUMN region_id;
                            RAISE NOTICE 'Dropped column region_id from parks table.';
                        END IF;
                    END $$;
                """))
                
                # Drop the regions table
                await conn.execute(text("""
                    DO $$
                    BEGIN
                        IF EXISTS (SELECT 1 FROM information_schema.tables 
                                   WHERE table_name = 'regions') THEN
                            DROP TABLE regions CASCADE;
                            RAISE NOTICE 'Dropped regions table.';
                        END IF;
                    END $$;
                """))
                
                print("✅ Regions table removed successfully!")
            else:
                print("✅ Regions table does not exist")
                
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(remove_regions_table())
