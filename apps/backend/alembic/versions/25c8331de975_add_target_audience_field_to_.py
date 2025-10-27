"""Add target_audience field to announcements

Revision ID: 25c8331de975
Revises: 20251024_0007
Create Date: 2025-10-25 10:19:16.415279

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '25c8331de975'
down_revision = '20251024_0007'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Only add the target_audience column to announcements table
    op.add_column('announcements', sa.Column('target_audience', sa.String(length=50), nullable=False, server_default='regional_admin', comment='Target audience: super_admin, regional_admin'))


def downgrade() -> None:
    # Only drop the target_audience column from announcements table
    op.drop_column('announcements', 'target_audience')
