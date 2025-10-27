# apps/backend/api/v1/routes/activities.py
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database.session import get_session
from domains.activities.models import Activity
from users.models import User, UserRole
from api.v1.permissions.rbac import current_user
from api.v1.permissions.policies import require_roles
from api.v1.serializers.activities import ActivityIn, ActivityOut, ActivityUpdate, ActivityListResponse
from api.v1.serializers.common import ErrorResponse

router = APIRouter(prefix="/activities")

@router.get(
    "",
    response_model=ActivityListResponse,
)
@router.get(
    "/",
    response_model=ActivityListResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        422: {"model": ErrorResponse, "description": "Validation Error - Invalid query parameters"},
    },
)
async def list_activities(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    q: Optional[str] = Query(None, description="Cari berdasarkan judul kegiatan", examples=["Penanaman"]),
    park_id: Optional[int] = Query(None, description="Filter berdasarkan ID taman", examples=[1]),
    status_filter: Optional[str] = Query(None, description="Filter berdasarkan status workflow", examples=["approved"]),
    submitted_by: Optional[str] = Query(None, description="Filter berdasarkan user yang submit (user ID or 'me')", examples=["me"]),
    limit: int = Query(50, ge=1, le=1000, description="Jumlah item per halaman"),
    offset: int = Query(0, ge=0, description="Offset untuk pagination"),
):
    stmt = select(Activity)
    # .options(
    #     # selectinload(Activity.park),
    #     # selectinload(Activity.created_by_user),
    #     # selectinload(Activity.approved_by_user),
    # )

    # Apply filters
    if q:
        stmt = stmt.where(Activity.title.ilike(f"%{q}%"))
    
    if park_id:
        stmt = stmt.where(Activity.park_id == park_id)
    
    if status_filter:
        stmt = stmt.where(Activity.status == status_filter)

    # Filter by submitted_by
    if submitted_by:
        if submitted_by == "me":
            # Filter by current user's submitted activities
            try:
                user_id_int = int(user.id)
                stmt = stmt.where(Activity.submitted_by == user_id_int)
                print(f"🔍 Filtering activities submitted by current user: {user_id_int}")
            except (ValueError, TypeError) as e:
                print(f"⚠️ Failed to convert user.id to int: {e}")
                stmt = stmt.where(Activity.id == -1)
        else:
            # Filter by specific user ID
            try:
                submitted_by_int = int(submitted_by)
                stmt = stmt.where(Activity.submitted_by == submitted_by_int)
                print(f"🔍 Filtering activities submitted by user: {submitted_by_int}")
            except ValueError:
                print(f"⚠️ Invalid submitted_by parameter: {submitted_by}")
                stmt = stmt.where(Activity.id == -1)

    # Regional admin filtering - using park-based access control
    if user.role == UserRole.regional_admin:
        if user.park_id:
            # Filter by park_id - only show activities from their assigned park
            stmt = stmt.where(Activity.park_id == user.park_id)
            print(f"🔍 Filtering activities for regional admin: park_id == {user.park_id}")
        else:
            # If no park_id assigned, filter by their submitted activities
            try:
                user_id_int = int(user.id)
                stmt = stmt.where(Activity.submitted_by == user_id_int)
                print(f"🔍 Filtering activities for regional admin: submitted_by == {user_id_int}")
            except (ValueError, TypeError) as e:
                print(f"⚠️ Failed to convert user.id to int: {e}")
                stmt = stmt.where(Activity.id == -1)

    # Get total count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar()

    # Apply pagination
    stmt = stmt.offset(offset).limit(limit)
    
    # Execute query
    result = await db.execute(stmt)
    activities = result.scalars().all()

    return {
        "items": [ActivityOut.model_validate(activity) for activity in activities],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_next": offset + limit < total,
        "has_prev": offset > 0,
    }

@router.get(
    "/{activity_id}",
    response_model=ActivityOut,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "Activity not found"},
    },
)
async def get_activity(
    activity_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    stmt = select(Activity).options(
        # selectinload(Activity.park),
    ).where(Activity.id == activity_id)

    result = await db.execute(stmt)
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    return ActivityOut.model_validate(activity)

@router.post(
    "/",
    response_model=ActivityOut,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        422: {"model": ErrorResponse, "description": "Validation Error - Invalid input data"},
    },
)
async def create_activity(
    payload: ActivityIn,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    # Insert using raw SQL
    result = await db.execute(text("""
        INSERT INTO activities (park_id, title, description, activity_date, location, status, submitted_by, created_at, updated_at)
        VALUES (:park_id, :title, :description, :activity_date, :location, 'draft', :submitted_by, now(), now())
        RETURNING id
    """), {
        "park_id": payload.park_id,
        "title": payload.title,
        "description": payload.description,
        "activity_date": payload.activity_date,
        "location": payload.location,
        "submitted_by": user.id,
    })

    activity_id = result.scalar()
    await db.commit()

    # Fetch the created activity
    stmt = select(Activity).options(
        # selectinload(Activity.park),
    ).where(Activity.id == activity_id)

    result = await db.execute(stmt)
    activity = result.scalar_one()

    return ActivityOut.model_validate(activity)

@router.put(
    "/{activity_id}",
    response_model=ActivityOut,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "Activity not found"},
        422: {"model": ErrorResponse, "description": "Validation Error - Invalid input data"},
    },
)
async def update_activity(
    activity_id: int,
    payload: ActivityUpdate,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    # Check if activity exists
    stmt = select(Activity).where(Activity.id == activity_id)
    result = await db.execute(stmt)
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Build dynamic UPDATE query
    update_fields = []
    update_values = {"activity_id": activity_id}
    
    update_field_names = ("title", "description", "activity_date", "location", "park_id")
    for field in update_field_names:
        value = getattr(payload, field, None)
        if value is not None:
            update_fields.append(f"{field} = :{field}")
            update_values[field] = value

    if not update_fields:
        # No fields to update
        stmt = select(Activity).options(
            # selectinload(Activity.park),
            # selectinload(Activity.created_by_user),
            # selectinload(Activity.approved_by_user),
        ).where(Activity.id == activity_id)
        result = await db.execute(stmt)
        activity = result.scalar_one()
        return ActivityOut.model_validate(activity)

    # Add updated_at
    update_fields.append("updated_at = now()")

    # Execute update
    update_query = f"""
        UPDATE activities 
        SET {', '.join(update_fields)}
        WHERE id = :activity_id
    """
    
    await db.execute(text(update_query), update_values)
    await db.commit()

    # Fetch updated activity
    stmt = select(Activity).options(
        # selectinload(Activity.park),
    ).where(Activity.id == activity_id)

    result = await db.execute(stmt)
    activity = result.scalar_one()

    return ActivityOut.model_validate(activity)

@router.delete(
    "/{activity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "Activity not found"},
    },
)
async def delete_activity(
    activity_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    # Check if activity exists
    stmt = select(Activity).where(Activity.id == activity_id)
    result = await db.execute(stmt)
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Delete activity
    await db.delete(activity)
    await db.commit()

@router.post(
    "/{activity_id}/submit",
    response_model=ActivityOut,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "Activity not found"},
    },
)
async def submit_activity(
    activity_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    # Check if activity exists
    stmt = select(Activity).where(Activity.id == activity_id)
    result = await db.execute(stmt)
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Update status to in_review
    await db.execute(text("""
        UPDATE activities 
        SET status = 'in_review', submitted_at = now(), updated_at = now()
        WHERE id = :activity_id
    """), {"activity_id": activity_id})

    await db.commit()

    # Fetch updated activity
    stmt = select(Activity).options(
        # selectinload(Activity.park),
    ).where(Activity.id == activity_id)

    result = await db.execute(stmt)
    activity = result.scalar_one()

    return ActivityOut.model_validate(activity)

@router.post(
    "/{activity_id}/approve",
    response_model=ActivityOut,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "Activity not found"},
    },
)
async def approve_activity(
    activity_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    # Check if activity exists
    stmt = select(Activity).where(Activity.id == activity_id)
    result = await db.execute(stmt)
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Update status to approved
    await db.execute(text("""
        UPDATE activities 
        SET status = 'approved', approved_by = :approved_by, approved_at = now(), updated_at = now()
        WHERE id = :activity_id
    """), {"activity_id": activity_id, "approved_by": user.id})

    await db.commit()

    # Fetch updated activity
    stmt = select(Activity).options(
        # selectinload(Activity.park),
    ).where(Activity.id == activity_id)

    result = await db.execute(stmt)
    activity = result.scalar_one()

    return ActivityOut.model_validate(activity)

@router.post(
    "/{activity_id}/reject",
    response_model=ActivityOut,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "Activity not found"},
    },
)
async def reject_activity(
    activity_id: int,
    reason: str,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    # Check if activity exists
    stmt = select(Activity).where(Activity.id == activity_id)
    result = await db.execute(stmt)
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Update status to rejected
    await db.execute(text("""
        UPDATE activities 
        SET status = 'rejected', rejected_at = now(), rejection_reason = :reason, updated_at = now()
        WHERE id = :activity_id
    """), {"activity_id": activity_id, "reason": reason})

    await db.commit()

    # Fetch updated activity
    stmt = select(Activity).options(
        # selectinload(Activity.park),
    ).where(Activity.id == activity_id)

    result = await db.execute(stmt)
    activity = result.scalar_one()

    return ActivityOut.model_validate(activity)
