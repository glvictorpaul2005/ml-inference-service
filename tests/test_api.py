import pytest
from fastapi.testclient import TestClient
from sklearn.datasets import load_breast_cancer

import train
from app import main
from app.cache import NullCache
from app.db import NullDB


class DictCache:
    """In-memory stand-in for Redis so tests need no external services."""
    enabled = True
    def __init__(self): self.d = {}
    def get(self, k): return self.d.get(k)
    def set(self, k, v, ttl=300): self.d[k] = v


@pytest.fixture(scope="module")
def client():
    if not train.MODEL_PATH.exists():
        train.main()
    main.state.cache = DictCache()
    main.state.db = NullDB()
    with TestClient(main.app) as c:
        yield c


SAMPLE = [float(x) for x in load_breast_cancer().data[0]]


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_model_info(client):
    info = client.get("/model/info").json()
    assert info["n_features"] == 30
    assert len(info["features"]) == 30


def test_predict_ok_and_latency_header(client):
    r = client.post("/predict", json={"features": SAMPLE})
    assert r.status_code == 200
    body = r.json()
    assert body["label"] in ("malignant", "benign")
    assert 0.0 <= body["probability"] <= 1.0
    assert "x-process-time-ms" in r.headers


def test_second_identical_request_is_cached(client):
    features = [f + 0.123 for f in SAMPLE]           # unique vector
    first = client.post("/predict", json={"features": features}).json()
    second = client.post("/predict", json={"features": features}).json()
    assert first["cached"] is False
    assert second["cached"] is True
    assert first["label"] == second["label"]


def test_wrong_feature_count_rejected(client):
    assert client.post("/predict", json={"features": [1.0, 2.0]}).status_code == 422


def test_bad_types_rejected(client):
    assert client.post("/predict", json={"features": "abc"}).status_code == 422


def test_batch(client):
    r = client.post("/predict/batch", json=[{"features": SAMPLE}, {"features": SAMPLE}])
    assert r.status_code == 200 and len(r.json()) == 2


def test_stats(client):
    assert client.get("/stats").json()["requests"] >= 1


def test_null_backends_do_not_break():
    assert NullCache().get("x") is None
    NullDB().log_prediction("v", "benign", 0.9, False, 1.0)
