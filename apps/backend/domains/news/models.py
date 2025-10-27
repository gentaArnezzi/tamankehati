from __future__ import annotations
from typing import TYPE_CHECKING
from enum import Enum

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Boolean,
    Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from core.database.base import Base

# Type variable for better type hints
if TYPE_CHECKING:
    from users.models import User
else:
    User = "User"


class NewsStatus(str, Enum):
    """Status enum for news"""
    draft = "draft"
    published = "published"
    archived = "archived"


class NewsCategory(str, Enum):
    """Category enum for news"""
    biodiversity = "biodiversity"
    conservation = "conservation"
    research = "research"
    education = "education"
    events = "events"
    general = "general"


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    
    # Core fields
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    summary = Column(String(500), nullable=True)
    slug = Column(String(255), nullable=True, unique=True, index=True)
    
    # Category and status
    # ✅ FIXED: Changed from SQLEnum to String for database compatibility (like Announcements)
    category = Column(
        String(50),
        nullable=False,
        default="general",
        index=True
    )
    status = Column(
        String(50),
        nullable=False,
        default="draft",
        index=True
    )
    
    # Priority and visibility
    priority = Column(Integer, default=0, comment="Priority level (0=normal, 1=high, 2=urgent)")
    is_featured = Column(Boolean, default=False, comment="Whether this news is featured")
    is_pinned = Column(Boolean, default=False, comment="Whether this news is pinned to top")
    
    # Publishing
    published_at = Column(DateTime(timezone=True), nullable=True, comment="When the news was published")
    expires_at = Column(DateTime(timezone=True), nullable=True, comment="When the news expires")
    
    # Author information
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    author = relationship("User", foreign_keys=[author_id], lazy="select")
    
    # Workflow fields
    # ✅ FIXED: Added ondelete='SET NULL' for data integrity
    submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(String(500), nullable=True)
    
    # Media
    featured_image = Column(String(500), nullable=True, comment="URL to featured image")
    attachments = Column(Text, nullable=True, comment="JSON string of attachment URLs")
    
    # Metadata
    tags = Column(String(500), nullable=True, comment="Comma-separated tags")
    view_count = Column(Integer, default=0, comment="Number of views")
    reading_time = Column(Integer, default=0, comment="Estimated reading time in minutes")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), 
                      onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # soft delete

    def __repr__(self):
        return f"<News {self.title} ({self.status})>"
