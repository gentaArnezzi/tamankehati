"""add missing galleries columns

Revision ID: 20251024_0004
Revises: 20251024_0003
Create Date: 2025-10-24 11:22:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251024_0004'
down_revision = '20251024_0003'
branch_labels = None
depends_on = None


def upgrade():
    # Add missing columns to galleries table
    op.add_column('galleries', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('galleries', sa.Column('author_id', sa.Integer(), nullable=True))
    op.add_column('galleries', sa.Column('region_code', sa.String(10), nullable=True))
    op.add_column('galleries', sa.Column('submitted_by', sa.Integer(), nullable=True))
    op.add_column('galleries', sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('galleries', sa.Column('approved_by', sa.Integer(), nullable=True))
    op.add_column('galleries', sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('galleries', sa.Column('rejected_by', sa.Integer(), nullable=True))
    op.add_column('galleries', sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('galleries', sa.Column('rejection_reason', sa.String(500), nullable=True))
    op.add_column('galleries', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column('galleries', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add foreign key constraints
    op.create_foreign_key('galleries_author_id_fkey', 'galleries', 'users', ['author_id'], ['id'], ondelete='CASCADE')
    
    # Add indexes
    op.create_index('ix_galleries_author_id', 'galleries', ['author_id'])
    op.create_index('ix_galleries_region_code', 'galleries', ['region_code'])
    
    # Update existing rows to have default values
    op.execute("UPDATE galleries SET region_code = 'JABAR' WHERE region_code IS NULL")
    op.execute("UPDATE galleries SET author_id = 1 WHERE author_id IS NULL")
    
    # Make certain columns non-nullable after setting defaults
    op.alter_column('galleries', 'author_id', nullable=False)
    op.alter_column('galleries', 'region_code', nullable=False)


def downgrade():
    # Remove indexes
    op.drop_index('ix_galleries_region_code', table_name='galleries')
    op.drop_index('ix_galleries_author_id', table_name='galleries')
    
    # Remove foreign key
    op.drop_constraint('galleries_author_id_fkey', 'galleries', type_='foreignkey')
    
    # Remove columns
    op.drop_column('galleries', 'deleted_at')
    op.drop_column('galleries', 'updated_at')
    op.drop_column('galleries', 'rejection_reason')
    op.drop_column('galleries', 'rejected_at')
    op.drop_column('galleries', 'rejected_by')
    op.drop_column('galleries', 'approved_at')
    op.drop_column('galleries', 'approved_by')
    op.drop_column('galleries', 'submitted_at')
    op.drop_column('galleries', 'submitted_by')
    op.drop_column('galleries', 'region_code')
    op.drop_column('galleries', 'author_id')
    op.drop_column('galleries', 'description')

