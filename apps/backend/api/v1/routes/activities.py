# apps/backend/api/v1/routes/activities.py
from typing import Optional, List
import json
import os
import uuid
from datetime import datetime, date
from pathlib import Path
import aiofiles

from fastapi import APIRouter, Depends, Query, HTTPException, status, UploadFile, File, Form
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database.session import get_session
from domains.activities.models import Activity
from users.models import User, UserRole
from api.v1.permissions.rbac import current_user
from api.v1.serializers.activities import ActivityIn, ActivityOut, ActivityUpdate, ActivityListResponse
from api.v1.serializers.common import ErrorResponse

router = APIRouter(prefix="/activities")

# Configuration
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

def generate_filename(original_filename: str) -> str:
    """Generate unique filename"""
    ext = Path(original_filename).suffix.lower()
    unique_id = str(uuid.uuid4())
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{timestamp}_{unique_id}{ext}"

async def save_uploaded_files(files: List[UploadFile]) -> List[str]:
    """Save uploaded files and return their URLs"""
    uploaded_urls = []
    
    for file in files:
        if not file.filename or not is_allowed_file(file.filename):
            continue
            
        # Check file size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            continue
            
        # Generate unique filename
        filename = generate_filename(file.filename)
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        
        # Generate URL
        file_url = f"/uploads/{filename}"
        uploaded_urls.append(file_url)
    
    return uploaded_urls

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
    stmt = select(Activity).options(
        selectinload(Activity.park),
        selectinload(Activity.submitted_by_user),
        selectinload(Activity.approved_by_user),
    )

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

    # Convert activities to response format with additional fields
    activity_items = []
    for activity in activities:
        activity_data = ActivityOut.model_validate(activity)
        # Add created_by name from submitted_by_user relationship
        if hasattr(activity, 'submitted_by_user') and activity.submitted_by_user:
            activity_data.created_by = activity.submitted_by_user.display_name or activity.submitted_by_user.email
        activity_items.append(activity_data)
    
    return {
        "items": activity_items,
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
    # Convert date string to date object
    activity_date_obj = datetime.strptime(payload.activity_date, '%Y-%m-%d').date()
    
    # Insert using raw SQL
    images_json = json.dumps(payload.images) if payload.images else None
    result = await db.execute(text("""
        INSERT INTO activities (park_id, title, description, activity_date, location, images, status, submitted_by, created_at, updated_at)
        VALUES (:park_id, :title, :description, :activity_date, :location, :images, 'draft', :submitted_by, now(), now())
        RETURNING id
    """), {
        "park_id": payload.park_id,
        "title": payload.title,
        "description": payload.description,
        "activity_date": activity_date_obj,
        "location": payload.location,
        "images": images_json,
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

@router.post(
    "/with-images",
    response_model=ActivityOut,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        422: {"model": ErrorResponse, "description": "Validation Error - Invalid input data"},
    },
)
async def create_activity_with_images(
    title: str = Form(..., description="Judul kegiatan"),
    description: Optional[str] = Form(None, description="Deskripsi kegiatan"),
    activity_date: str = Form(..., description="Tanggal kegiatan (YYYY-MM-DD)"),
    location: Optional[str] = Form(None, description="Lokasi kegiatan"),
    park_id: int = Form(..., description="ID taman"),
    images: List[UploadFile] = File([], description="Gambar kegiatan"),
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    """
    Create activity with image uploads in a single request
    """
    try:
        # Save uploaded images
        image_urls = await save_uploaded_files(images)
        
        # Convert date string to date object
        activity_date_obj = datetime.strptime(activity_date, '%Y-%m-%d').date()
        
        # Insert activity with images
        images_json = json.dumps(image_urls) if image_urls else None
        result = await db.execute(text("""
            INSERT INTO activities (park_id, title, description, activity_date, location, images, status, submitted_by, created_at, updated_at)
            VALUES (:park_id, :title, :description, :activity_date, :location, :images, 'draft', :submitted_by, now(), now())
            RETURNING id
        """), {
            "park_id": park_id,
            "title": title,
            "description": description,
            "activity_date": activity_date_obj,
            "location": location,
            "images": images_json,
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
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create activity: {str(e)}")

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
    
    # Handle images field separately
    if payload.images is not None:
        images_json = json.dumps(payload.images) if payload.images else None
        update_fields.append("images = :images")
        update_values["images"] = images_json

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

@router.put(
    "/{activity_id}/with-images",
    response_model=ActivityOut,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "Activity not found"},
        422: {"model": ErrorResponse, "description": "Validation Error - Invalid input data"},
    },
)
async def update_activity_with_images(
    activity_id: int,
    title: Optional[str] = Form(None, description="Judul kegiatan"),
    description: Optional[str] = Form(None, description="Deskripsi kegiatan"),
    activity_date: Optional[str] = Form(None, description="Tanggal kegiatan (YYYY-MM-DD)"),
    location: Optional[str] = Form(None, description="Lokasi kegiatan"),
    park_id: Optional[int] = Form(None, description="ID taman"),
    images: List[UploadFile] = File([], description="Gambar kegiatan"),
    existing_images: Optional[str] = Form(None, description="Existing images JSON"),
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    """
    Update activity with image uploads in a single request
    """
    try:
        # Check if activity exists
        stmt = select(Activity).where(Activity.id == activity_id)
        result = await db.execute(stmt)
        activity = result.scalar_one_or_none()

        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")

        # Build update fields
        update_fields = []
        update_values = {"activity_id": activity_id}
        
        # Handle text fields
        if title is not None:
            update_fields.append("title = :title")
            update_values["title"] = title
        if description is not None:
            update_fields.append("description = :description")
            update_values["description"] = description
        if activity_date is not None:
            # Convert date string to date object
            activity_date_obj = datetime.strptime(activity_date, '%Y-%m-%d').date()
            update_fields.append("activity_date = :activity_date")
            update_values["activity_date"] = activity_date_obj
        if location is not None:
            update_fields.append("location = :location")
            update_values["location"] = location
        if park_id is not None:
            update_fields.append("park_id = :park_id")
            update_values["park_id"] = park_id

        # Handle images
        if images or existing_images:
            all_images = []
            
            # Parse existing images from form data
            if existing_images:
                try:
                    all_images = json.loads(existing_images)
                except (json.JSONDecodeError, TypeError):
                    all_images = []
            
            # Add new uploaded images
            if images:
                image_urls = await save_uploaded_files(images)
                all_images.extend(image_urls)
            
            update_fields.append("images = :images")
            update_values["images"] = json.dumps(all_images)

        if not update_fields:
            # No fields to update, return current activity
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
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update activity: {str(e)}")

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
