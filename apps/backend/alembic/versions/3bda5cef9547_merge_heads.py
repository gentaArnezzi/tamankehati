"""merge_heads

Revision ID: 3bda5cef9547
Revises: 25c8331de975, add_target_audience
Create Date: 2025-10-25 10:45:50.474296

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3bda5cef9547'
down_revision = ('25c8331de975', 'add_target_audience')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
