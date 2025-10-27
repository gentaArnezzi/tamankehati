from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from api.v1.serializers.public import ArtikelPublicOut, ArtikelPublicListResponse
from core.database.session import get_session

router = APIRouter()


@router.get("/", response_model=ArtikelPublicListResponse)
async def get_artikel(
    search: Optional[str] = Query(None, description="Search by title or content"),
    kategori: Optional[str] = Query(None, description="Filter by category/region"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_session)
):
    try:
        # Get total count
        count_query = text("SELECT COUNT(*) FROM articles WHERE is_published = true")
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0
        
        # Get items with pagination
        query = text("""
            SELECT id, title, content, summary, region_code, created_at
            FROM articles 
            WHERE is_published = true
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset
        """)
        
        result = await db.execute(query, {"limit": limit, "offset": offset})
        items = result.fetchall()
        
        return ArtikelPublicListResponse(
            items=[ArtikelPublicOut(
                id=str(item.id),
                judul=item.title or "",
                slug=item.title.replace(" ", "-").lower() if item.title else "",
                excerpt=item.summary or (item.content[:100] + "..." if item.content and len(item.content) > 100 else item.content or ""),
                kategori=item.region_code or "",
                tanggal_publish=str(item.created_at) if item.created_at else "",
                gambar_cover=""
            ) for item in items],
            total=total,
            limit=limit,
            offset=offset,
            has_next=(offset + limit) < total,
            has_prev=offset > 0
        )
    except Exception as e:
        print(f"Error getting articles: {e}")
        return ArtikelPublicListResponse(
            items=[],
            total=0,
            limit=limit,
            offset=offset,
            has_next=False,
            has_prev=False
        )


@router.get("/{slug}", response_model=ArtikelPublicOut)
async def get_artikel_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_session)
):
    # Note: The current Article model doesn't have a slug field, so matching by title
    # In a real implementation, you'd want to add a slug field to the Article model
    from fastapi import HTTPException
    
    item = await PublicArtikelService.get_by_slug(db=db, slug=slug)
    if not item:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
    
    return ArtikelPublicOut(
        id=str(item.id),
        judul=item.title or "",
        slug=slug if slug else str(item.id),  # Use slug parameter or ID as fallback
        excerpt=item.summary or (item.content[:100] + "..." if item.content and len(item.content) > 100 else item.content or ""),
        kategori=item.region_code or "",
        tanggal_publish=str(item.created_at) if item.created_at else "",
        gambar_cover=""  # No image field in current model
    )