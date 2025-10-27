# apps/backend/users/repo.py
"""User repository functions"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from users.models import User

async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email"""
    stmt = select(User).where(User.email == email, User.is_active == True)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """Get user by ID"""
    stmt = select(User).where(User.id == user_id, User.is_active == True)
    result = await db.execute(stmt)
    return result.scalars().first()

async def create_user(db: AsyncSession, email: str, password_hash: str, **kwargs) -> User:
    """Create new user"""
    from users.models import User, UserRole

    user = User(
        email=email,
        password_hash=password_hash,
        role=kwargs.get("role", UserRole.public),
        region_code=kwargs.get("region_code"),
        display_name=kwargs.get("display_name"),
        is_active=kwargs.get("is_active", True)
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
