from alembic import op

revision = "20251019_0007"
down_revision = "20251019_0006"
branch_labels = None
depends_on = None

def upgrade():
    # Create functional GIN indexes for full-text search (simple config for mixed Bahasa/Latin)
    op.execute("""
    CREATE INDEX IF NOT EXISTS idx_flora_tsv_gin ON flora
    USING GIN (to_tsvector('simple', coalesce(local_name,'') || ' ' || coalesce(scientific_name,'') || ' ' || coalesce(description,'')));
    """)
    op.execute("""
    CREATE INDEX IF NOT EXISTS idx_fauna_tsv_gin ON fauna
    USING GIN (to_tsvector('simple', coalesce(local_name,'') || ' ' || coalesce(scientific_name,'') || ' ' || coalesce(description,'')));
    """)

def downgrade():
    op.execute("DROP INDEX IF EXISTS idx_fauna_tsv_gin")
    op.execute("DROP INDEX IF EXISTS idx_flora_tsv_gin")
