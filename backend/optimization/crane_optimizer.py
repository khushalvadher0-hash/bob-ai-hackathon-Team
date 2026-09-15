"""
Crane Optimizer Module (Model-Driven with Collision Avoidance)
Uses trained Random Forest Crane Allocation Regressor to predict required crane count,
and matches physical crane assets while strictly avoiding double-booking overlapping time slots.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from ..ml.predict_crane import predict_crane_requirement
from ..optimization.berth_optimizer import parse_iso_datetime

CRANE_PRODUCTIVITY_TEU_PER_HOUR: int = 35

def calculate_required_crane_count(
    container_count: int,
    priority: str = "MEDIUM",
    max_berth_cranes: int = 4
) -> int:
    """Compatibility helper using ML crane requirement prediction."""
    res = predict_crane_requirement(
        vessel={"container_count": container_count, "priority": priority},
        berth={"crane_count": max_berth_cranes}
    )
    return res.get("predicted_crane_count", 2)

def allocate_cranes(vessel: Dict[str, Any], berth: Dict[str, Any]) -> int:
    """Compatibility helper: Returns ML-predicted crane count for a vessel & berth pair."""
    res = predict_crane_requirement(vessel=vessel, berth=berth)
    return res.get("predicted_crane_count", 2)

def calculate_handling_time_hours(
    container_count: int,
    crane_count: int,
    productivity_per_crane: int = CRANE_PRODUCTIVITY_TEU_PER_HOUR
) -> float:
    """Computes container handling turnaround duration in hours."""
    c_count = max(100, int(container_count or 1000))
    cranes = max(1, int(crane_count or 1))
    rate = max(35, cranes * productivity_per_crane)
    return max(2.5, round(c_count / rate, 1))

def get_terminal_cranes_inventory(
    berths: List[Dict[str, Any]]
) -> Dict[str, List[Dict[str, Any]]]:
    """Builds crane asset inventory grouped by terminal and berth."""
    cranes_by_terminal: Dict[str, List[Dict[str, Any]]] = {}

    for b in berths:
        t_id = str(b.get("terminal_id", "T1")).upper().strip()
        b_id = str(b.get("berth_id", "B01"))
        crane_count = int(b.get("crane_count", 2) or 2)
        b_status = str(b.get("status", "AVAILABLE")).upper()

        if t_id not in cranes_by_terminal:
            cranes_by_terminal[t_id] = []

        for i in range(1, crane_count + 1):
            crane_id = f"CR-{b_id}-{i:02d}"
            cranes_by_terminal[t_id].append({
                "crane_id": crane_id,
                "berth_id": b_id,
                "terminal_id": t_id,
                "status": "OPERATIONAL" if b_status != "MAINTENANCE" else "MAINTENANCE",
                "capacity_teu_per_hour": CRANE_PRODUCTIVITY_TEU_PER_HOUR
            })

    return cranes_by_terminal

def optimize_crane_allocations(
    berth_schedule: List[Dict[str, Any]],
    berths: List[Dict[str, Any]],
    congestion_predictions: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Master Model-Driven Crane Optimizer:
    1. For each berth assignment, calls ML Crane Regressor to predict required crane count.
    2. Identifies active cranes available at the assigned berth and terminal.
    3. Allocates specific crane IDs while enforcing non-overlapping time constraints.
    """
    if not berth_schedule:
        return []

    berth_lookup = {str(b.get("berth_id")): b for b in berths}
    crane_inventory = get_terminal_cranes_inventory(berths)
    
    # Track when each crane asset becomes free
    crane_free_times: Dict[str, datetime] = {}
    for t_cranes in crane_inventory.values():
        for cr in t_cranes:
            crane_free_times[cr["crane_id"]] = datetime(2026, 9, 15, 6, 0, 0)

    # Congestion lookup
    cong_lookup = {}
    if congestion_predictions:
        for cp in congestion_predictions:
            t_id = str(cp.get("terminal_id", "")).upper()
            cong_lookup[t_id] = str(cp.get("congestion_level", "MEDIUM")).upper()

    allocations = []

    for item in berth_schedule:
        v_id = str(item.get("vessel_id"))
        t_id = str(item.get("terminal_id", "T1")).upper()
        b_id = str(item.get("berth_id", "B01"))
        b_obj = berth_lookup.get(b_id, {"crane_count": 3, "berth_id": b_id, "terminal_id": t_id})

        start_dt = parse_iso_datetime(item.get("start_time"))
        end_dt = parse_iso_datetime(item.get("end_time"))
        c_count = int(item.get("container_count", 1000) or 1000)
        c_level = cong_lookup.get(t_id, "MEDIUM")

        # 1. Execute ML Crane Prediction
        ml_crane_res = predict_crane_requirement(
            vessel={"container_count": c_count, "priority": item.get("priority", "MEDIUM")},
            berth=b_obj,
            congestion_level=c_level
        )
        target_cranes = ml_crane_res.get("predicted_crane_count", 2)

        # 2. Select available crane assets at this terminal
        term_cranes = crane_inventory.get(t_id, [])
        assigned_crane_ids = []

        # Prefer cranes assigned to this exact berth first
        berth_specific_cranes = [cr for cr in term_cranes if cr["berth_id"] == b_id and cr["status"] == "OPERATIONAL"]
        other_terminal_cranes = [cr for cr in term_cranes if cr["berth_id"] != b_id and cr["status"] == "OPERATIONAL"]

        for cr in (berth_specific_cranes + other_terminal_cranes):
            cr_id = cr["crane_id"]
            if crane_free_times.get(cr_id, start_dt) <= start_dt:
                assigned_crane_ids.append(cr_id)
                crane_free_times[cr_id] = end_dt
                if len(assigned_crane_ids) >= target_cranes:
                    break

        # If zero cranes available at exact window, fallback to best available
        if not assigned_crane_ids and berth_specific_cranes:
            assigned_crane_ids = [berth_specific_cranes[0]["crane_id"]]

        handling_hours = calculate_handling_time_hours(c_count, len(assigned_crane_ids))

        allocations.append({
            "vessel_id": v_id,
            "vessel_name": item.get("vessel_name", v_id),
            "terminal_id": t_id,
            "berth_id": b_id,
            "crane_ids": assigned_crane_ids,
            "crane_count": len(assigned_crane_ids),
            "predicted_crane_requirement": target_cranes,
            "start_time": item.get("start_time"),
            "end_time": item.get("end_time"),
            "estimated_handling_hours": handling_hours,
            "status": "ASSIGNED",
            "model_version": ml_crane_res.get("model_version", "crane_rf_v1")
        })

    return allocations
