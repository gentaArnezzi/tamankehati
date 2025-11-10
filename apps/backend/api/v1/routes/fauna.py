# apps/backend/api/v1/routes/fauna.py
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database.session import get_session
from domains.fauna.models import Fauna
from domains.parks.models import Park
from domains.galleries.models import Gallery, GalleryStatus
# from domains.zones.models import Zone  # Temporarily disabled due to schema changes
from users.models import User, UserRole
from api.v1.permissions.rbac import current_user
from api.v1.permissions.policies import require_roles
from api.v1.serializers.fauna import FaunaIn, FaunaOut, FaunaUpdate, FaunaListResponse
from api.v1.serializers.common import ErrorResponse

router = APIRouter(prefix="/fauna")

@router.get(
    "/",
    response_model=FaunaListResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        422: {"model": ErrorResponse, "description": "Validation Error - Invalid query parameters"},
    },
)
@router.get(
    "",
    response_model=FaunaListResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient permissions"},
        422: {"model": ErrorResponse, "description": "Validation Error - Invalid query parameters"},
    },
)
async def list_fauna(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
    q: Optional[str] = Query(None, description="Cari berdasarkan nama lokal atau ilmiah", examples=["Orangutan"]),
    # region_code: Optional[str] = Query(None, description="Filter berdasarkan kode region", examples=["KALTIM"]),  # Removed - using user-based access control
    status_filter: Optional[str] = Query(None, description="Filter berdasarkan status workflow", examples=["approved"]),
    submitted_by: Optional[str] = Query(None, description="Filter berdasarkan user yang submit (user ID or 'me')", examples=["me"]),
    limit: int = Query(50, ge=1, le=1000, description="Jumlah item per halaman"),
    offset: int = Query(0, ge=0, description="Offset untuk pagination"),
):
    # Get real data from database
    stmt = select(Fauna).where(Fauna.deleted_at == None)
    
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
                    Fauna.status.in_(['approved', 'in_review']),  # Public statuses
                    and_(
                        Fauna.status.in_(['draft', 'rejected']),  # Private statuses
                        Fauna.submitted_by == user_id_int  # Only their own
                    )
                )
            )
        print(f"🔒 [FAUNA] Filtering by status and user permissions (user_id: {user_id_int}, role: {user.role})")
    except (ValueError, TypeError) as e:
        print(f"⚠️ Failed to apply status filter: {e}")
    
    # Filter by status
    if status_filter:
        stmt = stmt.where(Fauna.status == status_filter)
        print(f"🔍 [FAUNA] Filtering by status: {status_filter}")
    
    # Filter by submitted_by
    if submitted_by:
        if submitted_by == "me":
            # Filter by current user's submitted fauna
            try:
                user_id_int = int(user.id)
                stmt = stmt.where(Fauna.submitted_by == user_id_int)
                print(f"🔍 Filtering fauna submitted by current user: {user_id_int}")
            except (ValueError, TypeError) as e:
                print(f"⚠️ Failed to convert user.id to int: {e}")
                stmt = stmt.where(Fauna.id == -1)
        else:
            # Filter by specific user ID
            try:
                submitted_by_int = int(submitted_by)
                stmt = stmt.where(Fauna.submitted_by == submitted_by_int)
                print(f"🔍 Filtering fauna submitted by user: {submitted_by_int}")
            except ValueError:
                print(f"⚠️ Invalid submitted_by parameter: {submitted_by}")
                stmt = stmt.where(Fauna.id == -1)
    # Regional admin scope - using park-based access control
    elif user.role == UserRole.regional_admin:
        if user.park_id:
            # Filter by park_id - only show fauna from their assigned park
            stmt = stmt.where(Fauna.park_id == user.park_id)
            print(f"🔍 Filtering fauna for regional admin: park_id == {user.park_id}")
        else:
            # If no park_id assigned, filter by their submitted fauna
            try:
                user_id_int = int(user.id)
                stmt = stmt.where(Fauna.submitted_by == user_id_int)
                print(f"🔍 Filtering fauna for regional admin: submitted_by == {user_id_int}")
            except (ValueError, TypeError) as e:
                print(f"⚠️ Failed to convert user.id to int: {e}")
                stmt = stmt.where(Fauna.id == -1)
    
    # Get total count with same filter
    count_stmt = select(func.count(Fauna.id)).where(Fauna.deleted_at == None)
    
    # ✅ Apply same status filter to count
    try:
        user_id_int = int(user.id)
        from sqlalchemy import or_, and_
        
        if user.role != UserRole.super_admin:
            count_stmt = count_stmt.where(
                or_(
                    Fauna.status.in_(['approved', 'in_review']),
                    and_(
                        Fauna.status.in_(['draft', 'rejected']),
                        Fauna.submitted_by == user_id_int
                    )
                )
            )
    except (ValueError, TypeError):
        pass
    
    # Apply status filter to count if provided
    if status_filter:
        count_stmt = count_stmt.where(Fauna.status == status_filter)
    
    if submitted_by:
        if submitted_by == "me":
            try:
                user_id_int = int(user.id)
                count_stmt = count_stmt.where(Fauna.submitted_by == user_id_int)
            except (ValueError, TypeError):
                count_stmt = count_stmt.where(Fauna.id == -1)
        else:
            try:
                submitted_by_int = int(submitted_by)
                count_stmt = count_stmt.where(Fauna.submitted_by == submitted_by_int)
            except ValueError:
                count_stmt = count_stmt.where(Fauna.id == -1)
    elif user.role == UserRole.regional_admin:
        if user.park_id:
            # Filter by park_id - only count fauna from their assigned park
            count_stmt = count_stmt.where(Fauna.park_id == user.park_id)
        else:
            # If no park_id assigned, filter by their submitted fauna
            try:
                user_id_int = int(user.id)
                count_stmt = count_stmt.where(Fauna.submitted_by == user_id_int)
            except (ValueError, TypeError):
                count_stmt = count_stmt.where(Fauna.id == -1)
    
    total = (await db.execute(count_stmt)).scalar() or 0

    # Apply pagination
    stmt = stmt.limit(limit).offset(offset)
    rows = (await db.execute(stmt)).scalars().all()

    # Get unique park IDs from fauna records
    park_ids = list(set([fauna.park_id for fauna in rows if fauna.park_id]))
    
    # Fetch park data for all unique park IDs
    parks_data = {}
    if park_ids:
        parks_stmt = select(Park).where(Park.id.in_(park_ids))
        parks_result = (await db.execute(parks_stmt)).scalars().all()
        parks_data = {park.id: park for park in parks_result}

    # Convert to complete format
    items = []
    for fauna in rows:
        park_data = None
        if fauna.park_id and fauna.park_id in parks_data:
            park = parks_data[fauna.park_id]
            park_data = {
                "id": park.id,
                "name": park.name
            }
        
        items.append({
            "id": fauna.id,
            "local_name": fauna.local_name,
            "scientific_name": fauna.scientific_name,
            "class": fauna.class_,
            "family": fauna.family,
            "genus": fauna.genus,
            "species": fauna.species,
            "ordo": fauna.ordo,
            "description": fauna.description,
            "habitat": fauna.habitat,
            "diet": fauna.diet,
            "behavior": fauna.behavior,
            "morphology": fauna.morphology,
            "local_id": fauna.local_id,
            "image_url": fauna.image_url,
            "habitat_sumber_makanan": fauna.habitat_sumber_makanan,
            "status_hama": fauna.status_hama,
            "tingkat_hama": fauna.tingkat_hama,
            "gambar_utama": fauna.gambar_utama,
            "is_endemic": fauna.is_endemic,
            "iucn_status": fauna.iucn_status,
            "park_id": fauna.park_id,
            "park": park_data,
            "status": fauna.status,
            "submitted_by": fauna.submitted_by,
            "approved_by": fauna.approved_by,
            "rejected_by": fauna.rejected_by,
            "submitted_at": fauna.submitted_at.isoformat() if fauna.submitted_at else None,
            "approved_at": fauna.approved_at.isoformat() if fauna.approved_at else None,
            "rejected_at": fauna.rejected_at.isoformat() if fauna.rejected_at else None,
            "rejection_reason": fauna.rejection_reason,
            "created_at": fauna.created_at.isoformat() if fauna.created_at else None,
            "updated_at": fauna.updated_at.isoformat() if fauna.updated_at else None,
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

@router.get("/{fauna_id}", response_model=FaunaOut)
async def get_fauna(
    fauna_id: int,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    stmt = select(Fauna).where(Fauna.id == fauna_id, Fauna.deleted_at.is_(None))
    obj = (await db.execute(stmt)).scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail="Fauna not found")

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
        "class": obj.class_,
        "family": obj.family,
        "genus": obj.genus,
        "species": obj.species,
        "ordo": obj.ordo,
        "description": obj.description,
        "habitat": obj.habitat,
        "diet": obj.diet,
        "behavior": obj.behavior,
        "morphology": obj.morphology,
        "local_id": obj.local_id,
        "image_url": obj.image_url,
        "habitat_sumber_makanan": obj.habitat_sumber_makanan,
        "status_hama": obj.status_hama,
        "tingkat_hama": obj.tingkat_hama,
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

    return FaunaOut.model_validate(response_data)

@router.post(
    "/",
    response_model=FaunaOut,
    status_code=201,
    dependencies=[
        Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))
    ],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden - Insufficient role or region scope"},
        400: {"model": ErrorResponse, "description": "Bad Request - Invalid park_id"},
        422: {"model": ErrorResponse, "description": "Validation Error"},
    },
)
async def create_fauna(
    payload: FaunaIn,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    # Validasi park_id: regional_admin hanya bisa create fauna untuk park mereka sendiri
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
        INSERT INTO fauna (park_id, local_name, scientific_name, "class", family, genus, species, ordo, description, habitat, diet, behavior, morphology, habitat_sumber_makanan, status_hama, tingkat_hama, is_endemic, iucn_status, gambar_utama, submitted_by, status, created_at, updated_at)
        VALUES (:park_id, :local_name, :scientific_name, :class, :family, :genus, :species, :ordo, :description, :habitat, :diet, :behavior, :morphology, :habitat_sumber_makanan, :status_hama, :tingkat_hama, :is_endemic, :iucn_status, :gambar_utama, :submitted_by, :status, now(), now())
        RETURNING id
    """), {
        "park_id": payload.park_id,
        "local_name": payload.local_name,
        "scientific_name": payload.scientific_name,
        "class": getattr(payload, 'class_', None),
        "family": payload.family,
        "genus": payload.genus,
        "species": payload.species,
        "ordo": payload.ordo,
        "description": payload.description,
        "habitat": payload.habitat,
        "diet": payload.diet,
        "behavior": payload.behavior,
        "morphology": payload.morphology,
        "habitat_sumber_makanan": payload.habitat_sumber_makanan,
        "status_hama": payload.status_hama,
        "tingkat_hama": payload.tingkat_hama,
        "is_endemic": payload.is_endemic,
        "iucn_status": iucn_status_value,
        "gambar_utama": getattr(payload, 'gambar_utama', None),
        "submitted_by": int(user.id),  # ✅ Set submitted_by (convert to int)
        "status": status_value  # ✅ Use status from frontend
    })
    
    fauna_id = result.scalar()
    await db.commit()
    
    # Fetch the created record
    created_fauna = await db.execute(select(Fauna).where(Fauna.id == fauna_id))
    obj = created_fauna.scalars().first()
    
    return FaunaOut.model_validate(obj)

@router.put(
    "/{fauna_id}",
    response_model=FaunaOut,
    dependencies=[Depends(require_roles(UserRole.regional_admin, UserRole.super_admin))],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Fauna not found"},
    },
)
async def update_fauna(
    fauna_id: int,
    payload: FaunaUpdate,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
):
    obj = (
        await db.execute(
            select(Fauna).where(Fauna.id == fauna_id, Fauna.deleted_at.is_(None))
        )
    ).scalars().first()
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fauna dengan ID tersebut tidak ditemukan",
        )

    # Validasi: regional_admin hanya bisa update fauna yang SUBMITTED BY mereka sendiri
    if user.role == UserRole.regional_admin:
        # Check if fauna submitted by this user (convert user.id to int for comparison)
        if obj.submitted_by != int(user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda hanya bisa mengupdate fauna yang Anda submit sendiri"
            )

    # Workaround: Use raw SQL for UPDATE due to SQLAlchemy foreign key resolution issue
    from sqlalchemy import text
    import json
    
    # ✅ BACKUP DATA: If editing approved fauna, backup original data
    backup_json = None
    if obj.status == "approved":
        backup_query = text("""
            SELECT local_name, scientific_name, "class", family, genus, species, ordo, description, habitat, diet, behavior, morphology, habitat_sumber_makanan,
                   status_hama, tingkat_hama, is_endemic, iucn_status, park_id, gambar_utama
            FROM fauna WHERE id = :fauna_id
        """)
        backup_result = await db.execute(backup_query, {"fauna_id": fauna_id})
        backup_row = backup_result.fetchone()
        
        if backup_row:
            backup_data = {
                "local_name": backup_row[0],
                "scientific_name": backup_row[1],
                "class": backup_row[2],
                "family": backup_row[3],
                "genus": backup_row[4],
                "species": backup_row[5],
                "ordo": backup_row[6],
                "description": backup_row[7],
                "habitat": backup_row[8],
                "diet": backup_row[9],
                "behavior": backup_row[10],
                "morphology": backup_row[11],
                "habitat_sumber_makanan": backup_row[12],
                "status_hama": backup_row[13],
                "tingkat_hama": backup_row[14],
                "is_endemic": backup_row[15],
                "iucn_status": backup_row[16],
                "park_id": backup_row[17],
                "gambar_utama": backup_row[18],
                "_backup": True  # Mark as backup
            }
            backup_json = json.dumps(backup_data)
            print(f"💾 Backing up fauna {fauna_id} data before edit")
    
    # Build dynamic UPDATE query
    update_fields = []
    update_values = {"fauna_id": fauna_id}
    
    # Handle class field separately since it's a Python keyword
    class_value = getattr(payload, 'class_', None)
    if class_value is not None:
        update_fields.append('"class" = :class')
        update_values["class"] = class_value
    
    update_field_names = ("local_name", "scientific_name", "family", "genus", "species", "ordo", "description", "habitat", "diet", "behavior", "morphology", "habitat_sumber_makanan", "status_hama", "tingkat_hama", "is_endemic", "iucn_status", "park_id", "gambar_utama")
    for field in update_field_names:
        value = getattr(payload, field, None)
        if value is not None:
            if field == "iucn_status" and value:
                update_fields.append(f"{field} = :{field}")
                update_values[field] = value.value
            else:
                update_fields.append(f"{field} = :{field}")
                update_values[field] = value
    
    if update_fields:
        update_fields.append("updated_at = now()")
        
        # If regional_admin edits approved fauna, set status back to in_review and store backup
        if user.role == UserRole.regional_admin and obj.status == "approved":
            update_fields.append("status = 'in_review'")
            update_fields.append("submitted_at = now()")
            update_fields.append("approved_by = NULL")
            update_fields.append("approved_at = NULL")
            if backup_json:
                update_fields.append("rejection_reason = :backup_data")
                update_values["backup_data"] = backup_json
            print(f"⚠️  Fauna {fauna_id} was approved, now back to in_review after edit by regional_admin")
        
        query = f"UPDATE fauna SET {', '.join(update_fields)} WHERE id = :fauna_id"
        await db.execute(text(query), update_values)
        await db.commit()
    
    # Fetch the updated record
    updated_fauna = await db.execute(select(Fauna).where(Fauna.id == fauna_id))
    obj = updated_fauna.scalars().first()
    
    return FaunaOut.model_validate(obj)

@router.delete("/{fauna_id}", dependencies=[Depends(require_roles(
    UserRole.regional_admin, UserRole.super_admin
))])
async def delete_fauna(fauna_id: int, db: AsyncSession = Depends(get_session)):
    obj = (await db.execute(select(Fauna).where(Fauna.id == fauna_id, Fauna.deleted_at.is_(None)))).scalars().first()
    if not obj:
        raise HTTPException(404, "Fauna not found")
    obj.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"ok": True}

# -------------------- WORKFLOW --------------------

@router.post("/{fauna_id}/submit", dependencies=[Depends(require_roles(
    UserRole.regional_admin, UserRole.super_admin
))])
async def submit_fauna(fauna_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    obj = (await db.execute(select(Fauna).where(Fauna.id == fauna_id))).scalars().first()
    if not obj: raise HTTPException(404, "Fauna not found")
    # if user.role == UserRole.regional_admin and getattr(obj.zone, "region_code", None) != user.region_code:
    #     raise HTTPException(403, "Region mismatch")
    obj.status = "in_review"
    obj.submitted_by = user.id or 0
    obj.submitted_at = datetime.now(timezone.utc)
    await db.commit()
    # emit("fauna.submitted", entity="fauna", entity_id=fauna_id, region_code=getattr(obj.zone, "region_code", None))
    return {"ok": True}

@router.post("/{fauna_id}/approve", dependencies=[Depends(require_roles(UserRole.super_admin))])
async def approve_fauna(fauna_id: int, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    obj = (await db.execute(select(Fauna).where(Fauna.id == fauna_id))).scalars().first()
    if not obj: raise HTTPException(404, "Fauna not found")
    # Super Admin bisa approve tanpa batasan region
    obj.status = "approved"
    obj.approved_by = user.id or 0
    obj.approved_at = datetime.now(timezone.utc)
    
    # ✅ Clear backup data if exists (changes are now approved)
    if obj.rejection_reason and obj.rejection_reason.startswith('{') and '"_backup"' in obj.rejection_reason:
        obj.rejection_reason = None
        print(f"🗑️ Cleared backup data for fauna {fauna_id} (changes approved)")
    
    # Cascade approve: Auto-approve all galleries for this fauna
    await db.execute(
        update(Gallery)
        .where(
            Gallery.entity_type == "fauna",
            Gallery.entity_id == fauna_id,
            Gallery.status.in_([GalleryStatus.draft.value, GalleryStatus.in_review.value])
        )
        .values(status=GalleryStatus.approved.value)
    )
    
    await db.commit()
    # emit("fauna.approved", entity="fauna", entity_id=fauna_id, region_code=getattr(obj.zone, "region_code", None))
    
    # Log gallery approval
    gallery_count = (await db.execute(
        select(func.count(Gallery.id))
        .where(Gallery.entity_type == "fauna", Gallery.entity_id == fauna_id, Gallery.status == GalleryStatus.approved.value)
    )).scalar()
    print(f"✅ Fauna {fauna_id} approved. Auto-approved {gallery_count} galleries.")
    
    return {"ok": True}

from pydantic import BaseModel
class RejectIn(BaseModel):
    reason: str

@router.post("/{fauna_id}/reject", dependencies=[Depends(require_roles(UserRole.super_admin))])
async def reject_fauna(fauna_id: int, payload: RejectIn, db: AsyncSession = Depends(get_session), user: User = Depends(current_user)):
    obj = (await db.execute(select(Fauna).where(Fauna.id == fauna_id))).scalars().first()
    if not obj: raise HTTPException(404, "Fauna not found")
    
    # ✅ CHECK IF THIS IS A REJECTED EDIT (has backup data)
    import json
    has_backup = False
    backup_data = None
    rejection_reason = payload.reason
    
    if obj.rejection_reason and obj.rejection_reason.startswith('{') and '"_backup"' in obj.rejection_reason:
        try:
            backup_data = json.loads(obj.rejection_reason)
            if backup_data.get("_backup"):
                has_backup = True
                print(f"🔄 Found backup data for fauna {fauna_id}, will restore to approved state")
        except:
            pass
    
    if has_backup and backup_data:
        # ✅ RESTORE DATA: This was an edit of approved fauna, restore to original state
        obj.local_name = backup_data.get("local_name")
        obj.scientific_name = backup_data.get("scientific_name")
        obj.ordo = backup_data.get("ordo")
        obj.description = backup_data.get("description")
        obj.habitat_sumber_makanan = backup_data.get("habitat_sumber_makanan")
        obj.status_hama = backup_data.get("status_hama")
        obj.tingkat_hama = backup_data.get("tingkat_hama")
        obj.is_endemic = backup_data.get("is_endemic")
        obj.iucn_status = backup_data.get("iucn_status")
        obj.park_id = backup_data.get("park_id")
        obj.gambar_utama = backup_data.get("gambar_utama")
        
        # Restore status to approved
        obj.status = "approved"
        obj.approved_at = datetime.now(timezone.utc)
        obj.approved_by = user.id or 0
        obj.rejection_reason = f"Edit rejected: {rejection_reason}"  # Keep rejection reason for history
        
        print(f"✅ Fauna {fauna_id} restored to approved state with original data")
    else:
        # ✅ NEW FAUNA REJECTION: This is a new fauna submission, reject normally
        obj.status = "rejected"
        obj.rejection_reason = rejection_reason
        obj.approved_by = user.id or 0
        obj.rejected_at = datetime.now(timezone.utc)
        
        print(f"❌ Fauna {fauna_id} rejected (new submission)")
    
    await db.commit()
    # emit("fauna.rejected", entity="fauna", entity_id=fauna_id, region_code=getattr(obj.zone, "region_code", None), reason=rejection_reason)
    return {"ok": True}
