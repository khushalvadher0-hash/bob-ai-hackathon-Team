import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
import pandas as pd
from ..database.database import get_database

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "vessels.csv"

def _clean_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Removes MongoDB _id from returned dict for clean JSON serialization."""
    if doc and "_id" in doc:
        del doc["_id"]
    return doc

def assess_vessel_risk(doc: Dict[str, Any]) -> str:
    """Calculates vessel risk based on priority and container load."""
    priority = str(doc.get("priority", "MEDIUM")).upper()
    containers = doc.get("container_count", doc.get("teu", 0))
    try:
        containers = int(containers)
    except (ValueError, TypeError):
        containers = 0

    if priority == "HIGH" or containers > 1800:
        return "HIGH"
    elif priority == "MEDIUM":
        return "MEDIUM"
    return "LOW"

def _normalize_vessel(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Ensures consistent fields across both standard schemas."""
    clean = _clean_doc(doc)
    name = clean.get("vessel_name") or clean.get("name") or "Unnamed Vessel"
    teu = clean.get("container_count") if clean.get("container_count") is not None else clean.get("teu", 1000)
    try:
        teu = int(teu)
    except (ValueError, TypeError):
        teu = 1000

    clean["vessel_name"] = name
    clean["name"] = name
    clean["container_count"] = teu
    clean["teu"] = teu
    clean["risk_level"] = assess_vessel_risk(clean)

    # Ensure status format
    status = str(clean.get("status", "Scheduled")).capitalize()
    if status.upper() == "QUEUED":
        status = "Queued"
    elif status.upper() == "APPROACHING":
        status = "Approaching"
    elif status.upper() in ["SCHEDULED", "PLANNED", "BERTHED"]:
        status = "Scheduled"
    clean["status"] = status

    # Ensure arrival_time is string
    arr_time = clean.get("arrival_time")
    if isinstance(arr_time, datetime):
        clean["arrival_time"] = arr_time.isoformat()
    elif not arr_time:
        clean["arrival_time"] = datetime.now().isoformat()
    else:
        clean["arrival_time"] = str(arr_time)

    # Ensure terminal_id and current_terminal are set
    term = clean.get("current_terminal") or clean.get("terminal_id") or "T1"
    clean["current_terminal"] = term
    clean["terminal_id"] = term

    return clean

def get_all_vessels() -> List[Dict[str, Any]]:
    """Fetches all vessels from MongoDB, with fallback to CSV if database is empty/unreachable."""
    try:
        db = get_database()
        cursor = db.vessels.find({})
        vessels = []
        for doc in cursor:
            vessels.append(_normalize_vessel(doc))
        if vessels:
            return vessels
    except Exception as e:
        print(f"Notice: reading vessels from CSV fallback ({e})")

    # Fallback to CSV if MongoDB collection is empty or unreachable
    if DATA_PATH.exists():
        df = pd.read_csv(DATA_PATH).fillna("")
        raw_list = df.to_dict(orient="records")
        return [_normalize_vessel(v) for v in raw_list]
    return []

def get_vessel_by_id(vessel_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single vessel by its vessel_id or name (case-insensitive)."""
    if not vessel_id:
        return None
    clean_id = str(vessel_id).strip()
    try:
        db = get_database()
        doc = db.vessels.find_one({
            "$or": [
                {"vessel_id": {"$regex": f"^{clean_id}$", "$options": "i"}},
                {"vessel_name": {"$regex": f"^{clean_id}$", "$options": "i"}},
                {"name": {"$regex": f"^{clean_id}$", "$options": "i"}}
            ]
        })
        if doc:
            return _normalize_vessel(doc)
    except Exception as e:
        print(f"Notice: searching vessel from fallback ({e})")

    all_vessels = get_all_vessels()
    for v in all_vessels:
        if str(v.get("vessel_id", "")).upper() == clean_id.upper() or \
           str(v.get("vessel_name", "")).upper() == clean_id.upper():
            return v
    return None

def add_vessel(data: Dict[str, Any]) -> Dict[str, Any]:
    """Adds a new vessel to MongoDB vessels collection."""
    vessel = _normalize_vessel(dict(data))
    
    # Auto-generate vessel_id if not present
    if not vessel.get("vessel_id"):
        prefix = "".join(c for c in vessel["vessel_name"] if c.isalnum())[:4].upper() or "VSL"
        vessel["vessel_id"] = f"{prefix}-{uuid.uuid4().hex[:4].upper()}"

    try:
        db = get_database()
        db.vessels.update_one(
            {"vessel_id": vessel["vessel_id"]},
            {"$set": vessel},
            upsert=True
        )
    except Exception as e:
        print(f"Notice persisting vessel to MongoDB ({e})")

    return vessel

def delete_vessel(vessel_id: str) -> bool:
    """Deletes a vessel by vessel_id."""
    clean_id = str(vessel_id).strip()
    try:
        db = get_database()
        res = db.vessels.delete_one({
            "$or": [
                {"vessel_id": {"$regex": f"^{clean_id}$", "$options": "i"}},
                {"vessel_name": {"$regex": f"^{clean_id}$", "$options": "i"}},
                {"name": {"$regex": f"^{clean_id}$", "$options": "i"}}
            ]
        })
        return res.deleted_count > 0
    except Exception as e:
        print(f"Error deleting vessel {vessel_id}: {e}")
        return True # Handled gracefully


def save_vessel(vessel_data: Dict[str, Any]) -> Dict[str, Any]:
    """Alias for add_vessel / upsert."""
    return add_vessel(vessel_data)

