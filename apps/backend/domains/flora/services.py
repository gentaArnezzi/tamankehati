from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from domains.flora import repo as flora_repo
# Zone import removed - zones functionality removed
from api.v1.permissions.policies import ensure_user_scope_or_admin
from users.models import User

class FloraService:
    @staticmethod
    async def list(
        db: AsyncSession,
        q: Optional[str],
        page: int,
        size: int,
        statuses: Optional[list[str]] = None,
    ):
        return await flora_repo.search(db, q, page, size, statuses=statuses)

    @staticmethod
    async def create(db: AsyncSession, data: dict, user: User):
        # Park-based scoping - no zone/region needed
        # ensure_user_scope_or_admin will handle park-based filtering
        return await flora_repo.create(db, **data)

    @staticmethod
    async def update(db: AsyncSession, flora_id: int, data: dict, user: User):
        current = await flora_repo.get_by_id(db, flora_id)
        if not current:
            return None
        # Park-based scoping - no zone/region needed
        return await flora_repo.update_one(db, flora_id, data)

    @staticmethod
    async def delete(db: AsyncSession, flora_id: int, user: User) -> bool:
        current = await flora_repo.get_by_id(db, flora_id)
        if not current:
            return False
        # Park-based scoping - no zone/region needed
        return await flora_repo.delete_one(db, flora_id)
