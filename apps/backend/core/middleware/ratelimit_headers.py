from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from starlette.requests import Request
from starlette.responses import Response

class RateLimitHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        rl = getattr(request.state, "rate_limit", None)
        if rl:
            response.headers.setdefault("X-RateLimit-Limit", str(rl.get("limit", "")))
            response.headers.setdefault("X-RateLimit-Remaining", str(rl.get("remaining", "")))
            response.headers.setdefault("X-RateLimit-Window", str(rl.get("window_sec", "")))
            response.headers.setdefault("X-RateLimit-Scope", str(rl.get("scope", "")))
        return response
