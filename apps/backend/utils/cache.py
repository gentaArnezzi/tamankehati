import os, time, json, asyncio
from typing import Any, Optional

REDIS_URL = os.getenv("REDIS_URL")

class MemoryCache:
    def __init__(self):
        self.data = {}
    async def get(self, key: str) -> Optional[str]:
        rec = self.data.get(key)
        if not rec: return None
        value, exp = rec
        if exp and time.time() > exp:
            self.data.pop(key, None)
            return None
        return value
    async def setex(self, key: str, ttl: int, value: str) -> None:
        self.data[key] = (value, time.time() + ttl)

_redis = None
_mem = MemoryCache()

async def get_client():
    global _redis
    if REDIS_URL and _redis is None:
        try:
            import redis.asyncio as redis
            _redis = redis.from_url(REDIS_URL, decode_responses=True)
        except Exception:
            _redis = False
    return _redis if _redis else _mem

async def cache_get_json(key: str):
    cli = await get_client()
    val = await cli.get(key)
    return json.loads(val) if val else None

async def cache_set_json(key: str, ttl: int, obj: Any):
    cli = await get_client()
    await cli.setex(key, ttl, json.dumps(obj))
