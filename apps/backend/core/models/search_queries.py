from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from core.database.base import Base


class SearchQueryLog(Base):
    __tablename__ = "search_query_logs"

    id = Column(Integer, primary_key=True)
    query = Column(Text, nullable=False)
    normalized_query = Column(Text, nullable=False, index=True)
    source = Column(String(32), nullable=False)
    results_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
