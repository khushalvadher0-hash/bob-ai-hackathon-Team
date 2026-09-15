from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib
from .planning_features import create_planning_features, PLANNING_FEATURE_COLUMNS

MODEL_PATH = Path(__file__).resolve().parent / "planning_model.pkl"
_cached_planning_model = None

def get_planning_model():
    """Loads and caches the trained Planning Duration model artifact."""
    global _cached_planning_model
    if _cached_planning_model is None and MODEL_PATH.exists():
        try:
            _cached_planning_model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"[WARN] Error loading planning model from {MODEL_PATH}: {e}")
            _cached_planning_model = None
    return _cached_planning_model

def predict_service_duration(
    vessel: Dict[str, Any],
    crane_count: int = 2,
    congestion_level: str = "LOW",
    wait_hours: float = 2.0
) -> Dict[str, Any]:
    """
    Executes ML inference to predict the expected vessel turnaround handling duration in hours.
    """
    model = get_planning_model()
    if model is None:
        c_count = float(vessel.get("container_count", 1000) or 1000)
        cranes = max(1, crane_count)
        calc_dur = max(2.5, round(c_count / (cranes * 35.0), 1))
        return {
            "predicted_duration_hours": calc_dur,
            "raw_prediction": calc_dur,
            "model_version": "planning_rf_v1"
        }

    X = create_planning_features(vessel, crane_count, congestion_level, wait_hours)
    raw_pred = float(model.predict(X)[0])
    predicted_dur = max(2.5, round(raw_pred, 1))

    return {
        "predicted_duration_hours": predicted_dur,
        "raw_prediction": round(raw_pred, 2),
        "model_version": "planning_rf_v1"
    }
