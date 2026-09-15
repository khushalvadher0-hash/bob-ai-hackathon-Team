from pathlib import Path
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np
import joblib
from .berth_features import create_berth_features, BERTH_FEATURE_COLUMNS

MODEL_PATH = Path(__file__).resolve().parent / "berth_model.pkl"
_cached_berth_model = None

def get_berth_model():
    """Loads and caches the trained Berth Assignment model artifact."""
    global _cached_berth_model
    if _cached_berth_model is None and MODEL_PATH.exists():
        try:
            _cached_berth_model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"[WARN] Error loading berth model from {MODEL_PATH}: {e}")
            _cached_berth_model = None
    return _cached_berth_model

def predict_preferred_berth(
    vessel: Dict[str, Any],
    target_terminal: str = "T1"
) -> Dict[str, Any]:
    """
    Executes ML inference to predict the ranked preferred berth candidates for a vessel.
    Returns predicted top berth, confidence, and complete probability distribution across all berths.
    """
    model = get_berth_model()
    if model is None:
        return {
            "predicted_berth_id": "B01",
            "confidence": 1.0,
            "ranked_berths": ["B01"],
            "probabilities": {"B01": 1.0},
            "model_version": "berth_rf_v1"
        }

    X = create_berth_features(vessel, target_terminal)
    raw_pred = str(model.predict(X)[0]).strip()
    
    classes = [str(c).strip() for c in model.classes_]
    probas = model.predict_proba(X)[0]
    
    # Sort berths by probability descending
    ranked_pairs = sorted(zip(classes, probas), key=lambda x: x[1], reverse=True)
    ranked_berths = [p[0] for p in ranked_pairs]
    prob_map = {cls_name: round(float(p), 4) for cls_name, p in zip(classes, probas)}
    confidence = prob_map.get(raw_pred, round(float(max(probas)), 2))

    return {
        "predicted_berth_id": raw_pred,
        "confidence": float(confidence),
        "ranked_berths": ranked_berths,
        "probabilities": prob_map,
        "model_version": "berth_rf_v1"
    }
