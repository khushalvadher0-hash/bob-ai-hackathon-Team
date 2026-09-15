from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
from .feature_engineering import create_congestion_features

MODEL_PATH = Path(__file__).resolve().parent / "congestion_model.pkl"
_cached_model = None

def get_model():
    """Loads and caches the trained Random Forest model."""
    global _cached_model
    if _cached_model is None and MODEL_PATH.exists():
        try:
            import joblib
            _cached_model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"[WARN] Error loading model from {MODEL_PATH}: {e}")
            _cached_model = None
    return _cached_model

def calculate_expected_wait_hours(level: str, vessels: int, avail_berths: float) -> float:
    """Computes explainable estimated wait hours based on congestion level and queue."""
    base_hours = {
        "CRITICAL": 12.0,
        "HIGH": 8.0,
        "MEDIUM": 4.5,
        "LOW": 1.5
    }.get(level, 3.0)
    
    # Scale slightly with vessels per berth
    ratio = max(vessels / max(avail_berths, 0.5), 0.5)
    adjusted = base_hours * (0.7 + 0.3 * min(ratio, 3.0))
    return round(float(adjusted), 1)

def predict_congestion(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predicts terminal congestion level, probability, queue, and wait hours.
    Returns:
    {
        "congestion_level": "CRITICAL",
        "probability": 0.89,
        "expected_queue": 14,
        "expected_wait_hours": 18.0
    }
    """
    vessel_count = int(features.get("vessel_count", 2))
    container_count = int(features.get("container_count", 4000))
    available_berths = max(float(features.get("available_berths", 1)), 0.5)
    available_cranes = max(float(features.get("available_cranes", 2)), 0.5)
    
    # Calculate queue
    expected_queue = max(0, int(vessel_count - max(available_berths, 1)))

    model = get_model()
    if model is not None:
        try:
            X = create_congestion_features(features)
            pred_level = str(model.predict(X)[0]).upper()
            
            # Predict class probability
            classes = list(model.classes_)
            if pred_level in classes:
                class_idx = classes.index(pred_level)
                proba_arr = model.predict_proba(X)[0]
                probability = float(proba_arr[class_idx])
            else:
                probability = 0.85
                
            wait_hours = calculate_expected_wait_hours(pred_level, vessel_count, available_berths)
            
            return {
                "congestion_level": pred_level,
                "probability": round(probability, 2),
                "expected_queue": expected_queue,
                "expected_wait_hours": wait_hours,
                "predicted_wait_hours": wait_hours,  # Alias for backward compatibility
                "level": pred_level                  # Alias for backward compatibility
            }
        except Exception as e:
            print(f"[WARN] Prediction failed, using fallback heuristic: {e}")

    # Explainable Fallback Heuristic
    vpb = vessel_count / available_berths
    if vpb >= 3.0 or container_count > 8000:
        level = "CRITICAL"
        prob = 0.92
    elif vpb >= 2.0 or container_count > 6000:
        level = "HIGH"
        prob = 0.78
    elif vpb >= 1.0 or container_count > 3000:
        level = "MEDIUM"
        prob = 0.55
    else:
        level = "LOW"
        prob = 0.22

    wait_hours = calculate_expected_wait_hours(level, vessel_count, available_berths)
    return {
        "congestion_level": level,
        "probability": prob,
        "expected_queue": expected_queue,
        "expected_wait_hours": wait_hours,
        "predicted_wait_hours": wait_hours,
        "level": level
    }
