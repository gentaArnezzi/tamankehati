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

from core.auth.jwt import create_access_token, create_refresh_token, decode_token
from core.auth.config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, refresh_token_timedelta
from core.database.session import get_session
from users.models import User
from domains.articles.models import UserRole
from api.v1.permissions.rbac import current_user
from users.services.otp_service import create_otp, verify_otp
from users.services.email_service import send_otp_email
from api.v1.serializers.auth import (
    RequestOTPIn, RequestOTPOut, VerifyOTPIn, LoginWithOTPIn,
    LoginResponse, VerifyOTPAfterPasswordIn
)

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
    refresh_token: str
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
    
    # Clear refresh token cookie juga
    response.delete_cookie(
        key="refresh_token",
        path="/",
        httponly=True,
        secure=os.getenv('ENV', 'production') == 'production',
        samesite="strict"
    )
    
    # If using header-based auth, return a message to clear the token client-side
    if authorization and authorization.startswith("Bearer "):
        return {
            "message": "Successfully logged out. Please clear your client-side token.",
            "clear_token": True
        }
    
    return {"message": "Successfully logged out"}

@router.post("/refresh", response_model=TokenOut, tags=["Auth"], status_code=status.HTTP_200_OK)
async def refresh_token_endpoint(
    request: Request,
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    refresh_token_header: Optional[str] = Header(None, alias="X-Refresh-Token"),
    db: AsyncSession = Depends(get_session)
):
    """Regenerate access token menggunakan refresh token yang masih valid."""
    token = refresh_token
    if not token and refresh_token_header:
        token = refresh_token_header

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token tidak ditemukan",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_token(token)

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token yang diberikan bukan refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token tidak valid: user ID tidak ditemukan",
                headers={"WWW-Authenticate": "Bearer"},
            )

        stmt = select(User).where(User.id == int(user_id))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User tidak ditemukan",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account tidak aktif",
            )

        primary_role = "user"
        if hasattr(user, "role") and user.role:
            primary_role = user.role.value if hasattr(user.role, "value") else str(user.role)
        elif hasattr(user, "roles") and user.roles:
            primary_role = user.roles[0].name if hasattr(user.roles[0], "name") else "user"

        user_email = str(getattr(user, "email", "")).strip()
        if not user_email or "@" not in user_email:
            user_email = f"user_{user.id}@placeholder.com"

        user_name = str(getattr(user, "display_name", "") or getattr(user, "name", "") or "").strip()
        if not user_name:
            user_name = f"User {user.id}"

        token_data = {
            "sub": str(user.id),
            "email": user_email,
            "role": primary_role,
            "name": user_name,
        }

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = create_access_token(
            data=token_data,
            expires_delta=access_token_expires,
        )

        response.set_cookie(
            key="access_token",
            value=f"Bearer {new_access_token}",
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            secure=os.getenv("ENV", "production") == "production",
            samesite="strict",
        )

        return TokenOut(
            access_token=new_access_token,
            refresh_token=token,
            token_type="bearer",
            user_id=user.id,
            email=user_email,
            role=primary_role,
            name=user.display_name or user_email.split("@")[0],
            profile_picture_url=user.profile_picture_url if hasattr(user, "profile_picture_url") else None,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Refresh token tidak valid atau sudah expired: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        import traceback
        print(f"Refresh token error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Terjadi error saat refresh token. Silakan coba lagi.",
        )


@router.post("/login", response_model=LoginResponse, tags=["Auth"], status_code=status.HTTP_200_OK)
async def login(
    request: Request,
    form_data: LoginIn,
    db: AsyncSession = Depends(get_session)
):
    """
    User login endpoint with 2FA (OTP) support.
    
    Flow:
    1. Verify email and password
    2. If password correct, generate and send OTP
    3. Return requires_otp: true
    4. User must verify OTP via /verify-otp-after-password to complete login
    
    Returns:
        LoginResponse: requires_otp flag and message
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
        
        # Password verified! Now generate and send OTP
        try:
            otp = await create_otp(db, form_data.email, expiration_minutes=10)
            
            # Send OTP via email
            email_sent = await send_otp_email(form_data.email, otp.code)

            if not email_sent:
                # Log the OTP for development (remove in production)
                print(f"⚠️ OTP generated but email not sent. OTP for {form_data.email}: {otp.code}")

            return LoginResponse(
                requires_otp=True,
                message="Password verified. OTP code has been sent to your email.",
                email=form_data.email,
            )
        except Exception as e:
            import traceback
            print(f"Error creating OTP: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP. Please try again.",
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


@router.post("/request-otp", response_model=RequestOTPOut, tags=["Auth"], status_code=status.HTTP_200_OK)
async def request_otp(
    request: Request,
    otp_request: RequestOTPIn,
    db: AsyncSession = Depends(get_session)
):
    """
    Request OTP code for login.
    
    Returns:
        RequestOTPOut: Confirmation message
    """
    # Check rate limit
    client_ip = request.client.host if request.client else "unknown"
    if check_rate_limit(client_ip, "request-otp"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Please try again later."
        )
    
    # Check if user exists
    stmt = select(User).where(User.email.ilike(otp_request.email))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        # Don't reveal if user exists (security best practice)
        # Still return success to prevent user enumeration
        return RequestOTPOut(
            message="If the email exists, an OTP code has been sent.",
            expires_in_minutes=10
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support."
        )
    
    # Create OTP
    try:
        otp = await create_otp(db, otp_request.email, expiration_minutes=10)
        
        # Send OTP via email
        email_sent = await send_otp_email(otp_request.email, otp.code)
        
        if not email_sent:
            # Log the OTP for development (remove in production)
            print(f"⚠️ OTP generated but email not sent. OTP for {otp_request.email}: {otp.code}")
        
        return RequestOTPOut(
            message="OTP code has been sent to your email.",
            expires_in_minutes=10
        )
    except Exception as e:
        import traceback
        print(f"Error creating OTP: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP. Please try again."
        )


@router.post("/verify-otp-after-password", response_model=TokenOut, tags=["Auth"], status_code=status.HTTP_200_OK)
async def verify_otp_after_password(
    request: Request,
    response: Response,
    verify_data: VerifyOTPAfterPasswordIn,
    db: AsyncSession = Depends(get_session)
):
    """
    Verify OTP after password has been verified.
    This completes the 2FA login process.
    
    Returns:
        TokenOut: JWT token and user information
    """
    # Check rate limit
    client_ip = request.client.host if request.client else "unknown"
    if check_rate_limit(client_ip, "verify-otp-after-password"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification attempts. Please try again later."
        )
    
    # Verify OTP
    otp = await verify_otp(db, verify_data.email, verify_data.otp_code)
    
    if not otp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP code.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user
    stmt = select(User).where(User.email.ilike(verify_data.email))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        print(f"❌ User not found for email: {verify_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or OTP code.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support.",
        )
    
    # Get user's primary role
    primary_role = "user"
    if hasattr(user, 'role') and user.role:
        primary_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
    elif hasattr(user, 'roles') and user.roles:
        primary_role = user.roles[0].name if hasattr(user.roles[0], 'name') else 'user'
    
    # Ensure email is valid
    user_email = str(getattr(user, 'email', '')).strip()
    if not user_email or '@' not in user_email:
        user_email = f"user_{user.id}@placeholder.com"
    
    # Ensure name is properly handled
    user_name = str(getattr(user, 'display_name', '') or getattr(user, 'name', '') or '').strip()
    if not user_name:
        user_name = f"User {user.id}"
    
    # Update last login time (if field exists)
    if hasattr(user, 'last_login'):
        user.last_login = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)
    
    # Create JWT tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = refresh_token_timedelta()

    token_data = {
        "sub": str(user.id),
        "email": user_email,
        "role": primary_role,
        "name": user_name,
    }

    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires,
    )

    refresh_token = create_refresh_token(
        data=token_data,
        expires_delta=refresh_token_expires,
    )

    # Set HTTP-only cookies
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=os.getenv('ENV', 'production') == 'production',
        samesite="strict",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        secure=os.getenv('ENV', 'production') == 'production',
        samesite="strict",
    )

    response_data = TokenOut(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user_id=user.id,
        email=user_email,
        role=primary_role,
        name=user.display_name or user_email.split('@')[0],
        profile_picture_url=user.profile_picture_url if hasattr(user, 'profile_picture_url') else None,
    )

    print(f"✅ OTP verified for user: id={user.id}, email={user_email}, role={primary_role}")
    print(f"📤 Response data: user_id={response_data.user_id}, role={response_data.role}, email={response_data.email}")

    return response_data


@router.post("/login-with-otp", response_model=TokenOut, tags=["Auth"], status_code=status.HTTP_200_OK)
async def login_with_otp(
    request: Request,
    response: Response,
    login_data: LoginWithOTPIn,
    db: AsyncSession = Depends(get_session)
):
    """
    Login using OTP code instead of password (legacy endpoint, kept for backward compatibility).
    
    Returns:
        TokenOut: JWT token and user information
    """
    # Check rate limit
    client_ip = request.client.host if request.client else "unknown"
    if check_rate_limit(client_ip, "login-with-otp"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
    
    # Verify OTP
    otp = await verify_otp(db, login_data.email, login_data.otp_code)
    
    if not otp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP code.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user
    stmt = select(User).where(User.email.ilike(login_data.email))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or OTP code.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support.",
        )
    
    # Get user's primary role
    primary_role = "user"
    if hasattr(user, 'role') and user.role:
        primary_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
    elif hasattr(user, 'roles') and user.roles:
        primary_role = user.roles[0].name if hasattr(user.roles[0], 'name') else 'user'
    
    # Ensure email is valid
    user_email = str(getattr(user, 'email', '')).strip()
    if not user_email or '@' not in user_email:
        user_email = f"user_{user.id}@placeholder.com"
    
    # Ensure name is properly handled
    user_name = str(getattr(user, 'display_name', '') or getattr(user, 'name', '') or '').strip()
    if not user_name:
        user_name = f"User {user.id}"
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = refresh_token_timedelta()

    token_data = {
        "sub": str(user.id),
        "email": user_email,
        "role": primary_role,
        "name": user_name,
    }

    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires,
    )

    refresh_token = create_refresh_token(
        data=token_data,
        expires_delta=refresh_token_expires,
    )

    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=os.getenv('ENV', 'production') == 'production',
        samesite="strict",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        secure=os.getenv('ENV', 'production') == 'production',
        samesite="strict",
    )

    return TokenOut(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user_id=user.id,
        email=user_email,
        role=primary_role,
        name=user.display_name or user_email.split('@')[0],
        profile_picture_url=user.profile_picture_url if hasattr(user, 'profile_picture_url') else None,
    )
