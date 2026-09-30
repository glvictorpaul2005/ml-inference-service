"""Measure real latency of the running service (stdlib only).
    python scripts/benchmark.py --url http://localhost:8000 --requests 500 --concurrency 20
Reports client-side round-trip latency for cache-MISS and cache-HIT traffic.
"""
import argparse
import json
import statistics
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor


def call(url, features):
    req = urllib.request.Request(url + "/predict", json.dumps({"features": features}).encode(),
                                 {"Content-Type": "application/json"})
    t = time.perf_counter()
    with urllib.request.urlopen(req) as r:
        r.read()
    return (time.perf_counter() - t) * 1000


def summarize(name, lat):
    lat = sorted(lat)
    print(f"{name:<12} n={len(lat)}  p50={statistics.median(lat):.1f}ms  "
          f"p95={lat[int(len(lat) * .95) - 1]:.1f}ms  max={lat[-1]:.1f}ms")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://localhost:8000")
    ap.add_argument("--requests", type=int, default=500)
    ap.add_argument("--concurrency", type=int, default=20)
    a = ap.parse_args()

    n = json.load(urllib.request.urlopen(a.url + "/model/info"))["n_features"]
    seed = time.time()
    vectors = [[(seed + i * 0.001 + j) % 50 for j in range(n)] for i in range(a.requests)]  # unique -> misses
    with ThreadPoolExecutor(a.concurrency) as ex:
        summarize("cache MISS", list(ex.map(lambda v: call(a.url, v), vectors)))
        summarize("cache HIT", list(ex.map(lambda v: call(a.url, v), vectors)))   # same vectors again
    print(json.load(urllib.request.urlopen(a.url + "/stats")))


if __name__ == "__main__":
    main()
