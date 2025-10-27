# apps/backend/alembic/versions/20251019_0012_add_missing_user_columns_role_region_updated_at.py
"""add_missing_user_columns_role_region_updated_at

Revision ID: 20251019_0012
Revises: 20251019_0011
Create Date: 2025-10-19 08:49:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251019_0012"
down_revision = "20251019_0011"
branch_labels = None
depends_on = None

def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return any(col["name"] == column_name for col in inspector.get_columns(table_name))


def _has_index(inspector, table_name: str, index_name: str) -> bool:
    return any(idx["name"] == index_name for idx in inspector.get_indexes(table_name))


def _has_enum(name: str, bind) -> bool:
    result = bind.execute(
        sa.text("SELECT 1 FROM pg_type WHERE typname = :name"),
        {"name": name},
    )
    return result.scalar() is not None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("users"):
        raise RuntimeError("users table must exist before running this migration")

    if not _has_enum("user_role", bind):
        sa.Enum(
            "super_admin",
            "regional_admin",
            "ranger",
            "volunteer",
            "public",
            name="user_role",
        ).create(bind, checkfirst=True)

    if not _has_column(inspector, "users", "role"):
        op.add_column(
            "users",
            sa.Column(
                "role",
                sa.Enum(
                    "super_admin",
                    "regional_admin",
                    "ranger",
                    "volunteer",
                    "public",
                    name="user_role",
                ),
                nullable=False,
                server_default="public",
            ),
        )
        inspector = sa.inspect(bind)

    if not _has_column(inspector, "users", "region_code"):
        op.add_column("users", sa.Column("region_code", sa.String(10), nullable=True))
        inspector = sa.inspect(bind)

    if not _has_column(inspector, "users", "updated_at"):
        op.add_column(
            "users",
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        )
        inspector = sa.inspect(bind)

    if _has_column(inspector, "users", "region_code") and not _has_index(inspector, "users", "ix_users_region_code"):
        op.create_index("ix_users_region_code", "users", ["region_code"])

def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("users"):
        return

    if _has_index(inspector, "users", "ix_users_region_code"):
        op.drop_index("ix_users_region_code", "users")
        inspector = sa.inspect(bind)

    for column in ["updated_at", "region_code", "role"]:
        if _has_column(inspector, "users", column):
            op.drop_column("users", column)
            inspector = sa.inspect(bind)

    if _has_enum("user_role", bind):
        bind.execute(sa.text("DROP TYPE IF EXISTS user_role"))
