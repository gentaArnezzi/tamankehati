# apps/backend/utils/scope.py
"""Region-scoped query utilities for data access control"""

from typing import Optional, Any, Type
from sqlalchemy import select, and_, func
from sqlalchemy.orm import Query
from sqlalchemy.ext.asyncio import AsyncSession

from users.models import User, UserRole
# Zone import removed - zones functionality removed

def scoped_by_user(
    stmt,
    user: User,
    Model: Type,
    submitted_by_field: str = "submitted_by",
    created_by_field: str = "created_by"
):
    """
    Apply user scope to a query based on user role

    Args:
        stmt: SQLAlchemy select statement
        user: Current user
        Model: The model being queried
        submitted_by_field: Field name for submitted_by (default: "submitted_by")
        created_by_field: Field name for created_by (default: "created_by")
    """
    if user.role == UserRole.super_admin:
        return stmt

    # Regional Admin: filter by their submitted data
    if user.role == UserRole.regional_admin:
        if hasattr(Model, submitted_by_field):
            return stmt.where(getattr(Model, submitted_by_field) == user.id)
        elif hasattr(Model, created_by_field):
            return stmt.where(getattr(Model, created_by_field) == user.id)
        return stmt

    # Other users: no access
    return stmt.where(Model.id == -1)  # Return empty result

async def get_scoped_count(
    db: AsyncSession,
    user: User,
    Model: Type,
    base_filters: Optional[dict] = None,
    **kwargs
) -> int:
    """Get count of records with region scope applied"""
    stmt = select(Model)

    if base_filters:
        for field, value in base_filters.items():
            stmt = stmt.where(getattr(Model, field) == value)

    stmt = scoped_by_region(stmt, user, Model, **kwargs)
    count_stmt = stmt.with_only_columns(func.count(), maintain_column_froms=True).order_by(None)

    result = await db.execute(count_stmt)
    return result.scalar() or 0

def require_national_approval(user: User):
    """Check if user has national approval rights"""
    from fastapi import HTTPException
    if user.role != UserRole.super_admin:
        raise HTTPException(
            status_code=403,
            detail="National approval requires Super Admin"
        )

def require_regional_or_admin(user: User, target_user_id: Optional[int] = None):
    """Check if user has regional admin rights for the given user"""
    from fastapi import HTTPException
    if user.role == UserRole.super_admin:
        return

    if user.role != UserRole.regional_admin:
        raise HTTPException(
            status_code=403,
            detail="Regional admin access required"
        )

    if target_user_id and user.id != target_user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied for this user's data"
        )
