from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database.base import Base
from users.models import User

class GalleryStatus(str, PyEnum):
    draft = "draft"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"

class Gallery(Base):
    __tablename__ = "galleries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=False)  # URL to image
    # ✅ FIXED: Changed author_id ondelete from CASCADE to SET NULL (less aggressive)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)  # user who created
    author = relationship("User", foreign_keys=[author_id])
    # ✅ FIXED: Removed region_code - migrated to park-based access control
    # region_code = Column(String(10), nullable=False, index=True)  # LEGACY - removed
    
    # Polymorphic relationship fields untuk menghubungkan dengan flora/fauna/park
    entity_type = Column(String(20), nullable=True, index=True)  # 'flora', 'fauna', 'park', etc.
    entity_id = Column(Integer, nullable=True, index=True)  # ID of the related entity
    
    status = Column(String(20), nullable=False, server_default=GalleryStatus.draft.value)
    # ✅ FIXED: Added ForeignKey constraints for data integrity
    submitted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # soft delete
