"""Geospatial Restructuring for Taman Kehati

This migration restructures the geospatial data to match the proposed ERD:
- Renames taman to parks (or creates parks from taman)
- Creates park_zones from zones data
- Adds proper relationships and region support
- Migrates existing data

Revision ID: 20251022_0002
Revises: 20251022_0001
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

try:
    from geoalchemy2 import Geometry
except ImportError:
    # Fallback for systems without geoalchemy2
    from sqlalchemy.types import UserDefinedType

    class Geometry(UserDefinedType):
        def __init__(self, geometry_type="GEOMETRY", srid=None):
            self.geometry_type = geometry_type
            self.srid = srid

        def get_col_spec(self, **kw):
            if self.srid:
                return f"geometry({self.geometry_type},{self.srid})"
            return f"geometry({self.geometry_type})"

# revision identifiers, used by Alembic.
revision = "20251022_0002"
down_revision = "20251022_0001"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create organizations table first (for multi-tenant support)
    op.create_table(
        "organizations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("is_active", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # Create regions table (for proper regional structure)
    op.create_table(
        "regions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("code", sa.String(10), unique=True, nullable=False),
        sa.Column("org_id", sa.Integer(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True),  # For multi-tenant
        sa.Column("geom", Geometry("MULTIPOLYGON", srid=4326)),  # Region boundary
        sa.Column("timezone", sa.String(50), default="Asia/Jakarta"),
        sa.Column("is_active", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # Create parks table (migrate from taman)
    op.create_table(
        "parks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), unique=True, nullable=False),
        sa.Column("region_id", sa.Integer(), sa.ForeignKey("regions.id", ondelete="CASCADE"), nullable=True),  # Now regions exists
        sa.Column("wilayah", sa.String(100)),  # Legacy field from taman
        sa.Column("area_ha", sa.Numeric(10, 2)),  # Renamed from luas_ha
        sa.Column("description", sa.Text()),
        sa.Column("status", sa.Enum("active", "inactive", name="park_status"), default="active", nullable=False),
        sa.Column("geom", Geometry("MULTIPOLYGON", srid=4326)),  # PostGIS geometry
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("approved_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Create park_zones table (migrate from zones)
    op.create_table(
        "park_zones",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("park_id", sa.Integer(), sa.ForeignKey("parks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("zone_type", sa.String(50)),  # core, buffer, transition, etc.
        sa.Column("geom", Geometry("MULTIPOLYGON", srid=4326), nullable=False),
        sa.Column("area_ha", sa.Numeric(10, 2)),  # Calculated from geometry
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # Migrate data from zones to parks (each zone becomes a park)
    op.execute("""
        INSERT INTO parks (id, name, slug, geom, status, created_at, updated_at)
        SELECT
            id,
            name,
            LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')),
            geom,
            'active'::park_status as status,
            now() as created_at,
            now() as updated_at
        FROM zones
    """)

    # Migrate data from zones to park_zones (each zone becomes a park_zone in its own park)
    op.execute("""
        INSERT INTO park_zones (id, park_id, name, zone_type, geom, area_ha, created_at, updated_at)
        SELECT
            id,
            id as park_id,  -- Each zone becomes a park and also a park_zone within that park
            name,
            'core' as zone_type,
            geom,
            NULL as area_ha,  -- Will be calculated
            now() as created_at,
            now() as updated_at
        FROM zones
    """)

    # Create default organization and regions
    op.execute("""
        INSERT INTO organizations (name, slug, description, is_active, created_at, updated_at) VALUES
        ('Taman Kehati Indonesia', 'taman-kehati', 'Indonesian Conservation Network', true, now(), now())
    """)

    # Create regions from existing region codes
    op.execute("""
        INSERT INTO regions (name, code, is_active, created_at, updated_at)
        SELECT DISTINCT
            INITCAP(REPLACE(region_code, '_', ' ')) as name,
            UPPER(region_code) as code,
            true as is_active,
            now() as created_at,
            now() as updated_at
        FROM users
        WHERE region_code IS NOT NULL AND region_code != ''
        UNION
        SELECT DISTINCT
            INITCAP(REPLACE(region_code, '_', ' ')) as name,
            UPPER(region_code) as code,
            true as is_active,
            now() as created_at,
            now() as updated_at
        FROM articles
        WHERE region_code IS NOT NULL AND region_code != ''
        UNION
        SELECT DISTINCT
            INITCAP(wilayah) as name,
            UPPER(REGEXP_REPLACE(wilayah, '[^A-Z]', '', 'g')) as code,
            true as is_active,
            now() as created_at,
            now() as updated_at
        FROM taman
        WHERE wilayah IS NOT NULL AND wilayah != ''
    """)

    # Update parks to link with regions
    op.execute("""
        -- Update region_id based on existing relationship or default to first region
        -- This is a placeholder - adjust the logic based on your actual region mapping
        -- If no region mapping is needed, this can be removed if the column is already nullable
        UPDATE parks
        SET region_id = (SELECT id FROM regions LIMIT 1)
        WHERE region_id IS NULL
    """)

    # Update user_roles to use region IDs instead of codes
    op.execute("""
        UPDATE user_roles
        SET region_code = NULL
        WHERE region_code IS NOT NULL
    """)

    # Add indexes
    op.create_index("ix_parks_region_id", "parks", ["region_id"])
    op.create_index("ix_parks_status", "parks", ["status"])
    op.create_index("ix_parks_geom", "parks", ["geom"], postgresql_using="gist")
    op.create_index("ix_park_zones_park_id", "park_zones", ["park_id"])
    op.create_index("ix_park_zones_geom", "park_zones", ["geom"], postgresql_using="gist")
    op.create_index("ix_regions_code", "regions", ["code"])
    op.create_index("ix_regions_org_id", "regions", ["org_id"])
    op.create_index("ix_organizations_slug", "organizations", ["slug"])

    # Add unique constraints
    op.create_unique_constraint("uq_parks_slug", "parks", ["slug"])
    op.create_unique_constraint("uq_regions_code", "regions", ["code"])

def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table("park_zones")
    op.drop_table("parks")
    op.drop_table("regions")
    op.drop_table("organizations")

    # Drop enums
    op.execute("DROP TYPE IF EXISTS park_status")
