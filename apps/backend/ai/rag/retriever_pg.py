from typing import List, Tuple
from sqlalchemy import select, func, literal_column
from sqlalchemy.ext.asyncio import AsyncSession
from domains.flora.models import Flora
from domains.fauna.models import Fauna
from core.config.constants import MIN_TRGM_SIMILARITY

def _similarity(col, q: str):
    return func.similarity(func.lower(col), func.lower(q))

async def trigram_retrieve(db: AsyncSession, q: str, limit: int = 6) -> List[Tuple[str, str]]:
    """Use pg_trgm similarity on local_name & scientific_name for Flora & Fauna.
    Return list of (title, snippet)."""
    sim_f_local = _similarity(Flora.local_name, q)
    sim_f_scient = _similarity(Flora.scientific_name, q)
    sim_a_local = _similarity(Fauna.local_name, q)
    sim_a_scient = _similarity(Fauna.scientific_name, q)

    s_flora = (
        select(Flora.local_name, Flora.description, func.greatest(sim_f_local, sim_f_scient).label("sim"))
        .where(func.greatest(sim_f_local, sim_f_scient) >= MIN_TRGM_SIMILARITY)
        .order_by(literal_column("sim").desc())
        .limit(limit)
    )
    s_fauna = (
        select(Fauna.local_name, Fauna.description, func.greatest(sim_a_local, sim_a_scient).label("sim"))
        .where(func.greatest(sim_a_local, sim_a_scient) >= MIN_TRGM_SIMILARITY)
        .order_by(literal_column("sim").desc())
        .limit(limit)
    )

    flora_rows = (await db.execute(s_flora)).all()
    fauna_rows = (await db.execute(s_fauna)).all()

    results: List[Tuple[str, str]] = []
    for t, d, _sim in flora_rows + fauna_rows:
        results.append((t or "", (d or "")[:400]))
    # take top 'limit' merged by simple interleave—can be improved with heap merge
    return results[:limit]
