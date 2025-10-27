# apps/backend/core/security/deps.py
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from core.database.session import get_session
from core.auth.jwt import bearer

class CurrentUser(BaseModel):
    id: int
    role: str
    region_code: Optional[str] = None
    email: Optional[str] = None
    display_name: Optional[str] = None

async def get_current_user(
    request: Request = Depends(),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: AsyncSession = Depends(get_session)
) -> CurrentUser:
    # Delegate to existing rbac.get_current_user which is async and requires all parameters
    from api.v1.permissions.rbac import get_current_user as rbac_get_current_user
    user = await rbac_get_current_user(request, credentials, db)
    # Map to CurrentUser
    return CurrentUser(
        id=user.id,
        role=user.role.value if hasattr(user.role, 'value') else str(user.role),
        region_code=getattr(user, 'region_code', None),
        email=user.email,
        display_name=getattr(user, 'display_name', None)
    )
