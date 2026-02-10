import json
import hashlib
from typing import Optional, Any
from app.core.config import settings

try:
    import redis.asyncio as aioredis
    _redis_client: Optional[aioredis.Redis] = None

    async def get_redis() -> aioredis.Redis:
        global _redis_client
        if _redis_client is None:
            _redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        return _redis_client

    async def cache_get(key: str) -> Optional[Any]:
        try:
            r = await get_redis()
            val = await r.get(key)
            return json.loads(val) if val else None
        except Exception:
            return None

    async def cache_set(key: str, value: Any, ttl: int = 300) -> None:
        try:
            r = await get_redis()
            await r.setex(key, ttl, json.dumps(value))
        except Exception:
            pass

    async def cache_delete(key: str) -> None:
        try:
            r = await get_redis()
            await r.delete(key)
        except Exception:
            pass

except ImportError:
    async def cache_get(key: str) -> Optional[Any]:
        return None

    async def cache_set(key: str, value: Any, ttl: int = 300) -> None:
        pass

    async def cache_delete(key: str) -> None:
        pass


def make_cache_key(*parts: str) -> str:
    raw = ":".join(str(p) for p in parts)
    return hashlib.sha256(raw.encode()).hexdigest()[:32]
