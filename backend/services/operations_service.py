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

def generate_simple_72h_plan() -> List[Dict[str, Any]]:
    """
    Task 4: AI 72-Hour Scheduling Engine (generateOptimizedPlan)
    Steps:
      1. Sort vessels by Priority (HIGH first) then arrival time.
      2. For each vessel:
         - assign_best_berth (size fit, wait score)
         - assign_cranes (TEU workload tiered allocation)
         - calculate non-overlapping start/end times
      3. Track berth usage timeline to avoid overlap.
      4. Output structured plan with transparent AI reasoning (WHY).
    """
    from datetime import datetime, timedelta
    from ..optimization.berth_optimizer import assign_best_berth
    from ..optimization.crane_optimizer import assign_cranes

    vessels = get_all_vessels()
    raw_berths = get_berths_data()

    if not raw_berths:
        raw_berths = [
            {"berth_id": "B01", "terminal_id": "T1", "crane_count": 4, "max_vessel_size": "Ultra Large (ULCV)", "status": "AVAILABLE"},
            {"berth_id": "B02", "terminal_id": "T1", "crane_count": 4, "max_vessel_size": "Ultra Large (ULCV)", "status": "AVAILABLE"},
            {"berth_id": "B03", "terminal_id": "T1", "crane_count": 3, "max_vessel_size": "Neo-Panamax", "status": "AVAILABLE"},
            {"berth_id": "B04", "terminal_id": "T2", "crane_count": 4, "max_vessel_size": "Ultra Large (ULCV)", "status": "AVAILABLE"},
            {"berth_id": "B05", "terminal_id": "T2", "crane_count": 3, "max_vessel_size": "Neo-Panamax", "status": "AVAILABLE"},
            {"berth_id": "B06", "terminal_id": "T3", "crane_count": 3, "max_vessel_size": "Neo-Panamax", "status": "AVAILABLE"},
            {"berth_id": "B07", "terminal_id": "T3", "crane_count": 3, "max_vessel_size": "Neo-Panamax", "status": "AVAILABLE"},
            {"berth_id": "B08", "terminal_id": "T4", "crane_count": 2, "max_vessel_size": "Feeder", "status": "AVAILABLE"}
        ]

    # Timeline tracker: berth_id -> datetime when it becomes free
    berth_free_times: Dict[str, datetime] = {
        str(b.get("berth_id")): datetime.min for b in raw_berths if b.get("berth_id")
    }

    # Helper to parse arrival time
    def parse_arrival(v):
        arr = v.get("arrival_time") or v.get("eta")
        if isinstance(arr, datetime):
            return arr
        if isinstance(arr, str):
            try:
                return datetime.fromisoformat(arr.replace("Z", "+00:00").split("+")[0])
            except Exception:
                pass
        return datetime(2026, 9, 15, 8, 0)

    # Priority rank: HIGH (1) -> MEDIUM (2) -> LOW (3)
    def priority_rank(v):
        p = str(v.get("priority") or v.get("risk_level") or "LOW").upper()
        if "HIGH" in p or "CRIT" in p or p == "1":
            return 1
        if "MED" in p or p == "2":
            return 2
        return 3

    # 1. Sort vessels by Priority then Arrival Time
    sorted_vessels = sorted(vessels, key=lambda v: (priority_rank(v), parse_arrival(v)))

    plan_entries: List[Dict[str, Any]] = []

    for v in sorted_vessels:
        vessel_name = v.get("name") or v.get("vessel_name") or v.get("vessel_id") or "Vessel"
        arr_dt = parse_arrival(v)
        teu = int(v.get("container_count", v.get("teu", 1000)) or 1000)

        # 2. Smart Berth Allocation Engine
        best_berth_decision = assign_best_berth(v, raw_berths, berth_free_times)
        chosen_berth_id = best_berth_decision.get("berth_id", "B01")
        chosen_berth_obj = best_berth_decision.get("berth", {})

        # 3. Smart Crane Allocation Engine
        crane_decision = assign_cranes(v, chosen_berth_obj)
        cranes = crane_decision["cranes"]
        duration_hrs = crane_decision["duration_hours"]

        # 4. Scheduling start and end times without temporal overlap
        start_dt = best_berth_decision.get("start_time", arr_dt)
        if start_dt < arr_dt:
            start_dt = arr_dt
        end_dt = start_dt + timedelta(hours=duration_hrs)

        # Update berth tracker
        berth_free_times[chosen_berth_id] = end_dt

        # Check status
        has_delay = (start_dt > arr_dt)
        raw_status = str(v.get("status", "Scheduled")).capitalize()
        if has_delay:
            status = "Queued"
        elif raw_status in ["Approaching", "Queued"]:
            status = raw_status
        else:
            status = "Scheduled"

        wait_hrs = round(max(0.0, (start_dt - arr_dt).total_seconds() / 3600.0), 1)
        why_text = f"Allocated Berth {chosen_berth_id} with {cranes} cranes for {teu:,} TEU (duration: {duration_hrs}h, wait: {wait_hrs}h)."

        plan_entries.append({
            "time": start_dt.strftime("%Y-%m-%d %H:%M"),
            "vessel": vessel_name,
            "berth": chosen_berth_id,
            "cranes": cranes,
            "start_time": start_dt.isoformat(),
            "end_time": end_dt.isoformat(),
            "duration_hours": duration_hrs,
            "status": status,
            "reason": why_text,
            "why": why_text
        })

    return plan_entries


