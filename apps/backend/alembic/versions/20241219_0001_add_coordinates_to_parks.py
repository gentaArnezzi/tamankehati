"""add coordinates to parks

Revision ID: 20241219_0001
Revises: bc293e49d17a
Create Date: 2024-12-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20241219_0001'
down_revision = 'bc293e49d17a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add coordinate fields to parks table
    op.add_column('parks', sa.Column('latitude', sa.Numeric(10, 8), nullable=True, comment='Latitude koordinat taman'))
    op.add_column('parks', sa.Column('longitude', sa.Numeric(11, 8), nullable=True, comment='Longitude koordinat taman'))
    
    # Create indexes for better query performance
    op.create_index('idx_parks_latitude', 'parks', ['latitude'])
    op.create_index('idx_parks_longitude', 'parks', ['longitude'])
    op.create_index('idx_parks_coordinates', 'parks', ['latitude', 'longitude'])
    
    # Add constraints to ensure valid coordinate ranges
    op.create_check_constraint('chk_latitude_range', 'parks', 'latitude IS NULL OR (latitude >= -90 AND latitude <= 90)')
    op.create_check_constraint('chk_longitude_range', 'parks', 'longitude IS NULL OR (longitude >= -180 AND longitude <= 180)')


def downgrade() -> None:
    # Drop constraints
    op.drop_constraint('chk_longitude_range', 'parks', type_='check')
    op.drop_constraint('chk_latitude_range', 'parks', type_='check')
    
    # Drop indexes
    op.drop_index('idx_parks_coordinates', 'parks')
    op.drop_index('idx_parks_longitude', 'parks')
    op.drop_index('idx_parks_latitude', 'parks')
    
    # Drop columns
    op.drop_column('parks', 'longitude')
    op.drop_column('parks', 'latitude')
