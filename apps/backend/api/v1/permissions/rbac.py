from typing import Optional, Union
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
import time
import os
from functools import lru_cache

from core.auth.jwt import decode_token
from core.database.session import get_session

from users.models import User as UserModel
from domains.articles.models import UserRole

# Define a user type that works with FastAPI
AnyUser = Union[UserModel, 'SimpleUser']

bearer = HTTPBearer(auto_error=False)

# User cache to reduce database queries
_user_cache = {}
_cache_ttl = 30  # 30 seconds cache

def clear_user_cache(user_id: int = None):
    """Clear user cache - if user_id provided, clear only that user, otherwise clear all"""
    global _user_cache
    if user_id:
        cache_key = f"user_{user_id}"
        if cache_key in _user_cache:
            del _user_cache[cache_key]
            print(f"🗑️ Cleared cache for user {user_id}")
    else:
        _user_cache.clear()
        print("🗑️ Cleared all user cache")

class SimpleUser:
    """Simple user-like object that mimics User interface for anonymous access"""
    def __init__(self, id: int = 0, email: str = "anon@kehati", role: UserRole = None,
                 display_name: str = None, park_id: str = None):
        self.id = id
        self.email = email
        # ✅ SECURITY FIX: Anonymous users have no role (None)
        # Only authenticated users should have super_admin or regional_admin role
        self.role = role  # Don't set default role - anonymous users should not have privileges
        self.display_name = display_name
        self.park_id = park_id  # Add park_id for regional admins
        self.is_active = True
        self.created_at = None
        self.password_hash = ""

    @property
    def name(self):
        return self.display_name or self.email

    def __repr__(self):
        return f"<SimpleUser(id={self.id}, email={self.email}, role={self.role}, park_id={self.park_id})>"

# For backward compatibility
async def current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: AsyncSession = Depends(get_session)
):
    """
    DEPRECATED: Use get_current_user instead.
    This is kept for backward compatibility with existing code.
    """
    return await get_current_user(request, credentials, db)

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: AsyncSession = Depends(get_session)
):
    """
    Resolusi user dari:
    1) HTTP-only cookie 'access_token'
    2) JWT Bearer token (payload minimal: sub, role, park_id, uid)
    3) Load user dari database untuk mendapat park_id dan data terbaru
    4) Fallback dev-stub: "Bearer admin" atau "Bearer user:ID"
    """
    token = None
    
    # Check for token in cookie first
    token = None
    if request.cookies and 'access_token' in request.cookies:
        token = request.cookies['access_token']
        # Remove 'Bearer ' prefix if present
        if token and token.startswith('Bearer '):
            token = token[7:]
    # Fall back to Authorization header if no cookie
    elif credentials is not None:
        token = credentials.credentials.strip()
    
    # If still no token, return anonymous user
    if not token:
        return SimpleUser()

    # Dev-stub cepat untuk testing tanpa JWT (ONLY in development with explicit flag)
    if os.getenv('ENV', 'production') == 'development' and os.getenv('ENABLE_DEV_STUBS', 'false').lower() == 'true':
        if token.lower() == "admin":
            print("⚠️ DEV STUB ACTIVE: Using admin authentication bypass")
            return SimpleUser(id=1, email="admin@kehati", role=UserRole.super_admin)
        if token.lower().startswith("user:"):
            print("⚠️ DEV STUB ACTIVE: Using user authentication bypass")
            user_id = token.split(":", 1)[1].strip()
            user_id_int = int(user_id) if user_id.isdigit() else 2
            
            # Try to load user from database for dev-stub
            try:
                # Check cache first for dev-stub
                cache_key = f"user_{user_id_int}"
                now = time.time()
                
                if cache_key in _user_cache:
                    cached_user, timestamp = _user_cache[cache_key]
                    if now - timestamp < _cache_ttl:
                        print(f"🚀 Dev-stub user loaded from cache: id={cached_user.id}, email={cached_user.email}, role={cached_user.role}, park_id={getattr(cached_user, 'park_id', None)}")
                        return cached_user
                    else:
                        del _user_cache[cache_key]
                
                result = await db.execute(
                    select(UserModel).where(UserModel.id == user_id_int)
                )
                user = result.scalar_one_or_none()
                if user:
                    print(f"🔍 Dev-stub user loaded from database: id={user.id}, email={user.email}, role={user.role}, park_id={getattr(user, 'park_id', None)}")
                    # Cache the user
                    _user_cache[cache_key] = (user, now)
                    return user
            except Exception as e:
                print(f"⚠️ Dev-stub database loading failed: {e}")
            
            # Fallback to SimpleUser if database loading fails
            return SimpleUser(
                id=user_id_int,
                email=f"regional@{user_id}",
                role=UserRole.regional_admin,
                display_name=f"Regional Admin {user_id}"
            )

    # Coba JWT beneran
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Get user_id from JWT
    user_id = payload.get("sub") or payload.get("uid")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing user ID")
    
    # Load user from database to get latest park_id and data
    try:
        # Convert user_id to int if it's a string
        user_id_int = int(user_id) if isinstance(user_id, str) else user_id
        
        # Check cache first
        cache_key = f"user_{user_id_int}"
        now = time.time()
        
        if cache_key in _user_cache:
            cached_user, timestamp = _user_cache[cache_key]
            if now - timestamp < _cache_ttl:
                print(f"🚀 User loaded from cache: id={cached_user.id}, email={cached_user.email}, role={cached_user.role}, park_id={getattr(cached_user, 'park_id', None)}")
                return cached_user
            else:
                # Cache expired, remove it
                del _user_cache[cache_key]
        
        print(f"🔍 Attempting to load user from database: user_id={user_id_int}")
        
        # Query users table (plural) to get user data
        result = await db.execute(
            select(UserModel).where(UserModel.id == user_id_int)
        )
        user = result.scalar_one_or_none()
        
        if user:
            print(f"🔍 Database user loaded: id={user.id}, email={user.email}, role={user.role}, park_id={getattr(user, 'park_id', None)}")
            # Cache the user
            _user_cache[cache_key] = (user, now)
            return user
        else:
            print(f"⚠️ User not found in database: user_id={user_id_int}")
            # Fallback to JWT payload if user not found in database
            role_val = payload.get("role", "regional_admin")
            try:
                role = UserRole(role_val) if isinstance(role_val, str) else UserRole(role_val)
            except Exception:
                role = UserRole.regional_admin
            
            return SimpleUser(
                id=user_id_int,
                email=payload.get("email", "user@kehati"),
                role=role,
                display_name=payload.get("name"),
                park_id=payload.get("park_id")
            )
    except Exception as e:
        # Fallback to JWT payload if database query fails
        print(f"⚠️ Database user loading failed: {e}")
        role_val = payload.get("role", "regional_admin")
        try:
            role = UserRole(role_val) if isinstance(role_val, str) else UserRole(role_val)
        except Exception:
            role = UserRole.regional_admin
        
        return SimpleUser(
            id=int(user_id) if isinstance(user_id, str) else user_id,
            email=payload.get("email", "user@kehati"),
            role=role,
            display_name=payload.get("name"),
            park_id=payload.get("park_id")
        )

# Optional: current_user dependency for routes that need authentication
def require_auth():
    """Dependency that requires authentication"""
    return Depends(current_user)
