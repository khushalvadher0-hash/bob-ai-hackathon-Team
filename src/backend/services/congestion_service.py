from typing import List, Dict, Any
from datetime import datetime
from ..database.database import get_database
from ..ml.predict import predict_congestion
from .vessel_service import get_all_vessels

def _clean_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if doc and "_id" in doc:
        del doc["_id"]
    return doc

def get_terminal_congestion_status() -> List[Dict[str, Any]]:
    """
    Computes terminal congestion using live vessel/berth counts and ML predictor,
    and stores/updates results in MongoDB congestion_predictions collection.
    """
    terminals = ["T1", "T2", "T3", "T4"]
    terminal_names = {
        "T1": "North Deepwater Terminal",
        "T2": "East Pier Container Terminal",
        "T3": "South Gateway Terminal",
        "T4": "West River Feeder Terminal"
    }

    # Fetch vessels and berths
    vessels = get_all_vessels()
    berths = []
    try:
        db = get_database()
        berths = [_clean_doc(b) for b in db.berths.find({})]
    except Exception:
        pass

    results = []
    db = None
    try:
        db = get_database()
    except Exception:
        pass

    for t_id in terminals:
        # Calculate vessel count and container volume for terminal
        sub_v = [v for v in vessels if str(v.get("current_terminal") or v.get("terminal_id", "")).upper() == t_id]
        v_count = len(sub_v)
        c_count = sum(int(v.get("container_count", 0)) for v in sub_v)

        # Calculate berth and crane availability
        sub_b = [b for b in berths if str(b.get("terminal_id", "")).upper() == t_id]
        if sub_b:
            avail_berths = len([b for b in sub_b if b.get("status") == "AVAILABLE" or b.get("available") is True])
            avail_cranes = sum(int(b.get("crane_count", 2)) for b in sub_b)
        else:
            avail_berths = 1
            avail_cranes = 3

        # Run ML Prediction
        pred = predict_congestion({
            "vessel_count": v_count,
            "container_count": c_count,
            "available_berths": avail_berths,
            "available_cranes": avail_cranes
        })

        expected_queue = max(0, v_count - max(avail_berths, 1))
        expected_wait = pred.get("predicted_wait_hours", 2.0)

        record = {
            "terminal_id": t_id,
            "terminal_name": terminal_names.get(t_id, f"Terminal {t_id}"),
            "prediction_time": datetime.now().isoformat(),
            "vessel_count": v_count,
            "container_count": c_count,
            "available_berths": avail_berths,
            "available_cranes": avail_cranes,
            "congestion_level": pred["level"],
            "probability": pred["probability"],
            "expected_queue": expected_queue,
            "expected_wait_hours": expected_wait,
            "predicted_wait_hours": expected_wait
        }

        # Persist prediction in MongoDB
        if db is not None:
            try:
                db.congestion_predictions.update_one(
                    {"terminal_id": t_id},
                    {"$set": record},
                    upsert=True
                )
            except Exception:
                pass

        results.append(record)

    return results

def get_terminal_congestion_by_id(terminal_id: str) -> Dict[str, Any]:
    """Retrieves congestion metrics for a single terminal from MongoDB or on-the-fly."""
    t_id_clean = terminal_id.strip().upper()
    try:
        db = get_database()
        doc = db.congestion_predictions.find_one({"terminal_id": t_id_clean})
        if doc:
            return _clean_doc(doc)
    except Exception:
        pass

    all_statuses = get_terminal_congestion_status()
    for item in all_statuses:
        if item["terminal_id"].upper() == t_id_clean:
            return item

    return {
        "terminal_id": terminal_id,
        "terminal_name": f"Terminal {terminal_id}",
        "prediction_time": datetime.now().isoformat(),
        "congestion_level": "LOW",
        "probability": 0.20,
        "expected_queue": 1,
        "expected_wait_hours": 1.5,
        "predicted_wait_hours": 1.5,
        "available_berths": 2,
        "available_cranes": 4,
        "vessel_count": 1,
        "container_count": 1000
    }

def save_congestion_prediction(prediction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Explicitly saves a congestion prediction document to MongoDB."""
    t_id = prediction_data.get("terminal_id")
    if not t_id:
        raise ValueError("terminal_id is required")
    db = get_database()
    clean_data = dict(prediction_data)
    if "_id" in clean_data:
        del clean_data["_id"]
    db.congestion_predictions.update_one({"terminal_id": t_id}, {"$set": clean_data}, upsert=True)
    return clean_data
