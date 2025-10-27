"""
One-time setup endpoint for initial admin creation
Only works if no super admin exists yet (for security)
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

from core.database.session import get_session
from users.models import User

router = APIRouter(prefix="/setup", tags=["Setup"])

class SetupRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str = "Super Administrator"

@router.post("/create-admin")
async def create_initial_admin(
    request: SetupRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Create initial super admin user.
    Only works if no super admin exists yet (for security).
    
    This endpoint is designed for first-time setup only.
    """
    # Check if any super admin already exists
    result = await db.execute(
        select(User).where(User.role == "super_admin")
    )
    existing_admin = result.scalar_one_or_none()
    
    if existing_admin:
        raise HTTPException(
            status_code=400,
            detail="Super admin already exists. This endpoint can only be used for initial setup."
        )
    
    # Create admin user
    admin = User(
        email=request.email,
        role="super_admin",
        display_name=request.display_name,
        full_name=request.display_name,
        is_active=True
    )
    admin.set_password(request.password)
    
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    
    return {
        "message": "Super admin created successfully",
        "email": admin.email,
        "id": admin.id
    }

@router.get("/status")
async def check_setup_status(db: AsyncSession = Depends(get_session)):
    """Check if initial setup has been completed"""
    result = await db.execute(
        select(User).where(User.role == "super_admin")
    )
    admin_exists = result.scalar_one_or_none() is not None
    
    return {
        "setup_completed": admin_exists,
        "requires_initial_setup": not admin_exists
    }

