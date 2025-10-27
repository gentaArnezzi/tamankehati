from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from geoalchemy2 import functions as ST
# Zone import removed - zones functionality removed
from domains.flora.models import Flora
from domains.fauna.models import Fauna

async def find_species_by_bbox(db: AsyncSession, minx: float, miny: float, maxx: float, maxy: float, limit: int = 20) -> dict:
    bbox_wkt = f"SRID=4326;POLYGON(({minx} {miny},{maxx} {miny},{maxx} {maxy},{minx} {maxy},{minx} {miny}))"
    zones_q = select(Zone.id).where(ST.ST_Intersects(Zone.geom, ST.ST_GeomFromText(bbox_wkt)))
    zone_ids = [z for (z,) in (await db.execute(zones_q)).all()]
    flora_names, fauna_names = [], []
    if zone_ids:
        flora_q = select(Flora.local_name).where(Flora.zone_id.in_(zone_ids)).limit(limit)
        fauna_q = select(Fauna.local_name).where(Fauna.zone_id.in_(zone_ids)).limit(limit)
        flora_names = [n for (n,) in (await db.execute(flora_q)).all()]
        fauna_names = [n for (n,) in (await db.execute(fauna_q)).all()]
    return {"bbox": [minx, miny, maxx, maxy], "zone_count": len(zone_ids), "flora": flora_names, "fauna": fauna_names}

async def species_near_point(db: AsyncSession, lon: float, lat: float, radius_km: float = 5.0, limit: int = 50) -> dict:
    # Buffer point in meters using geography for accuracy
    point = ST.ST_SetSRID(ST.ST_MakePoint(lon, lat), 4326)
    buf = ST.ST_Buffer(point.cast("geography"), radius_km * 1000).cast("geometry")
    zones_q = select(Zone.id).where(ST.ST_Intersects(Zone.geom, buf))
    zone_ids = [z for (z,) in (await db.execute(zones_q)).all()]

    flora_names, fauna_names = [], []
    if zone_ids:
        flora_q = select(Flora.local_name).where(Flora.zone_id.in_(zone_ids)).limit(limit)
        fauna_q = select(Fauna.local_name).where(Fauna.zone_id.in_(zone_ids)).limit(limit)
        flora_names = [n for (n,) in (await db.execute(flora_q)).all()]
        fauna_names = [n for (n,) in (await db.execute(fauna_q)).all()]
    return {"point": [lon, lat], "radius_km": radius_km, "zone_count": len(zone_ids), "flora": flora_names, "fauna": fauna_names}
