from typing import List, Dict, Any, Optional
from datetime import datetime
from ..database.database import get_database
from ..ml.predict import predict_congestion
from .vessel_service import get_all_vessels

VALID_TERMINALS = ["T1", "T2", "T3", "T4"]
TERMINAL_NAMES = {
    "T1": "North Deepwater Terminal",
    "T2": "East Pier Container Terminal",
    "T3": "South Gateway Terminal",
    "T4": "West River Feeder Terminal"
}

def _clean_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Removes MongoDB _id from returned dictionary."""
    if doc and "_id" in doc:
        del doc["_id"]
    return doc

def predict_terminal_congestion(terminal_id: str) -> Optional[Dict[str, Any]]:
    """
    Computes real-time ML congestion prediction for a given terminal based on
    live vessel manifests and berth availability from MongoDB, then stores it.
    """
    t_id_clean = terminal_id.strip().upper()
    if t_id_clean not in VALID_TERMINALS:
        return None

    vessels = get_all_vessels()
    sub_v = [v for v in vessels if str(v.get("current_terminal") or v.get("terminal_id", "")).upper() == t_id_clean]
    v_count = len(sub_v)
    c_count = sum(int(v.get("container_count", 0)) for v in sub_v)

    berths = []
    try:
        db = get_database()
        berths = [_clean_doc(b) for b in db.berths.find({"terminal_id": t_id_clean})]
    except Exception:
        pass

    if berths:
        avail_berths = len([b for b in berths if b.get("status") == "AVAILABLE" or b.get("available") is True])
        avail_cranes = sum(int(b.get("crane_count", 2)) for b in berths)
    else:
        # Default capacity per terminal type
        avail_berths = 2 if t_id_clean in ["T1", "T2"] else 1
        avail_cranes = 4 if t_id_clean in ["T1", "T2"] else 2

    # Run ML prediction
    pred = predict_congestion({
        "vessel_count": v_count,
        "container_count": c_count,
        "available_berths": avail_berths,
        "available_cranes": avail_cranes
    })

    expected_queue = max(0, int(v_count - max(avail_berths, 1)))
    expected_wait = pred.get("expected_wait_hours") or pred.get("predicted_wait_hours", 2.0)

    record = {
        "terminal_id": t_id_clean,
        "terminal_name": TERMINAL_NAMES.get(t_id_clean, f"Terminal {t_id_clean}"),
        "prediction_time": datetime.now().isoformat(),
        "congestion_level": pred["congestion_level"],
        "probability": pred["probability"],
        "expected_queue": expected_queue,
        "expected_wait_hours": expected_wait,
        "predicted_wait_hours": expected_wait,
        "available_berths": avail_berths,
        "available_cranes": avail_cranes,
        "vessel_count": v_count,
        "container_count": c_count
    }

    # Persist in MongoDB
    try:
        db = get_database()
        db.congestion_predictions.update_one(
            {"terminal_id": t_id_clean},
            {"$set": record},
            upsert=True
        )
    except Exception as e:
        print(f"[INFO] Notice saving prediction to MongoDB: {e}")

    return record

def get_congestion_predictions() -> List[Dict[str, Any]]:
    """
    Returns congestion predictions for all terminals from MongoDB.
    If empty, computes them dynamically and stores them.
    """
    predictions = []
    try:
        db = get_database()
        docs = list(db.congestion_predictions.find({}))
        if docs and len(docs) >= len(VALID_TERMINALS):
            return [_clean_doc(d) for d in docs]
    except Exception:
        pass

    # Compute predictions for all valid terminals
    for t_id in VALID_TERMINALS:
        pred = predict_terminal_congestion(t_id)
        if pred:
            predictions.append(pred)

    return predictions

def get_terminal_congestion(terminal_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves stored congestion prediction for a single terminal from MongoDB.
    If not found in database, computes it or returns None if invalid terminal.
    """
    if not terminal_id:
        return None
    t_id_clean = terminal_id.strip().upper()
    if t_id_clean not in VALID_TERMINALS:
        return None

    try:
        db = get_database()
        doc = db.congestion_predictions.find_one({"terminal_id": t_id_clean})
        if doc:
            return _clean_doc(doc)
    except Exception:
        pass

    return predict_terminal_congestion(t_id_clean)

def get_terminal_congestion_by_id(terminal_id: str) -> Optional[Dict[str, Any]]:
    """Alias for backwards compatibility."""
    return get_terminal_congestion(terminal_id)

def get_terminal_congestion_status() -> List[Dict[str, Any]]:
    """Alias for backwards compatibility (used by Person 2 routing/optimization)."""
    return get_congestion_predictions()

def save_congestion_prediction(prediction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Persists a congestion prediction document into MongoDB."""
    t_id = prediction_data.get("terminal_id")
    if not t_id:
        raise ValueError("terminal_id is required")
    db = get_database()
    clean_data = dict(prediction_data)
    if "_id" in clean_data:
        del clean_data["_id"]
    db.congestion_predictions.update_one({"terminal_id": t_id}, {"$set": clean_data}, upsert=True)
    return clean_data
