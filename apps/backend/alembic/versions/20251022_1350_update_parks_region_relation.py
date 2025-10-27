"""update_parks_region_relation

Revision ID: 20251022_1350
Revises: 20251022_1342
Create Date: 2025-10-22 20:55:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251022_1350'
down_revision = '20251022_1342'
branch_labels = None
depends_on = None

def upgrade():
    # Pastikan tabel regions ada
    op.execute("""
        CREATE TABLE IF NOT EXISTS regions (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    
    # Tambahkan kolom region_id jika belum ada
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name='parks' AND column_name='region_id'
            ) THEN
                ALTER TABLE parks ADD COLUMN region_id INTEGER;
            END IF;
        END $$;
    """)
    
    # Karena kolom wilayah sudah dihapus, kita tidak bisa memigrasi data lama
    # Kita akan menginisialisasi dengan region default jika diperlukan
    op.execute("""
        -- Tambahkan region default jika belum ada
        INSERT INTO regions (name)
        SELECT 'Default Region'
        WHERE NOT EXISTS (SELECT 1 FROM regions LIMIT 1);
        
        -- Set region_id ke region yang ada untuk semua parks yang region_id-nya NULL
        -- Jika tidak ada region yang tersedia, operasi ini tidak akan melakukan apa-apa
        UPDATE parks p
        SET region_id = (SELECT id FROM regions LIMIT 1)
        WHERE region_id IS NULL
        AND EXISTS (SELECT 1 FROM regions LIMIT 1);
    """)
    
    # Buat foreign key constraint
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 
                FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_parks_region_id'
            ) THEN
                ALTER TABLE parks 
                ADD CONSTRAINT fk_parks_region_id 
                FOREIGN KEY (region_id) 
                REFERENCES regions(id) 
                ON DELETE SET NULL;
            END IF;
        END $$;
    """)

def downgrade():
    # Hapus foreign key constraint
    op.execute("""
        ALTER TABLE parks 
        DROP CONSTRAINT IF EXISTS fk_parks_region_id;
        
        -- Hapus region_id? Hati-hati, ini akan menghapus kolom
        -- Hapus komentar di bawah jika yakin ingin menghapus kolom
        -- ALTER TABLE parks DROP COLUMN IF EXISTS region_id;
    """)
