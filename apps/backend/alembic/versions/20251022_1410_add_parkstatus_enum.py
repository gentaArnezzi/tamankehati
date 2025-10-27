"""add_parkstatus_enum

Revision ID: 20251022_1410
Revises: 20251022_1400
Create Date: 2025-10-22 21:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251022_1410'
down_revision = '20251022_1400'
branch_labels = None
depends_on = None

def upgrade():
    # Check if the column already exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [column['name'] for column in inspector.get_columns('parks')]
    
    # Create the ENUM type
    parkstatus = postgresql.ENUM(
        'draft', 'published', 'archived',
        name='parkstatus',
        create_type=True
    )
    parkstatus.create(op.get_bind(), checkfirst=True)
    
    # Add the column if it doesn't exist
    if 'status' not in columns:
        op.add_column('parks', 
                     sa.Column('status', 
                              sa.Enum('draft', 'published', 'archived', 
                                     name='parkstatus'),
                              nullable=False, 
                              server_default='draft'))
        print("Successfully added 'status' column to 'parks' table")
    else:
        print("'status' column already exists in 'parks' table, skipping")

def downgrade():
    # Drop the column
    op.drop_column('parks', 'status')
    
    # Drop the ENUM type
    op.execute('DROP TYPE IF EXISTS parkstatus')
    print("Dropped 'status' column and 'parkstatus' type")
