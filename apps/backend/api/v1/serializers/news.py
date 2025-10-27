from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from domains.news.models import NewsStatus, NewsCategory


class NewsBase(BaseModel):
    """Base model for news data"""
    title: str = Field(..., min_length=1, max_length=255, description="Title of the news")
    content: str = Field(..., min_length=1, description="Content of the news")
    summary: Optional[str] = Field(None, max_length=500, description="Summary of the news")
    slug: Optional[str] = Field(None, max_length=255, description="URL slug for the news")
    category: NewsCategory = Field(NewsCategory.general, description="Category of the news")
    priority: int = Field(0, ge=0, le=2, description="Priority level (0=normal, 1=high, 2=urgent)")
    is_featured: bool = Field(False, description="Whether this news is featured")
    is_pinned: bool = Field(False, description="Whether this news is pinned to top")
    featured_image: Optional[str] = Field(None, max_length=500, description="URL to featured image")
    attachments: Optional[str] = Field(None, description="JSON string of attachment URLs")
    tags: Optional[str] = Field(None, max_length=500, description="Comma-separated tags")
    reading_time: Optional[int] = Field(0, ge=0, description="Estimated reading time in minutes")
    expires_at: Optional[datetime] = Field(None, description="When the news expires")


class NewsIn(NewsBase):
    """Input model for creating news"""
    pass


class NewsUpdate(BaseModel):
    """Update model for news"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = Field(None, max_length=500)
    slug: Optional[str] = Field(None, max_length=255)
    category: Optional[NewsCategory] = None
    status: Optional[NewsStatus] = None
    priority: Optional[int] = Field(None, ge=0, le=2)
    is_featured: Optional[bool] = None
    is_pinned: Optional[bool] = None
    featured_image: Optional[str] = Field(None, max_length=500)
    attachments: Optional[str] = None
    tags: Optional[str] = Field(None, max_length=500)
    reading_time: Optional[int] = Field(None, ge=0)
    expires_at: Optional[datetime] = None


class NewsOut(NewsBase):
    """Output model for news"""
    id: int
    status: NewsStatus
    author_id: Optional[int]
    published_at: Optional[datetime]
    view_count: int
    created_at: datetime
    updated_at: datetime
    
    # Workflow fields
    submitted_by: Optional[int]
    submitted_at: Optional[datetime]
    approved_by: Optional[int]
    approved_at: Optional[datetime]
    rejected_by: Optional[int]
    rejected_at: Optional[datetime]
    rejection_reason: Optional[str]

    class Config:
        from_attributes = True


class NewsListResponse(BaseModel):
    """Response model for news list"""
    items: List[NewsOut]
    total: int
    limit: int
    offset: int
    has_next: bool
    has_prev: bool


class NewsPublicOut(BaseModel):
    """Public output model for news (limited fields)"""
    id: int
    title: str
    content: str
    summary: Optional[str]
    slug: Optional[str]
    category: NewsCategory
    priority: int
    is_featured: bool
    is_pinned: bool
    featured_image: Optional[str]
    tags: Optional[str]
    reading_time: int
    published_at: Optional[datetime]
    expires_at: Optional[datetime]
    view_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class NewsPublicListResponse(BaseModel):
    """Public response model for news list"""
    items: List[NewsPublicOut]
    total: int
    limit: int
    offset: int
    has_next: bool
    has_prev: bool
