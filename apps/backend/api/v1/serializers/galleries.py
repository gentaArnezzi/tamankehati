from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class GalleryIn(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: str
    park_id: Optional[int] = None
    entity_type: Optional[str] = None  # 'flora', 'fauna', 'park', etc.
    entity_id: Optional[int] = None  # ID of the related entity

class GalleryOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    image_url: str
    author_id: Optional[int]
    park_id: Optional[int]
    entity_type: Optional[str]  # 'flora', 'fauna', 'park', etc.
    entity_id: Optional[int]  # ID of the related entity
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

class GalleryListResponse(BaseModel):
    items: List[GalleryOut]
    total: int
    limit: int
    offset: int
    has_next: bool
    has_prev: bool
