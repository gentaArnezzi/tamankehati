# apps/backend/alembic/versions/20251019_0014_add_system_settings_table.py
"""add_system_settings_table

Revision ID: 20251019_0014
Revises: 20251019_0013
Create Date: 2025-10-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251019_0014"
down_revision = "20251019_0013"
branch_labels = None
depends_on = None

def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    
    # Create system_settings table for global configurations (check if it exists first)
    if not inspector.has_table('system_settings'):
        op.create_table('system_settings',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('key', sa.String(255), nullable=False),
            sa.Column('value', sa.JSON(), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('is_sensitive', sa.Boolean(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

        # Create indexes
        op.create_index('ix_system_settings_key', 'system_settings', ['key'], unique=True)

def downgrade():
    # Drop indexes
    op.drop_index('ix_system_settings_key', 'system_settings')

    # Drop table
    op.drop_table('system_settings')
