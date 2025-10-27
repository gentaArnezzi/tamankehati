from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database.base import Base

class UserRole(str, PyEnum):
    super_admin = "super_admin"
    regional_admin = "regional_admin"

class ArticleStatus(str, PyEnum):
    draft = "draft"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"

# Export UserRole for other modules to import
__all__ = ['Article', 'ArticleStatus', 'UserRole']

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    summary = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    featured_image = Column(String(500), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # author = relationship("User", foreign_keys=[author_id])  # Disabled to avoid circular import
    park_id = Column(Integer, ForeignKey("parks.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), nullable=False, server_default=ArticleStatus.draft.value)
    
    # ✅ FIXED: Added ForeignKey constraints for data integrity
    submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)  # user who submitted for review
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)  # user who approved
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)  # user who rejected
    rejected_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # soft delete
