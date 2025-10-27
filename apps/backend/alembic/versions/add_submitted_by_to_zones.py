"""add submitted_by to zones

Revision ID: add_submitted_by_zones
Revises: 
Create Date: 2025-10-24 17:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_submitted_by_zones'
down_revision = '20251024_0005'  # Point to the latest migration
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add submitted_by column to park_zones table
    op.add_column('park_zones', 
        sa.Column('submitted_by', sa.Integer(), nullable=True, comment='User who submitted/created this zone')
    )
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_park_zones_submitted_by_users',
        'park_zones', 
        'users',
        ['submitted_by'], 
        ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    # Drop foreign key constraint
    op.drop_constraint('fk_park_zones_submitted_by_users', 'park_zones', type_='foreignkey')
    
    # Drop submitted_by column
    op.drop_column('park_zones', 'submitted_by')

