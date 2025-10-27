"""remove_wilayah_column

Revision ID: 20251022_1342
Revises: 20251022_0008
Create Date: 2025-10-22 20:43:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251022_1342'
down_revision = '20251022_0008'
branch_labels = None
depends_on = None


def upgrade():
    # Periksa apakah kolom wilayah ada sebelum menghapusnya
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [column['name'] for column in inspector.get_columns('parks')]
    
    if 'wilayah' in columns:
        op.drop_column('parks', 'wilayah')
        print("Kolom 'wilayah' berhasil dihapus dari tabel 'parks'")
    else:
        print("Kolom 'wilayah' tidak ditemukan di tabel 'parks', melewati penghapusan")


def downgrade():
    # Periksa apakah kolom wilayah sudah ada sebelum menambahkannya
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [column['name'] for column in inspector.get_columns('parks')]
    
    if 'wilayah' not in columns:
        op.add_column('parks', 
                     sa.Column('wilayah', 
                              sa.VARCHAR(length=100), 
                              nullable=True, 
                              comment='Nama Wilayah (legacy)'))
        print("Kolom 'wilayah' berhasil ditambahkan ke tabel 'parks'")
    else:
        print("Kolom 'wilayah' sudah ada di tabel 'parks', melewati penambahan")
