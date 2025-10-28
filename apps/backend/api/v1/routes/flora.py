# apps/backend/api/v1/routes/flora.py
from typing import List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database.session import get_session
from domains.flora.models import Flora
from domains.parks.models import Park
from domains.galleries.models import Gallery, GalleryStatus
# Zone import removed - zones functionality removed
from users.models import User
from domains.articles.models import UserRole
from api.v1.permissions.rbac import current_user
from api.v1.permissions.policies import require_roles
from api.v1.serializers.flora import FloraIn, FloraOut, FloraUpdate, FloraListResponse
from api.v1.serializers.common import ErrorResponse
from utils.events import emit

router = APIRouter(prefix="/flora")

@router.get("/",
    response_model=FloraListResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        422: {"model": ErrorResponse, "description": "Validation Error - Invalid query parameters"}
    }
)
@router.get("",
    response_model=FloraListResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        422: {"model": ErrorResponse, "description": "Validation Error - Invalid query parameters"}
    }
)
async def list_flora(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    q: Optional[str] = Query(None, description="Cari berdasarkan nama lokal atau ilmiah", examples=["Rafflesia"]),
    # region_code: Optional[str] = Query(None, description="Filter berdasarkan kode region", examples=["KALTIM"]),  # Removed - using user-based access control
    status_filter: Optional[str] = Query(None, description="Filter berdasarkan status workflow", examples=["approved"]),
    submitted_by: Optional[str] = Query(None, description="Filter berdasarkan user yang submit (user ID or 'me')", examples=["me"]),
    sort: Optional[str] = Query(None, description="Urutkan hasil (contoh: created_at_desc, local_name_asc)"),
    limit: int = Query(50, ge=1, le=1000, description="Jumlah item per halaman"),
    offset: int = Query(0, ge=0, description="Offset untuk pagination"),
):
    # Get real data from database
    stmt = select(Flora).where(Flora.deleted_at == None)
    
    # ✅ IMPORTANT: Filter berdasarkan status dan permission
    # - Draft: hanya pembuat yang bisa lihat
    # - Rejected: hanya pembuat dan super admin yang bisa lihat
    # - Deleted: tidak bisa diakses siapapun (sudah di-filter di atas)
    # - Approved & In_review: semua authenticated user bisa lihat
    try:
        user_id_int = int(user.id)
        from sqlalchemy import or_, and_
        
        if user.role == UserRole.super_admin:
            # Super admin bisa lihat semua status kecuali deleted
            pass
        else:
            # Regional admin dan user lain:
            # - Bisa lihat approved dan in_review
            # - Bisa lihat draft dan rejected milik mereka sendiri
            stmt = stmt.where(
                or_(
                    Flora.status.in_(['approved', 'in_review']),  # Public statuses
                    and_(
                        Flora.status.in_(['draft', 'rejected']),  # Private statuses
                        Flora.submitted_by == user_id_int  # Only their own
                    )
                )
            )
        print(f"🔒 [FLORA] Filtering by status and user permissions (user_id: {user_id_int}, role: {user.role})")
    except (ValueError, TypeError) as e:
        print(f"⚠️ Failed to apply status filter: {e}")
    
    # Filter by status
    if status_filter:
        stmt = stmt.where(Flora.status == status_filter)
        print(f"🔍 [FLORA] Filtering by status: {status_filter}")
    
    # Filter by submitted_by
    if submitted_by:
        if submitted_by == "me":
            # Filter by current user's submitted flora
            try:
                user_id_int = int(user.id)
                stmt = stmt.where(Flora.submitted_by == user_id_int)
                print(f"🔍 Filtering flora submitted by current user: {user_id_int}")
            except (ValueError, TypeError) as e:
                print(f"⚠️ Failed to convert user.id to int: {e}")
                stmt = stmt.where(Flora.id == -1)
        else:
            # Filter by specific user ID
            try:
                submitted_by_int = int(submitted_by)
                stmt = stmt.where(Flora.submitted_by == submitted_by_int)
                print(f"🔍 Filtering flora submitted by user: {submitted_by_int}")
            except ValueError:
                print(f"⚠️ Invalid submitted_by parameter: {submitted_by}")
                stmt = stmt.where(Flora.id == -1)
    # Regional admin scope - using park-based access control
    elif user.role == UserRole.regional_admin:
        if user.park_id:
            # Filter by park_id - only show flora from their assigned park
            stmt = stmt.where(Flora.park_id == user.park_id)
            print(f"🔍 Filtering flora for regional admin: park_id == {user.park_id}")
        else:
            # If no park_id assigned, filter by their submitted flora
            try:
                user_id_int = int(user.id)
                stmt = stmt.where(Flora.submitted_by == user_id_int)
                print(f"🔍 Filtering flora for regional admin: submitted_by == {user_id_int}")
            except (ValueError, TypeError) as e:
                print(f"⚠️ Failed to convert user.id to int: {e}")
                stmt = stmt.where(Flora.id == -1)
    
    # Get total count with same filter
    count_stmt = select(func.count(Flora.id)).where(Flora.deleted_at == None)
    
    # ✅ Apply same status filter to count
    try:
        user_id_int = int(user.id)
        from sqlalchemy import or_, and_
        
        if user.role != UserRole.super_admin:
            count_stmt = count_stmt.where(
                or_(
                    Flora.status.in_(['approved', 'in_review']),
                    and_(
                        Flora.status.in_(['draft', 'rejected']),
                        Flora.submitted_by == user_id_int
                    )
                )
            )
    except (ValueError, TypeError):
        pass
    
    # Apply status filter to count if provided
    if status_filter:
        count_stmt = count_stmt.where(Flora.status == status_filter)
    
    if submitted_by:
        if submitted_by == "me":
            try:
                user_id_int = int(user.id)
                count_stmt = count_stmt.where(Flora.submitted_by == user_id_int)
            except (ValueError, TypeError):
                count_stmt = count_stmt.where(Flora.id == -1)
        else:
            try:
                submitted_by_int = int(submitted_by)
                count_stmt = count_stmt.where(Flora.submitted_by == submitted_by_int)
            except ValueError:
                count_stmt = count_stmt.where(Flora.id == -1)
    elif user.role == UserRole.regional_admin:
        if user.park_id:
            # Filter by park_id - only count flora from their assigned park
            count_stmt = count_stmt.where(Flora.park_id == user.park_id)
        else:
            # If no park_id assigned, filter by their submitted flora
            try:
                user_id_int = int(user.id)
                count_stmt = count_stmt.where(Flora.submitted_by == user_id_int)
            except (ValueError, TypeError):
                count_stmt = count_stmt.where(Flora.id == -1)
    
    total = (await db.execute(count_stmt)).scalar() or 0

    # Apply pagination
    stmt = stmt.limit(limit).offset(offset)
    rows = (await db.execute(stmt)).scalars().all()

    # Get unique park IDs from flora records
    park_ids = list(set([flora.park_id for flora in rows if flora.park_id]))
    
    # Fetch park data for all unique park IDs
    parks_data = {}
    if park_ids:
        parks_stmt = select(Park).where(Park.id.in_(park_ids))
        parks_result = (await db.execute(parks_stmt)).scalars().all()
        parks_data = {park.id: park for park in parks_result}

    # Convert to complete format
    items = []
    for flora in rows:
        park_data = None
        if flora.park_id and flora.park_id in parks_data:
            park = parks_data[flora.park_id]
            park_data = {
                "id": park.id,
                "name": park.name
            }
        
        items.append({
            "id": flora.id,
            "local_name": flora.local_name,
            "scientific_name": flora.scientific_name,
            "family": flora.family,
            "genus": flora.genus,
            "species": flora.species,
            "description": flora.description,
            "habitat": flora.habitat,
            "morphology": flora.morphology,
            "benefits": flora.benefits,
            "uses": flora.uses,
            "local_id": flora.local_id,
            "image_url": flora.image_url,
            "gambar_utama": flora.gambar_utama,
            "is_endemic": flora.is_endemic,
            "iucn_status": flora.iucn_status,
            "park_id": flora.park_id,
            "park": park_data,
            "status": flora.status,
            "submitted_by": flora.submitted_by,
            "approved_by": flora.approved_by,
            "rejected_by": flora.rejected_by,
            "submitted_at": flora.submitted_at.isoformat() if flora.submitted_at else None,
            "approved_at": flora.approved_at.isoformat() if flora.approved_at else None,
            "rejected_at": flora.rejected_at.isoformat() if flora.rejected_at else None,
            "rejection_reason": flora.rejection_reason,
            "created_at": flora.created_at.isoformat() if flora.created_at else None,
            "updated_at": flora.updated_at.isoformat() if flora.updated_at else None,
            "wilayah": None,
        })

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_next": (offset + limit) < total,
        "has_prev": offset > 0
    }

@router.get(
    "/{flora_id}",
    response_model=FloraOut,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Flora not found"},
        403: {"model": ErrorResponse, "description": "Forbidden - Region access denied"}
    }
)
async def get_flora(flora_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    stmt = select(Flora).where(Flora.id == flora_id, Flora.deleted_at == None)
    obj = (await db.execute(stmt)).scalars().first()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flora dengan ID tersebut tidak ditemukan"
        )

    # Load park data if park_id exists
    park_data = None
    if obj.park_id:
        park_stmt = select(Park).where(Park.id == obj.park_id)
        park_obj = (await db.execute(park_stmt)).scalars().first()
        if park_obj:
            park_data = {
                "id": park_obj.id,
                "name": park_obj.name
            }

    # Create response data with park information
    response_data = {
        "id": obj.id,
        "local_name": obj.local_name,
        "scientific_name": obj.scientific_name,
        "family": obj.family,
        "genus": obj.genus,
        "species": obj.species,
        "description": obj.description,
        "habitat": obj.habitat,
        "morphology": obj.morphology,
        "benefits": obj.benefits,
        "uses": obj.uses,
        "local_id": obj.local_id,
        "image_url": obj.image_url,
        "gambar_utama": obj.gambar_utama,
        "is_endemic": obj.is_endemic,
        "iucn_status": obj.iucn_status,
        "park_id": obj.park_id,
        "park": park_data,
        "status": obj.status,
        "submitted_by": obj.submitted_by,
        "approved_by": obj.approved_by,
        "rejected_by": obj.rejected_by,
        "submitted_at": obj.submitted_at,
        "approved_at": obj.approved_at,
        "rejected_at": obj.rejected_at,
        "rejection_reason": obj.rejection_reason,
        "created_at": obj.created_at,
        "updated_at": obj.updated_at,
    }

    return FloraOut.model_validate(response_data)

@router.post(
    "/",
    response_model=FloraOut,
    status_code=201,
    dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient role or region scope"},
        400: {"model": ErrorResponse, "description": "Bad Request - Invalid park_id"},
        422: {"model": ErrorResponse, "description": "Validation Error"}
    }
)
async def create_flora(payload: FloraIn, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    # Validasi park_id: regional_admin hanya bisa create flora untuk park mereka sendiri
    if user.role == UserRole.regional_admin:
        if not user.park_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Regional admin belum di-assign ke park manapun. Silakan buat dan submit park terlebih dahulu, lalu tunggu approval dari super admin."
            )
        # Auto-set park_id to user's park (setelah park approved, user sudah punya park_id)
        payload.park_id = user.park_id

    # Workaround: Use raw SQL due to SQLAlchemy foreign key resolution issue
    from sqlalchemy import text
    
    # Prepare the data
    iucn_status_value = payload.iucn_status.value if payload.iucn_status else None
    local_name_value = payload.local_name or payload.scientific_name or "Unknown"
    
    # Insert using raw SQL - tambahkan submitted_by dan status
    # ✅ Use status from payload (frontend sends 'draft' or 'in_review')
    status_value = payload.status.value if payload.status else 'draft'  # Get enum value
    
    result = await db.execute(text("""
        INSERT INTO flora (park_id, local_name, scientific_name, family, genus, description, morphology, benefits, is_endemic, iucn_status, gambar_utama, submitted_by, status, created_at, updated_at)
        VALUES (:park_id, :local_name, :scientific_name, :family, :genus, :description, :morphology, :benefits, :is_endemic, :iucn_status, :gambar_utama, :submitted_by, :status, now(), now())
        RETURNING id
    """), {
        "park_id": payload.park_id,
        "local_name": payload.local_name,
        "scientific_name": payload.scientific_name,
        "family": payload.family,
        "genus": payload.genus,
        "description": payload.description,
        "morphology": payload.morphology,
        "benefits": payload.benefits,
        "is_endemic": payload.is_endemic,
        "iucn_status": iucn_status_value,
        "gambar_utama": getattr(payload, 'gambar_utama', None),
        "submitted_by": int(user.id),  # ✅ Set submitted_by (convert to int)
        "status": status_value  # ✅ Use status from frontend
    })
    
    flora_id = result.scalar()
    await db.commit()
    
    # Fetch the created record
    created_flora = await db.execute(select(Flora).where(Flora.id == flora_id))
    obj = created_flora.scalars().first()
    
    return FloraOut.model_validate(obj)

@router.put(
    "/{flora_id}",
    response_model=FloraOut,
    dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Flora not found"}
    }
)
async def update_flora(flora_id: int, payload: FloraUpdate, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    obj = (await db.execute(select(Flora).where(Flora.id == flora_id, Flora.deleted_at == None))).scalars().first()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flora dengan ID tersebut tidak ditemukan"
        )

    # Validasi: regional_admin hanya bisa update flora yang SUBMITTED BY mereka sendiri
    if user.role == UserRole.regional_admin:
        # Check if flora submitted by this user (convert user.id to int for comparison)
        if obj.submitted_by != int(user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda hanya bisa mengupdate flora yang Anda submit sendiri"
            )

    # Workaround: Use raw SQL for UPDATE due to SQLAlchemy foreign key resolution issue
    from sqlalchemy import text
    
    # Build dynamic UPDATE query
    update_fields = []
    update_values = {"flora_id": flora_id}
    
    for f in ("local_name","scientific_name","family","genus","description","morphology","benefits","is_endemic","iucn_status","park_id","gambar_utama"):
        v = getattr(payload, f, None)
        if v is not None:
            if f == "iucn_status" and v:
                update_fields.append(f"{f} = :{f}")
                update_values[f] = v.value
            else:
                update_fields.append(f"{f} = :{f}")
                update_values[f] = v
    
    if update_fields:
        update_fields.append("updated_at = now()")
        
        # If regional_admin edits approved flora, set status back to in_review
        if user.role == UserRole.regional_admin and obj.status == "approved":
            update_fields.append("status = 'in_review'")
            print(f"⚠️  Flora {flora_id} was approved, now back to in_review after edit by regional_admin")
        
        query = f"UPDATE flora SET {', '.join(update_fields)} WHERE id = :flora_id"
        await db.execute(text(query), update_values)
        await db.commit()
    
    # Fetch the updated record
    updated_flora = await db.execute(select(Flora).where(Flora.id == flora_id))
    obj = updated_flora.scalars().first()
    
    return FloraOut.model_validate(obj)

@router.delete(
    "/{flora_id}",
    dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Flora not found"}
    }
)
async def delete_flora(flora_id: int, db: AsyncSession = Depends(get_session)):
    obj = (await db.execute(select(Flora).where(Flora.id == flora_id))).scalars().first()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flora dengan ID tersebut tidak ditemukan"
        )
    obj.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"ok": True}

# -------------------- WORKFLOW --------------------

@router.post(
    "/{flora_id}/submit",
    dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Flora not found"}
    }
)
async def submit_flora(flora_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    obj = (await db.execute(select(Flora).where(Flora.id == flora_id, Flora.deleted_at == None))).scalars().first()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flora dengan ID tersebut tidak ditemukan"
        )
    if user.role == UserRole.regional_admin:
        # Regional admin can only submit flora they created
        # Region-based access control removed - using user-based access control
        if obj.submitted_by and obj.submitted_by != int(user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda hanya bisa submit flora yang Anda buat sendiri"
            )
    obj.status = "in_review"
    obj.submitted_by = user.id or 0
    obj.submitted_at = datetime.now(timezone.utc)
    await db.commit()
    emit("flora.submitted", entity="flora", entity_id=flora_id, region_code=None)  # Temporarily disabled due to relationship issues
    return {"ok": True}

@router.post(
    "/{flora_id}/approve",
    dependencies=[Depends(require_roles(UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Flora not found"}
    }
)
async def approve_flora(flora_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    obj = (await db.execute(select(Flora).where(Flora.id == flora_id, Flora.deleted_at == None))).scalars().first()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flora dengan ID tersebut tidak ditemukan"
        )
    # Super Admin bisa approve tanpa batasan region
    obj.status = "approved"
    obj.approved_by = user.id or 0
    obj.approved_at = datetime.now(timezone.utc)
    
    # Cascade approve: Auto-approve all galleries for this flora
    await db.execute(
        update(Gallery)
        .where(
            Gallery.entity_type == "flora",
            Gallery.entity_id == flora_id,
            Gallery.status.in_([GalleryStatus.draft.value, GalleryStatus.in_review.value])
        )
        .values(status=GalleryStatus.approved.value)
    )
    
    await db.commit()
    emit("flora.approved", entity="flora", entity_id=flora_id, region_code=None)  # Temporarily disabled due to relationship issues
    
    # Log gallery approval
    gallery_count = (await db.execute(
        select(func.count(Gallery.id))
        .where(Gallery.entity_type == "flora", Gallery.entity_id == flora_id, Gallery.status == GalleryStatus.approved.value)
    )).scalar()
    print(f"✅ Flora {flora_id} approved. Auto-approved {gallery_count} galleries.")
    
    return {"ok": True}

@router.post(
    "/{flora_id}/reject",
    dependencies=[Depends(require_roles(UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Flora not found"}
    }
)
async def reject_flora(flora_id: int, payload: dict, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    obj = (await db.execute(select(Flora).where(Flora.id == flora_id, Flora.deleted_at == None))).scalars().first()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flora dengan ID tersebut tidak ditemukan"
        )
    # Super Admin bisa reject tanpa batasan region
    obj.status = "rejected"
    obj.rejection_reason = payload.get("reason", "")
    obj.approved_by = user.id or 0
    obj.rejected_at = datetime.now(timezone.utc)
    await db.commit()
    emit("flora.rejected", entity="flora", entity_id=flora_id, region_code=None, reason=payload.get("reason"))  # Temporarily disabled due to relationship issues
    return {"ok": True}

# -------------------- REVIEW & BULK OPERATIONS --------------------

@router.get(
    "/review",
    response_model=FloraListResponse,
    dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"}
    }
)
async def review_flora_inbox(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    region_code: Optional[str] = Query(None, description="Filter berdasarkan kode region"),
    limit: int = Query(50, ge=1, le=100, description="Jumlah item per halaman"),
    offset: int = Query(0, ge=0, description="Offset untuk pagination"),
):
    """Inbox untuk reviewer melihat flora yang perlu direview"""
    stmt = select(Flora).where(Flora.status == "in_review", Flora.deleted_at == None)

    # Regional admin hanya lihat regionnya
    if user.role == UserRole.regional_admin:
        # stmt = stmt.join(Zone, Zone.id == Flora.park_id).where(Zone.region_code == user.region_code)
        pass  # Temporarily disabled due to schema changes

    # Region filter untuk super admin
    if region_code and user.role == UserRole.super_admin:
        # stmt = stmt.join(Zone, Zone.id == Flora.park_id).where(Zone.region_code == user.region_code)
        pass  # Temporarily disabled due to schema changes

    # Get total count for pagination metadata
    count_stmt = stmt.with_only_columns(func.count(), maintain_column_froms=True).order_by(None)
    total = (await db.execute(count_stmt)).scalar() or 0

    # Apply pagination
    stmt = stmt.limit(limit).offset(offset)
    rows = (await db.execute(stmt)).scalars().all()

    return FloraListResponse(
        items=[FloraOut.model_validate(flora) for flora in rows],
        total=total,
        limit=limit,
        offset=offset,
        has_next=(offset + limit) < total,
        has_prev=offset > 0
    )

@router.post(
    "/bulk",
    response_model=dict,
    dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        422: {"model": ErrorResponse, "description": "Validation Error"}
    }
)
async def bulk_create_flora(
    payload: List[FloraIn],
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """Bulk create multiple flora records"""
    created_count = 0
    errors = []

    for i, flora_data in enumerate(payload):
        try:
            # Validasi park_id -> region scope
            # z = (await db.execute(select(Zone).where(Zone.id == flora_data.park_id))).scalars().first()
            # if not z:
            #     errors.append(f"Item {i}: Zone dengan ID tersebut tidak ditemukan")
            #     continue

            # if user.role == UserRole.regional_admin and user.region_code != z.region_code:
            #     errors.append(f"Item {i}: Anda tidak memiliki akses untuk region ini")
            #     continue

            obj = Flora(
                park_id=flora_data.park_id,
                local_name=flora_data.local_name,
                scientific_name=flora_data.scientific_name,
                family=flora_data.family,
                genus=flora_data.genus,
                description=flora_data.description,
                is_endemic=flora_data.is_endemic,
                iucn_status=flora_data.iucn_status.value if flora_data.iucn_status else None,
                status="draft",
                submitted_by=None,
            )
            db.add(obj)
            created_count += 1

        except Exception as e:
            errors.append(f"Item {i}: {str(e)}")

    await db.commit()

    return {
        "created": created_count,
        "errors": errors,
        "total_processed": len(payload)
    }

@router.get(
    "/csv",
    dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"}
    }
)
async def export_flora_csv(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    region_code: Optional[str] = Query(None, description="Filter berdasarkan kode region"),
):
    """Export flora data sebagai CSV (hanya yang approved)"""
    # Only approved flora for public/volunteer/ranger
    stmt = select(Flora).where(Flora.status == "approved", Flora.deleted_at == None)

    if region_code:
        # stmt = stmt.join(Zone, Zone.id == Flora.park_id).where(Zone.region_code == user.region_code)
        pass  # Temporarily disabled due to schema changes

    rows = (await db.execute(stmt)).scalars().all()

    # Generate CSV content
    import io
    import csv

    output = io.StringIO()
    writer = csv.writer(output)

    # Header - exclude PII for non-super admin
    if user.role == UserRole.super_admin:
        writer.writerow([
            "ID", "Nama Lokal", "Nama Ilmiah", "Family", "Genus",
            "Deskripsi", "Endemik", "IUCN Status", "Status", "Zona", "Region"
        ])
    else:
        writer.writerow([
            "Nama Lokal", "Nama Ilmiah", "Family", "Genus",
            "Deskripsi", "Endemik", "IUCN Status", "Status", "Zona"
        ])

    # Data rows
    for flora in rows:
        if user.role == UserRole.super_admin:
            writer.writerow([
                flora.id,
                flora.local_name or "",
                flora.scientific_name or "",
                flora.family or "",
                flora.genus or "",
                flora.description or "",
                "Ya" if flora.is_endemic else "Tidak",
                flora.iucn_status or "",
                flora.status,
                getattr(flora.zone, "name", ""),
                getattr(flora.zone, "region_code", "")
            ])
        else:
            writer.writerow([
                flora.local_name or "",
                flora.scientific_name or "",
                flora.family or "",
                flora.genus or "",
                flora.description or "",
                "Ya" if flora.is_endemic else "Tidak",
                flora.iucn_status or "",
                flora.status,
                getattr(flora.zone, "name", "")
            ])

    csv_content = output.getvalue()
    output.close()

    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=flora_export.csv"}
    )

@router.get(
    "/stats",
    response_model=dict,
    dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"}
    }
)
async def flora_stats(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    region_code: Optional[str] = Query(None, description="Filter berdasarkan kode region"),
):
    """Get flora statistics"""
    # Base query with region filter
    base_query = select(Flora).where(Flora.deleted_at == None)
    if region_code:
        # base_query = base_query.join(Zone, Zone.id == Flora.park_id).where(Zone.region_code == region_code)
        pass  # Temporarily disabled due to schema changes

    # Total counts by status - use direct count queries to avoid cartesian products
    if region_code:
        total = (await db.execute(
            select(func.count(Flora.id))
            .join(Zone, Zone.id == Flora.park_id)
            .where(Flora.deleted_at == None)        )).scalar() or 0
    else:
        total = (await db.execute(select(func.count(Flora.id)).where(Flora.deleted_at == None))).scalar() or 0

    # Create separate queries for each status
    if region_code:
        draft_count = (await db.execute(
            select(func.count(Flora.id))
            .join(Zone, Zone.id == Flora.park_id)
            .where(Flora.deleted_at == None, Flora.status == "draft")        )).scalar() or 0
        in_review_count = (await db.execute(
            select(func.count(Flora.id))
            .join(Zone, Zone.id == Flora.park_id)
            .where(Flora.deleted_at == None, Flora.status == "in_review")        )).scalar() or 0
        approved_count = (await db.execute(
            select(func.count(Flora.id))
            .join(Zone, Zone.id == Flora.park_id)
            .where(Flora.deleted_at == None, Flora.status == "approved")        )).scalar() or 0
        rejected_count = (await db.execute(
            select(func.count(Flora.id))
            .join(Zone, Zone.id == Flora.park_id)
            .where(Flora.deleted_at == None, Flora.status == "rejected")        )).scalar() or 0
    else:
        draft_count = (await db.execute(select(func.count(Flora.id)).where(Flora.deleted_at == None, Flora.status == "draft"))).scalar() or 0
        in_review_count = (await db.execute(select(func.count(Flora.id)).where(Flora.deleted_at == None, Flora.status == "in_review"))).scalar() or 0
        approved_count = (await db.execute(select(func.count(Flora.id)).where(Flora.deleted_at == None, Flora.status == "approved"))).scalar() or 0
        rejected_count = (await db.execute(select(func.count(Flora.id)).where(Flora.deleted_at == None, Flora.status == "rejected"))).scalar() or 0

    # IUCN status breakdown - create separate queries for each status
    iucn_counts = {}
    for status in ["LC", "NT", "VU", "EN", "CR", "DD", "NE"]:
        if region_code:
            count = (await db.execute(
                select(func.count(Flora.id))
                .join(Zone, Zone.id == Flora.park_id)
                .where(Flora.deleted_at == None, Flora.iucn_status == status)            )).scalar() or 0
        else:
            count = (await db.execute(select(func.count(Flora.id)).where(Flora.deleted_at == None, Flora.iucn_status == status))).scalar() or 0
        iucn_counts[status] = count

    # Endemic count
    if region_code:
        endemic_count = (await db.execute(
            select(func.count(Flora.id))
            .join(Zone, Zone.id == Flora.park_id)
            .where(Flora.deleted_at == None, Flora.is_endemic == True)        )).scalar() or 0
    else:
        endemic_count = (await db.execute(select(func.count(Flora.id)).where(Flora.deleted_at == None, Flora.is_endemic == True))).scalar() or 0

    return {
        "total": total,
        "by_status": {
            "draft": draft_count,
            "in_review": in_review_count,
            "approved": approved_count,
            "rejected": rejected_count
        },
        "by_iucn": iucn_counts,
        "endemic": endemic_count,
        "region_code": region_code
    }
