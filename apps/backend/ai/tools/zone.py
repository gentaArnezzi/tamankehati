from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from geoalchemy2 import functions as ST
# Zone import removed - zones functionality removed
from domains.flora.models import Flora
from domains.fauna.models import Fauna

async def get_zone_stats(db: AsyncSession, zone_id: int) -> dict:
    # Accurate area using geography cast (meters)
    area_q = select(ST.ST_Area(func.cast(Zone.geom, "geography"))).where(Zone.id == zone_id)
    area = (await db.execute(area_q)).scalar() or 0.0

    flora_count_q = select(func.count(Flora.id)).where(Flora.zone_id == zone_id)
    fauna_count_q = select(func.count(Fauna.id)).where(Fauna.zone_id == zone_id)
    flora_count = (await db.execute(flora_count_q)).scalar() or 0
    fauna_count = (await db.execute(fauna_count_q)).scalar() or 0

    flora_q = select(Flora.local_name).where(Flora.zone_id == zone_id).limit(5)
    fauna_q = select(Fauna.local_name).where(Fauna.zone_id == zone_id).limit(5)
    sample_flora = [n for (n,) in (await db.execute(flora_q)).all()]
    sample_fauna = [n for (n,) in (await db.execute(fauna_q)).all()]

    return {
        "zone_id": zone_id,
        "area_m2": float(area),
        "flora_count": int(flora_count),
        "fauna_count": int(fauna_count),
        "sample_flora": sample_flora,
        "sample_fauna": sample_fauna,
    }

async def list_endemic_by_region(db: AsyncSession, region_code: str, limit: int = 50) -> dict:
    # Assumes Flora/Fauna have a boolean column 'is_endemic' (or treat absent as False).
    endemic_flora_q = select(Flora.local_name).join(Zone, Zone.id == Flora.zone_id)        .where(Zone.region_code == region_code, getattr(Flora, "is_endemic", False) == True)        .limit(limit)
    endemic_fauna_q = select(Fauna.local_name).join(Zone, Zone.id == Fauna.zone_id)        .where(Zone.region_code == region_code, getattr(Fauna, "is_endemic", False) == True)        .limit(limit)

    flora = [n for (n,) in (await db.execute(endemic_flora_q)).all()]
    fauna = [n for (n,) in (await db.execute(endemic_fauna_q)).all()]
    return {"region_code": region_code, "flora": flora, "fauna": fauna}

async def count_by_iucn_status(db: AsyncSession, region_code: str) -> dict:
    # Assumes Flora/Fauna have 'iucn_status' column (e.g., LC, NT, VU, EN, CR).
    async def agg(model):
        q = select(getattr(model, "iucn_status").label("s"), func.count(model.id))\
            .join(Zone, Zone.id == model.zone_id)\
            .where(Zone.region_code == region_code)\
            .group_by("s")
        rows = (await db.execute(q)).all()
        return { (s or "UNKNOWN"): int(c) for s, c in rows }

    flora = await agg(Flora)
    fauna = await agg(Fauna)
    return {"region_code": region_code, "flora": flora, "fauna": fauna}
