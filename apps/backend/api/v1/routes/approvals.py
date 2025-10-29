from datetime import datetime, timezone
from typing import Literal, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.v1.permissions.policies import require_roles
from api.v1.permissions.rbac import current_user
from api.v1.serializers.common import ErrorResponse
from core.database.session import get_session
from domains.articles.models import Article, ArticleStatus
from domains.fauna.models import Fauna, WorkflowStatus as FaunaStatus
from domains.flora.models import Flora, WorkflowStatus as FloraStatus
from domains.galleries.models import Gallery, GalleryStatus
from domains.activities.models import Activity
# Zone import removed - zones functionality removed
from domains.parks.models import Park
from users.models import User, UserRole

router = APIRouter(prefix="/approvals")


class ApprovalMeta(BaseModel):
    region_code: Optional[str] = None
    submitted_by: Optional[int] = None
    approved_by: Optional[int] = None


class ApprovalItem(BaseModel):
    entity_type: Literal["flora", "fauna", "zona", "artikel", "galeri", "kegiatan", "taman"]
    entity_id: int
    title: str
    status: str
    submitted_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    metadata: ApprovalMeta = Field(default_factory=ApprovalMeta)
    thumbnail_url: Optional[str] = None


class ApprovalListResponse(BaseModel):
    items: list[ApprovalItem]
    total: int
    counts: dict[str, int]
    has_next: bool


@router.get(
    "",
    response_model=ApprovalListResponse,
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
    },
)
@router.get(
    "/",
    response_model=ApprovalListResponse,
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
    },
)
async def list_pending_approvals(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    entity_type: Optional[Literal["flora", "fauna", "zona", "artikel", "galeri", "kegiatan", "taman"]] = Query(
        default=None, description="Filter berdasarkan tipe entitas"
    ),
    limit: int = Query(default=50, ge=1, le=200),
):
    if user.role not in (UserRole.super_admin, UserRole.regional_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya admin yang dapat mengakses antrean persetujuan",
        )

    records: list[ApprovalItem] = []
    counts: dict[str, int] = {
        "flora": 0,
        "fauna": 0,
        "zona": 0,
        "artikel": 0,
        "galeri": 0,
        "kegiatan": 0,
        "taman": 0,
    }

    want_flora = entity_type in (None, "flora")
    want_fauna = entity_type in (None, "fauna")
    want_zona = entity_type in (None, "zona")
    want_artikel = entity_type in (None, "artikel")
    want_galeri = False  # Gallery is NOT a separate approval item - part of park
    want_kegiatan = entity_type in (None, "kegiatan")
    want_taman = entity_type in (None, "taman")

    if want_flora:
        stmt = (
            select(Flora)
            .where(
                Flora.status == FloraStatus.in_review,
                Flora.deleted_at.is_(None),
            )
        )
        flora_rows = (await db.execute(stmt)).scalars().all()
        counts["flora"] = len(flora_rows)
        for flora in flora_rows:
            records.append(
                ApprovalItem(
                    entity_type="flora",
                    entity_id=flora.id,
                    title=flora.local_name or flora.scientific_name or f"Flora #{flora.id}",
                    status=flora.status.value if hasattr(flora.status, "value") else flora.status,
                    submitted_at=flora.submitted_at,
                    updated_at=flora.updated_at,
                    metadata=ApprovalMeta(
                        region_code=None,
                        submitted_by=flora.submitted_by,
                        approved_by=flora.approved_by,
                    ),
                    thumbnail_url=None,
                )
            )

    if want_fauna:
        stmt = (
            select(Fauna)
            .where(Fauna.status == FaunaStatus.in_review)
        )
        fauna_rows = (await db.execute(stmt)).scalars().all()
        counts["fauna"] = len(fauna_rows)
        for fauna in fauna_rows:
            records.append(
                ApprovalItem(
                    entity_type="fauna",
                    entity_id=fauna.id,
                    title=fauna.local_name or fauna.scientific_name or f"Fauna #{fauna.id}",
                    status=fauna.status.value if hasattr(fauna.status, "value") else fauna.status,
                    submitted_at=fauna.submitted_at,
                    updated_at=fauna.updated_at,
                    metadata=ApprovalMeta(
                        region_code=None,
                        submitted_by=fauna.submitted_by,
                        approved_by=fauna.approved_by,
                    ),
                    thumbnail_url=None,
                )
            )

    if want_zona:
        counts["zona"] = 0

    if want_artikel:
        stmt = select(Article).where(
            Article.status == ArticleStatus.in_review.value,
            Article.deleted_at.is_(None),
        )
        if user.role == UserRole.regional_admin:
            # Regional admin only sees their own submitted articles
            stmt = stmt.where(Article.submitted_by == int(user.id))
        article_rows = (await db.execute(stmt)).scalars().all()
        counts["artikel"] = len(article_rows)
        for article in article_rows:
            records.append(
                ApprovalItem(
                    entity_type="artikel",
                    entity_id=article.id,
                    title=article.title or f"Artikel #{article.id}",
                    status=article.status,
                    submitted_at=article.submitted_at,
                    updated_at=article.updated_at,
                    metadata=ApprovalMeta(
                        region_code=article.region_code,
                        submitted_by=article.submitted_by,
                        approved_by=article.approved_by,
                    ),
                    thumbnail_url=None,
                )
            )

    # Gallery is NOT a separate approval item - it's part of the park
    # Galleries are auto-approved when their park is approved
    if want_galeri:
        # This block is disabled - galleries should not appear in approval queue
        # stmt = select(Gallery).where(...)
        counts["galeri"] = 0

    if want_kegiatan:
        stmt = select(Activity).where(
            Activity.status == "in_review"
        )
        # Regional admin filtering not needed for activities - they're already filtered by park
        activity_rows = (await db.execute(stmt)).scalars().all()
        counts["kegiatan"] = len(activity_rows)
        for activity in activity_rows:
            records.append(
                ApprovalItem(
                    entity_type="kegiatan",
                    entity_id=activity.id,
                    title=activity.title or f"Kegiatan #{activity.id}",
                    status=activity.status,
                    submitted_at=activity.submitted_at or activity.created_at,
                    updated_at=activity.updated_at,
                    metadata=ApprovalMeta(
                        region_code=None,
                        submitted_by=activity.created_by,
                        approved_by=activity.approved_by,
                    ),
                    thumbnail_url=None,
                )
            )

    if want_taman:
        stmt = select(Park).where(
            Park.status == "in_review",
            Park.deleted_at.is_(None),
        )
        # Parks are global - all admins can see all parks pending approval
        # Regional admin will be assigned to approved park later
        park_rows = (await db.execute(stmt)).scalars().all()
        counts["taman"] = len(park_rows)
        print(f"🔍 Found {len(park_rows)} parks with status 'in_review' for approval queue")
        for park in park_rows:
            records.append(
                ApprovalItem(
                    entity_type="taman",
                    entity_id=park.id,
                    title=park.name or f"Taman #{park.id}",
                    status=park.status,
                    submitted_at=park.submitted_at,
                    updated_at=park.updated_at,
                    metadata=ApprovalMeta(
                        region_code=None,  # Parks don't have region_code
                        submitted_by=park.submitted_by,
                        approved_by=park.approved_by,
                    ),
                    thumbnail_url=None,
                )
            )

    # Helper function to ensure timezone-aware datetime
    def get_sort_datetime(item):
        dt = item.submitted_at or item.updated_at
        if dt is None:
            return datetime.min.replace(tzinfo=timezone.utc)
        # If datetime is naive, make it aware (assume UTC)
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt
    
    records.sort(key=get_sort_datetime, reverse=True)
    total = len(records)
    paginated = records[:limit]
    has_next = total > limit

    return ApprovalListResponse(items=paginated, total=total, counts=counts, has_next=has_next)


# ==================== GROUPED APPROVALS BY PARK ====================

class ParkGroupItem(BaseModel):
    entity_type: Literal["flora", "fauna", "artikel", "kegiatan"]  # Gallery removed - part of park
    entity_id: int
    title: str
    status: str
    submitted_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    thumbnail_url: Optional[str] = None


class ParkGroup(BaseModel):
    park_id: int
    park_name: str
    items: List[ParkGroupItem]
    total_items: int
    flora_count: int
    fauna_count: int
    artikel_count: int
    galeri_count: int
    kegiatan_count: int


class GroupedApprovalsResponse(BaseModel):
    groups: List[ParkGroup]
    total_parks: int
    total_items: int


@router.get(
    "/grouped",
    response_model=GroupedApprovalsResponse,
    dependencies=[Depends(require_roles(UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
    },
)
async def get_grouped_approvals(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    """Get all pending approvals grouped by park for easier bulk approval"""
    
    groups: dict[int, ParkGroup] = {}
    
    # Get flora items with park info
    flora_stmt = (
        select(Flora, Park.name)
        .join(Park, Flora.park_id == Park.id)
        .where(
            Flora.status == FloraStatus.in_review,
            Flora.deleted_at.is_(None),
        )
    )
    flora_rows = (await db.execute(flora_stmt)).all()
    
    for flora, park_name in flora_rows:
        if flora.park_id not in groups:
            groups[flora.park_id] = ParkGroup(
                park_id=flora.park_id,
                park_name=park_name,
                items=[],
                total_items=0,
                flora_count=0,
                fauna_count=0,
                artikel_count=0,
                galeri_count=0,
                kegiatan_count=0,
            )
        
        groups[flora.park_id].items.append(
            ParkGroupItem(
                entity_type="flora",
                entity_id=flora.id,
                title=flora.local_name or flora.scientific_name or f"Flora #{flora.id}",
                status=flora.status.value if hasattr(flora.status, "value") else flora.status,
                submitted_at=flora.submitted_at,
                updated_at=flora.updated_at,
                thumbnail_url=None,
            )
        )
        groups[flora.park_id].flora_count += 1
        groups[flora.park_id].total_items += 1
    
    # Get fauna items with park info
    fauna_stmt = (
        select(Fauna, Park.name)
        .join(Park, Fauna.park_id == Park.id)
        .where(Fauna.status == FaunaStatus.in_review)
    )
    fauna_rows = (await db.execute(fauna_stmt)).all()
    
    for fauna, park_name in fauna_rows:
        if fauna.park_id not in groups:
            groups[fauna.park_id] = ParkGroup(
                park_id=fauna.park_id,
                park_name=park_name,
                items=[],
                total_items=0,
                flora_count=0,
                fauna_count=0,
                artikel_count=0,
                galeri_count=0,
                kegiatan_count=0,
            )
        
        groups[fauna.park_id].items.append(
            ParkGroupItem(
                entity_type="fauna",
                entity_id=fauna.id,
                title=fauna.local_name or fauna.scientific_name or f"Fauna #{fauna.id}",
                status=fauna.status.value if hasattr(fauna.status, "value") else fauna.status,
                submitted_at=fauna.submitted_at,
                updated_at=fauna.updated_at,
                thumbnail_url=None,
            )
        )
        groups[fauna.park_id].fauna_count += 1
        groups[fauna.park_id].total_items += 1
    
    # Get activities with park info
    activities_stmt = (
        select(Activity, Park.name)
        .join(Park, Activity.park_id == Park.id)
        .where(Activity.status == "in_review")
    )
    activities_rows = (await db.execute(activities_stmt)).all()
    
    for activity, park_name in activities_rows:
        if activity.park_id not in groups:
            groups[activity.park_id] = ParkGroup(
                park_id=activity.park_id,
                park_name=park_name,
                items=[],
                total_items=0,
                flora_count=0,
                fauna_count=0,
                artikel_count=0,
                galeri_count=0,
                kegiatan_count=0,
            )
        
        groups[activity.park_id].items.append(
            ParkGroupItem(
                entity_type="kegiatan",
                entity_id=activity.id,
                title=activity.title or f"Kegiatan #{activity.id}",
                status=activity.status,
                submitted_at=activity.submitted_at or activity.created_at,
                updated_at=activity.updated_at,
                thumbnail_url=None,
            )
        )
        groups[activity.park_id].kegiatan_count += 1
        groups[activity.park_id].total_items += 1
    
    # Note: Galleries are NOT separate approval items
    # They are part of the park and auto-approved when park is approved
    
    # Sort groups by total items (descending)
    sorted_groups = sorted(groups.values(), key=lambda g: g.total_items, reverse=True)
    
    total_items = sum(g.total_items for g in sorted_groups)
    
    return GroupedApprovalsResponse(
        groups=sorted_groups,
        total_parks=len(sorted_groups),
        total_items=total_items,
    )


# ==================== BULK APPROVAL ENDPOINTS ====================

class BulkApprovalRequest(BaseModel):
    park_id: int
    entity_types: Optional[List[Literal["flora", "fauna", "kegiatan"]]] = None  # None means all


class BulkApprovalResponse(BaseModel):
    approved_count: int
    failed_count: int
    details: dict[str, int]  # entity_type -> count


@router.post(
    "/bulk-approve",
    response_model=BulkApprovalResponse,
    dependencies=[Depends(require_roles(UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
    },
)
async def bulk_approve_by_park(
    request: BulkApprovalRequest,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    """Bulk approve all pending items from a specific park"""
    
    approved_count = 0
    failed_count = 0
    details = {"flora": 0, "fauna": 0, "kegiatan": 0}
    
    entity_types = request.entity_types or ["flora", "fauna", "kegiatan"]
    
    # Approve flora
    if "flora" in entity_types:
        try:
            flora_stmt = select(Flora).where(
                Flora.park_id == request.park_id,
                Flora.status == FloraStatus.in_review,
                Flora.deleted_at.is_(None),
            )
            flora_items = (await db.execute(flora_stmt)).scalars().all()
            
            for flora in flora_items:
                flora.status = FloraStatus.approved
                flora.approved_by = user.id or 0
                flora.approved_at = datetime.now(timezone.utc)
                details["flora"] += 1
                approved_count += 1
        except Exception as e:
            print(f"Error approving flora: {e}")
            failed_count += len(flora_items) if 'flora_items' in locals() else 0
    
    # Approve fauna
    if "fauna" in entity_types:
        try:
            fauna_stmt = select(Fauna).where(
                Fauna.park_id == request.park_id,
                Fauna.status == FaunaStatus.in_review,
            )
            fauna_items = (await db.execute(fauna_stmt)).scalars().all()
            
            for fauna in fauna_items:
                fauna.status = FaunaStatus.approved
                fauna.approved_by = user.id or 0
                fauna.approved_at = datetime.now(timezone.utc)
                details["fauna"] += 1
                approved_count += 1
        except Exception as e:
            print(f"Error approving fauna: {e}")
            failed_count += len(fauna_items) if 'fauna_items' in locals() else 0
    
    # Approve activities
    if "kegiatan" in entity_types:
        try:
            activities_stmt = select(Activity).where(
                Activity.park_id == request.park_id,
                Activity.status == "in_review",
            )
            activity_items = (await db.execute(activities_stmt)).scalars().all()
            
            for activity in activity_items:
                activity.status = "approved"
                activity.approved_by = user.id or 0
                activity.approved_at = datetime.now(timezone.utc)
                details["kegiatan"] += 1
                approved_count += 1
        except Exception as e:
            print(f"Error approving activities: {e}")
            failed_count += len(activity_items) if 'activity_items' in locals() else 0
    
    await db.commit()
    
    return BulkApprovalResponse(
        approved_count=approved_count,
        failed_count=failed_count,
        details=details,
    )
