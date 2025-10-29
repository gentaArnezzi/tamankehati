from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from api.v1.serializers.public import GaleriPublicOut, GaleriPublicListResponse
from core.database.session import get_session

router = APIRouter()


@router.get("/", response_model=GaleriPublicListResponse)
async def get_galeri(
    jenis: Optional[str] = Query(None, description="Filter by type"),
    wilayah: Optional[str] = Query(None, description="Filter by region"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_session)
):
    try:
        # Get total count - only approved galleries
        count_query = text("SELECT COUNT(*) FROM galleries WHERE status = 'approved'")
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0
        
        # Get items with pagination - only approved galleries
        query = text("""
            SELECT id, title, image_url, entity_type, created_at
            FROM galleries 
            WHERE status = 'approved'
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset
        """)
        
        result = await db.execute(query, {"limit": limit, "offset": offset})
        items = result.fetchall()
        
        return GaleriPublicListResponse(
            items=[GaleriPublicOut(
                id=str(item.id),
                judul=item.title or "",
                url=item.image_url or "",
                jenis=item.entity_type or "",
                wilayah=item.entity_type or ""
            ) for item in items],
            total=total,
            limit=limit,
            offset=offset,
            has_next=(offset + limit) < total,
            has_prev=offset > 0
        )
    except Exception as e:
        print(f"Error getting gallery items: {e}")
        return GaleriPublicListResponse(
            items=[],
            total=0,
            limit=limit,
            offset=offset,
            has_next=False,
            has_prev=False
        )