"""add_otp_table

Revision ID: add_otp_table_001
Revises: 795ca4608cd2
Create Date: 2025-11-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_otp_table_001'
down_revision: Union[str, None] = '795ca4608cd2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create OTP table for one-time password authentication."""
    op.create_table(
        'otps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=6), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for faster lookups
    op.create_index('ix_otps_email', 'otps', ['email'])
    op.create_index('idx_otp_email_code', 'otps', ['email', 'code'])
    op.create_index('idx_otp_email_active', 'otps', ['email', 'used', 'expires_at'])


def downgrade() -> None:
    """Drop OTP table."""
    op.drop_index('idx_otp_email_active', table_name='otps')
    op.drop_index('idx_otp_email_code', table_name='otps')
    op.drop_index('ix_otps_email', table_name='otps')
    op.drop_table('otps')

