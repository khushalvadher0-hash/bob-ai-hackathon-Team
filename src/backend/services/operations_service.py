from typing import List, Dict, Any
from pathlib import Path
import pandas as pd
from ..database.database import get_database
from .vessel_service import get_all_vessels
from .congestion_service import get_terminal_congestion_status
from ..planner.planner_72h import generate_72h_operations_plan

BASE_DIR = Path(__file__).resolve().parent.parent
BERTHS_PATH = BASE_DIR / "data" / "berths.csv"

def _clean_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if doc and "_id" in doc:
        del doc["_id"]
    return doc

def get_berths_data() -> List[Dict[str, Any]]:
    """Fetches all berths from MongoDB, with fallback to CSV."""
    try:
        db = get_database()
        berths = [_clean_doc(b) for b in db.berths.find({})]
        if berths:
            return berths
    except Exception as e:
        print(f"Notice: reading berths from CSV fallback ({e})")

    if BERTHS_PATH.exists():
        df = pd.read_csv(BERTHS_PATH).fillna("")
        return df.to_dict(orient="records")
    return []

def get_cranes_data() -> List[Dict[str, Any]]:
    """Generates crane asset list based on berths collection."""
    berths = get_berths_data()
    cranes = []
    for b in berths:
        crane_count = b.get("crane_count", 2)
        try:
            crane_count = int(crane_count)
        except (ValueError, TypeError):
            crane_count = 2
        for i in range(1, crane_count + 1):
            cranes.append({
                "crane_id": f"CR-{b.get('berth_id')}-{i:02d}",
                "berth_id": b.get("berth_id"),
                "terminal_id": b.get("terminal_id"),
                "status": "OPERATIONAL" if b.get("status") != "MAINTENANCE" else "MAINTENANCE",
                "capacity_teu_per_hour": 35
            })
    return cranes

def get_72h_plan_service() -> Dict[str, Any]:
    """
    Computes rolling 72-hour operational plan and persists the assignments into
    the MongoDB 'operations' collection.
    """
    vessels = get_all_vessels()
    berths = get_berths_data()
    terminals = get_terminal_congestion_status()
    cong_map = {t["terminal_id"]: t for t in terminals}

    plan = generate_72h_operations_plan(vessels, berths, cong_map)

    # Persist the operations into MongoDB
    try:
        db = get_database()
        for item in plan.get("schedule", []):
            op_doc = {
                "vessel_id": item.get("vessel_id"),
                "vessel_name": item.get("vessel_name"),
                "terminal_id": item.get("terminal_id"),
                "berth_id": item.get("berth_id"),
                "cranes": item.get("cranes"),
                "start_time": item.get("start_time"),
                "end_time": item.get("end_time"),
                "action": item.get("action", "BERTH_ASSIGNED"),
                "status": "PLANNED",
                "priority": item.get("priority", "MEDIUM")
            }
            db.operations.update_one(
                {"vessel_id": item.get("vessel_id")},
                {"$set": op_doc},
                upsert=True
            )
    except Exception as e:
        print(f"Notice: operational plan MongoDB persistence ({e})")

    return plan

def save_operation(operation_data: Dict[str, Any]) -> Dict[str, Any]:
    """Saves a single operation record into MongoDB."""
    v_id = operation_data.get("vessel_id")
    if not v_id:
        raise ValueError("vessel_id is required")
    db = get_database()
    clean_data = dict(operation_data)
    if "_id" in clean_data:
        del clean_data["_id"]
    db.operations.update_one({"vessel_id": v_id}, {"$set": clean_data}, upsert=True)
    return clean_data
