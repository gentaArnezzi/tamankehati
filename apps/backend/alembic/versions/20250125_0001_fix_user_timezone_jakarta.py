"""Fix user timestamps to use Jakarta timezone

Revision ID: 20250125_0001_fix_user_timezone_jakarta
Revises: 
Create Date: 2025-01-25 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = '20250125_0001_fix_user_timezone_jakarta'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Set timezone to Asia/Jakarta and update existing timestamps"""
    # Set timezone to Asia/Jakarta for the session
    op.execute(text("SET timezone = 'Asia/Jakarta'"))
    
    # Update existing user timestamps to Jakarta timezone
    # Convert timestamps to proper Jakarta timezone format
    op.execute(text("""
        UPDATE users 
        SET created_at = timezone('Asia/Jakarta', created_at AT TIME ZONE 'UTC'),
            updated_at = timezone('Asia/Jakarta', updated_at AT TIME ZONE 'UTC')
        WHERE created_at IS NOT NULL
    """))


def downgrade():
    """Revert timezone changes"""
    # Convert Jakarta timestamps back to UTC
    op.execute(text("""
        UPDATE users 
        SET created_at = created_at AT TIME ZONE 'Asia/Jakarta' AT TIME ZONE 'UTC',
            updated_at = updated_at AT TIME ZONE 'Asia/Jakarta' AT TIME ZONE 'UTC'
        WHERE created_at IS NOT NULL
    """))
