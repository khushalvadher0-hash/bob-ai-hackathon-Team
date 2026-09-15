import joblib
import pandas as pd
from pathlib import Path
from typing import Dict, Any

MODEL_PATH = Path(__file__).resolve().parent / "congestion_model.pkl"

def predict_congestion(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predict congestion level and probability.
    Returns:
    {
        "probability": 0.87,
        "level": "HIGH",
        "predicted_wait_hours": 7.5
    }
    """
    vessel_count = features.get("vessel_count", 2)
    container_count = features.get("container_count", 4000)
    available_berths = max(features.get("available_berths", 1), 0.5)
    available_cranes = max(features.get("available_cranes", 2), 0.5)
    
    # Fallback heuristic calculation if model file isn't found
    if not MODEL_PATH.exists():
        vpb = vessel_count / available_berths
        if vpb >= 3 or container_count > 8000:
            return {"probability": 0.92, "level": "CRITICAL", "predicted_wait_hours": 12.0}
        elif vpb >= 2 or container_count > 6000:
            return {"probability": 0.78, "level": "HIGH", "predicted_wait_hours": 8.0}
        elif vpb >= 1:
            return {"probability": 0.45, "level": "MEDIUM", "predicted_wait_hours": 4.5}
        else:
            return {"probability": 0.18, "level": "LOW", "predicted_wait_hours": 1.5}

    try:
        model = joblib.load(MODEL_PATH)
        df_input = pd.DataFrame([{
            'vessel_count': vessel_count,
            'container_count': container_count,
            'available_berths': features.get("available_berths", 1),
            'available_cranes': features.get("available_cranes", 2),
            'vessels_per_berth': vessel_count / available_berths,
            'containers_per_crane': container_count / available_cranes
        }])
        
        pred_level = model.predict(df_input)[0]
        proba_matrix = model.predict_proba(df_input)[0]
        max_proba = float(max(proba_matrix))
        
        wait_map = {"CRITICAL": 12.5, "HIGH": 8.0, "MEDIUM": 4.5, "LOW": 1.5}
        
        return {
            "probability": round(max_proba, 2),
            "level": str(pred_level),
            "predicted_wait_hours": wait_map.get(str(pred_level), 3.0)
        }
    except Exception as e:
        # Graceful fallback
        return {
            "probability": 0.75,
            "level": "MEDIUM",
            "predicted_wait_hours": 4.0,
            "note": f"Fallback mode: {str(e)}"
        }
