import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database.session import get_session
from api.v1.public.services import PublicSearchService
from api.v1.serializers.search import SearchResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=SearchResponse, tags=["Public Search"])
async def public_search(
    q: str = Query(..., min_length=2, description="Kata kunci pencarian"),
    limit: int = Query(20, ge=1, le=40, description="Batas hasil"),
    db: AsyncSession = Depends(get_session),
):
    """
    Endpoint pencarian publik untuk mencari data di seluruh sistem.
    """
    if not q or len(q.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Kata kunci pencarian minimal 2 karakter",
        )

    try:
        # Gunakan PublicSearchService untuk melakukan pencarian
        search_results = await PublicSearchService.search(
            db=db,
            query=q,
            limit=limit
        )
        
        return SearchResponse(
            query=search_results['query'],
            results=search_results['results'],
            total=search_results['total']
        )
        
    except Exception as e:
        logger.error(f"Error in public search: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Terjadi kesalahan saat melakukan pencarian"
        )
