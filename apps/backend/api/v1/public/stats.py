from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from api.v1.serializers.public import StatsResponse
from core.database.session import get_session
from typing import List
from pydantic import BaseModel

router = APIRouter()


class RegionResponse(BaseModel):
    id: int
    name: str
    code: str


class RegionsResponse(BaseModel):
    regions: List[RegionResponse]


@router.get("/", response_model=StatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_session)
):
    try:
        # Get flora count
        flora_query = text("SELECT COUNT(*) FROM flora WHERE status = 'approved'")
        flora_result = await db.execute(flora_query)
        total_flora = flora_result.scalar() or 0

        # Get fauna count
        fauna_query = text("SELECT COUNT(*) FROM fauna WHERE status = 'approved'")
        fauna_result = await db.execute(fauna_query)
        total_fauna = fauna_result.scalar() or 0

        # Get taman count
        taman_query = text("SELECT COUNT(*) FROM parks WHERE status = 'published'")
        taman_result = await db.execute(taman_query)
        total_taman = taman_result.scalar() or 0

        # Get artikel count
        artikel_query = text("SELECT COUNT(*) FROM articles WHERE status = 'approved'")
        artikel_result = await db.execute(artikel_query)
        total_artikel = artikel_result.scalar() or 0

        return StatsResponse(
            total_flora=total_flora,
            total_fauna=total_fauna,
            total_taman=total_taman,
            total_artikel=total_artikel
        )
    except Exception as e:
        print(f"Error getting public stats: {e}")
        # Return fallback data
        return StatsResponse(
            total_flora=0,
            total_fauna=0,
            total_taman=0,
            total_artikel=0
        )


@router.get("/park/{park_id}", response_model=StatsResponse)
async def get_park_stats(
    park_id: int,
    db: AsyncSession = Depends(get_session)
):
    """
    Get statistics for a specific park.
    """
    try:
        # Get flora count for this park
        flora_query = text("SELECT COUNT(*) FROM flora WHERE park_id = :park_id AND status = 'approved'")
        flora_result = await db.execute(flora_query, {"park_id": park_id})
        total_flora = flora_result.scalar() or 0

        # Get fauna count for this park
        fauna_query = text("SELECT COUNT(*) FROM fauna WHERE park_id = :park_id AND status = 'approved'")
        fauna_result = await db.execute(fauna_query, {"park_id": park_id})
        total_fauna = fauna_result.scalar() or 0

        # Get artikel count - since articles don't have park_id, return 0 for now
        total_artikel = 0

        # Get gallery count - since galleries don't have park_id, return 0 for now
        total_galeri = 0

        return StatsResponse(
            total_flora=total_flora,
            total_fauna=total_fauna,
            total_taman=0,  # This is for the park itself, not relevant here
            total_artikel=total_artikel
        )
    except Exception as e:
        print(f"Error getting park stats: {e}")
        # Return fallback data
        return StatsResponse(
            total_flora=0,
            total_fauna=0,
            total_taman=0,
            total_artikel=0
        )


@router.get("/regions", response_model=RegionsResponse)
async def get_available_regions(
    db: AsyncSession = Depends(get_session)
):
    """
    Get list of regions that have published parks.
    """
    try:
        # Get regions that have published parks
        regions_query = text("""
            SELECT DISTINCT r.id, r.name, r.code
            FROM regions r
            INNER JOIN parks p ON r.id = p.region_id
            WHERE p.status = 'published'
            ORDER BY r.name
        """)
        regions_result = await db.execute(regions_query)
        regions_data = regions_result.fetchall()
        
        regions = [
            RegionResponse(
                id=row.id,
                name=row.name,
                code=row.code
            )
            for row in regions_data
        ]
        
        return RegionsResponse(regions=regions)
    except Exception as e:
        print(f"Error getting available regions: {e}")
        # Return fallback data
        return RegionsResponse(regions=[])