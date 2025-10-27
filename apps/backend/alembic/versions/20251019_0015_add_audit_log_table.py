# apps/backend/alembic/versions/20251019_0015_add_audit_log_table.py
"""add_audit_log_table

Revision ID: 20251019_0015
Revises: 20251019_0014
Create Date: 2025-10-19 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251019_0015"
down_revision = "20251019_0014"
branch_labels = None
depends_on = None

def upgrade():
    # Create audit_log table for tracking actions
    op.create_table('audit_log',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=False),
        sa.Column('actor_role', sa.String(50), nullable=False),
        sa.Column('actor_region_code', sa.String(10), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('resource_type', sa.String(100), nullable=False),
        sa.Column('resource_id', sa.Integer(), nullable=True),
        sa.Column('old_values', sa.JSON(), nullable=True),
        sa.Column('new_values', sa.JSON(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('ix_audit_log_actor_id', 'audit_log', ['actor_id'])
    op.create_index('ix_audit_log_actor_region_code', 'audit_log', ['actor_region_code'])
    op.create_index('ix_audit_log_resource_id', 'audit_log', ['resource_id'])
    op.create_index('ix_audit_log_created_at', 'audit_log', ['created_at'])

def downgrade():
    # Drop indexes
    op.drop_index('ix_audit_log_created_at', 'audit_log')
    op.drop_index('ix_audit_log_resource_id', 'audit_log')
    op.drop_index('ix_audit_log_actor_region_code', 'audit_log')
    op.drop_index('ix_audit_log_actor_id', 'audit_log')

    # Drop table
    op.drop_table('audit_log')
