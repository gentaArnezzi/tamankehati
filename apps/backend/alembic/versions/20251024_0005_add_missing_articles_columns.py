"""add missing articles columns

Revision ID: 20251024_0005
Revises: 20251024_0004
Create Date: 2025-10-24 11:25:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251024_0005'
down_revision = '20251024_0004'
branch_labels = None
depends_on = None


def upgrade():
    # Add missing columns to articles table
    op.add_column('articles', sa.Column('summary', sa.String(500), nullable=True))
    op.add_column('articles', sa.Column('author_id', sa.Integer(), nullable=True))
    op.add_column('articles', sa.Column('region_code', sa.String(10), nullable=True))
    op.add_column('articles', sa.Column('submitted_by', sa.Integer(), nullable=True))
    op.add_column('articles', sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('articles', sa.Column('approved_by', sa.Integer(), nullable=True))
    op.add_column('articles', sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('articles', sa.Column('rejected_by', sa.Integer(), nullable=True))
    op.add_column('articles', sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('articles', sa.Column('rejection_reason', sa.String(500), nullable=True))
    op.add_column('articles', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column('articles', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add foreign key constraints
    op.create_foreign_key('articles_author_id_fkey', 'articles', 'users', ['author_id'], ['id'], ondelete='SET NULL')
    
    # Add indexes
    op.create_index('ix_articles_author_id', 'articles', ['author_id'])
    op.create_index('ix_articles_region_code', 'articles', ['region_code'])
    
    # Update existing rows to have default values
    op.execute("UPDATE articles SET region_code = 'JABAR' WHERE region_code IS NULL")
    op.execute("UPDATE articles SET author_id = 1 WHERE author_id IS NULL")


def downgrade():
    # Remove indexes
    op.drop_index('ix_articles_region_code', table_name='articles')
    op.drop_index('ix_articles_author_id', table_name='articles')
    
    # Remove foreign key
    op.drop_constraint('articles_author_id_fkey', 'articles', type_='foreignkey')
    
    # Remove columns
    op.drop_column('articles', 'deleted_at')
    op.drop_column('articles', 'updated_at')
    op.drop_column('articles', 'rejection_reason')
    op.drop_column('articles', 'rejected_at')
    op.drop_column('articles', 'rejected_by')
    op.drop_column('articles', 'approved_at')
    op.drop_column('articles', 'approved_by')
    op.drop_column('articles', 'submitted_at')
    op.drop_column('articles', 'submitted_by')
    op.drop_column('articles', 'region_code')
    op.drop_column('articles', 'author_id')
    op.drop_column('articles', 'summary')

