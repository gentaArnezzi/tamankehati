"""create taman table

Revision ID: 20251020_0020
Revises: 20251019_0019
Create Date: 2025-10-20 19:13:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func


# revision identifiers, used by Alembic.
revision = '20251020_0020'
down_revision = '20251019_0019'
branch_labels = None
depends_on = None


def upgrade():
    # Create taman table
    op.create_table(
        'taman',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nama', sa.String(length=255), nullable=False),
        sa.Column('wilayah', sa.String(length=100), nullable=True),
        sa.Column('luas_ha', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('deskripsi', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create index for name column for faster searching
    op.create_index(op.f('ix_taman_nama'), 'taman', ['nama'], unique=False)


def downgrade():
    # Drop taman table
    op.drop_index(op.f('ix_taman_nama'), table_name='taman')
    op.drop_table('taman')