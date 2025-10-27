from typing import Literal, Optional

from pydantic import BaseModel, Field


class SearchResultOut(BaseModel):
    id: str = Field(..., description="Identifier of the entity")
    tipe: Literal["flora", "fauna", "taman", "artikel", "galeri"]
    judul: str
    ringkasan: Optional[str] = None
    url: str
    badge: Optional[str] = None
    gambar: Optional[str] = None
    score: Optional[float] = Field(default=None, description="Optional relevance score")


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultOut]
