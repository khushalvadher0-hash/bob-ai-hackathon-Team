from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
from .feature_engineering import create_congestion_features, FEATURE_COLUMNS

MODEL_PATH = Path(__file__).resolve().parent / "congestion_model.pkl"
_cached_model = None

SEVERITY_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

def get_model():
    """Loads and caches the trained Random Forest model artifact."""
    global _cached_model
    if _cached_model is None and MODEL_PATH.exists():
        try:
            import joblib
            _cached_model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"[WARN] Error loading model from {MODEL_PATH}: {e}")
            _cached_model = None
    return _cached_model

def calculate_expected_wait_hours(
    level: str,
    vessels: int,
    avail_berths: float,
    containers: int,
    avail_cranes: float
) -> float:
    """
    Computes explainable, deterministic expected waiting hours based on
    congestion level, vessel backlog, and crane handling throughput.
    """
    base_hours = {
        "CRITICAL": 12.5,
        "HIGH": 8.0,
        "MEDIUM": 4.5,
        "LOW": 1.5
    }.get(level, 3.0)

    # Workload factor: ratio of vessels to active berths
    berth_ratio = max(vessels / max(avail_berths, 0.5), 0.5)
    # Handling factor: container volume per available crane (35 TEU/hr benchmark)
    crane_capacity_hr = max(avail_cranes * 35.0, 35.0)
    handling_time_hr = containers / crane_capacity_hr if containers > 0 else 2.0

    # Composite expected wait calculation
    estimated = (base_hours * 0.5) + (berth_ratio * 1.5) + min(handling_time_hr * 0.15, 6.0)
    return round(float(estimated), 1)

def predict_congestion(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Runs Random Forest inference on operational port metrics.
    Returns predicted class, confidence probability, class probabilities distribution,
    expected queue, and estimated wait hours.
    """
    vessel_count = int(features.get("vessel_count", 0))
    container_count = int(features.get("container_count", 0))
    available_berths = max(float(features.get("available_berths", 1)), 0.5)
    available_cranes = max(float(features.get("available_cranes", 2)), 0.5)

    # Calculate vessel queue (vessels waiting beyond available berth capacity)
    expected_queue = max(0, int(vessel_count - max(int(available_berths), 1)))

    model = get_model()
    if model is not None:
        try:
            X = create_congestion_features(features)
            pred_level = str(model.predict(X)[0]).upper().strip()
            
            # Extract probability distribution across all classes
            classes = [str(c).upper().strip() for c in model.classes_]
            raw_probas = model.predict_proba(X)[0]
            
            probabilities = {}
            for cls_name, prob in zip(classes, raw_probas):
                probabilities[cls_name] = round(float(prob), 4)

            # Ensure all standard severity levels exist in probability map
            for lvl in SEVERITY_ORDER:
                if lvl not in probabilities:
                    probabilities[lvl] = 0.0

            # Confidence probability is the probability of the predicted class
            confidence_prob = probabilities.get(pred_level, round(float(max(raw_probas)), 2))
            
            wait_hours = calculate_expected_wait_hours(
                pred_level, vessel_count, available_berths, container_count, available_cranes
            )

            return {
                "congestion_level": pred_level,
                "probability": round(confidence_prob, 2),
                "probabilities": probabilities,
                "expected_queue": expected_queue,
                "expected_wait_hours": wait_hours,
                "predicted_wait_hours": wait_hours,  # Alias
                "level": pred_level,                 # Alias
                "features_used": {col: float(X[col].iloc[0]) for col in FEATURE_COLUMNS if col in X.columns}
            }
        except Exception as e:
            print(f"[WARN] Model inference error: {e}. Executing explainable fallback.")

    # ── Explainable Fallback Heuristic if model is not yet compiled on disk ──
    vpb = vessel_count / available_berths
    if vpb >= 3.0 or container_count > 8000:
        level = "CRITICAL"
        prob = 0.90
        probs = {"LOW": 0.02, "MEDIUM": 0.03, "HIGH": 0.05, "CRITICAL": 0.90}
    elif vpb >= 2.0 or container_count > 6000:
        level = "HIGH"
        prob = 0.78
        probs = {"LOW": 0.05, "MEDIUM": 0.12, "HIGH": 0.78, "CRITICAL": 0.05}
    elif vpb >= 1.0 or container_count > 3000:
        level = "MEDIUM"
        prob = 0.60
        probs = {"LOW": 0.20, "MEDIUM": 0.60, "HIGH": 0.15, "CRITICAL": 0.05}
    else:
        level = "LOW"
        prob = 0.85
        probs = {"LOW": 0.85, "MEDIUM": 0.10, "HIGH": 0.04, "CRITICAL": 0.01}

    wait_hours = calculate_expected_wait_hours(
        level, vessel_count, available_berths, container_count, available_cranes
    )

    return {
        "congestion_level": level,
        "probability": prob,
        "probabilities": probs,
        "expected_queue": expected_queue,
        "expected_wait_hours": wait_hours,
        "predicted_wait_hours": wait_hours,
        "level": level,
        "features_used": {
            "vessel_count": vessel_count,
            "container_count": container_count,
            "available_berths": available_berths,
            "available_cranes": available_cranes
        }
    }
