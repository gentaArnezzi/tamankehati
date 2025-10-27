#!/usr/bin/env python3
"""
Script to remove regions table from database using synchronous connection
"""
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/kehati")

def remove_regions_table():
    print("🗑️ Removing regions table from database...")
    
    try:
        # Parse DATABASE_URL
        if DATABASE_URL.startswith("postgresql://"):
            # Extract connection details
            url_parts = DATABASE_URL.replace("postgresql://", "").split("/")
            db_name = url_parts[1]
            auth_parts = url_parts[0].split("@")
            user_pass = auth_parts[0].split(":")
            user = user_pass[0]
            password = user_pass[1] if len(user_pass) > 1 else ""
            host_port = auth_parts[1].split(":")
            host = host_port[0]
            port = int(host_port[1]) if len(host_port) > 1 else 5432
            
            # Connect to database
            conn = psycopg2.connect(
                host=host,
                port=port,
                database=db_name,
                user=user,
                password=password
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cur = conn.cursor()
            
            # Check if regions table exists
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'regions';
            """)
            tables = cur.fetchall()
            
            if tables:
                print("❌ Regions table found, removing...")
                
                # Drop foreign key constraint from parks table if exists
                cur.execute("""
                    DO $$
                    BEGIN
                        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                                   WHERE constraint_name = 'parks_region_id_fkey' AND table_name = 'parks') THEN
                            ALTER TABLE parks DROP CONSTRAINT parks_region_id_fkey;
                            RAISE NOTICE 'Dropped foreign key parks_region_id_fkey from parks table.';
                        END IF;
                    END $$;
                """)
                
                # Drop the region_id column from parks table if exists
                cur.execute("""
                    DO $$
                    BEGIN
                        IF EXISTS (SELECT 1 FROM information_schema.columns 
                                   WHERE table_name = 'parks' AND column_name = 'region_id') THEN
                            ALTER TABLE parks DROP COLUMN region_id;
                            RAISE NOTICE 'Dropped column region_id from parks table.';
                        END IF;
                    END $$;
                """)
                
                # Drop the regions table
                cur.execute("""
                    DO $$
                    BEGIN
                        IF EXISTS (SELECT 1 FROM information_schema.tables 
                                   WHERE table_name = 'regions') THEN
                            DROP TABLE regions CASCADE;
                            RAISE NOTICE 'Dropped regions table.';
                        END IF;
                    END $$;
                """)
                
                print("✅ Regions table removed successfully!")
            else:
                print("✅ Regions table does not exist")
                
            cur.close()
            conn.close()
            
        else:
            print("❌ Invalid DATABASE_URL format")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    remove_regions_table()
