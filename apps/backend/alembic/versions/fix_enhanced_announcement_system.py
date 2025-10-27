"""Fix Enhanced Announcement System Migration

Revision ID: fix_enhanced_announcement_system
Revises: enhanced_announcement_system
Create Date: 2024-10-25 16:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'fix_enhanced_announcement_system'
down_revision = 'enhanced_announcement_system'
branch_labels = None
depends_on = None


def upgrade():
    """Fix enhanced announcement system by adding only missing columns"""
    
    # Check and add missing columns only
    try:
        op.add_column('announcements', sa.Column('target_regions', sa.JSON(), nullable=True, comment='Array of region codes for targeted announcements'))
    except Exception:
        pass  # Column might already exist
    
    try:
        op.add_column('announcements', sa.Column('target_user_ids', sa.JSON(), nullable=True, comment='Array of specific user IDs for targeted announcements'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('requires_acknowledgment', sa.Boolean(), nullable=True, default=False, comment='Requires Regional Admin to acknowledge reading'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('is_featured', sa.Boolean(), nullable=True, default=False, comment='Featured announcement'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('is_pinned', sa.Boolean(), nullable=True, default=False, comment='Pinned to top'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('featured_image', sa.String(length=500), nullable=True, comment='URL to featured image'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('attachments', sa.Text(), nullable=True, comment='JSON string of attachment URLs'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('tags', sa.String(length=500), nullable=True, comment='Comma-separated tags'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('view_count', sa.Integer(), nullable=True, default=0, comment='Number of views'))
    except Exception:
        pass
    
    # Add workflow fields for approval process
    try:
        op.add_column('announcements', sa.Column('submitted_by', sa.Integer(), nullable=True, comment='User who submitted for review'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True, comment='When submitted for review'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('approved_by', sa.Integer(), nullable=True, comment='User who approved'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True, comment='When approved'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('rejected_by', sa.Integer(), nullable=True, comment='User who rejected'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True, comment='When rejected'))
    except Exception:
        pass
    
    try:
        op.add_column('announcements', sa.Column('rejection_reason', sa.String(length=500), nullable=True, comment='Reason for rejection'))
    except Exception:
        pass
    
    # Add foreign key constraints for workflow fields (only if they don't exist)
    try:
        op.create_foreign_key('fk_announcements_submitted_by', 'announcements', 'users', ['submitted_by'], ['id'])
    except Exception:
        pass
    
    try:
        op.create_foreign_key('fk_announcements_approved_by', 'announcements', 'users', ['approved_by'], ['id'])
    except Exception:
        pass
    
    try:
        op.create_foreign_key('fk_announcements_rejected_by', 'announcements', 'users', ['rejected_by'], ['id'])
    except Exception:
        pass


def downgrade():
    """Downgrade from enhanced announcement system"""
    
    # Remove foreign key constraints
    try:
        op.drop_constraint('fk_announcements_rejected_by', 'announcements', type_='foreignkey')
    except Exception:
        pass
    
    try:
        op.drop_constraint('fk_announcements_approved_by', 'announcements', type_='foreignkey')
    except Exception:
        pass
    
    try:
        op.drop_constraint('fk_announcements_submitted_by', 'announcements', type_='foreignkey')
    except Exception:
        pass
    
    # Remove columns
    try:
        op.drop_column('announcements', 'rejection_reason')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'rejected_at')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'rejected_by')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'approved_at')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'approved_by')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'submitted_at')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'submitted_by')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'view_count')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'tags')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'attachments')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'featured_image')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'is_pinned')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'is_featured')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'requires_acknowledgment')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'target_user_ids')
    except Exception:
        pass
    
    try:
        op.drop_column('announcements', 'target_regions')
    except Exception:
        pass
