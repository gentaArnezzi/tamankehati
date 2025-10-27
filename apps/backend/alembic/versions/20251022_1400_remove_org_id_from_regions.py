"""remove_org_id_from_regions

Revision ID: 20251022_1400
Revises: 20251022_1350
Create Date: 2025-10-22 21:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251022_1400'
down_revision = '20251022_1350'
branch_labels = None
depends_on = None


def upgrade():
    # Drop the foreign key constraint first
    op.execute("""
        ALTER TABLE regions 
        DROP CONSTRAINT IF EXISTS regions_org_id_fkey;
    """)
    
    # Drop the index on org_id if it exists
    op.execute("""
        DROP INDEX IF EXISTS ix_regions_org_id;
    """)
    
    # Drop the org_id column
    op.execute("""
        ALTER TABLE regions 
        DROP COLUMN IF EXISTS org_id;
    """)


def downgrade():
    # Add the org_id column back (nullable at first)
    op.add_column('regions', sa.Column('org_id', sa.Integer(), nullable=True))
    
    # Create the index
    op.create_index('ix_regions_org_id', 'regions', ['org_id'])
    
    # Note: You'll need to manually repopulate the org_id values if needed
    # as we can't automatically determine the original values in the downgrade
