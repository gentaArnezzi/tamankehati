"""
Enhanced Announcement Serializers
Support for interaction tracking and analytics
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from domains.announcements.models import AnnouncementStatus, AnnouncementType


class AnnouncementCreate(BaseModel):
    """Create announcement request"""
    title: str = Field(..., min_length=1, max_length=255, description="Announcement title")
    content: str = Field(..., min_length=1, description="Announcement content")
    summary: Optional[str] = Field(None, max_length=500, description="Brief summary")
    type: AnnouncementType = Field(AnnouncementType.announcement, description="Type of announcement")
    priority: str = Field("normal", description="Priority level")
    target_audience: str = Field("all_regional_admins", description="Target audience")
    target_regions: Optional[List[str]] = Field(None, description="Specific regions to target")
    target_user_ids: Optional[List[int]] = Field(None, description="Specific user IDs to target")
    requires_acknowledgment: bool = Field(False, description="Requires acknowledgment")
    is_featured: bool = Field(False, description="Featured announcement")
    is_pinned: bool = Field(False, description="Pinned to top")
    expires_at: Optional[datetime] = Field(None, description="Expiration date")
    tags: Optional[str] = Field(None, description="Comma-separated tags")
    featured_image: Optional[str] = Field(None, description="Featured image URL")
    attachments: Optional[List[Dict[str, Any]]] = Field(None, description="Attachment files")

    @validator('target_audience')
    def validate_target_audience(cls, v):
        allowed_values = ["all_regional_admins", "specific_regions", "specific_users"]
        if v not in allowed_values:
            raise ValueError(f"target_audience must be one of {allowed_values}")
        return v


class AnnouncementUpdate(BaseModel):
    """Update announcement request"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    summary: Optional[str] = Field(None, max_length=500)
    type: Optional[AnnouncementType] = None
    priority: Optional[str] = None
    target_audience: Optional[str] = None
    target_regions: Optional[List[str]] = None
    target_user_ids: Optional[List[int]] = None
    requires_acknowledgment: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_pinned: Optional[bool] = None
    expires_at: Optional[datetime] = None
    tags: Optional[str] = None
    featured_image: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = None


class UserOut(BaseModel):
    """User output for relationships"""
    id: int
    email: str
    display_name: Optional[str] = None
    role: str
    region_code: Optional[str] = None

    class Config:
        from_attributes = True


class AnnouncementReadOut(BaseModel):
    """Announcement read tracking output"""
    id: int
    announcement_id: int
    user_id: int
    read_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    user: UserOut

    class Config:
        from_attributes = True


class AnnouncementCommentOut(BaseModel):
    """Announcement comment output"""
    id: int
    announcement_id: int
    user_id: int
    content: str
    parent_comment_id: Optional[int] = None
    is_approved: bool
    moderated_by: Optional[int] = None
    moderated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    user: UserOut
    moderator: Optional[UserOut] = None

    class Config:
        from_attributes = True


class AnnouncementReactionOut(BaseModel):
    """Announcement reaction output"""
    id: int
    announcement_id: int
    user_id: int
    reaction_type: str
    created_at: datetime
    user: UserOut

    class Config:
        from_attributes = True


class AnnouncementOut(BaseModel):
    """Enhanced announcement output with interaction data"""
    id: int
    title: str
    content: str
    summary: Optional[str] = None
    type: AnnouncementType
    priority: str
    status: AnnouncementStatus
    target_audience: str
    target_regions: Optional[List[str]] = None
    target_user_ids: Optional[List[int]] = None
    requires_acknowledgment: bool
    is_featured: bool
    is_pinned: bool
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    author_id: Optional[int] = None
    featured_image: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = None
    tags: Optional[str] = None
    view_count: int
    created_at: datetime
    updated_at: datetime
    
    # Interaction data
    read_count: int = 0
    acknowledged_count: int = 0
    comment_count: int = 0
    reaction_count: int = 0
    user_has_read: bool = False
    user_has_acknowledged: bool = False
    user_reactions: List[str] = []

    class Config:
        from_attributes = True


class AnnouncementListResponse(BaseModel):
    """Paginated announcement list response"""
    items: List[AnnouncementOut]
    total: int
    page: int
    per_page: int
    pages: int


class AnnouncementAnalytics(BaseModel):
    """Announcement analytics data"""
    announcement_id: int
    title: str
    view_count: int
    read_count: int
    acknowledged_count: int
    comment_count: int
    reaction_count: int
    acknowledgment_rate: float
    engagement_rate: float
    reads_by_region: Dict[str, int] = {}
    reads_by_date: Dict[str, int] = {}


class CommentCreate(BaseModel):
    """Create comment request"""
    content: str = Field(..., min_length=1, max_length=2000, description="Comment content")
    parent_comment_id: Optional[int] = Field(None, description="Parent comment ID for replies")


class ReactionCreate(BaseModel):
    """Create reaction request"""
    reaction_type: str = Field(..., description="Type of reaction (like, love, etc.)")

    @validator('reaction_type')
    def validate_reaction_type(cls, v):
        allowed_types = ["like", "love", "dislike", "angry", "sad", "wow"]
        if v not in allowed_types:
            raise ValueError(f"reaction_type must be one of {allowed_types}")
        return v


class AcknowledgeRequest(BaseModel):
    """Acknowledge announcement request"""
    acknowledged: bool = Field(True, description="Whether to acknowledge the announcement")
