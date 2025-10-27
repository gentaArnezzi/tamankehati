# apps/backend/users/serializers.py
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field

RoleLiteral = Literal["super_admin", "regional_admin"]

# Nested models for detailed user response
class ParkSummary(BaseModel):
    id: int
    name: str
    slug: str
    status: str
    area_ha: Optional[float] = None
    description: Optional[str] = None
    sk_penetapan: Optional[str] = None
    pengelola: Optional[str] = None
    tipe_ekoregion: Optional[str] = None
    kondisi_fisik: Optional[str] = None
    nilai_penting: Optional[str] = None
    sejarah: Optional[str] = None
    visi: Optional[str] = None
    misi: Optional[str] = None
    nilai_dasar: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    model_config = {"from_attributes": True}

class RegionSummary(BaseModel):
    id: int
    name: str
    code: str
    timezone: Optional[str] = None
    is_active: Optional[bool] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    model_config = {"from_attributes": True}

class UserOut(BaseModel):
    id: int
    email: EmailStr
    display_name: Optional[str] = None
    full_name: Optional[str] = None
    role: RoleLiteral
    park_id: Optional[int] = None
    profile_picture_url: Optional[str] = None
    is_active: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = {"from_attributes": True}

class UserCreate(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    password: str = Field(min_length=8)
    role: RoleLiteral = "regional_admin"
    park_id: Optional[int] = None

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    password: Optional[str] = Field(default=None, min_length=8)
    park_id: Optional[int] = None

class UserRoleUpdate(BaseModel):
    role: RoleLiteral
    park_id: Optional[int] = None

class UserDetailOut(BaseModel):
    """Extended user response with optional park and region details"""
    id: int
    email: EmailStr
    display_name: Optional[str] = None
    full_name: Optional[str] = None
    role: RoleLiteral
    park_id: Optional[int] = None
    profile_picture_url: Optional[str] = None
    is_active: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    # Optional nested data
    park: Optional[ParkSummary] = None
    region: Optional[RegionSummary] = None
    
    model_config = {"from_attributes": True}

# Settings page serializers
class UpdateProfileRequest(BaseModel):
    """Request model for updating user profile"""
    nama: Optional[str] = Field(None, min_length=1, max_length=255, description="Display name")
    email: Optional[EmailStr] = Field(None, description="Email address")

class ChangePasswordRequest(BaseModel):
    """Request model for changing password"""
    current_password: str = Field(min_length=1, description="Current password")
    new_password: str = Field(min_length=8, description="New password (min 8 characters)")
    confirm_password: str = Field(min_length=8, description="Confirm new password")

class NotificationPreferences(BaseModel):
    """Notification preferences"""
    email_notifications: bool = True
    push_notifications: bool = False
    announcement_alerts: bool = True
    approval_alerts: bool = True

class UpdateNotificationsRequest(BaseModel):
    """Request model for updating notification preferences"""
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    announcement_alerts: Optional[bool] = None
    approval_alerts: Optional[bool] = None
