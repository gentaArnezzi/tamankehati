from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2 import functions as ST

async def validate_geom_expr(db: AsyncSession, geom_expr) -> tuple[bool, Optional[str]]:
    q = select(ST.ST_IsValid(geom_expr), ST.ST_IsValidReason(geom_expr))
    res = await db.execute(q)
    is_valid, reason = res.one()
    return bool(is_valid), None if bool(is_valid) else str(reason)

async def zone_as_geojson(db: AsyncSession, table, id_col, geom_col, zone_id: int) -> Optional[dict]:
    q = select(id_col, ST.ST_AsGeoJSON(geom_col)).where(id_col == zone_id)
    res = await db.execute(q)
    row = res.first()
    if not row:
        return None
    _id, geom_json = row
    return {"type": "Feature", "properties": {"id": _id}, "geometry": geom_json and __import__("json").loads(geom_json)}
