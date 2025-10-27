# apps/backend/alembic/versions/20251019_0016_add_soft_delete_to_flora_fauna.py
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251019_0016"
down_revision = "20251019_0015"
branch_labels = None
depends_on = None

def upgrade():
    # flora
    op.add_column(
        "flora",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    # fauna
    op.add_column(
        "fauna",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

def downgrade():
    op.drop_column("fauna", "deleted_at")
    op.drop_column("flora", "deleted_at")
