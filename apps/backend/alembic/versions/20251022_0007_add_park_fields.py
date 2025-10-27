"""Add new fields to parks table

Revision ID: 20251022_0007
Revises: 20251022_0006
Create Date: 2025-10-22 20:20:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251022_0007'
down_revision = '20251022_0006'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns
    op.add_column('parks', sa.Column('sk_penetapan', sa.String(255), nullable=True, comment='SK Penetapan Taman'))
    op.add_column('parks', sa.Column('visi', sa.Text(), nullable=True, comment='Visi Taman'))
    op.add_column('parks', sa.Column('misi', sa.Text(), nullable=True, comment='Misi Taman'))
    op.add_column('parks', sa.Column('value', sa.Text(), nullable=True, comment='Nilai-nilai Taman'))
    
    # Create index for better query performance if needed
    op.create_index(op.f('ix_parks_sk_penetapan'), 'parks', ['sk_penetapan'], unique=False)

def downgrade():
    # Drop the index first
    op.drop_index(op.f('ix_parks_sk_penetapan'), table_name='parks')
    
    # Drop the columns
    op.drop_column('parks', 'value')
    op.drop_column('parks', 'misi')
    op.drop_column('parks', 'visi')
    op.drop_column('parks', 'sk_penetapan')
