# apps/backend/alembic/versions/20251019_0013_create_users_table_complete.py
"""create_users_table_complete

Revision ID: 20251019_0013
Revises: 20251019_0012
Create Date: 2025-10-19 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251019_0013"
down_revision = "20251019_0012"
branch_labels = None
depends_on = None


def _has_table(inspector, table_name: str) -> bool:
    return inspector.has_table(table_name)


def _has_index(inspector, table_name: str, index_name: str) -> bool:
    return any(idx["name"] == index_name for idx in inspector.get_indexes(table_name))


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "users"):
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("email", sa.String(255), nullable=False),
            sa.Column("password_hash", sa.String(255), nullable=False),
            sa.Column("display_name", sa.String(255), nullable=True),
            sa.Column(
                "role",
                sa.Enum("super_admin", "regional_admin", "ranger", "volunteer", "public", name="user_role"),
                nullable=False,
            ),
            sa.Column("region_code", sa.String(10), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
        inspector = sa.inspect(bind)

    if not _has_index(inspector, "users", "ix_users_email"):
        op.create_index("ix_users_email", "users", ["email"], unique=True)

    if _has_table(inspector, "users") and not _has_index(inspector, "users", "ix_users_region_code"):
        columns = {col["name"] for col in inspector.get_columns("users")}
        if "region_code" in columns:
            op.create_index("ix_users_region_code", "users", ["region_code"])

    if _has_table(inspector, "users") and not _has_index(inspector, "users", "ix_users_role"):
        columns = {col["name"] for col in inspector.get_columns("users")}
        if "role" in columns:
            op.create_index("ix_users_role", "users", ["role"])


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "users"):
        return

    for index_name in ["ix_users_role", "ix_users_region_code", "ix_users_email"]:
        if _has_index(inspector, "users", index_name):
            op.drop_index(index_name, "users")
            inspector = sa.inspect(bind)
