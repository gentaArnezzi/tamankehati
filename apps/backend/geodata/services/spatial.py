from typing import Optional, Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from geoalchemy2 import functions as ST

# Zone import removed - zones functionality removed


async def zones_in_bbox(
    db: AsyncSession,
    minx: float,
    miny: float,
    maxx: float,
    maxy: float,
):
    """
    Get all zones that intersect with the given bounding box.

    Args:
        db: Database session
        minx, miny: Bottom-left coordinates
        maxx, maxy: Top-right coordinates

    Returns:
        List of Zone objects that intersect with the bbox
    """
    # Create a polygon from the bbox coordinates
    bbox_polygon = f"POLYGON(({minx} {miny}, {maxx} {miny}, {maxx} {maxy}, {minx} {maxy}, {minx} {miny}))"

    # Query zones that intersect with the bbox
    q = select(Zone).where(
        ST.ST_Intersects(
            Zone.geom,
            ST.ST_GeomFromText(bbox_polygon, 4326)
        )
    )

    result = await db.execute(q)
    return result.scalars().all()
