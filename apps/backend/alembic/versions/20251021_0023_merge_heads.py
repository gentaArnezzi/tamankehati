"""merge heads 20251019_00105 and 20251021_0022

Revision ID: 20251021_0023
Revises: 20251019_00105, 20251021_0022
Create Date: 2025-10-21 23:10:00.000000
"""

from alembic import op  # noqa: F401


# revision identifiers, used by Alembic.
revision = "20251021_0023"
down_revision = ("20251019_00105", "20251021_0022")
branch_labels = None
depends_on = None


def upgrade() -> None:
    """No-op merge."""
    pass


def downgrade() -> None:
    """No-op merge."""
    pass
