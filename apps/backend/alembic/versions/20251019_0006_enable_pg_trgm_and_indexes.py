from alembic import op


revision = "20251019_0006"
down_revision = "20251018_00055"
branch_labels = None
depends_on = None

def upgrade():
    # Enable pg_trgm
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # Useful trigram indexes for fuzzy name search
    op.execute("CREATE INDEX IF NOT EXISTS idx_flora_local_name_trgm ON flora USING GIN (local_name gin_trgm_ops)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_flora_scientific_name_trgm ON flora USING GIN (scientific_name gin_trgm_ops)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_fauna_local_name_trgm ON fauna USING GIN (local_name gin_trgm_ops)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_fauna_scientific_name_trgm ON fauna USING GIN (scientific_name gin_trgm_ops)")

def downgrade():
    op.execute("DROP INDEX IF EXISTS idx_fauna_scientific_name_trgm")
    op.execute("DROP INDEX IF EXISTS idx_fauna_local_name_trgm")
    op.execute("DROP INDEX IF EXISTS idx_flora_scientific_name_trgm")
    op.execute("DROP INDEX IF EXISTS idx_flora_local_name_trgm")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm")
