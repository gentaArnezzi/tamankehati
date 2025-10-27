# apps/backend/alembic/versions/20251019_0018_enhance_articles_table.py
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251019_0018"
down_revision = "20251019_0017"
branch_labels = None
depends_on = None

def upgrade():
    # Rename 'body' column to 'content' to match the model
    op.alter_column("articles", "body", new_column_name="content")

def downgrade():
    # Reverse the column rename
    op.alter_column("articles", "content", new_column_name="body")
