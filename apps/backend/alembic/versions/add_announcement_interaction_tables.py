"""Add announcement interaction tables

Revision ID: add_announcement_interactions
Revises: 3bda5cef9547
Create Date: 2024-10-25 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'add_announcement_interactions'
down_revision = '3bda5cef9547'
branch_labels = None
depends_on = None


def upgrade():
    # Create announcement_reads table
    op.create_table('announcement_reads',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('announcement_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('read_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('acknowledged', sa.Boolean(), nullable=True),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['announcement_id'], ['announcements.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('announcement_id', 'user_id', name='idx_announcement_user_read')
    )
    
    # Create announcement_comments table
    op.create_table('announcement_comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('announcement_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('parent_comment_id', sa.Integer(), nullable=True),
        sa.Column('is_approved', sa.Boolean(), nullable=True),
        sa.Column('moderated_by', sa.Integer(), nullable=True),
        sa.Column('moderated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['announcement_id'], ['announcements.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['parent_comment_id'], ['announcement_comments.id']),
        sa.ForeignKeyConstraint(['moderated_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create announcement_reactions table
    op.create_table('announcement_reactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('announcement_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('reaction_type', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['announcement_id'], ['announcements.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('announcement_id', 'user_id', 'reaction_type', name='idx_announcement_user_reaction')
    )
    
    # Add new columns to announcements table (only if they don't exist)
    # Check if columns exist before adding them
    # op.add_column('announcements', sa.Column('target_regions', sa.JSON(), nullable=True))
    # op.add_column('announcements', sa.Column('target_user_ids', sa.JSON(), nullable=True))
    # op.add_column('announcements', sa.Column('requires_acknowledgment', sa.Boolean(), nullable=True))
    # op.add_column('announcements', sa.Column('priority', sa.String(length=20), nullable=True))
    
    # Create indexes
    op.create_index('idx_announcement_reads_user', 'announcement_reads', ['user_id'])
    op.create_index('idx_announcement_reads_announcement', 'announcement_reads', ['announcement_id'])
    op.create_index('idx_announcement_comments_announcement', 'announcement_comments', ['announcement_id'])
    op.create_index('idx_announcement_comments_user', 'announcement_comments', ['user_id'])
    op.create_index('idx_announcement_reactions_announcement', 'announcement_reactions', ['announcement_id'])
    op.create_index('idx_announcement_reactions_user', 'announcement_reactions', ['user_id'])


def downgrade():
    # Drop indexes
    op.drop_index('idx_announcement_reactions_user', table_name='announcement_reactions')
    op.drop_index('idx_announcement_reactions_announcement', table_name='announcement_reactions')
    op.drop_index('idx_announcement_comments_user', table_name='announcement_comments')
    op.drop_index('idx_announcement_comments_announcement', table_name='announcement_comments')
    op.drop_index('idx_announcement_reads_announcement', table_name='announcement_reads')
    op.drop_index('idx_announcement_reads_user', table_name='announcement_reads')
    
    # Drop new columns (commented out since we're not adding them)
    # op.drop_column('announcements', 'priority')
    # op.drop_column('announcements', 'requires_acknowledgment')
    # op.drop_column('announcements', 'target_user_ids')
    # op.drop_column('announcements', 'target_regions')
    
    # Drop tables
    op.drop_table('announcement_reactions')
    op.drop_table('announcement_comments')
    op.drop_table('announcement_reads')
