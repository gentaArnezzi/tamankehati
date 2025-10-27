#!/usr/bin/env python3
"""
Migration script to change articles.region_code to articles.park_id
"""
import psycopg2
import os
from dotenv import load_dotenv

def main():
    load_dotenv('.env')
    DATABASE_URL = os.getenv('DATABASE_URL_SYNC', 'postgresql://postgres:password@localhost:5432/kehati_db')
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("Starting articles region_code to park_id migration...")
        
        # Check if region_code column exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'articles' 
            AND column_name = 'region_code'
        """)
        
        if cur.fetchone():
            print("Found region_code column in articles table")
            
            # Add park_id column if it doesn't exist
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'articles' 
                AND column_name = 'park_id'
            """)
            
            if not cur.fetchone():
                print("Adding park_id column to articles table...")
                cur.execute("""
                    ALTER TABLE articles 
                    ADD COLUMN park_id INTEGER REFERENCES parks(id) ON DELETE SET NULL
                """)
                print("✓ Added park_id column")
            else:
                print("park_id column already exists")
            
            # Drop region_code column
            print("Dropping region_code column...")
            cur.execute("ALTER TABLE articles DROP COLUMN region_code")
            print("✓ Dropped region_code column")
            
            conn.commit()
            print("✓ Migration completed successfully")
        else:
            print("region_code column not found, migration not needed")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    main()
