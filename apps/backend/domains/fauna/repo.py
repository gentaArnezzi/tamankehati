from typing import Optional, Sequence
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from domains.fauna.models import Fauna

async def count_all(db: AsyncSession, where=None, statuses: Optional[Sequence[str]] = None) -> int:
    where = where or []
    stmt = select(func.count(Fauna.id)).where(*where)
    if statuses is not None:
        stmt = stmt.where(Fauna.status.in_(statuses))  # Removed list() call
    return (await db.execute(stmt)).scalar_one()

async def get_by_id(db: AsyncSession, fauna_id: int) -> Optional[Fauna]:  # Changed return type to Optional[Fauna]
    res = await db.execute(select(Fauna).where(Fauna.id == fauna_id))
    return res.scalars().first()

def _apply_status_filter(stmt, statuses: Optional[Sequence[str]]):
    if statuses is None:
        return stmt
    return stmt.where(Fauna.status.in_(statuses))  # Removed list() call
    return stmt.where(Fauna.status.in_(list(statuses)))


async def search(
    db: AsyncSession,
    q: Optional[str],
    page: int,
    size: int,
    statuses: Optional[Sequence[str]] = None,
):
    where = []
    stmt = select(Fauna)
    if q:
        like = f"%{q.lower()}%"
        where.append(func.lower(Fauna.local_name).like(like) | func.lower(Fauna.scientific_name).like(like))
        stmt = stmt.where(*where)
    stmt = _apply_status_filter(stmt, statuses)
    total = await count_all(db, where, statuses)
    res = await db.execute(
        stmt.order_by(Fauna.id.desc()).offset((page - 1) * size).limit(size)
    )
    items = res.scalars().all()
    return items, total

async def create(db: AsyncSession, **data):
    obj = Fauna(**data)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj

async def update_one(db: AsyncSession, fauna_id: int, data: dict) -> Optional[Fauna]:
    await db.execute(update(Fauna).where(Fauna.id == fauna_id).values(**data))
    await db.commit()
    return await get_by_id(db, fauna_id)

async def delete_one(db: AsyncSession, fauna_id: int) -> bool:
    res = await db.execute(delete(Fauna).where(Fauna.id == fauna_id))
    await db.commit()
    return res.rowcount > 0
