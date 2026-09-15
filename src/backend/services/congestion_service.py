from typing import List, Dict, Any, Optional
from datetime import datetime
from ..database.database import get_database
from ..ml.predict import predict_congestion
from .vessel_service import get_all_vessels

VALID_TERMINALS = ["T1", "T2", "T3", "T4"]
TERMINAL_METADATA = {
    "T1": {"name": "North Deepwater Terminal", "type": "Deepwater", "berths": 3, "cranes": 10},
    "T2": {"name": "East Pier Container Terminal", "type": "Container", "berths": 3, "cranes": 8},
    "T3": {"name": "South Gateway Terminal", "type": "General Cargo", "berths": 3, "cranes": 7},
    "T4": {"name": "West River Feeder Terminal", "type": "Feeder", "berths": 2, "cranes": 4}
}

SEVERITY_RANK = {
    "CRITICAL": 0,
    "HIGH": 1,
    "MEDIUM": 2,
    "LOW": 3
}

def _clean_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Removes MongoDB internal _id from returned document for clean JSON serialization."""
    if doc and "_id" in doc:
        del doc["_id"]
    return doc

def predict_terminal_congestion(terminal_id: str) -> Optional[Dict[str, Any]]:
    """
    Computes real-time ML congestion prediction for a given terminal based on
    actual vessel manifests and berth availability in MongoDB, then persists the prediction.
    """
    t_id_clean = terminal_id.strip().upper()
    if t_id_clean not in VALID_TERMINALS:
        return None

    # 1. Fetch current vessels targeting this terminal
    vessels = get_all_vessels()
    sub_vessels = [
        v for v in vessels
        if str(v.get("current_terminal") or v.get("terminal_id", "")).upper() == t_id_clean
    ]
    v_count = len(sub_vessels)
    c_count = sum(int(v.get("container_count", 0)) for v in sub_vessels)

    # 2. Fetch berth status from MongoDB
    berths = []
    try:
        db = get_database()
        berths = [_clean_doc(b) for b in db.berths.find({"terminal_id": t_id_clean})]
    except Exception:
        pass

    if berths:
        avail_berths = len([b for b in berths if b.get("status") == "AVAILABLE" or b.get("available") is True])
        avail_cranes = sum(int(b.get("crane_count", 2)) for b in berths if b.get("status") == "AVAILABLE" or b.get("available") is True)
        total_berths = len(berths)
        total_cranes = sum(int(b.get("crane_count", 2)) for b in berths)
    else:
        # Fallback to standard terminal layout
        meta = TERMINAL_METADATA.get(t_id_clean, {"berths": 3, "cranes": 8})
        total_berths = meta["berths"]
        total_cranes = meta["cranes"]
        avail_berths = max(1, total_berths - min(v_count, total_berths))
        avail_cranes = max(2, int(total_cranes * (avail_berths / max(total_berths, 1))))

    # 3. Calculate utilization metrics
    occupied_berths = max(0, total_berths - avail_berths)
    used_cranes = max(0, total_cranes - avail_cranes)
    berth_utilization = round(occupied_berths / max(total_berths, 1), 2)
    crane_utilization = round(used_cranes / max(total_cranes, 1), 2)

    # 4. Prepare operational feature payload for ML model
    features_payload = {
        "vessel_count": v_count,
        "container_count": c_count,
        "available_berths": avail_berths,
        "available_cranes": avail_cranes,
        "berth_utilization": berth_utilization,
        "crane_utilization": crane_utilization
    }

    # 5. Execute ML prediction
    prediction_result = predict_congestion(features_payload)

    now_iso = datetime.now().isoformat()
    record = {
        "terminal_id": t_id_clean,
        "terminal_name": TERMINAL_METADATA.get(t_id_clean, {}).get("name", f"Terminal {t_id_clean}"),
        "prediction_time": now_iso,
        "created_at": now_iso,
        "congestion_level": prediction_result["congestion_level"],
        "probability": prediction_result["probability"],
        "probabilities": prediction_result.get("probabilities", {}),
        "expected_queue": prediction_result["expected_queue"],
        "expected_wait_hours": prediction_result["expected_wait_hours"],
        "predicted_wait_hours": prediction_result["expected_wait_hours"], # Alias
        "available_berths": avail_berths,
        "available_cranes": avail_cranes,
        "total_berths": total_berths,
        "total_cranes": total_cranes,
        "berth_utilization": berth_utilization,
        "crane_utilization": crane_utilization,
        "vessel_count": v_count,
        "container_count": c_count,
        "features": prediction_result.get("features_used", features_payload)
    }

    # 6. Save prediction in MongoDB congestion_predictions collection
    try:
        db = get_database()
        db.congestion_predictions.update_one(
            {"terminal_id": t_id_clean},
            {"$set": record},
            upsert=True
        )
    except Exception as e:
        print(f"[INFO] Notice persisting prediction in MongoDB: {e}")

    return record

def get_congestion_predictions() -> List[Dict[str, Any]]:
    """
    Returns real-time predictions for all port terminals, sorted by severity order:
    CRITICAL -> HIGH -> MEDIUM -> LOW, with secondary sort by probability descending.
    """
    predictions = []
    for t_id in VALID_TERMINALS:
        pred = predict_terminal_congestion(t_id)
        if pred:
            predictions.append(pred)

    # Sort terminals by severity rank (CRITICAL first), then probability descending
    predictions.sort(
        key=lambda x: (
            SEVERITY_RANK.get(x.get("congestion_level", "LOW"), 3),
            -float(x.get("probability", 0.0)),
            -float(x.get("expected_wait_hours", 0.0))
        )
    )

    return predictions

def get_terminal_congestion(terminal_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves or calculates prediction metrics for a specific terminal ID.
    Returns None if terminal ID is invalid.
    """
    if not terminal_id:
        return None
    return predict_terminal_congestion(terminal_id)

def get_terminal_congestion_by_id(terminal_id: str) -> Optional[Dict[str, Any]]:
    """Alias for backwards compatibility."""
    return get_terminal_congestion(terminal_id)

def get_terminal_congestion_status() -> List[Dict[str, Any]]:
    """Alias for backwards compatibility (used by Person 2 modules)."""
    return get_congestion_predictions()

def save_congestion_prediction(prediction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Explicitly saves a congestion prediction document into MongoDB."""
    t_id = prediction_data.get("terminal_id")
    if not t_id:
        raise ValueError("terminal_id is required")
    db = get_database()
    clean_data = dict(prediction_data)
    if "_id" in clean_data:
        del clean_data["_id"]
    db.congestion_predictions.update_one({"terminal_id": t_id}, {"$set": clean_data}, upsert=True)
    return clean_data
