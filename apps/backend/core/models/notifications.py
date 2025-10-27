from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, text
from sqlalchemy.sql import func
from core.database.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    to_user_id = Column(Integer, nullable=False, index=True)
    from_user_id = Column(Integer, nullable=True, index=True)
    type = Column(String(50), nullable=False)  # e.g., "review_submitted", "approved", "rejected"
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    resource = Column(String(100), nullable=True)  # e.g., "flora", "fauna"
    resource_id = Column(Integer, nullable=True)
    region_code = Column(String(10), nullable=True, index=True)
    is_read = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), nullable=False)

    def __repr__(self):
        return f"<Notification(id={self.id}, type={self.type}, to_user_id={self.to_user_id})>"
