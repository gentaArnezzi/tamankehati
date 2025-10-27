# apps/backend/api/v1/serializers/zone.py
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field

class ZoneBase(BaseModel):
    name: str
    park_id: int
    zone_type: Optional[str] = "conservation"

class ZoneIn(ZoneBase):
    pass

class ZoneGeomIn(ZoneIn):
    geom_geojson: Optional[Any] = Field(default=None, description="GeoJSON Geometry or Feature")
    geom_wkt: Optional[str] = Field(default=None, description="WKT string (Polygon/MultiPolygon)")
    simplify_tolerance: Optional[float] = Field(default=0.0001, ge=0, description="Simplify tolerance (degrees)")

class ZoneOut(ZoneBase):
    id: int
    area_ha: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Pydantic v2 (pengganti orm_mode)
