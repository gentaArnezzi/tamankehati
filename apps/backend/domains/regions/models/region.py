from typing import List, TYPE_CHECKING
from sqlalchemy import Column, String, Boolean, Integer, text, ForeignKey
from sqlalchemy.dialects.postgresql import TIMESTAMP
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship, Mapped

from core.database.base import Base

if TYPE_CHECKING:
    from domains.parks import Park

class Region(Base):
    __tablename__ = "regions"

    id = Column(
        Integer, 
        primary_key=True, 
        index=True,
        comment="Unique identifier for the region"
    )
    
    name = Column(
        String(100), 
        nullable=False,
        comment="Name of the region"
    )
    
    code = Column(
        String(10), 
        nullable=False, 
        unique=True,
        comment="Unique code for the region (e.g., 'JKT' for Jakarta)"
    )
    
    # geom = Column(
    #     Geometry('MULTIPOLYGON', srid=4326),
    #     comment="Geographic boundary of the region"
    # )  # REMOVED - not used yet
    
    timezone = Column(
        String(50),
        comment="IANA timezone name (e.g., 'Asia/Jakarta')"
    )
    
    is_active = Column(
        Boolean, 
        nullable=False, 
        server_default=text('true'),
        comment="Whether the region is active"
    )
    
    # Timestamps
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text('now()'),
        comment="Timestamp when the region was created"
    )
    
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text('now()'),
        onupdate=text('now()'),
        comment="Timestamp when the region was last updated"
    )
    
    # Relationships - commented out to avoid circular import issues
    # parks = relationship("Park", back_populates="region")
    
    def __repr__(self):
        return f"<Region {self.name} ({self.code})>"
