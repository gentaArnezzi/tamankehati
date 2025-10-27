# apps/backend/api/v1/utils/scoping.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict, Optional
from users.models import User, UserRole

def apply_role_based_filter(stmt, model, user: User, submitted_by_param: Optional[str] = None):
    """
    Apply role-based filtering to a SQLAlchemy select statement.

    Args:
        stmt: The select statement to filter
        model: The model class (e.g., Flora, Fauna)
        user: Current user object
        submitted_by_param: Optional submitted_by from query params (for overrides)

    Returns:
        Modified statement with appropriate filters
    """
    # Super Admin: no filter
    if user.role == UserRole.super_admin:
        return stmt

    # Regional Admin: filter by park_id
    if user.role == UserRole.regional_admin:
        if user.park_id:
            # Filter by park_id - only show data from their assigned park
            if hasattr(model, 'park_id'):
                stmt = stmt.where(model.park_id == user.park_id)
            # For models without park_id, filter by submitted_by
            elif hasattr(model, 'submitted_by'):
                stmt = stmt.where(model.submitted_by == user.id)
            elif hasattr(model, 'created_by'):
                stmt = stmt.where(model.created_by == user.id)
        else:
            # If no park_id assigned, filter by their submitted data
            if hasattr(model, 'submitted_by'):
                stmt = stmt.where(model.submitted_by == user.id)
            elif hasattr(model, 'created_by'):
                stmt = stmt.where(model.created_by == user.id)
        return stmt

    # All users: only approved items
    if hasattr(model, 'status'):
        stmt = stmt.where(model.status == "approved")
    return stmt

def enforce_user_scope(user: User, target_user_id: int, allow_super_admin: bool = True):
    """
    Enforce that user can only access their own data.

    Args:
        user: Current user
        target_user_id: User ID to check access for
        allow_super_admin: Whether to allow super admin access (default True)

    Raises:
        HTTPException: If access is forbidden
    """
    from fastapi import HTTPException

    if allow_super_admin and user.role == UserRole.super_admin:
        return

    if user.role == UserRole.regional_admin:
        if user.id != target_user_id:
            raise HTTPException(403, "Forbidden: Access to other user's data")
        return

    # All users: check user access
    if user.id != target_user_id:
        raise HTTPException(403, "Forbidden: Access to other user's data")
    return

    raise HTTPException(403, "Forbidden")

def get_user_id(user: User) -> Optional[int]:
    """Get the user ID."""
    return user.id

def is_admin(user: User) -> bool:
    """Check if user is an admin (super or regional)."""
    return user.role in (UserRole.super_admin, UserRole.regional_admin)
