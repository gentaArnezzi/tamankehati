from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ArticleIn(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    category: Optional[str] = None
    featured_image: Optional[str] = None
    park_id: Optional[int] = None
    status: Optional[str] = None

class ArticleOut(BaseModel):
    id: int
    title: str
    slug: Optional[str]
    content: str
    summary: Optional[str]
    category: Optional[str]
    featured_image: Optional[str]
    author_id: Optional[int]
    park_id: Optional[int]
    status: str
    submitted_by: Optional[int]
    submitted_at: Optional[datetime]
    approved_by: Optional[int]
    approved_at: Optional[datetime]
    rejected_by: Optional[int]
    rejected_at: Optional[datetime]
    rejection_reason: Optional[str]
    created_at: datetime
    updated_at: datetime

class ArticleListResponse(BaseModel):
    items: List[ArticleOut]
    total: int
    limit: int
    offset: int
    has_next: bool
    has_prev: bool
