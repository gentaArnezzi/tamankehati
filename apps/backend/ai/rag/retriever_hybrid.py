from typing import List, Tuple
from sqlalchemy import select, func, literal_column
from sqlalchemy.ext.asyncio import AsyncSession
from domains.flora.models import Flora
from domains.fauna.models import Fauna
from core.config.constants import MIN_TRGM_SIMILARITY, HYBRID_WEIGHT_TRGM, HYBRID_WEIGHT_BM25

def _sim(col, q): return func.similarity(func.lower(col), func.lower(q))

def _tsv_expr_flora():
    return func.to_tsvector('simple', func.coalesce(Flora.local_name, '') + ' ' + func.coalesce(Flora.scientific_name, '') + ' ' + func.coalesce(Flora.description, ''))
def _tsv_expr_fauna():
    return func.to_tsvector('simple', func.coalesce(Fauna.local_name, '') + ' ' + func.coalesce(Fauna.scientific_name, '') + ' ' + func.coalesce(Fauna.description, ''))

def _tsq(q: str):
    return func.plainto_tsquery('simple', q)

async def hybrid_retrieve(db: AsyncSession, q: str, limit: int = 8) -> List[Tuple[str, str]]:
    tsq = _tsq(q)

    # Flora scores
    sim_f = func.greatest(_sim(Flora.local_name, q), _sim(Flora.scientific_name, q)).label("sim")
    rank_f = func.ts_rank(_tsv_expr_flora(), tsq).label("rank")
    s_flora = (
        select(Flora.local_name, Flora.description, sim_f, rank_f)
        .where( (sim_f >= MIN_TRGM_SIMILARITY) | (_tsv_expr_flora().op('@@')(tsq)) )
        .order_by( (HYBRID_WEIGHT_TRGM*literal_column("sim") + HYBRID_WEIGHT_BM25*literal_column("rank")).desc() )
        .limit(limit)
    )

    # Fauna scores
    sim_a = func.greatest(_sim(Fauna.local_name, q), _sim(Fauna.scientific_name, q)).label("sim")
    rank_a = func.ts_rank(_tsv_expr_fauna(), tsq).label("rank")
    s_fauna = (
        select(Fauna.local_name, Fauna.description, sim_a, rank_a)
        .where( (sim_a >= MIN_TRGM_SIMILARITY) | (_tsv_expr_fauna().op('@@')(tsq)) )
        .order_by( (HYBRID_WEIGHT_TRGM*literal_column("sim") + HYBRID_WEIGHT_BM25*literal_column("rank")).desc() )
        .limit(limit)
    )

    f_rows = (await db.execute(s_flora)).all()
    a_rows = (await db.execute(s_fauna)).all()

    # interleave simple then cut to limit
    merged: List[Tuple[str, str]] = []
    i = 0
    while (i < len(f_rows) or i < len(a_rows)) and len(merged) < limit:
        if i < len(f_rows):
            t, d, _s, _r = f_rows[i]
            merged.append((t or "", (d or "")[:400]))
        if i < len(a_rows) and len(merged) < limit:
            t, d, _s, _r = a_rows[i]
            merged.append((t or "", (d or "")[:400]))
        i += 1
    return merged
