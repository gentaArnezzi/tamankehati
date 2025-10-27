# 🔒 Security Audit Report - API Endpoints

**Date**: 2025-10-26  
**Auditor**: AI Security Review  
**Scope**: All Backend API Endpoints  
**Total Endpoints**: 118+ endpoints across 20 route files

---

## 🚨 CRITICAL SECURITY ISSUES

### 1. ⚠️ **Dev Stub Authentication Active in Production** (CRITICAL)
**File**: `apps/backend/api/v1/permissions/rbac.py` (lines 98-136)

**Issue**:
```python
# Dev-stub cepat untuk testing tanpa JWT
if token.lower() == "admin":
    return SimpleUser(id=1, email="admin@kehati", role=UserRole.super_admin)
if token.lower().startswith("user:"):
    # ... returns user with any ID
```

**Risk**: 🔴 **CRITICAL**
- Anyone can bypass authentication using `Bearer admin` or `Bearer user:123`
- Full super admin access with just `Authorization: Bearer admin`
- No actual authentication required

**Recommendation**:
```python
# Remove dev stubs or wrap them in environment check:
if os.getenv('ENV') == 'development':
    if token.lower() == "admin":
        return SimpleUser(...)
```

**Fix Priority**: 🔥 IMMEDIATE

---

### 2. ⚠️ **Anonymous User Gets Regional Admin Role by Default** (CRITICAL)
**File**: `apps/backend/api/v1/permissions/rbac.py` (line 42)

**Issue**:
```python
class SimpleUser:
    def __init__(self, ...role: UserRole = None...):
        self.role = role or UserRole.regional_admin  # ⚠️ Default to regional_admin
```

**Risk**: 🔴 **CRITICAL**
- Unauthenticated users get regional_admin privileges by default
- Should default to read-only/guest role instead

**Recommendation**:
```python
self.role = role or UserRole.user  # Or create a 'guest' role
```

**Fix Priority**: 🔥 IMMEDIATE

---

### 3. ⚠️ **Insecure Cookie Settings** (HIGH)
**File**: `apps/backend/api/v1/routes/auth.py` (line 74, 179)

**Issue**:
```python
response.set_cookie(
    ...
    secure=False,  # ⚠️ Allows transmission over HTTP
    httponly=True,  # ✅ Good
    samesite="lax"  # ⚠️ Should be "strict" for production
)
```

**Risk**: 🟠 **HIGH**
- Cookies can be intercepted over HTTP (Man-in-the-Middle attack)
- `samesite="lax"` allows some cross-site requests

**Recommendation**:
```python
secure=True if os.getenv('ENV') == 'production' else False,
samesite="strict",  # Prevent CSRF
```

**Fix Priority**: 🔥 HIGH

---

### 4. ⚠️ **No Rate Limiting** (HIGH)
**Files**: All route files

**Issue**: No rate limiting middleware visible for:
- Login endpoint (brute force attacks)
- User creation
- Password reset
- API endpoints in general

**Risk**: 🟠 **HIGH**
- Brute force attacks on login
- DDoS attacks
- Credential stuffing
- Resource exhaustion

**Recommendation**:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/auth/login")
@limiter.limit("5/minute")  # Max 5 attempts per minute
async def login(...):
    ...
```

**Fix Priority**: 🔥 HIGH

---

### 5. ⚠️ **User Cache Without Invalidation on Sensitive Operations** (MEDIUM)
**File**: `apps/backend/api/v1/permissions/rbac.py` (lines 21-34)

**Issue**:
- User cache lasts 30 seconds
- No automatic invalidation when user role/permissions change
- `clear_user_cache()` function exists but not called consistently

**Risk**: 🟡 **MEDIUM**
- Privilege escalation window (up to 30 seconds)
- Deactivated users can still access for 30 seconds

**Recommendation**:
```python
# Call clear_user_cache() on:
# - User role change
# - User park assignment change
# - User deactivation
# - Password change
```

**Fix Priority**: 🟠 MEDIUM

---

## ✅ SECURITY STRENGTHS

### 1. ✅ **SQL Injection Protection** (GOOD)
- All queries use SQLAlchemy ORM with parameterized queries
- No raw SQL with string interpolation found
- Example:
```python
stmt = select(Park).where(Park.id == park_id)  # ✅ Parameterized
```

### 2. ✅ **Password Security** (GOOD)
**File**: `apps/backend/api/v1/routes/auth.py` (line 122)
- Constant-time password comparison
- Generic error messages to prevent user enumeration
```python
if not user.verify_password(form_data.password):  # ✅ Constant-time
    raise HTTPException(detail="Invalid email or password")  # ✅ Generic
```

### 3. ✅ **Role-Based Access Control (RBAC)** (GOOD)
- Clear role separation (super_admin, regional_admin, user)
- Park-based scoping for regional admins
- Permission policies in place

### 4. ✅ **Input Validation** (GOOD)
- Pydantic models for request validation
- Query parameter validation with `Query()`
- Type checking enforced

### 5. ✅ **Authentication Required for Most Endpoints** (GOOD)
- `Depends(current_user)` on protected routes
- Proper 401/403 responses

---

## ⚠️ ADDITIONAL SECURITY CONCERNS

### 6. ⚠️ **Missing CSRF Protection** (MEDIUM)
**Risk**: 🟡 **MEDIUM**
- No CSRF tokens for state-changing operations
- Cookie-based auth without CSRF protection

**Recommendation**:
```python
from fastapi_csrf_protect import CsrfProtect

@app.post("/api/v1/parks")
async def create_park(csrf_protect: CsrfProtect = Depends()):
    await csrf_protect.validate_csrf(request)
    ...
```

### 7. ⚠️ **Verbose Error Messages** (LOW)
**File**: Multiple route files

**Issue**: Some endpoints return detailed error messages with stack traces
```python
detail=f"Error getting user profile: {str(e)}"  # ⚠️ Exposes internals
```

**Recommendation**: Log detailed errors, return generic messages to client

### 8. ⚠️ **No Content Security Policy (CSP)** (LOW)
**Issue**: No CSP headers to prevent XSS attacks

**Recommendation**:
```python
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response
```

### 9. ⚠️ **No Request Size Limits** (MEDIUM)
**Issue**: No visible file upload size limits or request body size limits

**Recommendation**:
```python
app.add_middleware(
    RequestSizeLimitMiddleware,
    max_upload_size=100_000_000  # 100MB
)
```

### 10. ⚠️ **Logging May Expose Sensitive Data** (MEDIUM)
**File**: Multiple files with `print()` statements

**Issue**:
```python
print(f"🔍 User loaded from cache: email={user.email}, park_id={user.park_id}")
```

**Recommendation**: Use structured logging and avoid logging sensitive data

---

## 📊 SECURITY SCORE BY CATEGORY

| Category | Score | Status |
|----------|-------|--------|
| Authentication | ⚠️ 4/10 | CRITICAL - Dev stubs active |
| Authorization | ✅ 8/10 | GOOD - RBAC implemented |
| SQL Injection | ✅ 10/10 | EXCELLENT - ORM used |
| XSS Protection | ⚠️ 6/10 | MEDIUM - No CSP |
| CSRF Protection | ⚠️ 3/10 | POOR - Not implemented |
| Rate Limiting | ⚠️ 0/10 | CRITICAL - Not implemented |
| Password Security | ✅ 9/10 | EXCELLENT |
| Session Management | ⚠️ 5/10 | MEDIUM - Insecure cookies |
| Input Validation | ✅ 8/10 | GOOD - Pydantic models |
| Error Handling | ⚠️ 6/10 | MEDIUM - Some verbose errors |

**Overall Security Score**: ⚠️ **6.5/10** (NEEDS IMPROVEMENT)

---

## 🔧 IMMEDIATE ACTION ITEMS

### Priority 1 (Do TODAY):
1. ✅ **Remove or disable dev authentication stubs**
2. ✅ **Change anonymous user default role to 'user' or 'guest'**
3. ✅ **Enable secure cookies in production**

### Priority 2 (Do This Week):
4. ✅ **Implement rate limiting on auth endpoints**
5. ✅ **Add cache invalidation on user role/park changes**
6. ✅ **Add CSRF protection for state-changing operations**

### Priority 3 (Do This Month):
7. ✅ **Add request size limits**
8. ✅ **Implement CSP headers**
9. ✅ **Add security audit logging**
10. ✅ **Review and sanitize error messages**

---

## 📋 ENDPOINT SECURITY CHECKLIST

### Authentication Endpoints (`/auth`)
- ✅ Password constant-time comparison
- ✅ Generic error messages
- ⚠️ **No rate limiting** (CRITICAL)
- ⚠️ Insecure cookie settings
- ⚠️ Dev stubs active

### User Management (`/users`)
- ✅ RBAC implemented
- ✅ Access control checks
- ⚠️ **No rate limiting on creation**
- ⚠️ Verbose error messages

### Parks Management (`/parks`)
- ✅ Park-based access control
- ✅ Regional admin scoping
- ✅ Input validation
- ✅ SQL injection protection

### Flora/Fauna/Activities
- ✅ Access control by park_id
- ✅ Submitted_by filtering
- ✅ Regional admin scoping
- ✅ Input validation

### Dashboard/Analytics
- ✅ Role-based data filtering
- ✅ Access control checks
- ⚠️ No rate limiting

### File Upload (`/upload`)
- ⚠️ **Need to verify file size limits**
- ⚠️ **Need to verify file type validation**
- ⚠️ **Need to check for path traversal protection**

---

## 🛡️ SECURITY BEST PRACTICES RECOMMENDATIONS

### 1. Environment-Based Configuration
```python
# config.py
class SecurityConfig:
    ENV = os.getenv('ENV', 'development')
    ENABLE_DEV_STUBS = ENV == 'development'
    COOKIE_SECURE = ENV == 'production'
    COOKIE_SAMESITE = 'strict' if ENV == 'production' else 'lax'
```

### 2. Security Middleware Stack
```python
from fastapi_limiter import FastAPILimiter
from fastapi_csrf_protect import CsrfProtect
from starlette.middleware.cors import CORSMiddleware

app.add_middleware(RateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestSizeLimitMiddleware)
```

### 3. Audit Logging
```python
@app.middleware("http")
async def audit_log(request, call_next):
    user = get_current_user(request)
    log.info(f"User {user.id} accessed {request.url.path}")
    response = await call_next(request)
    return response
```

### 4. Security Headers
```python
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'",
}
```

---

## 📞 INCIDENT RESPONSE

If security vulnerabilities are actively exploited:

1. **Immediate**: Disable dev authentication stubs
2. **Block**: Implement rate limiting
3. **Monitor**: Check logs for suspicious activity
4. **Rotate**: Force password reset for all super_admins
5. **Patch**: Deploy fixes to production
6. **Notify**: Inform affected users if data breach occurred

---

## 🎯 CONCLUSION

**Current Status**: ⚠️ **VULNERABLE**

**Main Risks**:
1. 🔴 Dev authentication bypass (CRITICAL)
2. 🔴 No rate limiting (CRITICAL)
3. 🟠 Insecure session management (HIGH)
4. 🟡 Missing CSRF protection (MEDIUM)

**Recommendation**: **DO NOT deploy to production** until Priority 1 items are fixed.

After implementing Priority 1 & 2 fixes, security posture will improve to **ACCEPTABLE** (8/10).

---

**Generated**: 2025-10-26  
**Next Review**: After implementing fixes (within 1 week)

