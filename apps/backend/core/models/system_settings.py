from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from core.database.base import Base

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(255), unique=True, nullable=False, index=True)  # e.g., "theme", "api_key"
    value = Column(JSON, nullable=False)  # Flexible untuk string, dict, dll.
    description = Column(Text, nullable=True)
    is_sensitive = Column(Boolean, nullable=False, default=False)  # Untuk API keys, dll.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<SystemSettings(id={self.id}, key={self.key}, is_sensitive={self.is_sensitive})>"
