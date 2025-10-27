"""Add missing workflow columns to zones table

This migration adds the workflow columns that were missing from the zones table
after the geospatial restructuring migration.

Revision ID: 20251022_0003
Revises: 20251022_0002
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = "20251022_0003"
down_revision = "20251022_0002"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add missing workflow columns to zones table
    op.add_column("zones", sa.Column("status", sa.String(20), nullable=False, server_default="draft"))
    op.add_column("zones", sa.Column("submitted_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True))
    op.add_column("zones", sa.Column("approved_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True))
    op.add_column("zones", sa.Column("rejected_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True))
    op.add_column("zones", sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("zones", sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("zones", sa.Column("rejected_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("zones", sa.Column("rejection_reason", sa.Text(), nullable=True))
    op.add_column("zones", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.add_column("zones", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))

    # Update the created_at and updated_at for existing records
    op.execute("""
        UPDATE zones
        SET created_at = now(), updated_at = now()
        WHERE created_at IS NULL OR updated_at IS NULL
    """)

def downgrade() -> None:
    # Remove the columns in reverse order
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
