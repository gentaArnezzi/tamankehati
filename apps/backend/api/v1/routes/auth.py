# apps/backend/api/v1/routes/auth.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
import time
import os

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Header
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import Cookie
from pydantic import BaseModel, EmailStr, Field, validator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.auth.jwt import create_access_token
from core.auth.config import ACCESS_TOKEN_EXPIRE_MINUTES
from core.database.session import get_session
from users.models import User
from domains.articles.models import UserRole
from api.v1.permissions.rbac import current_user

router = APIRouter(prefix="/auth")

# ✅ SECURITY FIX: Simple rate limiting using in-memory dict
# For production, use Redis-based rate limiting (e.g., slowapi)
_rate_limit_cache: Dict[str, List[float]] = {}
_rate_limit_window = 60  # 60 seconds
_rate_limit_max_attempts = 5  # Max 5 attempts per window

def check_rate_limit(ip: str, endpoint: str) -> bool:
    """Simple rate limiter - returns True if rate limit exceeded"""
    key = f"{ip}:{endpoint}"
    now = time.time()
    
    # Clean old entries
    if key in _rate_limit_cache:
        _rate_limit_cache[key] = [t for t in _rate_limit_cache[key] if now - t < _rate_limit_window]
    else:
        _rate_limit_cache[key] = []
    
    # Check if limit exceeded
    if len(_rate_limit_cache[key]) >= _rate_limit_max_attempts:
        return True
    
    # Add current attempt
    _rate_limit_cache[key].append(now)
    return False

@router.get("/me", tags=["Auth"])
async def get_current_user(user: User = Depends(current_user)):
    """Get current authenticated user information."""
    try:
        return {
            "id": user.id,
            "email": user.email,
            "name": getattr(user, 'display_name', None) or getattr(user, 'name', f"User {user.id}"),
            "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
            "park_id": getattr(user, 'park_id', None),
            "profile_picture_url": getattr(user, 'profile_picture_url', None),
            "is_active": getattr(user, 'is_active', True),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting user: {str(e)}"
        )

class LoginIn(BaseModel):
    email: EmailStr
    password: str
    
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str  # Changed to regular string to avoid strict validation
    role: str
    name: Optional[str] = None
    profile_picture_url: Optional[str] = None
    
    @validator('email', pre=True)
    def validate_email(cls, v):
        if not v:
            return f"user_{int(time.time())}@placeholder.com"
            
        v = str(v).strip().lower()
        
        # If it's already a valid email, return as is
        if '@' in v and '.' in v.split('@')[1]:
            return v
            
        # If it's a number, use it as part of the placeholder
        if v.isdigit():
            return f"user_{v}@placeholder.com"
            
        # For any other case, generate a placeholder
        return f"user_{abs(hash(v))}@placeholder.com"
    
    class Config:
        json_encoders = {
            str: lambda v: str(v) if v is not None else ""
        }
        # Ensure validation is always on
        validate_assignment = True

@router.post("/logout", status_code=status.HTTP_200_OK, tags=["Auth"])
async def logout(
    request: Request,
    response: Response,
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None)
):
    """
    Logout endpoint that clears the authentication token.
    Handles both cookie-based and header-based authentication.
    """
    # Clear the access token cookie if it exists
    # ✅ SECURITY FIX: Secure cookies in production
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=os.getenv('ENV', 'production') == 'production',  # ✅ Secure in production
        samesite="strict"  # ✅ CSRF protection
    )
    
    # If using header-based auth, return a message to clear the token client-side
    if authorization and authorization.startswith("Bearer "):
        return {
            "message": "Successfully logged out. Please clear your client-side token.",
            "clear_token": True
        }
    
    return {"message": "Successfully logged out"}

@router.post("/login", response_model=TokenOut, tags=["Auth"], status_code=status.HTTP_200_OK)
async def login(
    request: Request,
    response: Response,
    form_data: LoginIn, 
    db: AsyncSession = Depends(get_session)
):
    """
    User login endpoint with rate limiting.
    
    Returns:
        TokenOut: JWT token and user information
    """
    # ✅ SECURITY FIX: Check rate limit
    client_ip = request.client.host if request.client else "unknown"
    if check_rate_limit(client_ip, "login"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
    
    # Generic error message to prevent user enumeration
    error_detail = "Invalid email or password"
    
    try:
        # Find user by email (case-insensitive)
        stmt = select(User).where(User.email.ilike(form_data.email))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_detail,
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive. Please contact support.",
            )

        # Verify password with constant-time comparison
        if not user.verify_password(form_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_detail,
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user's primary role
        primary_role = "user"
        if hasattr(user, 'role') and user.role:
            primary_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
        elif hasattr(user, 'roles') and user.roles:
            primary_role = user.roles[0].name if hasattr(user.roles[0], 'name') else 'user'

        # Ensure email is valid or use a placeholder
        user_email = str(getattr(user, 'email', '')).strip()
        if not user_email or '@' not in user_email:
            # Generate a valid placeholder email if none exists
            user_email = f"user_{user.id}@placeholder.com"
        
        # Ensure name is properly handled
        user_name = str(getattr(user, 'display_name', '') or getattr(user, 'name', '') or '').strip()
        if not user_name:
            user_name = f"User {user.id}"
            
        # Create JWT token with additional user data
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        token_data = {
            "sub": str(user.id),
            "email": user_email,  # This is now guaranteed to be a valid email
            "role": primary_role,
            "name": user_name,  # Use the processed name
        }
        
        access_token = create_access_token(
            data=token_data,
            expires_delta=access_token_expires
        )

        # Update last login time (if field exists)
        if hasattr(user, 'last_login'):
            user.last_login = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(user)

        # Set HTTP-only cookie
        # ✅ SECURITY FIX: Secure cookies in production
        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            secure=os.getenv('ENV', 'production') == 'production',  # ✅ Secure in production
            samesite="strict"  # ✅ CSRF protection
        )
        
        # Return the TokenOut model response
        return TokenOut(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            email=user_email,
            role=primary_role,
            name=user.display_name or user_email.split('@')[0],
            profile_picture_url=user.profile_picture_url if hasattr(user, 'profile_picture_url') else None
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
        
    except Exception as e:
        await db.rollback()
        # Log the error for debugging
        import traceback
        print(f"Login error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login. Please try again.",
        )
