"""update_park_status_enum

Revision ID: 20251022_1420
Revises: 20251022_1410
Create Date: 2025-10-22 21:20:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251022_1420'
down_revision = '20251022_1410'
branch_labels = None
depends_on = None

def upgrade():
    # Create a temporary type with the new values
    op.execute("""
    -- Create a temporary type with the new values
    CREATE TYPE park_status_new AS ENUM ('draft', 'published', 'archived');
    
    -- Add a temporary column with the new type
    ALTER TABLE parks ADD COLUMN status_new park_status_new;
    
    -- Update the temporary column with mapped values
    UPDATE parks 
    SET status_new = CASE 
        WHEN status::text = 'active' THEN 'published'::park_status_new
        WHEN status::text = 'inactive' THEN 'archived'::park_status_new
        ELSE 'draft'::park_status_new
    END;
    
    -- Drop the old column and rename the new one
    ALTER TABLE parks DROP COLUMN status;
    ALTER TABLE parks RENAME COLUMN status_new TO status;
    
    -- Drop the old type
    DROP TYPE park_status;
    
    -- Rename the new type to the original name
    ALTER TYPE park_status_new RENAME TO park_status;
    
    -- Add NOT NULL constraint
    ALTER TABLE parks ALTER COLUMN status SET NOT NULL;
    """)

def downgrade():
    # Revert to the old enum type
    op.execute("""
    -- Create the old enum type
    CREATE TYPE park_status_old AS ENUM ('active', 'inactive');
    
    -- Add a temporary column with the old type
    ALTER TABLE parks ADD COLUMN status_old park_status_old;
    
    -- Update the temporary column with mapped values
    UPDATE parks 
    SET status_old = CASE 
        WHEN status::text = 'published' THEN 'active'::park_status_old
        WHEN status::text = 'archived' THEN 'inactive'::park_status_old
        ELSE 'active'::park_status_old
    END;
    
    -- Drop the current column and rename the old one back
    ALTER TABLE parks DROP COLUMN status;
    ALTER TABLE parks RENAME COLUMN status_old TO status;
    
    -- Drop the new type
    DROP TYPE park_status;
    
    -- Rename the old type back to the original name
    ALTER TYPE park_status_old RENAME TO park_status;
    
    -- Add NOT NULL constraint
    ALTER TABLE parks ALTER COLUMN status SET NOT NULL;
    """)
