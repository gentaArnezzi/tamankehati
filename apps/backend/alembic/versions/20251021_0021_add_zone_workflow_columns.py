"""add workflow columns to zones table

Revision ID: 20251021_0021
Revises: 20251020_0020
Create Date: 2025-10-21 20:45:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20251021_0021"
down_revision = "20251020_0020"
branch_labels = None
depends_on = None


zone_status_enum = sa.Enum(
    "draft",
    "in_review",
    "approved",
    "rejected",
    name="zone_status",
)


def upgrade() -> None:
    # Ensure enum exists before adding column (idempotent for reruns)
    zone_status_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "zones",
        sa.Column(
            "status",
            zone_status_enum,
            nullable=False,
            server_default="draft",
        ),
    )
    op.add_column("zones", sa.Column("submitted_by", sa.Integer(), nullable=True))
    op.add_column("zones", sa.Column("approved_by", sa.Integer(), nullable=True))
    op.add_column("zones", sa.Column("rejected_by", sa.Integer(), nullable=True))
    op.add_column(
        "zones",
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "zones",
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "zones",
        sa.Column("rejected_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column("zones", sa.Column("rejection_reason", sa.Text(), nullable=True))
    op.add_column(
        "zones",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.add_column(
        "zones",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_foreign_key(
        "zones_submitted_by_fkey",
        "zones",
        "users",
        ["submitted_by"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "zones_approved_by_fkey",
        "zones",
        "users",
        ["approved_by"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "zones_rejected_by_fkey",
        "zones",
        "users",
        ["rejected_by"],
        ["id"],
        ondelete="SET NULL",
    )

    # Existing records dianggap approved agar tetap muncul di publik
    op.execute(
        "UPDATE zones SET status = 'approved'::zone_status, approved_at = NOW() WHERE status = 'draft'::zone_status"
    )


def downgrade() -> None:
    op.drop_constraint("zones_rejected_by_fkey", "zones", type_="foreignkey")
    op.drop_constraint("zones_approved_by_fkey", "zones", type_="foreignkey")
    op.drop_constraint("zones_submitted_by_fkey", "zones", type_="foreignkey")

    op.drop_column("zones", "updated_at")
    op.drop_column("zones", "created_at")
    op.drop_column("zones", "rejection_reason")
    op.drop_column("zones", "rejected_at")
    op.drop_column("zones", "approved_at")
    op.drop_column("zones", "submitted_at")
    op.drop_column("zones", "rejected_by")
    op.drop_column("zones", "approved_by")
    op.drop_column("zones", "submitted_by")
    op.drop_column("zones", "status")

    zone_status_enum.drop(op.get_bind(), checkfirst=True)
