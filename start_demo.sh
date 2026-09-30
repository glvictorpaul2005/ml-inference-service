#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "======================================================="
echo " Starting ML Model Inference Service Interactive Demo"
echo "======================================================="

# 1. Ensure Python 3 virtual environment
if [ ! -d ".venv" ]; then
  echo "Creating local Python virtual environment (.venv)..."
  python3 -m venv .venv
fi

source .venv/bin/activate

# 2. Install dependencies into virtualenv
echo "Checking dependencies..."
pip install -q fastapi "uvicorn[standard]" pydantic scikit-learn xgboost joblib numpy

# 3. Train model if not present
if [ ! -f "models/model.joblib" ]; then
  echo "Training XGBoost classification model..."
  python train.py
fi

echo ""
echo "======================================================="
echo " ✓ Server starting on http://localhost:8000"
echo " ✓ Opening interactive Swagger UI in your browser..."
echo "======================================================="

# 4. Automatically open browser in background after 1.5s
(sleep 1.5 && open "http://localhost:8000/docs") &

# 5. Start FastAPI server
python -m uvicorn app.main:app --port 8000 --reload
