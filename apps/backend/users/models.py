from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
import bcrypt
from core.database.base import Base
from core.database.functions import jakarta_now

# UserRole enum for backward compatibility
class UserRole:
    super_admin = "super_admin"
    regional_admin = "regional_admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)  # Use hashed_password as in database

    # Use String role instead of SQLEnum (database doesn't have user_role enum)
    role = Column(
        String(50),  # Use string instead of SQLEnum
        nullable=False,
        server_default="regional_admin"   # default 'regional_admin'
    )

    park_id = Column(Integer, ForeignKey('parks.id'), nullable=True, index=True)  # foreign key to parks table
    display_name = Column(String(255), nullable=True)  # friendly name for display
    full_name = Column(String(255), nullable=True)  # alternative name field (Railway DB)
    profile_picture_url = Column(String(255), nullable=True)  # profile picture URL
    is_active = Column(Boolean, nullable=False, server_default="true")  # account status
    created_at = Column(DateTime(timezone=True), server_default=jakarta_now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=jakarta_now(), onupdate=jakarta_now(), nullable=False)

    # Relationships - using string references to avoid circular imports
    # articles = relationship("Article", back_populates="author", cascade="all,delete-orphan", passive_deletes=True)
    # galleries = relationship("Gallery", back_populates="author", cascade="all,delete-orphan", passive_deletes=True)
    # park = relationship("Park", back_populates="users", lazy="select")  # Temporarily disabled to avoid circular import

    @property
    def name(self):
        """Backward compatibility property - returns display name or full name or email"""
        return self.display_name or self.full_name or self.email
    

    def set_password(self, raw: str):
        """Hash and set password"""
        # Ensure password is bytes and not too long for bcrypt
        password_bytes = raw.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]  # Truncate if too long
        self.hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, raw: str) -> bool:
        """Verify password against hash"""
        if not self.hashed_password:
            return False
        try:
            password_bytes = raw.encode('utf-8')
            if len(password_bytes) > 72:
                password_bytes = password_bytes[:72]  # Truncate if too long
            return bcrypt.checkpw(password_bytes, self.hashed_password.encode('utf-8'))
        except Exception:
            return False

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
