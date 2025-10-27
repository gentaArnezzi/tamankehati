"""add missing flora columns

Revision ID: 20251024_0001
Revises: 20251022_1420
Create Date: 2025-10-24 03:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251024_0001'
down_revision = '20251022_1420'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add missing columns to flora table (only those that don't exist)
    op.add_column('flora', sa.Column('park_id', sa.Integer(), sa.ForeignKey('parks.id', ondelete='CASCADE'), nullable=False, server_default='1'))
    op.add_column('flora', sa.Column('local_name', sa.String(), nullable=True))
    op.add_column('flora', sa.Column('family', sa.String(), nullable=True))
    op.add_column('flora', sa.Column('genus', sa.String(), nullable=True))
    op.add_column('flora', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('flora', sa.Column('morphology', sa.Text(), nullable=True))
    op.add_column('flora', sa.Column('benefits', sa.Text(), nullable=True))
    op.add_column('flora', sa.Column('is_endemic', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('flora', sa.Column('iucn_status', sa.String(length=8), nullable=True))
    
    # Add workflow columns (status already exists, so skip it)
    op.add_column('flora', sa.Column('submitted_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    op.add_column('flora', sa.Column('approved_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    op.add_column('flora', sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('flora', sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('flora', sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('flora', sa.Column('rejection_reason', sa.Text(), nullable=True))
    op.add_column('flora', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('flora', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    
    # Create indexes
    op.create_index('idx_flora_park_id', 'flora', ['park_id'])
    op.create_index('idx_flora_iucn', 'flora', ['iucn_status'])
    
    # Update existing records to have park_id = 1 (default park)
    op.execute("UPDATE flora SET park_id = 1 WHERE park_id IS NULL")
    
    # Make park_id not nullable after setting default values
    op.alter_column('flora', 'park_id', nullable=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_flora_iucn', 'flora')
    op.drop_index('idx_flora_status', 'flora')
    op.drop_index('idx_flora_park_id', 'flora')
    
    # Drop columns
    op.drop_column('flora', 'updated_at')
    op.drop_column('flora', 'deleted_at')
    op.drop_column('flora', 'rejection_reason')
    op.drop_column('flora', 'rejected_at')
    op.drop_column('flora', 'approved_at')
    op.drop_column('flora', 'submitted_at')
    op.drop_column('flora', 'approved_by')
    op.drop_column('flora', 'submitted_by')
    op.drop_column('flora', 'status')
    op.drop_column('flora', 'iucn_status')
    op.drop_column('flora', 'is_endemic')
    op.drop_column('flora', 'benefits')
    op.drop_column('flora', 'morphology')
    op.drop_column('flora', 'description')
    op.drop_column('flora', 'genus')
    op.drop_column('flora', 'family')
    op.drop_column('flora', 'local_name')
    op.drop_column('flora', 'park_id')
    
    # Drop enum type
    op.execute("DROP TYPE IF EXISTS wf_status")
