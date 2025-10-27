"""Add news table

Revision ID: 20251024_0007
Revises: 20251024_0006
Create Date: 2025-01-24 21:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251024_0007'
down_revision = '20251024_0006'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create news table
    op.create_table('news',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('summary', sa.String(length=500), nullable=True),
        sa.Column('slug', sa.String(length=255), nullable=True),
        sa.Column('category', sa.Enum('biodiversity', 'conservation', 'research', 'education', 'events', 'general', name='newscategory'), nullable=False),
        sa.Column('status', sa.Enum('draft', 'published', 'archived', name='newsstatus'), nullable=False),
        sa.Column('priority', sa.Integer(), nullable=True, comment='Priority level (0=normal, 1=high, 2=urgent)'),
        sa.Column('is_featured', sa.Boolean(), nullable=True, comment='Whether this news is featured'),
        sa.Column('is_pinned', sa.Boolean(), nullable=True, comment='Whether this news is pinned to top'),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True, comment='When the news was published'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True, comment='When the news expires'),
        sa.Column('author_id', sa.Integer(), nullable=True),
        sa.Column('submitted_by', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_by', sa.Integer(), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.String(length=500), nullable=True),
        sa.Column('featured_image', sa.String(length=500), nullable=True, comment='URL to featured image'),
        sa.Column('attachments', sa.Text(), nullable=True, comment='JSON string of attachment URLs'),
        sa.Column('tags', sa.String(length=500), nullable=True, comment='Comma-separated tags'),
        sa.Column('view_count', sa.Integer(), nullable=True, comment='Number of views'),
        sa.Column('reading_time', sa.Integer(), nullable=True, comment='Estimated reading time in minutes'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['rejected_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['submitted_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_news_id', 'news', ['id'])
    op.create_index('ix_news_title', 'news', ['title'])
    op.create_index('ix_news_slug', 'news', ['slug'])
    op.create_index('ix_news_category', 'news', ['category'])
    op.create_index('ix_news_status', 'news', ['status'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_news_status', table_name='news')
    op.drop_index('ix_news_category', table_name='news')
    op.drop_index('ix_news_slug', table_name='news')
    op.drop_index('ix_news_title', table_name='news')
    op.drop_index('ix_news_id', table_name='news')
    
    # Drop table
    op.drop_table('news')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS newscategory')
    op.execute('DROP TYPE IF EXISTS newsstatus')
