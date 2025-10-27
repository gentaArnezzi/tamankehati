from typing import Optional, Sequence
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from domains.flora.models import Flora

async def count_all(db: AsyncSession, where=None, statuses: Optional[Sequence[str]] = None) -> int:
    where = where or []
    stmt = select(func.count(Flora.id)).where(*where)
    if statuses is not None:
        stmt = stmt.where(Flora.status.in_(list(statuses)))
    return (await db.execute(stmt)).scalar_one()

async def get_by_id(db: AsyncSession, flora_id: int) -> Optional[Flora]:
    res = await db.execute(select(Flora).where(Flora.id == flora_id))
    return res.scalars().first()

def _apply_status_filter(stmt, statuses: Optional[Sequence[str]]):
    if statuses is None:
        return stmt
    return stmt.where(Flora.status.in_(list(statuses)))


async def search(
    db: AsyncSession,
    q: Optional[str],
    page: int,
    size: int,
    statuses: Optional[Sequence[str]] = None,
):
    where = []
    stmt = select(Flora)
    if q:
        like = f"%{q.lower()}%"
        where.append(func.lower(Flora.local_name).like(like) | func.lower(Flora.scientific_name).like(like))
        stmt = stmt.where(*where)
    stmt = _apply_status_filter(stmt, statuses)
    total = await count_all(db, where, statuses)
    res = await db.execute(
        stmt.order_by(Flora.id.desc()).offset((page - 1) * size).limit(size)
    )
    items = res.scalars().all()
    return items, total

async def create(db: AsyncSession, **data):
    obj = Flora(**data)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj

async def update_one(db: AsyncSession, flora_id: int, data: dict) -> Optional[Flora]:
    await db.execute(update(Flora).where(Flora.id == flora_id).values(**data))
    await db.commit()
    return await get_by_id(db, flora_id)

async def delete_one(db: AsyncSession, flora_id: int) -> bool:
    res = await db.execute(delete(Flora).where(Flora.id == flora_id))
    await db.commit()
    return res.rowcount > 0
