from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib
from .routing_features import create_routing_features, ROUTING_FEATURE_COLUMNS

MODEL_PATH = Path(__file__).resolve().parent / "routing_model.pkl"
_cached_routing_model = None

def get_routing_model():
    """Loads and caches the trained Alternate Routing model artifact."""
    global _cached_routing_model
    if _cached_routing_model is None and MODEL_PATH.exists():
        try:
            _cached_routing_model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"[WARN] Error loading routing model from {MODEL_PATH}: {e}")
            _cached_routing_model = None
    return _cached_routing_model

def predict_alternate_route(
    vessel: Dict[str, Any],
    congestion_map: Dict[str, Dict[str, Any]],
    candidate_terminals: Optional[list] = None
) -> Dict[str, Any]:
    """
    Executes ML inference to recommend the optimal destination terminal for a vessel.
    Falls back to current terminal if model is unavailable.
    """
    model = get_routing_model()
    curr_term = str(vessel.get("current_terminal") or vessel.get("terminal_id") or "T1").upper()
    
    if model is None:
        return {
            "recommended_terminal": curr_term,
            "confidence": 1.0,
            "probabilities": {curr_term: 1.0},
            "model_version": "routing_rf_v1"
        }

    X = create_routing_features(vessel, congestion_map)
    raw_pred = str(model.predict(X)[0]).upper().strip()
    
    # Calculate confidence probabilities across classes
    classes = [str(c).upper().strip() for c in model.classes_]
    probas = model.predict_proba(X)[0]
    prob_map = {cls_name: round(float(p), 4) for cls_name, p in zip(classes, probas)}
    
    confidence = prob_map.get(raw_pred, round(float(max(probas)), 2))

    # Feasibility validation: Ensure terminal exists in port network
    valid_terminals = candidate_terminals or ["T1", "T2", "T3", "T4"]
    recommended_terminal = raw_pred if raw_pred in valid_terminals else curr_term

    return {
        "recommended_terminal": recommended_terminal,
        "confidence": float(confidence),
        "probabilities": prob_map,
        "model_version": "routing_rf_v1"
    }
