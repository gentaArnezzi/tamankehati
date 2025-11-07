from __future__ import annotations
from enum import Enum

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from core.database.base import Base


class AnnouncementStatus(str, Enum):
    """Status enum for announcements"""
    draft = "draft"
    published = "published"
    archived = "archived"


class AnnouncementType(str, Enum):
    """Type enum for announcements"""
    news = "news"
    announcement = "announcement"
    event = "event"
    maintenance = "maintenance"


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    
    # Core fields
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    summary = Column(String(500), nullable=True)
    
    # Type and status (using String instead of SQLEnum for database compatibility)
    type = Column(
        String(50),
        nullable=False,
        default="announcement",
        index=True
    )
    status = Column(
        String(50),
        nullable=False,
        default="draft",
        index=True
    )
    
    # Target audience
    target_audience = Column(
        String(50),
        nullable=False,
        default="regional_admin",
        comment="Target audience: super_admin, regional_admin"
    )
    
    # Priority and visibility
    priority = Column(Integer, default=0, comment="Priority level (0=normal, 1=high, 2=urgent)")
    is_featured = Column(Boolean, default=False, comment="Whether this announcement is featured")
    is_pinned = Column(Boolean, default=False, comment="Whether this announcement is pinned to top")
    
    # Publishing
    published_at = Column(DateTime(timezone=True), nullable=True, comment="When the announcement was published")
    expires_at = Column(DateTime(timezone=True), nullable=True, comment="When the announcement expires")
    
    # Author information
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
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
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), 
                      onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # soft delete

    # Relationships
    reads = relationship("AnnouncementRead", back_populates="announcement", lazy="select")
    comments = relationship("AnnouncementComment", back_populates="announcement", lazy="select")
    reactions = relationship("AnnouncementReaction", back_populates="announcement", lazy="select")

    def __repr__(self):
        return f"<Announcement {self.title} ({self.status})>"
