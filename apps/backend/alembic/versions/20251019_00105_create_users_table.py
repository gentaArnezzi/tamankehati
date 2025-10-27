"""create initial users table

Revision ID: 20251019_00105
Revises: 20251019_0010
Create Date: 2025-10-19 08:10:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251019_00105"
down_revision = "20251019_0010"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("region_code", sa.String(length=10), nullable=True),
    )


def downgrade():
    op.drop_table("users")
