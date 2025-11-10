"""add_class_to_flora_fauna

Revision ID: add_class_flora_fauna_001
Revises: add_otp_table_001
Create Date: 2025-11-09 16:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_class_flora_fauna_001'
down_revision: Union[str, None] = 'add_otp_table_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add class column to flora and fauna tables."""
    # Add class column to flora table
    op.add_column('flora', sa.Column('class', sa.String(length=100), nullable=True))
    
    # Add class column to fauna table
    op.add_column('fauna', sa.Column('class', sa.String(length=100), nullable=True))


def downgrade() -> None:
    """Remove class column from flora and fauna tables."""
    # Remove class column from fauna table
    op.drop_column('fauna', 'class')
    
    # Remove class column from flora table
    op.drop_column('flora', 'class')

