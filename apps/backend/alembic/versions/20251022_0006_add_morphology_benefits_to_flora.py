"""add morphology and benefits columns to flora

Revision ID: 20251022_0006
Revises: 20251022_0005
Create Date: 2025-10-22 13:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251022_0006"
down_revision = "20251022_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("flora", sa.Column("morphology", sa.Text(), nullable=True))
    op.add_column("flora", sa.Column("benefits", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("flora", "benefits")
    op.drop_column("flora", "morphology")
