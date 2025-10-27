"""Add target_audience field to announcements

Revision ID: add_target_audience
Revises: 20251024_0007
Create Date: 2025-10-24 21:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_target_audience'
down_revision = '20251024_0007'
branch_labels = None
depends_on = None


def upgrade():
    # Add target_audience column to announcements table
    op.add_column('announcements', sa.Column('target_audience', sa.String(length=50), nullable=False, server_default='regional_admin'))


def downgrade():
    # Remove target_audience column from announcements table
    op.drop_column('announcements', 'target_audience')
