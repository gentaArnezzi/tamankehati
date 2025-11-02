# apps/backend/api/v1/routes/users_simple.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
import os
import uuid
from pathlib import Path

from api.v1.permissions.rbac import current_user, clear_user_cache
from users.models import User as UserModel, UserRole, User
from users.serializers import (
    UserOut, UserCreate, UserUpdate, UserDetailOut, ParkSummary,
    UpdateProfileRequest, ChangePasswordRequest, UpdateNotificationsRequest, NotificationPreferences
)
from core.database.session import get_session
from api.v1.permissions.policies import require_roles
from core.utils.timezone import get_jakarta_now

router = APIRouter(prefix="/users")

# Upload configuration
# Use UPLOAD_DIRECTORY to match main.py static files mount
UPLOAD_DIR = os.getenv("UPLOAD_DIRECTORY") or os.getenv("UPLOAD_DIR") or os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
AVATARS_DIR = os.path.join(UPLOAD_DIR, "avatars")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create avatars directory if it doesn't exist
Path(AVATARS_DIR).mkdir(parents=True, exist_ok=True)

@router.get("/me", response_model=UserOut, tags=["Users"])
async def get_current_user(user: UserModel = Depends(current_user)):
    """Get current authenticated user profile."""
    try:
        # Get role value
        role_val = user.role.value if hasattr(user.role, 'value') else str(user.role)
        # Ensure role is valid
        if role_val not in ["super_admin", "regional_admin"]:
            role_val = "regional_admin"  # Default to regional_admin
        
        # Get email and ensure it's valid
        user_email = user.email if user.email and '@' in user.email else f"user_{user.id}@kehati.org"
        
        # Simple user data without complex validation
        return UserOut(
            id=user.id,
            email=user_email,
            display_name=getattr(user, 'display_name', None),
            full_name=getattr(user, 'full_name', None),
            role=role_val,
            park_id=getattr(user, 'park_id', None),
            profile_picture_url=getattr(user, 'profile_picture_url', None),
            is_active=getattr(user, 'is_active', True),
            created_at=user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None,
            updated_at=user.updated_at.isoformat() if hasattr(user, 'updated_at') and user.updated_at else None
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting user profile: {str(e)}"
        )

@router.get("", response_model=List[UserOut], tags=["Users"])
@router.get("/", response_model=List[UserOut], tags=["Users"])
async def list_users(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    q: Optional[str] = None,
    is_active: Optional[bool] = Query(None, description="Filter by active status. None = all users, True = active only, False = inactive only"),
    sort: Optional[str] = Query(None, description="Sort by field (name_asc, email_asc, created_desc, created_asc)"),
    actor: UserModel = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    """List users with proper access control. Returns all users by default, including inactive ones."""
    try:
        # Get all users from database (including inactive ones)
        stmt = select(User)
        
        # Apply active status filter if provided
        if is_active is not None:
            stmt = stmt.where(User.is_active == is_active)
        
        # Apply search filter if provided
        if q:
            stmt = stmt.where(
                or_(
                    User.email.ilike(f"%{q}%"),
                    User.display_name.ilike(f"%{q}%")
                )
            )
        
        # Apply sorting
        if sort:
            if sort == "name_asc":
                stmt = stmt.order_by(User.display_name.asc().nulls_last())
            elif sort == "email_asc":
                stmt = stmt.order_by(User.email.asc())
            elif sort == "created_desc":
                stmt = stmt.order_by(User.created_at.desc())
            elif sort == "created_asc":
                stmt = stmt.order_by(User.created_at.asc())
            else:
                # Default sorting by name if invalid sort parameter
                stmt = stmt.order_by(User.display_name.asc().nulls_last())
        else:
            # Default sorting by name
            stmt = stmt.order_by(User.display_name.asc().nulls_last())
        
        # Apply pagination
        stmt = stmt.limit(limit).offset(offset)
        result = await db.execute(stmt)
        users = result.scalars().all()
        
        # Convert to response format
        user_list = []
        for user in users:
            user_list.append({
                "id": user.id,
                "email": user.email,
                "display_name": user.display_name,
                "full_name": user.full_name,
                "role": user.role,
                "park_id": user.park_id,
                "profile_picture_url": user.profile_picture_url,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            })
        
        return user_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing users: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserDetailOut, tags=["Users"])
async def get_user(user_id: int,
                   include: Optional[str] = Query(None, description="Include related data: 'park'"),
                   actor: UserModel = Depends(current_user),
                   db: AsyncSession = Depends(get_session)):
    """Get a specific user by ID with optional park details."""
    try:
        # Parse include parameter
        include_park = False
        if include:
            include_park = 'park' in include
        
        # Get the target user
        stmt = select(UserModel).where(UserModel.id == user_id)
        result = await db.execute(stmt)
        target_user = result.scalar_one_or_none()
        
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check access permissions
        if actor.role == UserRole.super_admin:
            # Super admin can see all users
            pass
        elif actor.role == UserRole.regional_admin:
            # Regional admin can see all users (no region_code filtering)
            pass
        else:
            # Regular users can only see themselves
            if target_user.id != actor.id:
                raise HTTPException(status_code=403, detail="Forbidden")
        
        # Convert to UserDetailOut
        role = target_user.role.value if hasattr(target_user.role, 'value') else str(target_user.role)
        if role not in ["super_admin", "regional_admin", "user"]:
            role = "user"
        
        # Build base response
        response_data = {
            "id": target_user.id,
            "email": target_user.email,
            "display_name": target_user.display_name,
            "full_name": target_user.full_name,
            "role": role,
            "park_id": target_user.park_id,
            "is_active": target_user.is_active,
            "created_at": target_user.created_at.isoformat() if target_user.created_at else None,
            "updated_at": target_user.updated_at.isoformat() if target_user.updated_at else None
        }
        
        # Add park data if requested and user has park_id
        if include_park and target_user.park_id:
            try:
                from sqlalchemy import text
                park_query = text("""
                    SELECT id, name, slug, status, area_ha, description, sk_penetapan, 
                           pengelola, tipe_ekoregion, kondisi_fisik, nilai_penting, 
                           sejarah, visi, misi, nilai_dasar, created_at, updated_at 
                    FROM parks WHERE id = :park_id
                """)
                park_result = await db.execute(park_query, {"park_id": target_user.park_id})
                park = park_result.fetchone()
                
                if park:
                    response_data["park"] = ParkSummary(
                        id=park[0],
                        name=park[1],
                        slug=park[2] or "",
                        status=park[3] or "draft",
                        area_ha=float(park[4]) if park[4] else None,
                        description=park[5],
                        sk_penetapan=park[6],
                        pengelola=park[7],
                        tipe_ekoregion=park[8],
                        kondisi_fisik=park[9],
                        nilai_penting=park[10],
                        sejarah=park[11],
                        visi=park[12],
                        misi=park[13],
                        nilai_dasar=park[14],
                        created_at=park[15].isoformat() if park[15] else None,
                        updated_at=park[16].isoformat() if park[16] else None
                    )
            except Exception as e:
                # Log error but don't fail the request
                print(f"Error fetching park data: {e}")
        
        # Region data removed - using park-based scoping
        
        return UserDetailOut(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting user: {str(e)}"
        )

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED, tags=["Users"])
async def create_user(
    user_data: UserCreate,
    actor: UserModel = Depends(require_roles(UserRole.super_admin)),
    db: AsyncSession = Depends(get_session),
):
    """Create a new user - Super Admin only."""
    try:
        # Check if user already exists
        existing_user = await db.execute(
            select(UserModel).where(UserModel.email == user_data.email)
        )
        if existing_user.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create new user with Jakarta timezone timestamps
        jakarta_time = get_jakarta_now()
        new_user = UserModel(
            email=user_data.email,
            display_name=user_data.display_name,
            role=user_data.role,
            park_id=user_data.park_id,
            is_active=True,
            created_at=jakarta_time,
            updated_at=jakarta_time
        )
        
        # Set password hash properly
        new_user.set_password(user_data.password)
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        return UserOut(
            id=new_user.id,
            email=new_user.email,
            display_name=new_user.display_name,
            full_name=new_user.full_name,
            role=new_user.role.value if hasattr(new_user.role, 'value') else str(new_user.role),
            park_id=new_user.park_id,
            profile_picture_url=new_user.profile_picture_url,
            is_active=new_user.is_active,
            created_at=new_user.created_at.isoformat() if new_user.created_at else None,
            updated_at=new_user.updated_at.isoformat() if new_user.updated_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@router.put("/{user_id}", response_model=UserOut, tags=["Users"])
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    actor: UserModel = Depends(require_roles(UserRole.super_admin)),
    db: AsyncSession = Depends(get_session),
):
    """Update a user - Super Admin only."""
    try:
        # Check if user exists
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update user fields with Jakarta timezone
        jakarta_time = get_jakarta_now()
        if user_data.display_name is not None:
            user.display_name = user_data.display_name
        if user_data.park_id is not None:
            user.park_id = user_data.park_id
        if user_data.password is not None:
            # Hash the new password
            user.set_password(user_data.password)
        
        # Update timestamp to Jakarta timezone
        user.updated_at = jakarta_time
        
        await db.commit()
        await db.refresh(user)
        
        # ✅ SECURITY FIX: Clear user cache after update
        clear_user_cache(user_id)
        
        return UserOut(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            full_name=user.full_name,
            role=user.role,
            park_id=user.park_id,
            profile_picture_url=user.profile_picture_url,
            is_active=user.is_active,
            created_at=user.created_at.isoformat() if user.created_at else None,
            updated_at=user.updated_at.isoformat() if user.updated_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )

@router.put("/{user_id}/activate", response_model=UserOut, tags=["Users"])
async def activate_user(
    user_id: int,
    actor: UserModel = Depends(require_roles(UserRole.super_admin)),
    db: AsyncSession = Depends(get_session),
):
    """Activate a user - Super Admin only."""
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.is_active = True
        await db.commit()
        await db.refresh(user)
        
        # ✅ SECURITY FIX: Clear user cache after activation
        clear_user_cache(user_id)
        
        return UserOut(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            full_name=user.full_name,
            role=user.role,
            park_id=user.park_id,
            profile_picture_url=user.profile_picture_url,
            is_active=user.is_active,
            created_at=user.created_at.isoformat() if user.created_at else None,
            updated_at=user.updated_at.isoformat() if user.updated_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error activating user: {str(e)}"
        )

@router.put("/{user_id}/deactivate", response_model=UserOut, tags=["Users"])
async def deactivate_user(
    user_id: int,
    actor: UserModel = Depends(require_roles(UserRole.super_admin)),
    db: AsyncSession = Depends(get_session),
):
    """Deactivate a user - Super Admin only."""
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.is_active = False
        await db.commit()
        await db.refresh(user)
        
        # ✅ SECURITY FIX: Clear user cache after deactivation
        clear_user_cache(user_id)
        
        return UserOut(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            full_name=user.full_name,
            role=user.role,
            park_id=user.park_id,
            profile_picture_url=user.profile_picture_url,
            is_active=user.is_active,
            created_at=user.created_at.isoformat() if user.created_at else None,
            updated_at=user.updated_at.isoformat() if user.updated_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deactivating user: {str(e)}"
        )

@router.put("/{user_id}/role", response_model=UserOut, tags=["Users"])
async def update_user_role(
    user_id: int,
    role_data: dict,
    actor: UserModel = Depends(require_roles(UserRole.super_admin)),
    db: AsyncSession = Depends(get_session),
):
    """Update user role - Super Admin only."""
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        new_role = role_data.get('role')
        if new_role not in ['super_admin', 'regional_admin', 'user']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role"
            )
        
        user.role = new_role
        await db.commit()
        await db.refresh(user)
        
        # ✅ SECURITY FIX: Clear user cache after role change
        clear_user_cache(user_id)
        
        return UserOut(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            full_name=user.full_name,
            role=user.role,
            park_id=user.park_id,
            profile_picture_url=user.profile_picture_url,
            is_active=user.is_active,
            created_at=user.created_at.isoformat() if user.created_at else None,
            updated_at=user.updated_at.isoformat() if user.updated_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user role: {str(e)}"
        )

@router.delete("/{user_id}", tags=["Users"])
async def delete_user(
    user_id: int,
    actor: UserModel = Depends(require_roles(UserRole.super_admin)),
    db: AsyncSession = Depends(get_session),
):
    """Delete a user permanently from database - Super Admin only."""
    try:
        # Check if user exists
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Hard delete - permanently remove from database
        await db.delete(user)
        await db.commit()
        
        return {"message": "User permanently deleted from database"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        )


@router.get("/me/debug", tags=["Users"])
async def debug_current_user(
    user: UserModel = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    """
    Debug endpoint: Get current user info with park details.
    Helps diagnose park assignment issues.
    Only available in development mode.
    """
    import os
    if os.getenv("ENVIRONMENT") == "production" or os.getenv("DEBUG", "false").lower() == "false":
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=404,
            content={"detail": "Not found"}
        )
    from domains.parks.models import Park
    
    # Get user's assigned park if they have one
    assigned_park = None
    if user.park_id:
        park_stmt = select(Park).where(Park.id == user.park_id)
        park_result = await db.execute(park_stmt)
        park = park_result.scalar_one_or_none()
        
        if park:
            assigned_park = {
                "id": park.id,
                "name": park.name,
                "status": park.status,
                "submitted_by": park.submitted_by,
                "approved_by": getattr(park, 'approved_by', None),
                "approved_at": park.approved_at.isoformat() if hasattr(park, 'approved_at') and park.approved_at else None,
            }
    
    # Get parks submitted by this user
    submitted_parks = []
    if user.role == UserRole.regional_admin:
        try:
            user_id_int = int(user.id)
            parks_stmt = select(Park).where(Park.submitted_by == user_id_int).order_by(Park.id.desc())
            parks_result = await db.execute(parks_stmt)
            parks = parks_result.scalars().all()
            
            for p in parks:
                submitted_parks.append({
                    "id": p.id,
                    "name": p.name,
                    "status": p.status,
                    "submitted_by": p.submitted_by,
                    "approved_by": getattr(p, 'approved_by', None),
                    "created_at": p.created_at.isoformat() if hasattr(p, 'created_at') and p.created_at else None,
                })
        except Exception as e:
            print(f"⚠️  Error fetching submitted parks: {e}")
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
            "park_id": user.park_id,
            "is_active": user.is_active,
        },
        "assigned_park": assigned_park,
        "submitted_parks": submitted_parks,
        "diagnosis": {
            "has_park_id": user.park_id is not None,
            "can_create_flora": user.park_id is not None if user.role == UserRole.regional_admin else True,
            "warning": "If park_id is set but assigned_park status is 'in_review', there's a BUG!" if user.park_id and assigned_park and assigned_park.get('status') == 'in_review' else None
        }
    }


# ============================================================================
# SETTINGS PAGE ENDPOINTS
# ============================================================================

@router.patch("/me/profile", response_model=UserOut, tags=["Settings"])
async def update_my_profile(
    profile_data: UpdateProfileRequest,
    user: UserModel = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    """
    Update current user's profile (name and email).
    Any user can update their own profile.
    """
    try:
        # Fetch the current user from database
        stmt = select(User).where(User.id == user.id)
        result = await db.execute(stmt)
        db_user = result.scalar_one_or_none()
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if email is being changed and if it's already taken
        if profile_data.email and profile_data.email != db_user.email:
            existing_user = await db.execute(
                select(User).where(User.email == profile_data.email)
            )
            if existing_user.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email sudah digunakan oleh user lain"
                )
            db_user.email = profile_data.email
        
        # Update display name (nama)
        if profile_data.nama is not None:
            db_user.display_name = profile_data.nama
            # Also update full_name for consistency
            db_user.full_name = profile_data.nama
        
        # Update timestamp
        db_user.updated_at = get_jakarta_now()
        
        await db.commit()
        await db.refresh(db_user)
        
        # Clear user cache
        clear_user_cache(user.id)
        
        return UserOut(
            id=db_user.id,
            email=db_user.email,
            display_name=db_user.display_name,
            full_name=db_user.full_name,
            role=db_user.role,
            park_id=db_user.park_id,
            profile_picture_url=db_user.profile_picture_url,
            is_active=db_user.is_active,
            created_at=db_user.created_at.isoformat() if db_user.created_at else None,
            updated_at=db_user.updated_at.isoformat() if db_user.updated_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )


@router.post("/me/change-password", tags=["Settings"])
async def change_my_password(
    password_data: ChangePasswordRequest,
    user: UserModel = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    """
    Change current user's password.
    Requires current password verification.
    """
    try:
        # Validate that new passwords match
        if password_data.new_password != password_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password baru tidak cocok"
            )
        
        # Fetch the current user from database
        stmt = select(User).where(User.id == user.id)
        result = await db.execute(stmt)
        db_user = result.scalar_one_or_none()
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify current password
        if not db_user.verify_password(password_data.current_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password saat ini salah"
            )
        
        # Set new password
        db_user.set_password(password_data.new_password)
        db_user.updated_at = get_jakarta_now()
        
        await db.commit()
        
        # Clear user cache
        clear_user_cache(user.id)
        
        return {
            "message": "Password berhasil diubah",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error changing password: {str(e)}"
        )


@router.get("/me/notifications", response_model=NotificationPreferences, tags=["Settings"])
async def get_my_notification_preferences(
    user: UserModel = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    """
    Get current user's notification preferences.
    Returns default preferences if not set.
    """
    try:
        # For now, return default preferences
        # TODO: Store preferences in database (preferences JSONB column)
        return NotificationPreferences(
            email_notifications=True,
            push_notifications=False,
            announcement_alerts=True,
            approval_alerts=True
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting notification preferences: {str(e)}"
        )


@router.patch("/me/notifications", response_model=NotificationPreferences, tags=["Settings"])
async def update_my_notification_preferences(
    preferences: UpdateNotificationsRequest,
    user: UserModel = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    """
    Update current user's notification preferences.
    Note: Currently stores in memory only. 
    TODO: Add preferences JSONB column to users table.
    """
    try:
        # Get current preferences (default for now)
        current_prefs = NotificationPreferences(
            email_notifications=True,
            push_notifications=False,
            announcement_alerts=True,
            approval_alerts=True
        )
        
        # Update with new values
        if preferences.email_notifications is not None:
            current_prefs.email_notifications = preferences.email_notifications
        if preferences.push_notifications is not None:
            current_prefs.push_notifications = preferences.push_notifications
        if preferences.announcement_alerts is not None:
            current_prefs.announcement_alerts = preferences.announcement_alerts
        if preferences.approval_alerts is not None:
            current_prefs.approval_alerts = preferences.approval_alerts
        
        # TODO: Store in database
        # For now, just return the updated preferences
        # In the future, add a `preferences` JSONB column to users table:
        # ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
        
        return current_prefs
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating notification preferences: {str(e)}"
        )


@router.post("/me/upload-photo", response_model=UserOut, tags=["Settings"])
async def upload_profile_photo(
    file: UploadFile = File(...),
    user: UserModel = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    """
    Upload profile photo for current user.
    Accepts: JPG, JPEG, PNG, GIF, WEBP (max 5MB)
    """
    try:
        # Validate file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Read file content
        content = await file.read()
        
        # Validate file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum of {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Generate unique filename
        unique_filename = f"{user.id}_{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(AVATARS_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Get user from database
        stmt = select(User).where(User.id == user.id)
        result = await db.execute(stmt)
        db_user = result.scalar_one_or_none()
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Delete old profile picture if exists
        if db_user.profile_picture_url:
            old_file = db_user.profile_picture_url.split('/')[-1]
            old_path = os.path.join(AVATARS_DIR, old_file)
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except Exception as e:
                    print(f"Failed to delete old profile picture: {e}")
        
        # Update user profile picture URL
        db_user.profile_picture_url = f"/uploads/avatars/{unique_filename}"
        db_user.updated_at = get_jakarta_now()
        
        await db.commit()
        await db.refresh(db_user)
        
        # Clear user cache
        clear_user_cache(user.id)
        
        return UserOut(
            id=db_user.id,
            email=db_user.email,
            display_name=db_user.display_name,
            full_name=db_user.full_name,
            role=db_user.role,
            park_id=db_user.park_id,
            profile_picture_url=db_user.profile_picture_url,
            is_active=db_user.is_active,
            created_at=db_user.created_at.isoformat() if db_user.created_at else None,
            updated_at=db_user.updated_at.isoformat() if db_user.updated_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading profile photo: {str(e)}"
        )


@router.delete("/me/delete-photo", response_model=UserOut, tags=["Settings"])
async def delete_profile_photo(
    user: UserModel = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    """
    Delete profile photo for current user.
    """
    try:
        # Get user from database
        stmt = select(User).where(User.id == user.id)
        result = await db.execute(stmt)
        db_user = result.scalar_one_or_none()
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Delete profile picture file if exists
        if db_user.profile_picture_url:
            old_file = db_user.profile_picture_url.split('/')[-1]
            old_path = os.path.join(AVATARS_DIR, old_file)
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except Exception as e:
                    print(f"Failed to delete profile picture: {e}")
        
        # Remove profile picture URL
        db_user.profile_picture_url = None
        db_user.updated_at = get_jakarta_now()
        
        await db.commit()
        await db.refresh(db_user)
        
        # Clear user cache
        clear_user_cache(user.id)
        
        return UserOut(
            id=db_user.id,
            email=db_user.email,
            display_name=db_user.display_name,
            full_name=db_user.full_name,
            role=db_user.role,
            park_id=db_user.park_id,
            profile_picture_url=db_user.profile_picture_url,
            is_active=db_user.is_active,
            created_at=db_user.created_at.isoformat() if db_user.created_at else None,
            updated_at=db_user.updated_at.isoformat() if db_user.updated_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting profile photo: {str(e)}"
        )

