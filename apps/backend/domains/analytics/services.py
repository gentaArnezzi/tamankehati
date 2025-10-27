# apps/backend/domains/analytics/services.py
from typing import Optional, Dict, Any
from sqlalchemy import select, func, literal
from sqlalchemy.ext.asyncio import AsyncSession

from domains.flora.models import Flora
from domains.fauna.models import Fauna
# Analytics services
from domains.parks.models import Park
# from domains.regions.models.region import Region  # Removed - using user-based access control


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------
IUCN_ALLOWED = {"LC", "NT", "VU", "EN", "CR", "DD", "NE"}


def _norm_iucn(v: Optional[str]) -> str:
    if not v:
        return "NE"  # treat missing as Not Evaluated for aggregation
    v = v.upper()
    return v if v in IUCN_ALLOWED else "NE"


# ---------------------------------------------------------------------
# Public services (async)
# ---------------------------------------------------------------------
async def endemic_by_user(db: AsyncSession, user_id: int) -> Dict[str, int]:
    """
    Get endemic species count for a specific user.
    """
    # Count endemic flora submitted by user
    flora_stmt = select(func.count(Flora.id)).where(
        Flora.submitted_by == user_id,
        Flora.is_endemic == True
    )
    flora_result = await db.execute(flora_stmt)
    flora_endemic = flora_result.scalar() or 0
    
    # Count endemic fauna submitted by user
    fauna_stmt = select(func.count(Fauna.id)).where(
        Fauna.submitted_by == user_id,
        Fauna.is_endemic == True
    )
    fauna_result = await db.execute(fauna_stmt)
    fauna_endemic = fauna_result.scalar() or 0
    
    return {
        "flora_endemic": flora_endemic,
        "fauna_endemic": fauna_endemic
    }

async def endemic_by_region(db: AsyncSession, region_code: str) -> Dict[str, int]:
    """
    Hitung jumlah flora/fauna endemik untuk region tertentu.
    Return:
      { "flora_endemic": N, "fauna_endemic": M }
    """
    # Flora - join through Park -> Region (zones removed)
    q_flora = (
        select(func.count(Flora.id))
        .join(Park, Park.id == Flora.park_id)
        .join(Region, Region.id == Park.region_id)
        .where(Region.code == region_code, Flora.is_endemic.is_(True))
    )
    flora_count = (await db.execute(q_flora)).scalar_one()

    # Fauna - join through Park -> Region (zones removed)
    q_fauna = (
        select(func.count(Fauna.id))
        .join(Park, Park.id == Fauna.park_id)
        .join(Region, Region.id == Park.region_id)
        .where(Region.code == region_code, Fauna.is_endemic.is_(True))
    )
    fauna_count = (await db.execute(q_fauna)).scalar_one()

    return {"flora_endemic": int(flora_count or 0), "fauna_endemic": int(fauna_count or 0)}


async def iucn_counts_by_region(db: AsyncSession, region_code: str) -> Dict[str, Dict[str, int]]:
    """
    Hitung distribusi IUCN untuk flora & fauna pada region.
    Return:
      {
        "flora": {"LC": n, "NT": n, ...},
        "fauna": {"LC": n, "NT": n, ...}
      }
    """
    # Flora per status - join through Park -> Region (zones removed)
    qf = (
        select(Flora.iucn_status, func.count(Flora.id))
        .join(Park, Park.id == Flora.park_id)
        .join(Region, Region.id == Park.region_id)
        .where(Region.code == region_code)
        .group_by(Flora.iucn_status)
    )
    flora_rows = (await db.execute(qf)).all()
    flora_map: Dict[str, int] = {s: 0 for s in IUCN_ALLOWED}
    for status, cnt in flora_rows:
        flora_map[_norm_iucn(status)] += int(cnt or 0)

    # Fauna per status - join through Park -> Region (zones removed)
    qfa = (
        select(Fauna.iucn_status, func.count(Fauna.id))
        .join(Park, Park.id == Fauna.park_id)
        .join(Region, Region.id == Park.region_id)
        .where(Region.code == region_code)
        .group_by(Fauna.iucn_status)
    )
    fauna_rows = (await db.execute(qfa)).all()
    fauna_map: Dict[str, int] = {s: 0 for s in IUCN_ALLOWED}
    for status, cnt in fauna_rows:
        fauna_map[_norm_iucn(status)] += int(cnt or 0)

    return {"flora": flora_map, "fauna": fauna_map}


# (opsional) Endpoint bisa memakai CSV helper berikut jika mau export langsung:
async def iucn_counts_by_region_flat(db: AsyncSession, region_code: str) -> list[dict[str, Any]]:
    """
    Versi 'flat' untuk CSV:
    [
      {"kingdom": "flora", "status": "LC", "count": 12},
      {"kingdom": "fauna", "status": "LC", "count": 7},
      ...
    ]
    """
    result: list[dict[str, Any]] = []

    agg = await iucn_counts_by_region(db, region_code)
    for k in ("flora", "fauna"):
        for s in sorted(IUCN_ALLOWED):
            result.append({"kingdom": k, "status": s, "count": int(agg[k][s])})
    return result
