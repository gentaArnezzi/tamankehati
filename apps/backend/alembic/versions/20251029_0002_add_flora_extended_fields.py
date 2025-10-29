"""add_flora_extended_fields

Revision ID: 20251029_0002
Revises: 20251029_0001
Create Date: 2025-10-29 01:00:00.000000

Menambahkan field tambahan untuk flora:
- synonym (sinonim)
- flowering_time (waktu berbunga)
- distribution (penyebaran)
- propagation_method (metode perbanyakan)
- reference (referensi)
- leaf_image_url (gambar pertelaan daun)
- stem_image_url (gambar batang percabangan)
- flower_image_url (gambar bunga)
- fruit_image_url (gambar buah)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20251029_0002'
down_revision: Union[str, None] = '20251029_0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new text fields
    op.add_column('flora', sa.Column('synonym', sa.Text(), nullable=True))
    op.add_column('flora', sa.Column('flowering_time', sa.String(length=100), nullable=True))
    op.add_column('flora', sa.Column('distribution', sa.Text(), nullable=True))
    op.add_column('flora', sa.Column('propagation_method', sa.Text(), nullable=True))
    op.add_column('flora', sa.Column('reference', sa.Text(), nullable=True))
    
    # Add new image URL fields
    op.add_column('flora', sa.Column('leaf_image_url', sa.String(length=500), nullable=True))
    op.add_column('flora', sa.Column('stem_image_url', sa.String(length=500), nullable=True))
    op.add_column('flora', sa.Column('flower_image_url', sa.String(length=500), nullable=True))
    op.add_column('flora', sa.Column('fruit_image_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    # Remove image URL fields
    op.drop_column('flora', 'fruit_image_url')
    op.drop_column('flora', 'flower_image_url')
    op.drop_column('flora', 'stem_image_url')
    op.drop_column('flora', 'leaf_image_url')
    
    # Remove text fields
    op.drop_column('flora', 'reference')
    op.drop_column('flora', 'propagation_method')
    op.drop_column('flora', 'distribution')
    op.drop_column('flora', 'flowering_time')
    op.drop_column('flora', 'synonym')

