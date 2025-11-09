from typing import Optional
import re
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
        # Get total count - use status = 'published' or 'approved' for public articles (exclude deleted)
        count_query = text("SELECT COUNT(*) FROM articles WHERE status IN ('published', 'approved') AND deleted_at IS NULL")
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0
        
        # Get items with pagination (exclude deleted)
        query = text("""
            SELECT id, title, slug, content, summary, category, featured_image, created_at, updated_at
            FROM articles 
            WHERE status IN ('published', 'approved') 
                AND deleted_at IS NULL
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset
        """)
        
        result = await db.execute(query, {"limit": limit, "offset": offset})
        items = result.fetchall()
        
        return ArtikelPublicListResponse(
            items=[ArtikelPublicOut(
                id=str(item.id),
                judul=item.title or "",
                slug=item.slug or (item.title.replace(" ", "-").lower() if item.title else ""),
                excerpt=item.summary or (item.content[:100] + "..." if item.content and len(item.content) > 100 else item.content or ""),
                kategori=item.category or "",
                tanggal_publish=str(item.created_at) if item.created_at else "",
                gambar_cover=item.featured_image or "",
                konten_markdown=None,  # Not needed for list view
                konten_html=None  # Not needed for list view
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
    from fastapi import HTTPException
    
    try:
        # Query by slug or title fallback (exclude deleted)
        query = text("""
            SELECT id, title, slug, content, summary, category, featured_image, created_at, updated_at
            FROM articles 
            WHERE (slug = :slug OR title = :title_fallback) 
                AND status IN ('published', 'approved')
                AND deleted_at IS NULL
            LIMIT 1
        """)
        
        # Create title fallback from slug
        title_fallback = slug.replace("-", " ").replace("_", " ").title()
        
        result = await db.execute(query, {"slug": slug, "title_fallback": title_fallback})
        item = result.fetchone()
        
        if not item:
            raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
        
        # Detect if content is HTML or markdown
        content = item.content or ""
        
        # Simple check: if content contains HTML tags (not escaped), treat as HTML
        # Check for common HTML tags like <p>, <h1>, <div>, <img>, etc.
        # Pattern matches: <tag>, <tag>, <tag attr="value">, etc.
        has_html_tags = bool(re.search(r'<[a-z][a-z0-9]*[\s>]', content, re.IGNORECASE))
        
        # If content has HTML tags, return as HTML; otherwise as markdown
        konten_html = content if has_html_tags else None
        konten_markdown = content if not has_html_tags else None
        
        return ArtikelPublicOut(
            id=str(item.id),
            judul=item.title or "",
            slug=item.slug or slug,
            excerpt=item.summary or (content[:100] + "..." if content and len(content) > 100 else content or ""),
            kategori=item.category or "",
            tanggal_publish=str(item.created_at) if item.created_at else "",
            gambar_cover=item.featured_image or "",
            konten_markdown=konten_markdown,
            konten_html=konten_html
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting article by slug: {e}")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan saat mengambil artikel")