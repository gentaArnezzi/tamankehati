import logging
from typing import Iterable, Optional, Sequence

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, literal, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.permissions.rbac import current_user
from api.v1.serializers.search import SearchResponse, SearchResultOut
from core.config.constants import MIN_TRGM_SIMILARITY
from core.database.session import get_session
from core.services.search_analytics import SearchAnalyticsService
from domains.articles.models import Article, ArticleStatus
from domains.fauna.models import Fauna, WorkflowStatus as WildlifeStatus
from domains.flora.models import Flora, WorkflowStatus
from domains.galleries.models import Gallery, GalleryStatus
from domains.parks import Park
from users.models import User
from domains.articles.models import UserRole

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/search", tags=["Search"])


def _normalize_query(term: str) -> str:
    return term.strip()


def _build_similarity(col, term: str):
    lowered = func.lower(literal(term))
    return func.similarity(func.lower(col), lowered)


def _format_summary(text: Optional[str], length: int = 220) -> Optional[str]:
    if not text:
        return None
    snippet = (text or "").strip().replace("\n", " ")
    if len(snippet) <= length:
        return snippet
    return snippet[: length - 1].rstrip() + "…"


def _allowed_statuses(user: Optional[User]) -> Optional[Sequence[str]]:
    if user is None:
        return [WorkflowStatus.approved.value]
    if user.role == UserRole.super_admin:
        return None
    return [WorkflowStatus.approved.value]


async def _search_flora(
    db: AsyncSession,
    term: str,
    limit: int,
    user: Optional[User],
) -> Iterable[SearchResultOut]:
    sim_local = _build_similarity(Flora.local_name, term)
    sim_scientific = _build_similarity(Flora.scientific_name, term)
    sim_family = _build_similarity(func.coalesce(Flora.family, ""), term)
    score_expr = func.greatest(sim_local, sim_scientific, sim_family)

    stmt = (
        select(
            Flora.id.label("id"),
            Flora.local_name.label("title"),
            Flora.description.label("summary"),
            score_expr.label("score"),
            Flora.park_id.label("park_id"),  # Use park_id instead of zone
        )
        .order_by(score_expr.desc())
        .limit(limit)
    )

    allowed_statuses = _allowed_statuses(user)
    if allowed_statuses is not None:
        stmt = stmt.where(Flora.status.in_(allowed_statuses))

    # if user and user.role == UserRole.regional_admin and user.region_code:
    #     stmt = stmt.where(Zone.region_code == user.region_code)

    stmt = stmt.where(score_expr >= MIN_TRGM_SIMILARITY)

    rows = (await db.execute(stmt)).all()
    for row in rows:
        yield SearchResultOut(
            id=str(row.id),
            tipe="flora",
            judul=row.title or "Flora",
            ringkasan=_format_summary(row.summary),
            url=f"/flora/{row.id}",
            badge=str(row.park_id) if row.park_id else None,  # Use park_id as badge
            score=float(row.score) if row.score is not None else None,
        )


async def _search_fauna(
    db: AsyncSession,
    term: str,
    limit: int,
    user: Optional[User],
) -> Iterable[SearchResultOut]:
    sim_local = _build_similarity(Fauna.local_name, term)
    sim_scientific = _build_similarity(Fauna.scientific_name, term)
    sim_family = _build_similarity(func.coalesce(Fauna.family, ""), term)
    score_expr = func.greatest(sim_local, sim_scientific, sim_family)

    stmt = (
        select(
            Fauna.id.label("id"),
            Fauna.local_name.label("title"),
            Fauna.description.label("summary"),
            score_expr.label("score"),
            Fauna.park_id.label("park_id"),  # Use park_id instead of zone
        )
        .order_by(score_expr.desc())
        .limit(limit)
    )

    if not user or user.role != UserRole.super_admin:
        stmt = stmt.where(Fauna.status.in_([WildlifeStatus.approved.value]))

    # if user and user.role == UserRole.regional_admin and user.region_code:
    #     stmt = stmt.where(Zone.region_code == user.region_code)

    stmt = stmt.where(score_expr >= MIN_TRGM_SIMILARITY)

    rows = (await db.execute(stmt)).all()
    for row in rows:
        yield SearchResultOut(
            id=str(row.id),
            tipe="fauna",
            judul=row.title or "Fauna",
            ringkasan=_format_summary(row.summary),
            url=f"/fauna/{row.id}",
            badge=str(row.park_id) if row.park_id else None,  # Use park_id as badge
            score=float(row.score) if row.score is not None else None,
        )


async def _search_taman(
    db: AsyncSession,
    term: str,
    limit: int,
) -> Iterable[SearchResultOut]:
    score_expr = _build_similarity(Park.name, term)
    stmt = (
        select(
            Park.id.label("id"),
            Park.name.label("title"),
            Park.description.label("summary"),
            score_expr.label("score"),
            Park.wilayah.label("region_code"),
        )
        .where(Park.status == "published")
        .order_by(score_expr.desc())
        .limit(limit)
        .where(score_expr >= MIN_TRGM_SIMILARITY)
    )
    rows = (await db.execute(stmt)).all()
    for row in rows:
        yield SearchResultOut(
            id=str(row.id),
            tipe="taman",
            judul=row.title or "Taman Konservasi",
            ringkasan=_format_summary(row.summary),
            url=f"/parks/{row.id}",  # Updated URL to match new route
            badge=row.region_code,
            score=float(row.score) if row.score is not None else None,
        )


async def _search_artikel(
    db: AsyncSession,
    term: str,
    limit: int,
) -> Iterable[SearchResultOut]:
    score_expr = _build_similarity(Article.title, term)
    stmt = (
        select(
            Article.id.label("id"),
            Article.title.label("title"),
            Article.summary.label("summary"),
            score_expr.label("score"),
        )
        .order_by(score_expr.desc())
        .limit(limit)
        .where(Article.status == ArticleStatus.approved.value)
        .where(score_expr >= MIN_TRGM_SIMILARITY)
    )
    rows = (await db.execute(stmt)).all()
    for row in rows:
        yield SearchResultOut(
            id=str(row.id),
            tipe="artikel",
            judul=row.title or "Artikel",
            ringkasan=_format_summary(row.summary),
            url=f"/artikel/{row.id}",
            score=float(row.score) if row.score is not None else None,
        )


async def _search_galeri(
    db: AsyncSession,
    term: str,
    limit: int,
) -> Iterable[SearchResultOut]:
    score_expr = _build_similarity(Gallery.title, term)
    stmt = (
        select(
            Gallery.id.label("id"),
            Gallery.title.label("title"),
            Gallery.description.label("summary"),
            score_expr.label("score"),
            Gallery.region_code.label("region_code"),
            Gallery.image_url.label("image_url"),
        )
        .order_by(score_expr.desc())
        .limit(limit)
        .where(Gallery.status == GalleryStatus.approved.value)
        .where(score_expr >= MIN_TRGM_SIMILARITY)
    )
    rows = (await db.execute(stmt)).all()
    for row in rows:
        yield SearchResultOut(
            id=str(row.id),
            tipe="galeri",
            judul=row.title or "Galeri",
            ringkasan=_format_summary(row.summary),
            url=f"/galeri/{row.id}",
            badge=row.region_code,
            gambar=row.image_url,
            score=float(row.score) if row.score is not None else None,
        )


async def _execute_search(db: AsyncSession, term: str, limit: int, user: Optional[User]):
    per_section = max(2, limit // 5)

    collectors: list[SearchResultOut] = []

    flora_results = [r async for r in _search_flora(db, term, per_section, user)]
    fauna_results = [r async for r in _search_fauna(db, term, per_section, user)]
    taman_results = [r async for r in _search_taman(db, term, per_section)]
    artikel_results = [r async for r in _search_artikel(db, term, per_section)]
    galeri_results = [r async for r in _search_galeri(db, term, per_section)]

    collectors.extend(flora_results)
    collectors.extend(fauna_results)
    collectors.extend(taman_results)
    collectors.extend(artikel_results)
    collectors.extend(galeri_results)

    # Sort by score (descending) then truncate
    collectors.sort(key=lambda item: item.score if item.score is not None else 0.0, reverse=True)
    trimmed = collectors[:limit]

    return trimmed


@router.get("/", response_model=SearchResponse)
async def aggregated_search(
    q: str = Query(..., min_length=2, description="Kata kunci pencarian"),
    limit: int = Query(20, ge=1, le=50, description="Batas jumlah hasil gabungan"),
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    term = _normalize_query(q)
    if not term:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Kata kunci pencarian wajib diisi",
        )

    results = await _execute_search(db, term, limit, user)
    source = user.role.value if user else "public"
    try:
        await SearchAnalyticsService.log_query(db, term, len(results), source)
    except Exception as exc:  # pragma: no cover - logging only
        logger.warning("Failed to log search analytics: %s", exc)

    return SearchResponse(query=term, results=results)
