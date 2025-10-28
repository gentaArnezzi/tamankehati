"""merge_heads

Revision ID: bc293e49d17a
Revises: 20250125_0001_fix_user_timezone_jakarta, 20251026_0001_notifications, 52fb0e4a18a9, add_submitted_by_zones
Create Date: 2025-10-28 14:59:54.447380

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bc293e49d17a'
down_revision = ('20250125_0001_fix_user_timezone_jakarta', '20251026_0001_notifications', '52fb0e4a18a9', 'add_submitted_by_zones')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
