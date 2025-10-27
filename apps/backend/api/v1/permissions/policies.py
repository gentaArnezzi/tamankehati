from fastapi import Depends, HTTPException, status, Request
from users.models import UserRole, User
from api.v1.permissions.rbac import get_current_user

def require_roles(*allowed: UserRole):
    async def _dep(user: User = Depends(get_current_user)):
        if user.role not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user
    return _dep

def require_user_scope_or_admin(user_id_param: str = "user_id"):
    async def _dep(user: User = Depends(get_current_user), **kwargs):
        # super_admin lewat
        if user.role == UserRole.super_admin:
            return user
        # regional_admin harus match user atau park
        target_user_id = kwargs.get(user_id_param) or user.id
        if user.role == UserRole.regional_admin:
            # Check if accessing own data
            if target_user_id and target_user_id == user.id:
                return user
            # Check if accessing data from their assigned park
            if user.park_id:
                # This will be handled by the scoping logic in the API endpoints
                return user
        raise HTTPException(status_code=403, detail="User scope required")
    return _dep

# ✅ alias agar impor lama tetap jalan
ensure_user_scope_or_admin = require_user_scope_or_admin
