"""migrate_taman_to_parks

Revision ID: 20251022_0008
Revises: 20251022_0007
Create Date: 2025-10-22 00:08:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251022_0008'
down_revision = '20251022_0007'
branch_labels = None
depends_on = None

def column_exists(table_name, column_name):
    conn = op.get_bind()
    query = sa.text(
        """
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = :table_name 
            AND column_name = :column_name
        )
        """
    )
    result = conn.execute(query, {'table_name': table_name, 'column_name': column_name})
    return result.scalar()

def upgrade():
    # Add columns if they don't exist
    if not column_exists('parks', 'sk_penetapan'):
        op.add_column('parks', sa.Column('sk_penetapan', sa.String(255), nullable=True, comment='Nomor SK Penetapan'))
    if not column_exists('parks', 'pengelola'):
        op.add_column('parks', sa.Column('pengelola', sa.String(255), nullable=True, comment='Instansi Pengelola'))
    if not column_exists('parks', 'tipe_ekoregion'):
        op.add_column('parks', sa.Column('tipe_ekoregion', sa.String(100), nullable=True, comment='Tipe Ekoregion'))
    if not column_exists('parks', 'kondisi_fisik'):
        op.add_column('parks', sa.Column('kondisi_fisik', sa.Text(), nullable=True, comment='Kondisi Fisik Kawasan'))
    if not column_exists('parks', 'nilai_penting'):
        op.add_column('parks', sa.Column('nilai_penting', sa.Text(), nullable=True, comment='Nilai Penting Kawasan'))
    if not column_exists('parks', 'sejarah'):
        op.add_column('parks', sa.Column('sejarah', sa.Text(), nullable=True, comment='Sejarah Taman'))
    if not column_exists('parks', 'visi'):
        op.add_column('parks', sa.Column('visi', sa.Text(), nullable=True, comment='Visi Taman'))
    if not column_exists('parks', 'misi'):
        op.add_column('parks', sa.Column('misi', sa.Text(), nullable=True, comment='Misi Taman'))
    if not column_exists('parks', 'nilai_dasar'):
        op.add_column('parks', sa.Column('nilai_dasar', sa.Text(), nullable=True, comment='Nilai-nilai Dasar'))

def downgrade():
    # Hapus kolom yang ditambahkan
    op.drop_column('parks', 'nilai_dasar')
    op.drop_column('parks', 'misi')
    op.drop_column('parks', 'visi')
    op.drop_column('parks', 'sejarah')
    op.drop_column('parks', 'nilai_penting')
    op.drop_column('parks', 'kondisi_fisik')
    op.drop_column('parks', 'tipe_ekoregion')
    op.drop_column('parks', 'pengelola')
    op.drop_column('parks', 'sk_penetapan')