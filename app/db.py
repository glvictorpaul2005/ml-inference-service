"""PostgreSQL prediction log using a psycopg2 connection pool (optional)."""
import logging
import os

log = logging.getLogger("db")

DDL = """
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    model_version TEXT NOT NULL,
    label TEXT NOT NULL,
    probability DOUBLE PRECISION NOT NULL,
    cached BOOLEAN NOT NULL,
    latency_ms DOUBLE PRECISION NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_predictions_created ON predictions (created_at DESC);
"""


class NullDB:
    enabled = False
    def log_prediction(self, *a, **k): pass
    def recent(self, limit=20): return []
    def close(self): pass


class PgDB:
    enabled = True

    def __init__(self, dsn: str):
        from psycopg2.pool import ThreadedConnectionPool
        self.pool = ThreadedConnectionPool(minconn=1, maxconn=int(os.getenv("DB_POOL_MAX", "10")), dsn=dsn)
        conn = self.pool.getconn()
        try:
            with conn, conn.cursor() as cur:
                cur.execute(DDL)
        finally:
            self.pool.putconn(conn)

    def log_prediction(self, model_version, label, probability, cached, latency_ms):
        conn = None
        try:
            conn = self.pool.getconn()
            with conn, conn.cursor() as cur:
                cur.execute("INSERT INTO predictions (model_version,label,probability,cached,latency_ms) "
                            "VALUES (%s,%s,%s,%s,%s)", (model_version, label, probability, cached, latency_ms))
        except Exception as e:  # noqa: BLE001
            log.warning("db log failed: %s", e)
        finally:
            if conn:
                self.pool.putconn(conn)

    def recent(self, limit=20):
        conn = self.pool.getconn()
        try:
            with conn, conn.cursor() as cur:
                cur.execute("SELECT created_at,label,probability,cached,latency_ms FROM predictions "
                            "ORDER BY created_at DESC LIMIT %s", (limit,))
                return [dict(zip(("created_at", "label", "probability", "cached", "latency_ms"), r)) for r in cur.fetchall()]
        finally:
            self.pool.putconn(conn)

    def close(self):
        self.pool.closeall()


def build_db():
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        return NullDB()
    try:
        return PgDB(dsn)
    except Exception as e:  # noqa: BLE001
        log.warning("Postgres unavailable (%s); running without prediction log", e)
        return NullDB()
