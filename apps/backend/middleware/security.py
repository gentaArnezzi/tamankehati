"""
Security middleware for adding security headers to all responses.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import os

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds security headers to all HTTP responses.
    
    Headers added:
    - X-Content-Type-Options: Prevents MIME type sniffing
    - X-Frame-Options: Prevents clickjacking
    - X-XSS-Protection: Enables XSS filtering in browsers
    - Strict-Transport-Security: Enforces HTTPS (production only)
    - Referrer-Policy: Controls referrer information
    """
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Basic security headers (always apply)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Production-only security headers
        if os.getenv('ENV', 'production') == 'production':
            # HSTS: Force HTTPS for 1 year
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware that limits the size of incoming requests.
    
    Prevents denial-of-service attacks via large request bodies.
    """
    
    def __init__(self, app, max_size: int = 100_000_000):  # 100MB default
        super().__init__(app)
        self.max_size = max_size
    
    async def dispatch(self, request: Request, call_next):
        # Only check content length for methods that have request bodies
        if request.method in ["POST", "PUT", "PATCH"]:
            content_length = request.headers.get("content-length")
            if content_length:
                try:
                    size = int(content_length)
                    if size > self.max_size:
                        from fastapi.responses import JSONResponse
                        return JSONResponse(
                            status_code=413,
                            content={
                                "detail": f"Request entity too large. Maximum size: {self.max_size} bytes ({self.max_size // 1_000_000}MB)"
                            }
                        )
                except ValueError:
                    pass  # Invalid content-length header, let it through
        
        return await call_next(request)

