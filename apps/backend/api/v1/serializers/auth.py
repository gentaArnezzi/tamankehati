# apps/backend/api/v1/serializers/auth.py
"""Authentication serializers"""

from pydantic import BaseModel, EmailStr

class AuthIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RefreshTokenIn(BaseModel):
    refresh_token: str
