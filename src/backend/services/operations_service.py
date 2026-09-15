from typing import List, Dict, Any, Optional
from pathlib import Path
from datetime import datetime
import pandas as pd
from ..database.database import get_database
from .vessel_service import get_all_vessels, get_vessel_by_id
from .congestion_service import get_terminal_congestion_status
from .routing_service import get_all_routing_recommendations_service
from ..optimization.berth_optimizer import optimize_berth_assignments
from ..optimization.crane_optimizer import optimize_crane_allocations, get_terminal_cranes_inventory
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

def get_optimized_berths_service() -> Dict[str, Any]:
    """
    Computes real-time optimized berth schedule using actual MongoDB/CSV vessel and berth data,
    incorporating alternate routing recommendations where appropriate.
    Persists resulting schedule into the 'operations' MongoDB collection.
    """
    vessels = get_all_vessels()
    berths = get_berths_data()

    # Collect routing recommendations to align target terminals
    routes_list = get_all_routing_recommendations_service()
    routing_map = {r["vessel_id"]: r for r in routes_list if "vessel_id" in r}

    optimized_result = optimize_berth_assignments(vessels, berths, routing_recommendations=routing_map)

    # Persist optimized assignments into MongoDB operations collection
    try:
        db = get_database()
        for item in optimized_result.get("schedule", []):
            op_doc = {
                "vessel_id": item.get("vessel_id"),
                "vessel_name": item.get("vessel_name"),
                "terminal_id": item.get("terminal_id"),
                "berth_id": item.get("berth_id"),
                "berth_name": item.get("berth_name"),
                "cranes": item.get("cranes"),
                "arrival_time": item.get("arrival_time"),
                "start_time": item.get("start_time"),
                "end_time": item.get("end_time"),
                "duration_hours": item.get("duration_hours"),
                "estimated_wait_hours": item.get("estimated_wait_hours"),
                "berth_score": item.get("berth_score"),
                "status": "ASSIGNED",
                "priority": item.get("priority", "MEDIUM")
            }
            db.operations.update_one(
                {"vessel_id": item.get("vessel_id")},
                {"$set": op_doc},
                upsert=True
            )
    except Exception as e:
        print(f"Notice: operational berth MongoDB persistence ({e})")

    return optimized_result

def get_vessel_berth_assignment_service(vessel_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves optimized berth assignment for a single vessel."""
    schedule_data = get_optimized_berths_service()
    for item in schedule_data.get("schedule", []):
        if str(item.get("vessel_id", "")).upper() == vessel_id.strip().upper():
            return item
    for item in schedule_data.get("unassigned", []):
        if str(item.get("vessel_id", "")).upper() == vessel_id.strip().upper():
            return item
    return None

def get_cranes_data() -> List[Dict[str, Any]]:
    """
    Returns actual optimized crane allocation results across scheduled operations.
    Fallback to static crane assets catalog if no vessels are scheduled.
    """
    vessels = get_all_vessels()
    berths = get_berths_data()
    congestion_predictions = get_terminal_congestion_status()

    # Get berth schedule
    berth_opt = get_optimized_berths_service()
    berth_schedule = berth_opt.get("schedule", [])

    if berth_schedule:
        # Optimize and return actual vessel-to-crane allocations
        allocations = optimize_crane_allocations(
            berth_schedule=berth_schedule,
            berths=berths,
            congestion_predictions=congestion_predictions
        )
        return allocations

    # Fallback to physical crane inventory catalog
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
    Computes complete 72-hour master operational plan integrating real vessel data,
    ML congestion predictions, alternate routing advice, berth optimization, and crane allocation.
    Persists master plan into MongoDB 'operations' collection.
    """
    vessels = get_all_vessels()
    berths = get_berths_data()
    terminals = get_terminal_congestion_status()
    cong_map = {t["terminal_id"]: t for t in terminals}

    plan = generate_72h_operations_plan(vessels, berths, cong_map)

    # Persist the full 72h operational plan into MongoDB
    try:
        db = get_database()
        for item in plan.get("operations", []):
            op_doc = {
                "vessel_id": item.get("vessel_id"),
                "vessel_name": item.get("vessel_name"),
                "terminal_id": item.get("terminal_id"),
                "berth_id": item.get("berth_id"),
                "berth_name": item.get("berth_name"),
                "crane_ids": item.get("crane_ids", []),
                "crane_count": item.get("crane_count", 2),
                "cranes": item.get("cranes", 2),
                "start_time": item.get("start_time"),
                "end_time": item.get("end_time"),
                "duration_hours": item.get("duration_hours"),
                "estimated_wait_hours": item.get("estimated_wait_hours"),
                "estimated_handling_hours": item.get("estimated_handling_hours"),
                "action": item.get("action", "Discharge & Load Containers"),
                "status": item.get("status", "SCHEDULED"),
                "priority": item.get("priority", "MEDIUM"),
                "created_at": datetime.now().isoformat()
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
