# apps/backend/alembic/versions/20251019_0010_workflow_status.py
from alembic import op

revision = "20251019_0010"
down_revision = "20251019_0008"
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='wf_status') THEN
        CREATE TYPE wf_status AS ENUM ('draft','in_review','approved','rejected');
      END IF;
    END$$;

    ALTER TABLE flora ADD COLUMN IF NOT EXISTS status wf_status NOT NULL DEFAULT 'draft';
    ALTER TABLE fauna ADD COLUMN IF NOT EXISTS status wf_status NOT NULL DEFAULT 'draft';
    ALTER TABLE flora ADD COLUMN IF NOT EXISTS submitted_by INT;
    ALTER TABLE fauna ADD COLUMN IF NOT EXISTS submitted_by INT;
    ALTER TABLE flora ADD COLUMN IF NOT EXISTS approved_by INT;
    ALTER TABLE fauna ADD COLUMN IF NOT EXISTS approved_by INT;
    ALTER TABLE flora ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
    ALTER TABLE fauna ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
    ALTER TABLE flora ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
    ALTER TABLE fauna ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
    ALTER TABLE flora ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
    ALTER TABLE fauna ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
    ALTER TABLE flora ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    ALTER TABLE fauna ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    """)
def downgrade():
    op.execute("""
    ALTER TABLE flora DROP COLUMN IF EXISTS rejection_reason;
    ALTER TABLE fauna DROP COLUMN IF EXISTS rejection_reason;
    ALTER TABLE flora DROP COLUMN IF EXISTS rejected_at;
    ALTER TABLE fauna DROP COLUMN IF EXISTS rejected_at;
    ALTER TABLE flora DROP COLUMN IF EXISTS approved_at;
    ALTER TABLE fauna DROP COLUMN IF EXISTS approved_at;
    ALTER TABLE flora DROP COLUMN IF EXISTS submitted_at;
    ALTER TABLE fauna DROP COLUMN IF EXISTS submitted_at;
    ALTER TABLE flora DROP COLUMN IF EXISTS approved_by;
    ALTER TABLE fauna DROP COLUMN IF EXISTS approved_by;
    ALTER TABLE flora DROP COLUMN IF EXISTS submitted_by;
    ALTER TABLE fauna DROP COLUMN IF EXISTS submitted_by;
    ALTER TABLE flora DROP COLUMN IF EXISTS status;
    ALTER TABLE fauna DROP COLUMN IF EXISTS status;
    DROP TYPE IF EXISTS wf_status;
    """)