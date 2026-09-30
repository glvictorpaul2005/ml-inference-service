"""FastAPI model-inference gateway with Redis caching and a PostgreSQL prediction log."""
import hashlib
import json
import os
import threading
import time
from contextlib import asynccontextmanager
from pathlib import Path

import joblib
import numpy as np
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from pydantic import BaseModel, Field

from app.cache import build_cache
from app.db import build_db

MODEL_PATH = Path(os.getenv("MODEL_PATH", Path(__file__).resolve().parent.parent / "models" / "model.joblib"))
CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", "300"))


class State:
    artifact = None
    cache = None
    db = None
    lock = threading.Lock()
    stats = {"requests": 0, "cache_hits": 0, "latency_ms_total": 0.0}


state = State()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model not found at {MODEL_PATH}. Run `python train.py` first.")
    state.artifact = joblib.load(MODEL_PATH)
    if state.cache is None:
        state.cache = build_cache()
    if state.db is None:
        state.db = build_db()
    yield
    state.db.close()


app = FastAPI(title="ML Inference Service", version="1.0.0", lifespan=lifespan)


class PredictRequest(BaseModel):
    features: list[float] = Field(..., description="Feature vector in the order given by GET /model/info")


class PredictResponse(BaseModel):
    label: str
    probability: float
    cached: bool
    model_version: str
    latency_ms: float


@app.middleware("http")
async def timing(request: Request, call_next):
    t = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time-ms"] = f"{(time.perf_counter() - t) * 1000:.2f}"
    return response


def _key(features: list[float]) -> str:
    raw = json.dumps([round(f, 6) for f in features]) + state.artifact["version"]
    return "pred:" + hashlib.sha256(raw.encode()).hexdigest()


def _predict_one(features: list[float]) -> dict:
    n = len(state.artifact["features"])
    if len(features) != n:
        raise HTTPException(422, f"expected {n} features, got {len(features)}")
    key = _key(features)
    hit = state.cache.get(key)
    if hit:
        return {**hit, "cached": True}
    proba = state.artifact["model"].predict_proba(np.asarray([features], dtype=float))[0]
    cls = int(np.argmax(proba))
    result = {"label": state.artifact["classes"][cls], "probability": round(float(proba[cls]), 6)}
    state.cache.set(key, result, CACHE_TTL)
    return {**result, "cached": False}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest, background: BackgroundTasks):
    t = time.perf_counter()
    result = _predict_one(req.features)
    latency = (time.perf_counter() - t) * 1000
    with state.lock:
        state.stats["requests"] += 1
        state.stats["cache_hits"] += int(result["cached"])
        state.stats["latency_ms_total"] += latency
    version = state.artifact["version"]
    # DB write happens AFTER the response is sent so it never adds request latency.
    background.add_task(state.db.log_prediction, version, result["label"], result["probability"], result["cached"], latency)
    return PredictResponse(**result, model_version=version, latency_ms=round(latency, 3))


@app.post("/predict/batch")
def predict_batch(items: list[PredictRequest]):
    if len(items) > 256:
        raise HTTPException(413, "max 256 items per batch")
    return [_predict_one(i.features) for i in items]


@app.get("/model/info")
def model_info():
    a = state.artifact
    return {"version": a["version"], "n_features": len(a["features"]), "features": a["features"],
            "classes": a["classes"], "test_roc_auc": a.get("test_roc_auc")}


@app.get("/health")
def health():
    return {"status": "ok", "model_version": state.artifact["version"],
            "cache": state.cache.enabled, "database": state.db.enabled}


@app.get("/stats")
def stats():
    s = state.stats
    n = max(s["requests"], 1)
    return {"requests": s["requests"], "cache_hit_rate": round(s["cache_hits"] / n, 4),
            "avg_latency_ms": round(s["latency_ms_total"] / n, 3)}


@app.get("/predictions/recent")
def recent(limit: int = 20):
    return state.db.recent(min(limit, 100))
