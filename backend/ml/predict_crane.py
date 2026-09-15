from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib
from .crane_features import create_crane_features, CRANE_FEATURE_COLUMNS

MODEL_PATH = Path(__file__).resolve().parent / "crane_model.pkl"
_cached_crane_model = None

def get_crane_model():
    """Loads and caches the trained Crane Allocation model artifact."""
    global _cached_crane_model
    if _cached_crane_model is None and MODEL_PATH.exists():
        try:
            _cached_crane_model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"[WARN] Error loading crane model from {MODEL_PATH}: {e}")
            _cached_crane_model = None
    return _cached_crane_model

def predict_crane_requirement(
    vessel: Dict[str, Any],
    berth: Dict[str, Any],
    congestion_level: str = "MEDIUM"
) -> Dict[str, Any]:
    """
    Executes ML inference to predict the optimal number of quay cranes for a vessel operation.
    Enforces hard physical constraints (1 <= allocated cranes <= berth maximum).
    """
    model = get_crane_model()
    max_berth_cranes = int(berth.get("crane_count", 3) or 3)

    if model is None:
        c_count = int(vessel.get("container_count", 1000) or 1000)
        fallback = 3 if c_count >= 1500 else 2
        return {
            "predicted_crane_count": min(fallback, max_berth_cranes),
            "raw_prediction": float(fallback),
            "max_berth_cranes": max_berth_cranes,
            "model_version": "crane_rf_v1"
        }

    X = create_crane_features(vessel, berth, congestion_level)
    raw_pred = float(model.predict(X)[0])
    
    # Rounded integer crane count bounded by berth infrastructure limit
    predicted_crane_count = max(1, min(int(round(raw_pred)), max_berth_cranes))

    return {
        "predicted_crane_count": predicted_crane_count,
        "raw_prediction": round(raw_pred, 2),
        "max_berth_cranes": max_berth_cranes,
        "model_version": "crane_rf_v1"
    }
