#!/usr/bin/env python3
"""
Migration script to add administrative columns to parks table
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
        
        print("Adding administrative columns to parks table...")
        
        # Add provinsi column
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'parks' 
            AND column_name = 'provinsi'
        """)
        
        if not cur.fetchone():
            print("Adding provinsi column...")
            cur.execute("ALTER TABLE parks ADD COLUMN provinsi VARCHAR(100)")
            print("✓ Added provinsi column")
        else:
            print("provinsi column already exists")
        
        # Add kota_kabupaten column
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'parks' 
            AND column_name = 'kota_kabupaten'
        """)
        
        if not cur.fetchone():
            print("Adding kota_kabupaten column...")
            cur.execute("ALTER TABLE parks ADD COLUMN kota_kabupaten VARCHAR(100)")
            print("✓ Added kota_kabupaten column")
        else:
            print("kota_kabupaten column already exists")
        
        # Add kecamatan column
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'parks' 
            AND column_name = 'kecamatan'
        """)
        
        if not cur.fetchone():
            print("Adding kecamatan column...")
            cur.execute("ALTER TABLE parks ADD COLUMN kecamatan VARCHAR(100)")
            print("✓ Added kecamatan column")
        else:
            print("kecamatan column already exists")
        
        # Add desa_kelurahan column
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'parks' 
            AND column_name = 'desa_kelurahan'
        """)
        
        if not cur.fetchone():
            print("Adding desa_kelurahan column...")
            cur.execute("ALTER TABLE parks ADD COLUMN desa_kelurahan VARCHAR(100)")
            print("✓ Added desa_kelurahan column")
        else:
            print("desa_kelurahan column already exists")
        
        conn.commit()
        print("✓ Migration completed successfully")
        
        # Verify the new columns
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'parks' 
            AND column_name IN ('provinsi', 'kota_kabupaten', 'kecamatan', 'desa_kelurahan')
            ORDER BY column_name
        """)
        
        new_columns = cur.fetchall()
        print("\nNew administrative columns:")
        for col in new_columns:
            print(f"  {col[0]}: {col[1]}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    main()
