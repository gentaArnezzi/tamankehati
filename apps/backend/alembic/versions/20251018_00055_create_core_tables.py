"""create core spatial and biodiversity tables

Revision ID: 20251018_00055
Revises: 20251018_0005
Create Date: 2025-10-18 00:05:30.000000
"""

from alembic import op
import sqlalchemy as sa
from typing import Optional

try:
    from geoalchemy2 import Geometry  # type: ignore
except ModuleNotFoundError:
    from sqlalchemy.types import UserDefinedType

    class Geometry(UserDefinedType):  # pragma: no cover - fallback for migrations
        def __init__(self, geometry_type: str = "GEOMETRY", srid: Optional[int] = None):
            self.geometry_type = geometry_type
            self.srid = srid

        def get_col_spec(self, **_kw):
            if self.srid is not None:
                return f"geometry({self.geometry_type},{self.srid})"
            return f"geometry({self.geometry_type})"


# revision identifiers, used by Alembic.
revision = "20251018_00055"
down_revision = "20251018_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Skip PostGIS extension creation for Railway compatibility
    # op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    if not inspector.has_table("zones"):
        op.create_table(
            "zones",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("region_code", sa.String(length=50), nullable=False),
            sa.Column("geom", sa.Text(), nullable=True),  # Store as text for Railway compatibility
        )

    if not inspector.has_table("flora"):
        op.create_table(
            "flora",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("zone_id", sa.Integer(), sa.ForeignKey("zones.id", ondelete="CASCADE"), nullable=False),
            sa.Column("local_name", sa.String(length=255), nullable=True),
            sa.Column("scientific_name", sa.String(length=255), nullable=True),
            sa.Column("family", sa.String(length=255), nullable=True),
            sa.Column("genus", sa.String(length=255), nullable=True),
            sa.Column("description", sa.Text(), nullable=True),
        )
        op.create_index("ix_flora_zone_id", "flora", ["zone_id"])

    if not inspector.has_table("fauna"):
        op.create_table(
            "fauna",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("zone_id", sa.Integer(), sa.ForeignKey("zones.id", ondelete="CASCADE"), nullable=False),
            sa.Column("local_name", sa.String(length=255), nullable=True),
            sa.Column("scientific_name", sa.String(length=255), nullable=True),
            sa.Column("family", sa.String(length=255), nullable=True),
            sa.Column("genus", sa.String(length=255), nullable=True),
            sa.Column("description", sa.Text(), nullable=True),
        )
        op.create_index("ix_fauna_zone_id", "fauna", ["zone_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("fauna"):
        op.drop_index("ix_fauna_zone_id", table_name="fauna")
        op.drop_table("fauna")

    if inspector.has_table("flora"):
        op.drop_index("ix_flora_zone_id", table_name="flora")
        op.drop_table("flora")

    if inspector.has_table("zones"):
        op.drop_table("zones")
