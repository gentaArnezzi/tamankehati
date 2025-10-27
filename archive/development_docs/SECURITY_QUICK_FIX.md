# 🔒 Security Quick Fix Guide

## ⚡ IMMEDIATE FIXES (Do NOW before deploying)

### Fix 1: Disable Dev Authentication Stubs

**File**: `apps/backend/api/v1/permissions/rbac.py`

**Change lines 98-136** from:
```python
# Dev-stub cepat untuk testing tanpa JWT
if token.lower() == "admin":
    return SimpleUser(id=1, email="admin@kehati", role=UserRole.super_admin)
if token.lower().startswith("user:"):
    # ... dev stub code
```

**To**:
```python
import os

# Dev-stub hanya untuk development
if os.getenv('ENV') == 'development' and os.getenv('ENABLE_DEV_STUBS') == 'true':
    if token.lower() == "admin":
        print("⚠️ DEV STUB: Using admin authentication")
        return SimpleUser(id=1, email="admin@kehati", role=UserRole.super_admin)
    if token.lower().startswith("user:"):
        print("⚠️ DEV STUB: Using user authentication")
        # ... existing dev stub code
```

Then in `.env`:
```bash
# Development
ENV=development
ENABLE_DEV_STUBS=true

# Production (CRITICAL: Set these!)
# ENV=production
# ENABLE_DEV_STUBS=false
```

---

### Fix 2: Change Anonymous User Default Role

**File**: `apps/backend/api/v1/permissions/rbac.py`

**Change line 42** from:
```python
self.role = role or UserRole.regional_admin  # ⚠️ Too permissive!
```

**To**:
```python
self.role = role or UserRole.user  # ✅ Least privilege
```

---

### Fix 3: Enable Secure Cookies

**File**: `apps/backend/api/v1/routes/auth.py`

**Change line 179** (in login function) from:
```python
response.set_cookie(
    key="access_token",
    value=access_token,
    httponly=True,
    secure=False,  # ⚠️ INSECURE!
    samesite="lax",
    max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
)
```

**To**:
```python
import os

response.set_cookie(
    key="access_token",
    value=access_token,
    httponly=True,
    secure=os.getenv('ENV') == 'production',  # ✅ Secure in production
    samesite="strict",  # ✅ CSRF protection
    max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
)
```

**And also change line 74** (in logout function):
```python
response.delete_cookie(
    key="access_token",
    path="/",
    httponly=True,
    secure=os.getenv('ENV') == 'production',  # ✅ Match login
    samesite="strict"
)
```

---

### Fix 4: Add Rate Limiting to Login

**File**: `apps/backend/api/v1/routes/auth.py`

**Step 1**: Install slowapi
```bash
pip install slowapi
```

**Step 2**: Add to auth.py (top of file):
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
```

**Step 3**: Add rate limit to login endpoint:
```python
@router.post("/auth/login", response_model=TokenOut, tags=["Auth"])
@limiter.limit("5/minute")  # ✅ Max 5 login attempts per minute
async def login(
    request: Request,  # ⚠️ Add this parameter!
    response: Response,
    form_data: LoginIn, 
    db: AsyncSession = Depends(get_session)
):
    # ... existing code
```

**Step 4**: Register limiter in main.py:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

---

### Fix 5: Invalidate User Cache on Sensitive Operations

**File**: `apps/backend/api/v1/routes/users.py`

Add cache invalidation calls:

```python
from api.v1.permissions.rbac import clear_user_cache

# In update_user function (after successful update):
@router.put("/{user_id}", ...)
async def update_user(...):
    # ... existing code
    
    # Clear cache after update
    clear_user_cache(user_id)  # ✅ Invalidate cache
    
    return response_data

# In activate_user function:
@router.patch("/{user_id}/activate", ...)
async def activate_user(...):
    # ... existing code
    clear_user_cache(user_id)  # ✅ Invalidate cache
    return {"message": "User activated"}

# In deactivate_user function:
@router.patch("/{user_id}/deactivate", ...)
async def deactivate_user(...):
    # ... existing code
    clear_user_cache(user_id)  # ✅ Invalidate cache
    return {"message": "User deactivated"}
```

---

## 📋 Verification Checklist

After making changes, verify:

```bash
# 1. Check environment variable is set
echo $ENV  # Should be 'production' in production

# 2. Test that dev stubs are disabled
curl -H "Authorization: Bearer admin" http://your-api/api/v1/users/me
# Should return 401 Unauthorized in production

# 3. Test rate limiting
for i in {1..10}; do 
  curl -X POST http://your-api/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Should get rate limit error after 5 attempts

# 4. Check secure cookie (in production)
curl -v http://your-api/api/v1/auth/login ...
# Look for "Set-Cookie: ... Secure; HttpOnly; SameSite=Strict"

# 5. Test user cache invalidation
# Deactivate a user, then immediately try to use their token
# Should get 403 Forbidden immediately (not after 30 seconds)
```

---

## 🔐 Additional Security Hardening

### Add Security Headers

Create `apps/backend/middleware/security.py`:
```python
from starlette.middleware.base import BaseHTTPMiddleware
import os

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        if os.getenv('ENV') == 'production':
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response
```

Add to `main.py`:
```python
from middleware.security import SecurityHeadersMiddleware

app.add_middleware(SecurityHeadersMiddleware)
```

---

### Add Request Size Limit

In `main.py`:
```python
from starlette.middleware.base import BaseHTTPMiddleware

class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_size: int = 100_000_000):  # 100MB default
        super().__init__(app)
        self.max_size = max_size
    
    async def dispatch(self, request, call_next):
        if request.method in ["POST", "PUT", "PATCH"]:
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.max_size:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request entity too large"}
                )
        
        return await call_next(request)

app.add_middleware(RequestSizeLimitMiddleware, max_size=100_000_000)  # 100MB
```

---

### Sanitize Error Messages

Create `apps/backend/utils/errors.py`:
```python
import os

def safe_error_message(error: Exception) -> str:
    """Return safe error message based on environment"""
    if os.getenv('ENV') == 'development':
        return str(error)  # Full error in dev
    else:
        return "An error occurred. Please try again."  # Generic in production
```

Use in routes:
```python
from utils.errors import safe_error_message

try:
    # ... your code
except Exception as e:
    logging.error(f"Error: {e}", exc_info=True)  # Log full error
    raise HTTPException(
        status_code=500,
        detail=safe_error_message(e)  # Return safe message
    )
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set `ENV=production` in environment variables
- [ ] Set `ENABLE_DEV_STUBS=false` (or remove it)
- [ ] Verify secure cookies are enabled
- [ ] Test rate limiting is working
- [ ] Check all security headers are present
- [ ] Review logs for sensitive data exposure
- [ ] Test authentication without dev stubs
- [ ] Verify CORS settings are restrictive
- [ ] Check database connection uses SSL/TLS
- [ ] Ensure JWT secret is strong and unique
- [ ] Set appropriate token expiration times

---

## 📊 Test Your Security

Run these commands to verify fixes:

```bash
# Test 1: Dev stubs disabled
curl -H "Authorization: Bearer admin" https://your-production-api/api/v1/users/me
# Expected: 401 Unauthorized

# Test 2: Rate limiting works
for i in {1..10}; do curl -X POST https://your-api/api/v1/auth/login -d '{"email":"test","password":"test"}'; done
# Expected: 429 Too Many Requests after 5 attempts

# Test 3: Secure cookies
curl -v -X POST https://your-api/api/v1/auth/login -d '{"email":"valid@email.com","password":"validpass"}'
# Expected: Set-Cookie with Secure and HttpOnly flags

# Test 4: Security headers
curl -v https://your-api/api/v1/users/me
# Expected: X-Content-Type-Options, X-Frame-Options, etc. in response headers
```

---

## 🆘 If You've Been Compromised

If you suspect security has been breached:

1. **Immediately**:
   - Disable dev authentication stubs
   - Force logout all users (invalidate all tokens)
   - Enable rate limiting

2. **Within 1 hour**:
   - Review access logs for suspicious activity
   - Check for unauthorized admin users
   - Rotate JWT secret key
   - Force password reset for all super_admins

3. **Within 24 hours**:
   - Full security audit
   - Notify affected users
   - Implement missing security controls
   - Update incident response plan

4. **Long term**:
   - Set up security monitoring
   - Implement intrusion detection
   - Regular security audits
   - Penetration testing

---

**REMEMBER**: Security is not a one-time fix. Regular audits and updates are essential!

