from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from domains.flora.models import Flora
from domains.fauna.models import Fauna

async def keyword_retrieve(db: AsyncSession, q: str, limit: int = 5) -> list[tuple[str, str]]:
    like = f"%{q.lower()}%"
    results: list[tuple[str, str]] = []
    for Model, title_col, text_col in [(Flora, Flora.local_name, Flora.description),
                                       (Fauna, Fauna.local_name, Fauna.description)]:
        stmt = select(title_col, text_col).where(
            func.lower(title_col).like(like) | func.lower(text_col).like(like)
        ).limit(limit)
        res = await db.execute(stmt)
        results.extend([(t or "", (d or "")[:300]) for (t, d) in res.all()])
    return results[:limit]
