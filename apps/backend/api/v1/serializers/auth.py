# apps/backend/api/v1/serializers/auth.py
"""Authentication serializers"""

from typing import Optional
from pydantic import BaseModel, EmailStr
from typing import Optional

class AuthIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenIn(BaseModel):
    refresh_token: str

class RequestOTPIn(BaseModel):
    email: EmailStr

class RequestOTPOut(BaseModel):
    message: str
    expires_in_minutes: int = 10

class VerifyOTPIn(BaseModel):
    email: EmailStr
    code: str

class LoginWithOTPIn(BaseModel):
    email: EmailStr
    otp_code: str

class LoginResponse(BaseModel):
    requires_otp: bool = False
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None
    name: Optional[str] = None
    profile_picture_url: Optional[str] = None
    message: Optional[str] = None

class VerifyOTPAfterPasswordIn(BaseModel):
    email: EmailStr
    otp_code: str
