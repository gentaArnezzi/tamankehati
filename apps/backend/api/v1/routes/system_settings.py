# apps/backend/api/v1/routes/system_settings.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database.session import get_session
from core.models.system_settings import SystemSettings
from users.models import User
from domains.articles.models import UserRole
from api.v1.permissions.policies import require_roles
from api.v1.permissions.rbac import current_user
from api.v1.serializers.system_settings import SystemSettingsOut, SystemSettingsIn, SystemSettingsUpdate

router = APIRouter(prefix="/system-settings")

@router.get("/system-settings", response_model=List[SystemSettingsOut], tags=["System Settings"])
async def list_system_settings(
    actor: User = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    if actor.role != UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Forbidden: Only Super Admin can access system settings")
    stmt = select(SystemSettings).order_by(SystemSettings.key)
    rows = (await db.execute(stmt)).scalars().all()
    return rows

@router.get("/system-settings/{setting_key}", response_model=SystemSettingsOut, tags=["System Settings"])
async def get_system_setting(
    setting_key: str,
    actor: User = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    if actor.role != UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Forbidden: Only Super Admin can access system settings")
    stmt = select(SystemSettings).where(SystemSettings.key == setting_key)
    obj = (await db.execute(stmt)).scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="System setting not found")
    return obj

@router.post("/system-settings", response_model=SystemSettingsOut, status_code=201, tags=["System Settings"])
async def create_system_setting(
    body: SystemSettingsIn,
    actor: User = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    if actor.role != UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Forbidden: Only Super Admin can manage system settings")
    # Check if key already exists
    existing = (await db.execute(select(SystemSettings).where(SystemSettings.key == body.key))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="System setting key already exists")
    obj = SystemSettings(
        key=body.key,
        value=body.value,
        description=body.description,
        is_sensitive=body.is_sensitive,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj

@router.put("/system-settings/{setting_key}", response_model=SystemSettingsOut, tags=["System Settings"])
async def update_system_setting(
    setting_key: str,
    body: SystemSettingsUpdate,
    actor: User = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    if actor.role != UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Forbidden: Only Super Admin can manage system settings")
    obj = (await db.execute(select(SystemSettings).where(SystemSettings.key == setting_key))).scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="System setting not found")
    obj.value = body.value
    if body.description is not None:
        obj.description = body.description
    if body.is_sensitive is not None:
        obj.is_sensitive = body.is_sensitive
    await db.commit()
    await db.refresh(obj)
    return obj

@router.delete("/system-settings/{setting_key}", tags=["System Settings"])
async def delete_system_setting(
    setting_key: str,
    actor: User = Depends(current_user),
    db: AsyncSession = Depends(get_session),
):
    if actor.role != UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Forbidden: Only Super Admin can manage system settings")
    obj = (await db.execute(select(SystemSettings).where(SystemSettings.key == setting_key))).scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="System setting not found")
    await db.delete(obj)
    await db.commit()
    return {"ok": True}
