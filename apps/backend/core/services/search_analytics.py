from sqlalchemy.ext.asyncio import AsyncSession

from core.models.search_queries import SearchQueryLog


class SearchAnalyticsService:
    @staticmethod
    async def log_query(
        db: AsyncSession,
        query: str,
        results_count: int,
        source: str,
    ) -> None:
        normalized = (query or "").strip().lower()
        if not normalized:
            return

        entry = SearchQueryLog(
            query=query.strip(),
            normalized_query=normalized,
            source=source,
            results_count=results_count,
        )
        db.add(entry)
        try:
            await db.commit()
        except Exception:
            await db.rollback()
            raise
