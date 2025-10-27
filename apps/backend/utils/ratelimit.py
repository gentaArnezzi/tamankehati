import os, time, hashlib, json
from typing import Optional, Callable
from fastapi import Request, HTTPException, status, WebSocket, WebSocketException
from utils.cache import get_client

DEFAULT_LIMIT = int(os.getenv("RL_LIMIT", "60"))
DEFAULT_WINDOW = int(os.getenv("RL_WINDOW_SEC", "60"))
DEFAULT_SCOPE = os.getenv("RL_SCOPE", "ip")  # 'ip' or 'token'

def _now_window(window: int) -> int:
    return int(time.time() // window)

def _hash(s: str) -> str:
    import hashlib as _h
    return _h.sha1(s.encode("utf-8")).hexdigest()[:16]

async def _identifier_from_request(req: Request, scope: str) -> str:
    if scope == "token":
        auth = req.headers.get("authorization") or ""
        return _hash(auth.strip().lower() or (req.client.host if req.client else "anonymous"))
    return (req.client.host if req.client else "anonymous")

async def _identifier_from_ws(ws: WebSocket, scope: str) -> str:
    if scope == "token":
        auth = ws.headers.get("authorization") or ""
        return _hash(auth.strip().lower() or (ws.client.host if ws.client else "anonymous"))
    return (ws.client.host if ws.client else "anonymous")

async def _incr(key: str, window_ttl: int):
    cli = await get_client()
    val = await cli.get(key)
    if val:
        try:
            data = json.loads(val); data["n"] = int(data.get("n", 0)) + 1
        except Exception:
            data = {"n": 1}
    else:
        data = {"n": 1}
    await cli.setex(key, window_ttl, json.dumps(data))
    return data["n"]

def rate_limiter(limit: int = DEFAULT_LIMIT, window_sec: int = DEFAULT_WINDOW, scope: str = DEFAULT_SCOPE) -> Callable:
    async def _dep(req: Request):
        ident = await _identifier_from_request(req, scope)
        route = req.url.path
        bucket = _now_window(window_sec)
        key = f"rl:{scope}:{ident}:{route}:{bucket}"
        count = await _incr(key, window_sec)
        if count > limit:
            reset_in = (bucket + 1) * window_sec - int(time.time())
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {limit}/{window_sec}s for scope={scope}. Retry in {max(reset_in,0)}s.",
                headers={"Retry-After": str(max(reset_in, 0))},
            )
        # store to request.state for headers middleware
        req.state.rate_limit = {"limit": limit, "remaining": max(0, limit - count), "window_sec": window_sec, "scope": scope}
    return _dep

# WebSocket helper: call at message boundaries
async def ws_rate_check(ws: WebSocket, route: str, *, limit: int = DEFAULT_LIMIT, window_sec: int = DEFAULT_WINDOW, scope: str = DEFAULT_SCOPE):
    ident = await _identifier_from_ws(ws, scope)
    bucket = _now_window(window_sec)
    key = f"rl:{scope}:{ident}:{route}:{bucket}"
    count = await _incr(key, window_sec)
    if count > limit:
        reset_in = (bucket + 1) * window_sec - int(time.time())
        # Inform client then close
        await ws.send_json({"event": "error", "data": f"429 Rate limit exceeded. Retry in {max(reset_in,0)}s."})
        await ws.close(code=1011)
        raise WebSocketException(code=1011)
