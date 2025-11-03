# apps/backend/domains/analytics/services.py
from typing import Optional, Dict
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from domains.flora.models import Flora
from domains.fauna.models import Fauna


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

