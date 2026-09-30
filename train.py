"""Trains an XGBoost classifier on a public dataset and saves a versioned artifact.
Swap load_breast_cancer() for your own data (e.g. the lung-cancer project's CSV).
    python train.py
"""
import json
import time
from pathlib import Path

import joblib
from sklearn.datasets import load_breast_cancer
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

MODEL_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODEL_DIR / "model.joblib"


def main() -> dict:
    ds = load_breast_cancer()
    X_tr, X_te, y_tr, y_te = train_test_split(ds.data, ds.target, test_size=0.2,
                                              stratify=ds.target, random_state=42)
    model = XGBClassifier(n_estimators=200, max_depth=4, learning_rate=0.1,
                          eval_metric="logloss", random_state=42, n_jobs=1)
    model.fit(X_tr, y_tr)
    auc = float(roc_auc_score(y_te, model.predict_proba(X_te)[:, 1]))
    artifact = {
        "model": model,
        "features": list(ds.feature_names),
        "classes": {0: "malignant", 1: "benign"},   # sklearn's encoding for this dataset
        "version": time.strftime("%Y%m%d-%H%M%S"),
        "test_roc_auc": round(auc, 4),
    }
    MODEL_DIR.mkdir(exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)
    (MODEL_DIR / "metrics.json").write_text(json.dumps({k: v for k, v in artifact.items() if k != "model"}, indent=2))
    print(f"Saved {MODEL_PATH}  version={artifact['version']}  test AUC={auc:.4f}")
    return artifact


if __name__ == "__main__":
    main()
