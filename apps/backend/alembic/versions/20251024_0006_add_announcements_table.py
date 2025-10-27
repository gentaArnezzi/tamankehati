"""Add announcements table

Revision ID: 20251024_0006
Revises: 20251024_0005
Create Date: 2025-01-24 21:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251024_0006'
down_revision = '20251024_0005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create announcements table
    op.create_table('announcements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('summary', sa.String(length=500), nullable=True),
        sa.Column('type', sa.Enum('news', 'announcement', 'event', 'maintenance', name='announcementtype'), nullable=False),
        sa.Column('status', sa.Enum('draft', 'published', 'archived', name='announcementstatus'), nullable=False),
        sa.Column('priority', sa.Integer(), nullable=True, comment='Priority level (0=normal, 1=high, 2=urgent)'),
        sa.Column('is_featured', sa.Boolean(), nullable=True, comment='Whether this announcement is featured'),
        sa.Column('is_pinned', sa.Boolean(), nullable=True, comment='Whether this announcement is pinned to top'),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True, comment='When the announcement was published'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True, comment='When the announcement expires'),
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
    op.create_index('ix_announcements_id', 'announcements', ['id'])
    op.create_index('ix_announcements_title', 'announcements', ['title'])
    op.create_index('ix_announcements_type', 'announcements', ['type'])
    op.create_index('ix_announcements_status', 'announcements', ['status'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_announcements_status', table_name='announcements')
    op.drop_index('ix_announcements_type', table_name='announcements')
    op.drop_index('ix_announcements_title', table_name='announcements')
    op.drop_index('ix_announcements_id', table_name='announcements')
    
    # Drop table
    op.drop_table('announcements')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS announcementtype')
    op.execute('DROP TYPE IF EXISTS announcementstatus')
