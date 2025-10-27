"""create notifications table

Revision ID: 20251026_0001
Revises: 
Create Date: 2025-10-26

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251026_0001_notifications'
down_revision = None  # Set this to the latest migration ID in your project
branch_labels = None
depends_on = None


def upgrade():
    # Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('to_user_id', sa.Integer(), nullable=False, index=True),
        sa.Column('from_user_id', sa.Integer(), nullable=True, index=True),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('resource', sa.String(100), nullable=True),
        sa.Column('resource_id', sa.Integer(), nullable=True),
        sa.Column('region_code', sa.String(10), nullable=True, index=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    
    # Create indexes
    op.create_index('ix_notifications_to_user_id', 'notifications', ['to_user_id'])
    op.create_index('ix_notifications_from_user_id', 'notifications', ['from_user_id'])
    op.create_index('ix_notifications_region_code', 'notifications', ['region_code'])
    op.create_index('ix_notifications_is_read', 'notifications', ['is_read'])
    op.create_index('ix_notifications_created_at', 'notifications', ['created_at'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_notifications_created_at', table_name='notifications')
    op.drop_index('ix_notifications_is_read', table_name='notifications')
    op.drop_index('ix_notifications_region_code', table_name='notifications')
    op.drop_index('ix_notifications_from_user_id', table_name='notifications')
    op.drop_index('ix_notifications_to_user_id', table_name='notifications')
    
    # Drop table
    op.drop_table('notifications')




