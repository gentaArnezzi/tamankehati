from sqlalchemy import Column, Integer, String, Text, Enum
from sqlalchemy.orm import relationship
from core.database.base import Base
import enum

class RegionStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class Region(Base):
    __tablename__ = "regions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    status = Column(Enum(RegionStatus), default=RegionStatus.ACTIVE, nullable=False)
    
    # parks = relationship("Park", back_populates="region")
    
    def __repr__(self):
        return f"<Region(id={self.id}, name='{self.name}')>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status.value if self.status else None
        }
