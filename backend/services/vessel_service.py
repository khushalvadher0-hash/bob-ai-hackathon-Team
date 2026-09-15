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
    containers = doc.get("container_count", 0)
    try:
        containers = int(containers)
    except (ValueError, TypeError):
        containers = 0

    if priority == "HIGH" or containers > 1800:
        return "HIGH"
    elif priority == "MEDIUM":
        return "MEDIUM"
    return "LOW"

def get_all_vessels() -> List[Dict[str, Any]]:
    """Fetches all vessels from MongoDB, with fallback to CSV if database is empty/unreachable."""
    try:
        db = get_database()
        cursor = db.vessels.find({})
        vessels = []
        for doc in cursor:
            clean = _clean_doc(doc)
            clean["risk_level"] = assess_vessel_risk(clean)
            vessels.append(clean)
        if vessels:
            return vessels
    except Exception as e:
        print(f"Notice: reading vessels from CSV fallback ({e})")

    # Fallback to CSV if MongoDB collection is empty or unreachable
    if DATA_PATH.exists():
        df = pd.read_csv(DATA_PATH).fillna("")
        df["risk_level"] = df.apply(assess_vessel_risk, axis=1)
        return df.to_dict(orient="records")
    return []

def get_vessel_by_id(vessel_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single vessel by its vessel_id (case-insensitive)."""
    if not vessel_id:
        return None
    try:
        db = get_database()
        doc = db.vessels.find_one({"vessel_id": {"$regex": f"^{vessel_id}$", "$options": "i"}})
        if doc:
            clean = _clean_doc(doc)
            clean["risk_level"] = assess_vessel_risk(clean)
            return clean
    except Exception as e:
        print(f"Notice: searching vessel from fallback ({e})")

    all_vessels = get_all_vessels()
    for v in all_vessels:
        if str(v.get("vessel_id", "")).upper() == vessel_id.strip().upper():
            return v
    return None

def save_vessel(vessel_data: Dict[str, Any]) -> Dict[str, Any]:
    """Inserts or updates a vessel document in MongoDB."""
    v_id = vessel_data.get("vessel_id")
    if not v_id:
        raise ValueError("vessel_id is required")
    db = get_database()
    clean_data = dict(vessel_data)
    if "_id" in clean_data:
        del clean_data["_id"]
    db.vessels.update_one({"vessel_id": v_id}, {"$set": clean_data}, upsert=True)
    return clean_data
