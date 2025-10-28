from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, text
from typing import List, Optional
from datetime import datetime

from core.database.session import get_session as get_db
# Public serializers removed - not used
from domains.parks.models import Park
from domains.articles.models import UserRole
from users.models import User
from api.v1.permissions.rbac import current_user, clear_user_cache
from api.v1.serializers.common import ErrorResponse

router = APIRouter(prefix="/parks")

# Public endpoints removed - frontend uses /api/public/parks/ instead


# ===== ADMIN/CRUD ENDPOINTS =====

@router.get("", 
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
    }
)
@router.get("/", 
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
    }
)
async def list_parks(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
    search: Optional[str] = Query(None, description="Search by name"),
    # region_id removed - using park-based scoping
    submitted_by: Optional[str] = Query(None, description="Filter by submitter (user ID or 'me')"),
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
):
    """
    Get list of parks with filtering.
    Park admins only see parks they are assigned to or submitted.
    """
    try:
        print(f"🔍 list_parks: user={user.email}, role={user.role}")
        
        # Base query
        stmt = select(Park)
        
        # Search filter
        if search:
            stmt = stmt.where(
                or_(
                    Park.name.ilike(f"%{search}%"),
                    Park.description.ilike(f"%{search}%")
                )
            )
        
        # Region filter - removed as we're using user-based access control
        # if region_id:
        #     stmt = stmt.where(Park.region_id == region_id)
        
        # Submitted by filter
        if submitted_by:
            if submitted_by == "me":
                # Filter by current user's submitted parks
                try:
                    user_id_int = int(user.id)
                    stmt = stmt.where(Park.submitted_by == user_id_int)
                    print(f"🔍 Filtering parks submitted by current user: {user_id_int}")
                except (ValueError, TypeError) as e:
                    print(f"⚠️ Failed to convert user.id to int: {e}")
                    stmt = stmt.where(Park.id == -1)
            else:
                # Filter by specific user ID
                try:
                    submitted_by_int = int(submitted_by)
                    stmt = stmt.where(Park.submitted_by == submitted_by_int)
                    print(f"🔍 Filtering parks submitted by user: {submitted_by_int}")
                except ValueError:
                    print(f"⚠️ Invalid submitted_by parameter: {submitted_by}")
                    stmt = stmt.where(Park.id == -1)
        
        # Regional admin scope - using park-based access control
        elif user.role == UserRole.regional_admin:
            if user.park_id:
                # Filter by park_id - only show parks they are assigned to
                stmt = stmt.where(Park.id == user.park_id)
                print(f"🔍 Filtering parks for regional admin: park_id == {user.park_id}")
            else:
                # If no park_id assigned, filter by their submitted parks
                try:
                    user_id_int = int(user.id)
                    stmt = stmt.where(Park.submitted_by == user_id_int)
                    print(f"🔍 Filtering parks for regional admin: submitted_by == {user_id_int}")
                except (ValueError, TypeError) as e:
                    print(f"⚠️ Failed to convert user.id to int: {e}")
                    stmt = stmt.where(Park.id == -1)
        
        # Apply pagination
        stmt = stmt.order_by(Park.id.desc()).limit(limit).offset(skip)
        
        # Execute query
        result = await db.execute(stmt)
        parks = result.scalars().all()
        
        # Convert to dict
        parks_list = []
        for park in parks:
            park_dict = {
                "id": park.id,
                "name": park.name,
                "slug": getattr(park, 'slug', ''),
                "area_ha": float(park.area_ha) if hasattr(park, 'area_ha') and park.area_ha else None,
                "description": getattr(park, 'description', ''),
                "status": str(getattr(park, 'status', 'draft')),
                "provinsi": getattr(park, 'provinsi', ''),
                "kota_kabupaten": getattr(park, 'kota_kabupaten', ''),
                "kecamatan": getattr(park, 'kecamatan', ''),
                "desa_kelurahan": getattr(park, 'desa_kelurahan', ''),
                "created_at": park.created_at.isoformat() if hasattr(park, 'created_at') and park.created_at else None,
                "updated_at": park.updated_at.isoformat() if hasattr(park, 'updated_at') and park.updated_at else None,
            }
            parks_list.append(park_dict)
        
        print(f"✅ list_parks: returning {len(parks_list)} parks")
        return parks_list
        
    except Exception as e:
        print(f"❌ Error in list_parks: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"List parks error: {str(e)}")


@router.post("/",
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
    }
)
async def create_park(
    data: dict,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    """
    Create new park
    
    BUSINESS RULE: 1 user = 1 park only!
    Regional admin can only create ONE park.
    """
    try:
        # ✅ VALIDATION: Check if regional admin already has a park
        if user.role == UserRole.regional_admin:
            # Check if user already has an assigned park
            if user.park_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Anda sudah memiliki taman. Satu user hanya dapat mengelola satu taman."
                )
            
            # Check if user already has an active park (draft, in_review, or approved)
            # Users CAN resubmit if their previous park was rejected
            existing_park_stmt = select(Park).where(
                Park.submitted_by == int(user.id),
                Park.status.in_(['draft', 'in_review', 'approved'])
            )
            existing_park_result = await db.execute(existing_park_stmt)
            existing_park = existing_park_result.scalar_one_or_none()
            
            if existing_park:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Anda sudah memiliki taman '{existing_park.name}' dengan status '{existing_park.status}'. Satu user hanya dapat mengelola satu taman."
                )
        
        # Auto-generate slug from name if not provided
        import re
        import uuid
        from datetime import datetime
        
        name = data.get("name", "")
        slug = data.get("slug")
        
        # Always regenerate slug to ensure uniqueness
        if name:
            base_slug = re.sub(r'[^a-z0-9-]', '', name.lower().replace(' ', '-').replace('_', '-'))
            # Add timestamp and random suffix for uniqueness
            unique_suffix = f"{int(datetime.now().timestamp())}-{str(uuid.uuid4())[:8]}"
            slug = f"{base_slug}-{unique_suffix}"
        
        # Use raw SQL to insert park
        insert_query = text("""
            INSERT INTO parks (
                name, slug, sk_penetapan, pengelola, 
                provinsi, kota_kabupaten, kecamatan, desa_kelurahan,
                area_ha, kondisi_fisik, nilai_penting, tipe_ekoregion,
                description, sejarah, visi, misi, nilai_dasar,
                status, submitted_by, created_at, updated_at
            )
            VALUES (
                :name, :slug, :sk_penetapan, :pengelola,
                :provinsi, :kota_kabupaten, :kecamatan, :desa_kelurahan,
                :area_ha, :kondisi_fisik, :nilai_penting, :tipe_ekoregion,
                :description, :sejarah, :visi, :misi, :nilai_dasar,
                :status, :submitted_by, NOW(), NOW()
            )
            RETURNING id, name, slug, status, created_at, updated_at
        """)
        
        result = await db.execute(insert_query, {
            "name": name,
            "slug": slug,
            "sk_penetapan": data.get("sk_penetapan"),
            "pengelola": data.get("pengelola"),
            "provinsi": data.get("provinsi"),
            "kota_kabupaten": data.get("kota_kabupaten"),
            "kecamatan": data.get("kecamatan"),
            "desa_kelurahan": data.get("desa_kelurahan"),
            "area_ha": data.get("area_ha"),
            "kondisi_fisik": data.get("kondisi_fisik"),
            "nilai_penting": data.get("nilai_penting"),
            "tipe_ekoregion": data.get("tipe_ekoregion"),
            "description": data.get("description"),
            "sejarah": data.get("sejarah"),
            "visi": data.get("visi"),
            "misi": data.get("misi"),
            "nilai_dasar": data.get("nilai_dasar"),
            "status": data.get("status", "draft"),  # Use status from request, default to 'draft'
            "submitted_by": int(user.id)
        })
        
        row = result.fetchone()
        park_id = row[0]
        
        print(f"✅ Park {park_id} created by user {user.id}")
        
        await db.commit()
        
        return {
            "id": str(park_id),
            "name": row[1],
            "slug": row[2],
            "status": row[3],
            "created_at": row[4].isoformat() if row[4] else None,
            "updated_at": row[5].isoformat() if row[5] else None,
        }
    except Exception as e:
        await db.rollback()
        import traceback
        print(f"ERROR creating park: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create park: {str(e)}")


@router.put("/{park_id}",
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    }
)
async def update_park(
    park_id: int,
    data: dict,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    try:
        # Check if park exists and user has permission to edit
        result = await db.execute(
            text("SELECT id, submitted_by, status FROM parks WHERE id = :park_id"),
            {"park_id": park_id}
        )
        park = result.fetchone()
        
        if not park:
            raise HTTPException(status_code=404, detail="Park not found")
        
        # Check if user can edit this park
        if user.role != UserRole.super_admin and park[1] != user.id:
            raise HTTPException(status_code=403, detail="You can only edit parks you submitted")
        
        # ✅ REMOVED: Allow editing parks regardless of status
        # Users can now edit parks even after they're approved
        # park_status = park[2]  # status is index 2
        # if user.role == UserRole.regional_admin and park_status != 'draft':
        #     raise HTTPException(
        #         status_code=403, 
        #         detail=f"Anda hanya bisa mengedit taman dengan status 'draft'. Taman ini berstatus '{park_status}'."
        #     )
        
        # ✅ FIX: Only update data fields, DON'T change status
        # Status should only change via explicit actions:
        # - draft → in_review: via submit_park endpoint
        # - in_review → approved/rejected: via approve_park/reject_park endpoints
        update_query = text("""
            UPDATE parks SET
                name = :name,
                sk_penetapan = :sk_penetapan,
                pengelola = :pengelola,
                area_ha = :area_ha,
                kondisi_fisik = :kondisi_fisik,
                nilai_penting = :nilai_penting,
                tipe_ekoregion = :tipe_ekoregion,
                description = :description,
                sejarah = :sejarah,
                visi = :visi,
                misi = :misi,
                nilai_dasar = :nilai_dasar,
                provinsi = :provinsi,
                kota_kabupaten = :kota_kabupaten,
                kecamatan = :kecamatan,
                desa_kelurahan = :desa_kelurahan,
                updated_at = NOW()
            WHERE id = :park_id
            RETURNING id, name, slug, status, created_at, updated_at
        """)
        
        result = await db.execute(update_query, {
            "park_id": park_id,
            "name": data.get("name", ""),
            "sk_penetapan": data.get("sk_penetapan"),
            "pengelola": data.get("pengelola"),
            "area_ha": data.get("area_ha"),
            "kondisi_fisik": data.get("kondisi_fisik"),
            "nilai_penting": data.get("nilai_penting"),
            "tipe_ekoregion": data.get("tipe_ekoregion"),
            "description": data.get("description"),
            "sejarah": data.get("sejarah"),
            "visi": data.get("visi"),
            "misi": data.get("misi"),
            "nilai_dasar": data.get("nilai_dasar"),
            "provinsi": data.get("provinsi"),
            "kota_kabupaten": data.get("kota_kabupaten"),
            "kecamatan": data.get("kecamatan"),
            "desa_kelurahan": data.get("desa_kelurahan"),
        })
        
        row = result.fetchone()
        
        print(f"✅ Park {park_id} updated by user {user.id}, status: {row[3]}")
        
        await db.commit()
        
        return {
            "id": str(row[0]),
            "name": row[1],
            "slug": row[2],
            "status": row[3],
            "created_at": row[4].isoformat() if row[4] else None,
            "updated_at": row[5].isoformat() if row[5] else None,
        }
    except Exception as e:
        await db.rollback()
        import traceback
        print(f"ERROR updating park: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to update park: {str(e)}")


# get_park_admin, delete_park removed - not used by frontend


@router.post("/{park_id}/submit",
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Park not found"},
    }
)
async def submit_park(
    park_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    """
    Submit park for review.
    """
    try:
        # Get park
        result = await db.execute(
            select(Park).where(Park.id == park_id)
        )
        park = result.scalar_one_or_none()
        
        if not park:
            raise HTTPException(status_code=404, detail="Park not found")
        
        # Check if user can submit this park
        # Super admin can submit any park, regional admin can only submit their own parks
        if user.role == UserRole.regional_admin and park.submitted_by != int(user.id):
            raise HTTPException(status_code=403, detail="You can only submit your own parks")
        
        # Check if park is in draft status
        if park.status != "draft":
            raise HTTPException(status_code=400, detail="Only draft parks can be submitted")
        
        # Update status to in_review
        park.status = "in_review"
        park.submitted_at = datetime.utcnow()
        park.submitted_by = int(user.id)
        
        await db.commit()
        await db.refresh(park)
        
        return {
            "message": "Park submitted for review successfully",
            "id": park.id,
            "name": park.name,
            "status": park.status,
            "submitted_at": park.submitted_at.isoformat() if park.submitted_at else None,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print(f"ERROR submitting park: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Submit error: {str(e)}")


@router.get("/pending-approval",
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden - Only super admin can view pending approvals"},
    }
)
async def list_pending_approval_parks(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    """
    Get list of parks pending approval (super admin only).
    """
    try:
        # Check if user is super admin
        if user.role != UserRole.super_admin:
            raise HTTPException(
                status_code=403,
                detail="Only super admin can view pending approvals"
            )
        
        # Get parks with in_review status (pending approval)
        stmt = select(Park).where(Park.status == "in_review").order_by(Park.updated_at.desc())
        result = await db.execute(stmt)
        parks = result.scalars().all()
        
        # Convert to dict
        parks_list = []
        for park in parks:
            park_dict = {
                "id": park.id,
                "name": park.name,
                "slug": getattr(park, 'slug', ''),
                "area_ha": float(park.area_ha) if hasattr(park, 'area_ha') and park.area_ha else None,
                "description": getattr(park, 'description', ''),
                "status": str(getattr(park, 'status', 'draft')),
                "provinsi": getattr(park, 'provinsi', ''),
                "kota_kabupaten": getattr(park, 'kota_kabupaten', ''),
                "kecamatan": getattr(park, 'kecamatan', ''),
                "desa_kelurahan": getattr(park, 'desa_kelurahan', ''),
                "created_at": park.created_at.isoformat() if hasattr(park, 'created_at') and park.created_at else None,
                "updated_at": park.updated_at.isoformat() if hasattr(park, 'updated_at') and park.updated_at else None,
                "submitted_at": park.submitted_at.isoformat() if hasattr(park, 'submitted_at') and park.submitted_at else None,
                "submitted_by": getattr(park, 'submitted_by', None),
            }
            parks_list.append(park_dict)
        
        print(f"✅ list_pending_approval_parks: returning {len(parks_list)} parks")
        return parks_list
        
    except Exception as e:
        print(f"❌ Error in list_pending_approval_parks: {e}")
        raise HTTPException(status_code=500, detail=f"List pending approval parks error: {str(e)}")

@router.post("/{park_id}/approve",
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden - Only super admin can approve"},
        404: {"model": ErrorResponse, "description": "Park not found"},
    }
)
async def approve_park(
    park_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    """
    Approve a park submission.
    """
    try:
        # Check if user is super admin
        if user.role != UserRole.super_admin:
            raise HTTPException(
                status_code=403,
                detail="Only super admin can approve parks"
            )
        
        # Get park
        stmt = select(Park).where(Park.id == park_id)
        result = await db.execute(stmt)
        park = result.scalar_one_or_none()
        
        if not park:
            raise HTTPException(status_code=404, detail="Park not found")
        
        # Update status to approved
        park.status = "approved"
        park.approved_at = datetime.utcnow()
        park.approved_by = int(user.id)
        
        # Assign park_id to the park submitter (if they don't have one yet)
        assign_to_user_id = park.submitted_by
        
        if assign_to_user_id:
            assignee_stmt = select(User).where(User.id == assign_to_user_id)
            assignee_result = await db.execute(assignee_stmt)
            assignee = assignee_result.scalar_one_or_none()
            
            if assignee:
                # ✅ VALIDATION: Check if user already has a park_id assigned to a different approved park
                if assignee.park_id and assignee.park_id != park.id:
                    # User already has a different park assigned
                    existing_park_stmt = select(Park).where(Park.id == assignee.park_id)
                    existing_park_result = await db.execute(existing_park_stmt)
                    existing_park = existing_park_result.scalar_one_or_none()
                    
                    if existing_park and existing_park.status == "approved":
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"User {assignee.email} sudah memiliki taman approved '{existing_park.name}'. Satu user hanya dapat mengelola satu taman."
                        )
                    else:
                        # If existing park is not approved, reassign to this park
                        print(f"⚠️  User {assignee.id} has park_id {assignee.park_id} but it's not approved. Reassigning to park {park.id}")
                        assignee.park_id = park.id
                        print(f"✅ Assigned park_id {park.id} to user {assignee.id} ({assignee.email})")
                
                elif not assignee.park_id:
                    # User doesn't have park_id yet, assign this park
                    assignee.park_id = park.id
                    print(f"✅ Assigned park_id {park.id} to user {assignee.id} ({assignee.email}) via submitted_by")
                else:
                    # User already has this park assigned (park_id matches)
                    print(f"ℹ️  User {assignee.id} already has this park assigned (park_id {assignee.park_id})")
        
        print(f"✅ Park {park.id} approved")
        
        # Clear user cache for the assignee if park_id was assigned
        if assign_to_user_id:
            clear_user_cache(assign_to_user_id)
        
        await db.commit()
        await db.refresh(park)
        
        return {
            "message": "Park approved successfully",
            "id": park.id,
            "name": park.name,
            "status": park.status,
            "approved_by": park.approved_by,
            "approved_at": park.approved_at.isoformat() if park.approved_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error approving park: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Approve error: {str(e)}")


@router.post("/{park_id}/reject",
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden - Only super admin can reject"},
        404: {"model": ErrorResponse, "description": "Park not found"},
    }
)
async def reject_park(
    park_id: int,
    data: dict,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    """
    Reject a park submission with reason (Super admin only).
    """
    # Check if user is super admin
    if user.role != UserRole.super_admin:
        raise HTTPException(
            status_code=403,
            detail="Only super admin can reject parks"
        )
    
    # Validate rejection reason
    rejection_reason = data.get("rejection_reason", "").strip()
    if not rejection_reason:
        raise HTTPException(
            status_code=400,
            detail="Rejection reason is required"
        )
    
    # Get park
    stmt = select(Park).where(Park.id == park_id)
    result = await db.execute(stmt)
    park = result.scalar_one_or_none()
    
    if not park:
        raise HTTPException(status_code=404, detail="Park not found")
    
    # Update status to rejected
    park.status = "rejected"
    park.approved_at = datetime.utcnow()
    park.rejection_reason = rejection_reason
    
    # ✅ IMPORTANT: Clear park_id from user so they can create a new park
    if park.submitted_by:
        submitter_stmt = select(User).where(User.id == park.submitted_by)
        submitter_result = await db.execute(submitter_stmt)
        submitter = submitter_result.scalar_one_or_none()
        
        if submitter and submitter.park_id == park.id:
            submitter.park_id = None
            print(f"✅ Cleared park_id from user {submitter.id} ({submitter.email}) - park rejected")
        
        # Clear user cache for the park submitter
        clear_user_cache(park.submitted_by)
    
    await db.commit()
    await db.refresh(park)
    
    return {
        "message": "Park rejected",
        "id": park.id,
        "name": park.name,
        "status": park.status,
        "rejected_by": park.approved_by,
        "rejected_at": park.approved_at.isoformat() if park.approved_at else None,
        "rejection_reason": park.rejection_reason,
    }
