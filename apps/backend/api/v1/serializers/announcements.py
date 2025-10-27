from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from domains.announcements.models import AnnouncementStatus, AnnouncementType


class AnnouncementBase(BaseModel):
    """Base model for announcement data"""
    title: str = Field(..., min_length=1, max_length=255, description="Title of the announcement")
    content: str = Field(..., min_length=1, description="Content of the announcement")
    summary: Optional[str] = Field(None, max_length=500, description="Summary of the announcement")
    type: AnnouncementType = Field(AnnouncementType.announcement, description="Type of announcement")
    target_audience: str = Field("regional_admin", description="Target audience: super_admin, regional_admin")
    priority: int = Field(0, ge=0, le=2, description="Priority level (0=normal, 1=high, 2=urgent)")
    is_featured: bool = Field(False, description="Whether this announcement is featured")
    is_pinned: bool = Field(False, description="Whether this announcement is pinned to top")
    featured_image: Optional[str] = Field(None, max_length=500, description="URL to featured image")
    attachments: Optional[str] = Field(None, description="JSON string of attachment URLs")
    tags: Optional[str] = Field(None, max_length=500, description="Comma-separated tags")
    expires_at: Optional[datetime] = Field(None, description="When the announcement expires")


class AnnouncementIn(AnnouncementBase):
    """Input model for creating announcements"""
    pass


class AnnouncementUpdate(BaseModel):
    """Update model for announcements"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = Field(None, max_length=500)
    type: Optional[AnnouncementType] = None
    target_audience: Optional[str] = None
    status: Optional[AnnouncementStatus] = None
    priority: Optional[int] = Field(None, ge=0, le=2)
    is_featured: Optional[bool] = None
    is_pinned: Optional[bool] = None
    featured_image: Optional[str] = Field(None, max_length=500)
    attachments: Optional[str] = None
    tags: Optional[str] = Field(None, max_length=500)
    expires_at: Optional[datetime] = None


class AnnouncementOut(AnnouncementBase):
    """Output model for announcements"""
    id: int
    status: AnnouncementStatus
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


class AnnouncementListResponse(BaseModel):
    """Response model for announcement list"""
    items: List[AnnouncementOut]
    total: int
    limit: int
    offset: int
    has_next: bool
    has_prev: bool


class AnnouncementPublicOut(BaseModel):
    """Public output model for announcements (limited fields)"""
    id: int
    title: str
    content: str
    summary: Optional[str]
    type: AnnouncementType
    priority: int
    is_featured: bool
    is_pinned: bool
    featured_image: Optional[str]
    tags: Optional[str]
    published_at: Optional[datetime]
    expires_at: Optional[datetime]
    view_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class AnnouncementPublicListResponse(BaseModel):
    """Public response model for announcement list"""
    items: List[AnnouncementPublicOut]
    total: int
    limit: int
    offset: int
    has_next: bool
    has_prev: bool
