from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from domains.fauna import repo as fauna_repo
# Zone import removed - zones functionality removed
from api.v1.permissions.policies import ensure_user_scope_or_admin
from users.models import User

class FaunaService:
    @staticmethod
    async def list(
        db: AsyncSession,
        q: Optional[str],
        page: int,
        size: int,
        statuses: Optional[list[str]] = None,
    ):
        return await fauna_repo.search(db, q, page, size, statuses=statuses)

    @staticmethod
    async def create(db: AsyncSession, data: dict, user: User):
        # Park-based scoping - no zone/region needed
        # ensure_user_scope_or_admin will handle park-based filtering
        return await fauna_repo.create(db, **data)

    @staticmethod
    async def update(db: AsyncSession, fauna_id: int, data: dict, user: User):
        current = await fauna_repo.get_by_id(db, fauna_id)
        if not current:
            return None
        # Park-based scoping - no zone/region needed
        return await fauna_repo.update_one(db, fauna_id, data)

    @staticmethod
    async def delete(db: AsyncSession, fauna_id: int, user: User) -> bool:
        current = await fauna_repo.get_by_id(db, fauna_id)
        if not current:
            return False
        # Park-based scoping - no zone/region needed
        return await fauna_repo.delete_one(db, fauna_id)
