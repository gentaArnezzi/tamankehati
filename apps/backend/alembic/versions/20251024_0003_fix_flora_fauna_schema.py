"""fix flora fauna schema issues

Revision ID: 20251024_0003
Revises: 20251024_0002
Create Date: 2025-10-24 03:40:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251024_0003'
down_revision = '20251024_0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make the old 'name' column nullable in flora table
    op.alter_column('flora', 'name', nullable=True)
    
    # Make the old 'name' column nullable in fauna table  
    op.alter_column('fauna', 'name', nullable=True)
    
    # Update existing records to populate the name column with local_name or scientific_name
    op.execute("UPDATE flora SET name = COALESCE(local_name, scientific_name) WHERE name IS NULL")
    op.execute("UPDATE fauna SET name = COALESCE(local_name, scientific_name) WHERE name IS NULL")


def downgrade() -> None:
    # Make the name columns NOT NULL again
    op.alter_column('flora', 'name', nullable=False)
    op.alter_column('fauna', 'name', nullable=False)
