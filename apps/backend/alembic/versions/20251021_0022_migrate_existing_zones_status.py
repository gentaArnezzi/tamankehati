"""migrate existing zones to approved status

Revision ID: 20251021_0022
Revises: 20251021_0021
Create Date: 2025-10-21 22:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20251021_0022"
down_revision = "20251021_0021"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # Update NULL status values to approved
    conn.execute(
        sa.text("UPDATE zones SET status = 'approved'::zone_status, approved_at = now() WHERE status IS NULL")
    )

    # Update draft status to approved
    conn.execute(
        sa.text("UPDATE zones SET status = 'approved'::zone_status WHERE status = 'draft'::zone_status")
    )


def downgrade() -> None:
    conn = op.get_bind()

    # Revert approved status back to draft
    conn.execute(
        sa.text("UPDATE zones SET status = 'draft'::zone_status WHERE status = 'approved'::zone_status")
    )
