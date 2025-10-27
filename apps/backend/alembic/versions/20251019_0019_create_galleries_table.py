# apps/backend/alembic/versions/20251019_0019_create_galleries_table.py
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251019_0019"
down_revision = "20251019_0018"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "galleries",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column("author_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("region_code", sa.String(length=10), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
        sa.Column("submitted_by", sa.Integer, nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by", sa.Integer, nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejected_by", sa.Integer, nullable=True),
        sa.Column("rejected_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_galleries_region", "galleries", ["region_code"])
    op.create_index("ix_galleries_author", "galleries", ["author_id"])

def downgrade():
    op.drop_index("ix_galleries_author", table_name="galleries")
    op.drop_index("ix_galleries_region", table_name="galleries")
    op.drop_table("galleries")
