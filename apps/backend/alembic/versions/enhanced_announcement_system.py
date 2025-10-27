"""Enhanced Announcement System Migration

Revision ID: enhanced_announcement_system
Revises: add_announcement_interactions
Create Date: 2024-10-25 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'enhanced_announcement_system'
down_revision = 'add_announcement_interactions'
branch_labels = None
depends_on = None


def upgrade():
    """Upgrade to enhanced announcement system"""
    
    # Add new columns to announcements table for enhanced features
    op.add_column('announcements', sa.Column('target_regions', sa.JSON(), nullable=True, comment='Array of region codes for targeted announcements'))
    op.add_column('announcements', sa.Column('target_user_ids', sa.JSON(), nullable=True, comment='Array of specific user IDs for targeted announcements'))
    op.add_column('announcements', sa.Column('requires_acknowledgment', sa.Boolean(), nullable=True, default=False, comment='Requires Regional Admin to acknowledge reading'))
    op.add_column('announcements', sa.Column('priority', sa.String(length=20), nullable=True, default='normal', comment='Priority level'))
    op.add_column('announcements', sa.Column('is_featured', sa.Boolean(), nullable=True, default=False, comment='Featured announcement'))
    op.add_column('announcements', sa.Column('is_pinned', sa.Boolean(), nullable=True, default=False, comment='Pinned to top'))
    op.add_column('announcements', sa.Column('featured_image', sa.String(length=500), nullable=True, comment='URL to featured image'))
    op.add_column('announcements', sa.Column('attachments', sa.Text(), nullable=True, comment='JSON string of attachment URLs'))
    op.add_column('announcements', sa.Column('tags', sa.String(length=500), nullable=True, comment='Comma-separated tags'))
    op.add_column('announcements', sa.Column('view_count', sa.Integer(), nullable=True, default=0, comment='Number of views'))
    
    # Add workflow fields for approval process
    op.add_column('announcements', sa.Column('submitted_by', sa.Integer(), nullable=True, comment='User who submitted for review'))
    op.add_column('announcements', sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True, comment='When submitted for review'))
    op.add_column('announcements', sa.Column('approved_by', sa.Integer(), nullable=True, comment='User who approved'))
    op.add_column('announcements', sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True, comment='When approved'))
    op.add_column('announcements', sa.Column('rejected_by', sa.Integer(), nullable=True, comment='User who rejected'))
    op.add_column('announcements', sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True, comment='When rejected'))
    op.add_column('announcements', sa.Column('rejection_reason', sa.String(length=500), nullable=True, comment='Reason for rejection'))
    
    # Add foreign key constraints for workflow fields
    op.create_foreign_key('fk_announcements_submitted_by', 'announcements', 'users', ['submitted_by'], ['id'])
    op.create_foreign_key('fk_announcements_approved_by', 'announcements', 'users', ['approved_by'], ['id'])
    op.create_foreign_key('fk_announcements_rejected_by', 'announcements', 'users', ['rejected_by'], ['id'])
    
    # Create indexes for better performance
    op.create_index('idx_announcements_priority', 'announcements', ['priority'])
    op.create_index('idx_announcements_is_featured', 'announcements', ['is_featured'])
    op.create_index('idx_announcements_is_pinned', 'announcements', ['is_pinned'])
    op.create_index('idx_announcements_requires_acknowledgment', 'announcements', ['requires_acknowledgment'])
    op.create_index('idx_announcements_target_audience', 'announcements', ['target_audience'])
    op.create_index('idx_announcements_published_at', 'announcements', ['published_at'])
    op.create_index('idx_announcements_expires_at', 'announcements', ['expires_at'])
    
    # Create composite indexes for common queries
    op.create_index('idx_announcements_status_published_at', 'announcements', ['status', 'published_at'])
    op.create_index('idx_announcements_priority_published_at', 'announcements', ['priority', 'published_at'])
    op.create_index('idx_announcements_is_pinned_published_at', 'announcements', ['is_pinned', 'published_at'])
    
    # Add triggers for automatic timestamp updates
    op.execute("""
        CREATE OR REPLACE FUNCTION update_announcement_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)
    
    op.execute("""
        CREATE TRIGGER update_announcements_updated_at
        BEFORE UPDATE ON announcements
        FOR EACH ROW
        EXECUTE FUNCTION update_announcement_updated_at();
    """)
    
    # Add function to automatically update view count
    op.execute("""
        CREATE OR REPLACE FUNCTION increment_announcement_view_count(announcement_id INTEGER)
        RETURNS VOID AS $$
        BEGIN
            UPDATE announcements 
            SET view_count = view_count + 1 
            WHERE id = announcement_id;
        END;
        $$ language 'plpgsql';
    """)
    
    # Add function to get announcement analytics
    op.execute("""
        CREATE OR REPLACE FUNCTION get_announcement_analytics(announcement_id INTEGER)
        RETURNS TABLE (
            read_count BIGINT,
            acknowledged_count BIGINT,
            comment_count BIGINT,
            reaction_count BIGINT,
            acknowledgment_rate NUMERIC,
            engagement_rate NUMERIC
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                COALESCE(ar.read_count, 0) as read_count,
                COALESCE(ar.acknowledged_count, 0) as acknowledged_count,
                COALESCE(ac.comment_count, 0) as comment_count,
                COALESCE(ar2.reaction_count, 0) as reaction_count,
                CASE 
                    WHEN COALESCE(ar.read_count, 0) > 0 
                    THEN COALESCE(ar.acknowledged_count, 0)::NUMERIC / ar.read_count::NUMERIC
                    ELSE 0 
                END as acknowledgment_rate,
                CASE 
                    WHEN COALESCE(ar.read_count, 0) > 0 
                    THEN (COALESCE(ac.comment_count, 0) + COALESCE(ar2.reaction_count, 0))::NUMERIC / ar.read_count::NUMERIC
                    ELSE 0 
                END as engagement_rate
            FROM (
                SELECT 
                    COUNT(*) as read_count,
                    COUNT(CASE WHEN acknowledged = true THEN 1 END) as acknowledged_count
                FROM announcement_reads 
                WHERE announcement_reads.announcement_id = $1
            ) ar
            CROSS JOIN (
                SELECT COUNT(*) as comment_count
                FROM announcement_comments 
                WHERE announcement_comments.announcement_id = $1 
                AND deleted_at IS NULL
            ) ac
            CROSS JOIN (
                SELECT COUNT(*) as reaction_count
                FROM announcement_reactions 
                WHERE announcement_reactions.announcement_id = $1
            ) ar2;
        END;
        $$ language 'plpgsql';
    """)


def downgrade():
    """Downgrade from enhanced announcement system"""
    
    # Remove triggers and functions
    op.execute("DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;")
    op.execute("DROP FUNCTION IF EXISTS update_announcement_updated_at();")
    op.execute("DROP FUNCTION IF EXISTS increment_announcement_view_count(INTEGER);")
    op.execute("DROP FUNCTION IF EXISTS get_announcement_analytics(INTEGER);")
    
    # Remove indexes
    op.drop_index('idx_announcements_status_published_at', table_name='announcements')
    op.drop_index('idx_announcements_priority_published_at', table_name='announcements')
    op.drop_index('idx_announcements_is_pinned_published_at', table_name='announcements')
    op.drop_index('idx_announcements_expires_at', table_name='announcements')
    op.drop_index('idx_announcements_published_at', table_name='announcements')
    op.drop_index('idx_announcements_target_audience', table_name='announcements')
    op.drop_index('idx_announcements_requires_acknowledgment', table_name='announcements')
    op.drop_index('idx_announcements_is_pinned', table_name='announcements')
    op.drop_index('idx_announcements_is_featured', table_name='announcements')
    op.drop_index('idx_announcements_priority', table_name='announcements')
    
    # Remove foreign key constraints
    op.drop_constraint('fk_announcements_rejected_by', 'announcements', type_='foreignkey')
    op.drop_constraint('fk_announcements_approved_by', 'announcements', type_='foreignkey')
    op.drop_constraint('fk_announcements_submitted_by', 'announcements', type_='foreignkey')
    
    # Remove columns
    op.drop_column('announcements', 'rejection_reason')
    op.drop_column('announcements', 'rejected_at')
    op.drop_column('announcements', 'rejected_by')
    op.drop_column('announcements', 'approved_at')
    op.drop_column('announcements', 'approved_by')
    op.drop_column('announcements', 'submitted_at')
    op.drop_column('announcements', 'submitted_by')
    op.drop_column('announcements', 'view_count')
    op.drop_column('announcements', 'tags')
    op.drop_column('announcements', 'attachments')
    op.drop_column('announcements', 'featured_image')
    op.drop_column('announcements', 'is_pinned')
    op.drop_column('announcements', 'is_featured')
    op.drop_column('announcements', 'priority')
    op.drop_column('announcements', 'requires_acknowledgment')
    op.drop_column('announcements', 'target_user_ids')
    op.drop_column('announcements', 'target_regions')
