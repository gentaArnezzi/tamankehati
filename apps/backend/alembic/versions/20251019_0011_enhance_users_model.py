# apps/backend/alembic/versions/20251019_0011_enhance_users_model.py
"""enhance_users_model

Revision ID: 20251019_0011
Revises: 20251019_00105
Create Date: 2025-10-19 07:58:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251019_0011"
down_revision = "20251019_0010"
branch_labels = None
depends_on = None

def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return any(col["name"] == column_name for col in inspector.get_columns(table_name))


def _has_index(inspector, table_name: str, index_name: str) -> bool:
    return any(idx["name"] == index_name for idx in inspector.get_indexes(table_name))


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("users"):
        raise RuntimeError("users table must exist before running this migration")

    if _has_column(inspector, "users", "hashed_password") and not _has_column(inspector, "users", "password_hash"):
        op.alter_column("users", "hashed_password", new_column_name="password_hash")
        inspector = sa.inspect(bind)  # refresh column cache

    if not _has_column(inspector, "users", "password_hash"):
        op.add_column(
            "users",
            sa.Column("password_hash", sa.String(255), nullable=False, server_default=""),
        )
        inspector = sa.inspect(bind)

    if not _has_column(inspector, "users", "display_name"):
        op.add_column("users", sa.Column("display_name", sa.String(255), nullable=True))
        inspector = sa.inspect(bind)

    if not _has_column(inspector, "users", "is_active"):
        op.add_column(
            "users",
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        )
        inspector = sa.inspect(bind)

    if not _has_column(inspector, "users", "created_at"):
        op.add_column(
            "users",
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        )
        inspector = sa.inspect(bind)

    if not _has_index(inspector, "users", "ix_users_email_unique"):
        op.create_index("ix_users_email_unique", "users", ["email"], unique=True)

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

    if _has_index(inspector, "users", "ix_users_email_unique"):
        op.drop_index("ix_users_email_unique", "users")
        inspector = sa.inspect(bind)

    if _has_column(inspector, "users", "password_hash"):
        if not _has_column(inspector, "users", "hashed_password"):
            op.alter_column("users", "password_hash", new_column_name="hashed_password")
        else:
            op.drop_column("users", "password_hash")
        inspector = sa.inspect(bind)

    for column in ["created_at", "is_active", "display_name"]:
        if _has_column(inspector, "users", column):
            op.drop_column("users", column)
            inspector = sa.inspect(bind)
