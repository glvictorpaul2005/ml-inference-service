# Containerized ML Model Inference Service

A production-style REST gateway that serves a scikit-learn/XGBoost model with **FastAPI**, packaged with **Docker**, with **Redis** response caching, a **PostgreSQL** prediction log (connection pooled) and a **GitHub Actions** CI/CD pipeline.

```
client ─► FastAPI (uvicorn) ─► Redis cache ──hit──► response
                 │                 └─miss─► XGBoost model ─► cache set
                 └─ background task ─► PostgreSQL (pooled) prediction log
```

## Features
- `POST /predict`, `POST /predict/batch`, `GET /model/info`, `GET /health`, `GET /stats`, `GET /predictions/recent`
- **Redis caching** keyed on a hash of the feature vector + model version (TTL configurable). If Redis is down the API keeps serving.
- **PostgreSQL** logging via `ThreadedConnectionPool`, written in a background task so it adds no request latency.
- Input validation (Pydantic), `X-Process-Time-ms` header on every response, non-root container, health check.
- Model is trained **at image build time** (`train.py`), so each image is self-contained and versioned.
- CI: unit tests → integration smoke test against real Postgres + Redis → Docker build → optional deploy hook.

## Run locally
```bash
docker compose up --build            # API on http://localhost:8000  (docs at /docs)
curl localhost:8000/health
curl localhost:8000/model/info       # shows the 30 feature names
```
Predict (30 features in the order from `/model/info`):
```bash
python - <<'PY'
import json, urllib.request
from sklearn.datasets import load_breast_cancer
x = [float(v) for v in load_breast_cancer().data[0]]
req = urllib.request.Request("http://localhost:8000/predict", json.dumps({"features": x}).encode(),
                             {"Content-Type": "application/json"})
print(urllib.request.urlopen(req).read().decode())
PY
```
Without Docker: `pip install -r requirements-dev.txt && python train.py && uvicorn app.main:app --reload` (cache/DB are simply disabled unless `REDIS_URL` / `DATABASE_URL` are set).

## Tests
```bash
pip install -r requirements-dev.txt
pytest -v
```

## Measure latency (get your own numbers)
```bash
python scripts/benchmark.py --url http://localhost:8000 --requests 500 --concurrency 20
```
Prints p50/p95 round-trip latency for cache **misses** and **hits**. Put your measured results here:

| Traffic | p50 (ms) | p95 (ms) |
|---|---|---|
| Cache miss | | |
| Cache hit | | |

## Deploy a live demo (free)
1. Push this repo to GitHub.
2. On [render.com](https://render.com): **New → Blueprint** → select the repo. `render.yaml` provisions the web service, Postgres and Key Value (Redis).
3. Open `https://<your-service>.onrender.com/docs` – this is your **Demo** link for the resume.
4. Optional auto-deploy from Actions: copy the service's *Deploy Hook* URL into repo **Settings → Secrets → `RENDER_DEPLOY_HOOK_URL`**.

Free tiers change over time (free instances sleep when idle; free databases may expire), so check Render's current docs. Railway and Fly.io also work with the included Dockerfile.

## Use your own model
Replace `load_breast_cancer()` in `train.py` with your dataset (for example the lung-cancer pipeline data) and keep the artifact keys (`model`, `features`, `classes`, `version`).
