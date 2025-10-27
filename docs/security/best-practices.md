# 🔒 Security Best Practices

Comprehensive security guidelines and best practices for the Taman Kehati project.

## Overview

Security is paramount in the Taman Kehati system. This guide covers security best practices, implementation guidelines, and security considerations for both development and production environments.

## Security Principles

### 1. Defense in Depth
- Multiple layers of security controls
- Fail-safe defaults
- Principle of least privilege
- Defense against multiple attack vectors

### 2. Secure by Design
- Security considerations from the start
- Threat modeling
- Security requirements
- Regular security reviews

### 3. Zero Trust Architecture
- Never trust, always verify
- Continuous authentication
- Least privilege access
- Micro-segmentation

## Authentication & Authorization

### Password Security
```python
# core/security.py
from passlib.context import CryptContext
import secrets
import string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_strong_password(length: int = 16) -> str:
    """Generate a strong password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def validate_password_strength(password: str) -> bool:
    """Validate password strength"""
    if len(password) < 8:
        return False
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    return has_upper and has_lower and has_digit and has_special

def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)
```

### JWT Security
```python
# core/security.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from core.config import settings

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create secure JWT token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "iss": "tamankehati-api",
        "aud": "tamankehati-frontend"
    })
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def verify_token(token: str) -> dict:
    """Verify JWT token with security checks"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            audience="tamankehati-frontend",
            issuer="tamankehati-api"
        )
        
        # Check token expiration
        if datetime.utcnow() > datetime.fromtimestamp(payload["exp"]):
            raise JWTError("Token expired")
        
        return payload
        
    except JWTError as e:
        raise JWTError(f"Token verification failed: {str(e)}")
```

### Rate Limiting
```python
# core/rate_limiting.py
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer
import time
from typing import Dict, Tuple

class RateLimiter:
    def __init__(self):
        self.requests: Dict[str, list] = {}
    
    def is_allowed(self, key: str, limit: int, window: int) -> bool:
        """Check if request is within rate limit"""
        now = time.time()
        
        if key not in self.requests:
            self.requests[key] = []
        
        # Remove old requests
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if now - req_time < window
        ]
        
        # Check limit
        if len(self.requests[key]) >= limit:
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True

rate_limiter = RateLimiter()

def check_rate_limit(limit: int = 100, window: int = 60):
    """Rate limiting decorator"""
    def decorator(func):
        async def wrapper(request: Request, *args, **kwargs):
            client_ip = request.client.host
            user_id = getattr(request.state, 'user_id', None)
            
            # Use user ID if available, otherwise IP
            key = f"{user_id}:{client_ip}" if user_id else client_ip
            
            if not rate_limiter.is_allowed(key, limit, window):
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded"
                )
            
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator
```

## Input Validation & Sanitization

### Data Validation
```python
# schemas/security.py
from pydantic import BaseModel, validator, Field
import re
from typing import Optional

class SecureUserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., max_length=255)
    
    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username must contain only letters, numbers, and underscores')
        return v.lower()
    
    @validator('email')
    def validate_email(cls, v):
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, v):
            raise ValueError('Invalid email format')
        return v.lower()
    
    @validator('password')
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]', v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    @validator('full_name')
    def validate_full_name(cls, v):
        # Remove potentially dangerous characters
        v = re.sub(r'[<>"\']', '', v)
        return v.strip()
```

### SQL Injection Prevention
```python
# core/database.py
from sqlalchemy import text
from sqlalchemy.orm import Session

class SecureDatabaseService:
    def __init__(self, db: Session):
        self.db = db
    
    def safe_query(self, query: str, params: dict = None):
        """Execute safe parameterized query"""
        try:
            result = self.db.execute(text(query), params or {})
            return result.fetchall()
        except Exception as e:
            raise Exception(f"Database query failed: {str(e)}")
    
    def get_user_by_username(self, username: str):
        """Get user by username with parameterized query"""
        query = "SELECT * FROM users WHERE username = :username"
        result = self.safe_query(query, {"username": username})
        return result[0] if result else None
```

## File Upload Security

### File Validation
```python
# core/file_security.py
import magic
import os
from typing import List, Tuple
from fastapi import UploadFile, HTTPException

class FileSecurityValidator:
    ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'text/plain'
    ]
    
    ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.txt']
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    def validate_file(self, file: UploadFile) -> Tuple[bool, str]:
        """Validate uploaded file"""
        # Check file size
        if file.size > self.MAX_FILE_SIZE:
            return False, "File size exceeds maximum allowed size"
        
        # Check file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in self.ALLOWED_EXTENSIONS:
            return False, "File type not allowed"
        
        # Check MIME type
        file_content = file.file.read(1024)
        file.file.seek(0)  # Reset file pointer
        
        mime_type = magic.from_buffer(file_content, mime=True)
        if mime_type not in self.ALLOWED_MIME_TYPES:
            return False, "File MIME type not allowed"
        
        # Check for malicious content
        if self._contains_malicious_content(file_content):
            return False, "File contains potentially malicious content"
        
        return True, "File is valid"
    
    def _contains_malicious_content(self, content: bytes) -> bool:
        """Check for malicious content patterns"""
        malicious_patterns = [
            b'<script',
            b'javascript:',
            b'vbscript:',
            b'onload=',
            b'onerror=',
            b'eval(',
            b'exec(',
        ]
        
        content_lower = content.lower()
        for pattern in malicious_patterns:
            if pattern in content_lower:
                return True
        
        return False
    
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename"""
        # Remove path traversal attempts
        filename = os.path.basename(filename)
        
        # Remove dangerous characters
        dangerous_chars = ['..', '/', '\\', ':', '*', '?', '"', '<', '>', '|']
        for char in dangerous_chars:
            filename = filename.replace(char, '_')
        
        # Limit length
        name, ext = os.path.splitext(filename)
        if len(name) > 100:
            name = name[:100]
        
        return name + ext
```

## API Security

### CORS Configuration
```python
# main.py
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page-Count"],
)
```

### Security Headers
```python
# middleware/security.py
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
import time

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        # Remove server header
        response.headers.pop("Server", None)
        
        return response
```

### Request Logging
```python
# middleware/logging.py
import logging
from fastapi import Request
from fastapi.middleware.base import BaseHTTPMiddleware
import time

logger = logging.getLogger(__name__)

class SecurityLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url}")
        logger.info(f"Client IP: {request.client.host}")
        logger.info(f"User Agent: {request.headers.get('user-agent', 'Unknown')}")
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(f"Response: {response.status_code} in {process_time:.4f}s")
        
        # Log security events
        if response.status_code >= 400:
            logger.warning(f"Security event: {response.status_code} for {request.url}")
        
        return response
```

## Database Security

### Connection Security
```python
# core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings

def create_secure_engine():
    """Create secure database engine"""
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=10,
        max_overflow=20,
        echo=settings.DEBUG,
        # Security options
        connect_args={
            "sslmode": "require",
            "application_name": "tamankehati-api"
        }
    )
    return engine
```

### Data Encryption
```python
# core/encryption.py
from cryptography.fernet import Fernet
from core.config import settings
import base64

class DataEncryption:
    def __init__(self):
        self.cipher = Fernet(settings.ENCRYPTION_KEY)
    
    def encrypt(self, data: str) -> str:
        """Encrypt sensitive data"""
        encrypted_data = self.cipher.encrypt(data.encode())
        return base64.b64encode(encrypted_data).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        encrypted_bytes = base64.b64decode(encrypted_data.encode())
        decrypted_data = self.cipher.decrypt(encrypted_bytes)
        return decrypted_data.decode()
```

## Environment Security

### Environment Variables
```bash
# .env.production
# Database
DATABASE_URL="postgresql+asyncpg://user:password@host:5432/db?sslmode=require"
DATABASE_URL_SYNC="postgresql://user:password@host:5432/db?sslmode=require"

# Security
SECRET_KEY="your-super-secure-secret-key-minimum-32-characters"
ENCRYPTION_KEY="your-encryption-key-base64-encoded"

# CORS
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Rate Limiting
RATE_LIMIT_REQUESTS="100"
RATE_LIMIT_WINDOW="60"

# File Upload
MAX_FILE_SIZE="10485760"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"

# Logging
LOG_LEVEL="WARNING"
ENABLE_SECURITY_LOGGING="true"
```

### Production Security Checklist
- [ ] Use HTTPS in production
- [ ] Set secure CORS origins
- [ ] Use strong secret keys
- [ ] Enable database SSL
- [ ] Set up rate limiting
- [ ] Configure security headers
- [ ] Enable request logging
- [ ] Use environment-specific configs
- [ ] Regular security updates
- [ ] Monitor security events

## Monitoring & Logging

### Security Event Logging
```python
# core/security_logging.py
import logging
from datetime import datetime
from typing import Dict, Any

security_logger = logging.getLogger("security")

class SecurityLogger:
    @staticmethod
    def log_login_attempt(username: str, success: bool, ip: str):
        """Log login attempts"""
        event = {
            "event": "login_attempt",
            "username": username,
            "success": success,
            "ip": ip,
            "timestamp": datetime.utcnow().isoformat()
        }
        security_logger.info(f"Security event: {event}")
    
    @staticmethod
    def log_permission_denied(user_id: int, resource: str, action: str):
        """Log permission denied events"""
        event = {
            "event": "permission_denied",
            "user_id": user_id,
            "resource": resource,
            "action": action,
            "timestamp": datetime.utcnow().isoformat()
        }
        security_logger.warning(f"Security event: {event}")
    
    @staticmethod
    def log_suspicious_activity(user_id: int, activity: str, details: Dict[str, Any]):
        """Log suspicious activities"""
        event = {
            "event": "suspicious_activity",
            "user_id": user_id,
            "activity": activity,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
        security_logger.error(f"Security event: {event}")
```

## Security Testing

### Security Test Suite
```python
# tests/test_security.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_password_validation():
    """Test password validation"""
    weak_passwords = [
        "12345678",  # No letters
        "password",   # No numbers
        "Password",   # No special chars
        "Pass123",    # Too short
    ]
    
    for password in weak_passwords:
        response = client.post("/api/v1/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": password,
            "full_name": "Test User"
        })
        assert response.status_code == 422

def test_rate_limiting():
    """Test rate limiting"""
    for i in range(105):  # Exceed rate limit
        response = client.get("/api/v1/parks")
        if i >= 100:
            assert response.status_code == 429

def test_sql_injection():
    """Test SQL injection prevention"""
    malicious_input = "'; DROP TABLE users; --"
    response = client.post("/api/v1/auth/login", json={
        "username": malicious_input,
        "password": "password"
    })
    # Should not cause database error
    assert response.status_code in [400, 401, 422]

def test_file_upload_security():
    """Test file upload security"""
    # Test malicious file
    malicious_content = b"<script>alert('xss')</script>"
    response = client.post(
        "/api/v1/upload",
        files={"file": ("malicious.html", malicious_content, "text/html")}
    )
    assert response.status_code == 400
```

## Incident Response

### Security Incident Response Plan
1. **Detection**: Monitor logs and alerts
2. **Assessment**: Evaluate severity and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threats
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update security measures

### Security Contacts
- **Security Team**: security@tamankehati.com
- **Emergency**: +62-xxx-xxx-xxxx
- **Incident Reporting**: incidents@tamankehati.com

## Related Documentation

- [Authentication System](authentication.md)
- [Role-Based Access Control](rbac.md)
- [API Documentation](../development/api-docs.md)
- [Production Deployment](../deployment/production.md)
