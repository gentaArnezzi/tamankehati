"""
Announcement Interaction Models
Support for read tracking, comments, and reactions
"""

from __future__ import annotations
from sqlalchemy import (
    Column, DateTime, ForeignKey, Integer, String, Text, Boolean,
    Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database.base import Base


class AnnouncementRead(Base):
    """Track when Regional Admins read announcements"""
    __tablename__ = "announcement_reads"

    id = Column(Integer, primary_key=True, index=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    read_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    user_agent = Column(String(500), nullable=True)
    
    # Acknowledgment tracking
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    announcement = relationship("Announcement", back_populates="reads")
    user = relationship("User", back_populates="announcement_reads", lazy="select")
    
    # Composite unique index to prevent duplicate reads
    __table_args__ = (
        Index('idx_announcement_user_read', 'announcement_id', 'user_id', unique=True),
    )

    def __repr__(self):
        return f"<AnnouncementRead announcement_id={self.announcement_id} user_id={self.user_id}>"


class AnnouncementComment(Base):
    """Comments on announcements by Regional Admins"""
    __tablename__ = "announcement_comments"

    id = Column(Integer, primary_key=True, index=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    
    # Comment threading (for replies)
    parent_comment_id = Column(Integer, ForeignKey("announcement_comments.id"), nullable=True)
    
    # Moderation
    is_approved = Column(Boolean, default=True)
    moderated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    moderated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), 
                      onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # soft delete
    
    # Relationships
    announcement = relationship("Announcement", back_populates="comments")
    user = relationship("User", foreign_keys=[user_id], back_populates="announcement_comments", lazy="select")
    parent_comment = relationship("AnnouncementComment", remote_side=[id])
    moderator = relationship("User", foreign_keys=[moderated_by], lazy="select")

    def __repr__(self):
        return f"<AnnouncementComment {self.id} on announcement {self.announcement_id}>"


class AnnouncementReaction(Base):
    """Reactions (likes, etc.) on announcements by Regional Admins"""
    __tablename__ = "announcement_reactions"

    id = Column(Integer, primary_key=True, index=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reaction_type = Column(String(20), nullable=False, default="like")  # like, dislike, love, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    announcement = relationship("Announcement", back_populates="reactions")
    user = relationship("User", back_populates="announcement_reactions", lazy="select")
    
    # Composite unique index to prevent duplicate reactions
    __table_args__ = (
        Index('idx_announcement_user_reaction', 'announcement_id', 'user_id', 'reaction_type', unique=True),
    )

    def __repr__(self):
        return f"<AnnouncementReaction {self.reaction_type} by user {self.user_id}>"
