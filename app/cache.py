"""Redis cache with graceful degradation: if Redis is down the API still works."""
import json
import logging
import os

log = logging.getLogger("cache")


class NullCache:
    enabled = False
    def get(self, key): return None
    def set(self, key, value, ttl=300): pass


class RedisCache:
    enabled = True

    def __init__(self, url: str):
        import redis
        # Short timeouts so a dead Redis never slows requests.
        self.r = redis.Redis.from_url(url, socket_timeout=0.2, socket_connect_timeout=0.2, decode_responses=True)
        self.r.ping()

    def get(self, key):
        try:
            v = self.r.get(key)
            return json.loads(v) if v else None
        except Exception as e:  # noqa: BLE001
            log.warning("cache get failed: %s", e)
            return None

    def set(self, key, value, ttl=300):
        try:
            self.r.setex(key, ttl, json.dumps(value))
        except Exception as e:  # noqa: BLE001
            log.warning("cache set failed: %s", e)


def build_cache():
    url = os.getenv("REDIS_URL")
    if not url:
        return NullCache()
    try:
        return RedisCache(url)
    except Exception as e:  # noqa: BLE001
        log.warning("Redis unavailable (%s); running without cache", e)
        return NullCache()
