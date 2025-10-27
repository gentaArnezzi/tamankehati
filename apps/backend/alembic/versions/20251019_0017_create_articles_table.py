# apps/backend/alembic/versions/20251019_0017_create_articles_table.py
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251019_0017"
down_revision = "20251019_0016"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "articles",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("region_code", sa.String(length=20), nullable=True),
        sa.Column("author_id", sa.Integer, sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_articles_region", "articles", ["region_code"])

def downgrade():
    op.drop_index("ix_articles_region", table_name="articles")
    op.drop_table("articles")
