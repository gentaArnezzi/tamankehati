"""merge enhanced announcement heads

Revision ID: 52fb0e4a18a9
Revises: fix_enhanced_announcement_system, seed_announcement_data
Create Date: 2025-10-25 11:11:32.762079

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '52fb0e4a18a9'
down_revision = ('fix_enhanced_announcement_system', 'seed_announcement_data')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
