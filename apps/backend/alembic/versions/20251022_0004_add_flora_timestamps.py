"""add timestamp columns to flora

Revision ID: 20251022_0004
Revises: 20251022_0003
Create Date: 2025-10-22 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251022_0004"
down_revision = "20251022_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "flora",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.add_column(
        "flora",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("flora", "updated_at")
    op.drop_column("flora", "created_at")
