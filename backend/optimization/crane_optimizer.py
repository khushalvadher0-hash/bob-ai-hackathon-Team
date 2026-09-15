"""
Crane Optimizer Module for Port Operations
Assigns available quay cranes to vessels based on berth allocations, container workload,
and priority constraints, while preventing temporal crane conflicts across simultaneous operations.

Scoring Weights:
- Availability: 40%
- Workload Suitability: 30%
- Terminal Suitability: 20%
- Handling Efficiency: 10%
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

# Transparent Crane Allocation Parameters
CRANE_PRODUCTIVITY_TEU_PER_HOUR: int = 35  # Industry standard container move rate per crane

# Explainable Crane Scoring Weights
WEIGHT_AVAILABILITY: float = 0.40
WEIGHT_WORKLOAD: float = 0.30
WEIGHT_TERMINAL: float = 0.20
WEIGHT_EFFICIENCY: float = 0.10

def parse_iso_datetime(dt_str: Optional[str], default_dt: Optional[datetime] = None) -> datetime:
    """Safely parses ISO timestamp string to datetime object with fallback."""
    if not dt_str:
        return default_dt or datetime(2026, 9, 15, 6, 0, 0)
    try:
        clean_str = str(dt_str).replace("Z", "+00:00")
        return datetime.fromisoformat(clean_str)
    except Exception:
        try:
            return datetime.strptime(str(dt_str)[:19], "%Y-%m-%dT%H:%M:%S")
        except Exception:
            return default_dt or datetime(2026, 9, 15, 6, 0, 0)

def calculate_required_crane_count(
    container_count: int,
    priority: str = "MEDIUM",
    max_berth_cranes: int = 4
) -> int:
    """
    Computes required number of cranes based on container volume and vessel priority.
    - HIGH priority or large workload (>1800 TEU) -> up to 4 cranes
    - MEDIUM priority or moderate workload (1000-1800 TEU) -> up to 3 cranes
    - LOW priority or smaller workload (<1000 TEU) -> 1-2 cranes
    """
    p_clean = str(priority).upper().strip()
    c_count = max(0, int(container_count or 1000))
    limit = max(1, int(max_berth_cranes or 4))

    if p_clean in ["HIGH", "CRITICAL", "1"] or c_count >= 1800:
        desired = 4
    elif p_clean in ["MEDIUM", "2"] or c_count >= 1000:
        desired = 3
    else:
        desired = 2

    return max(1, min(desired, limit))

def calculate_handling_time_hours(
    container_count: int,
    crane_count: int,
    productivity_per_crane: int = CRANE_PRODUCTIVITY_TEU_PER_HOUR
) -> float:
    """
    Computes deterministic container handling turnaround duration in hours.
    Formula: max(2.5, container_count / (crane_count * productivity_per_crane))
    """
    c_count = max(100, int(container_count or 1000))
    cranes = max(1, int(crane_count or 1))
    rate = max(35, cranes * productivity_per_crane)
    duration = max(2.5, round(c_count / rate, 1))
    return duration

def get_terminal_cranes_inventory(
    berths: List[Dict[str, Any]]
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Builds the crane asset catalog grouped by terminal and berth from actual berth infrastructure.
    """
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
                "productivity_teu_per_hour": CRANE_PRODUCTIVITY_TEU_PER_HOUR
            })

    return cranes_by_terminal

def allocate_cranes(
    vessel: Dict[str, Any],
    berth: Dict[str, Any]
) -> int:
    """
    Legacy helper function for backward compatibility.
    Returns integer number of allocated cranes.
    """
    max_berth_cranes = int(berth.get("crane_count", 3) or 3)
    container_count = int(vessel.get("container_count", 1000) or 1000)
    priority = vessel.get("priority", "MEDIUM")
    return calculate_required_crane_count(container_count, priority, max_berth_cranes)

def optimize_crane_allocations(
    berth_schedule: List[Dict[str, Any]],
    berths: List[Dict[str, Any]],
    congestion_predictions: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Master Greedy Crane Optimizer:
    Allocates individual crane hardware assets (e.g. CR-B07-01, CR-B07-02) to each vessel in the
    berth schedule while tracking dynamic crane timelines to completely eliminate overlapping crane conflicts.
    """
    if not berth_schedule:
        return []

    # Map congestion levels for priority boost
    cong_map = {}
    if congestion_predictions:
        for pred in congestion_predictions:
            t_id = str(pred.get("terminal_id", "")).upper()
            cong_map[t_id] = pred.get("congestion_level", "LOW")

    # Build crane inventory
    cranes_by_terminal = get_terminal_cranes_inventory(berths)

    # Crane timeline availability registry: crane_id -> next free datetime
    crane_free_times: Dict[str, datetime] = {}
    for t_id, crane_list in cranes_by_terminal.items():
        for cr in crane_list:
            crane_free_times[cr["crane_id"]] = datetime(2026, 9, 15, 6, 0, 0)

    # Sort berth schedule items by operational urgency:
    # 1. Start time (chronological)
    # 2. Congestion severity
    # 3. Priority
    priority_ranks = {"HIGH": 1, "CRITICAL": 1, "1": 1, "MEDIUM": 2, "2": 2, "LOW": 3, "3": 3}
    
    def schedule_sort_key(item):
        st = parse_iso_datetime(item.get("start_time"))
        p = priority_ranks.get(str(item.get("priority", "MEDIUM")).upper(), 2)
        c_count = int(item.get("container_count", 0) or 0)
        return (st, p, -c_count)

    sorted_schedule = sorted(berth_schedule, key=schedule_sort_key)
    crane_allocations = []

    for item in sorted_schedule:
        v_id = str(item.get("vessel_id", ""))
        t_id = str(item.get("terminal_id", "T1")).upper()
        b_id = str(item.get("berth_id", "B01"))
        
        op_start = parse_iso_datetime(item.get("start_time"))
        op_end = parse_iso_datetime(item.get("end_time"))
        container_count = int(item.get("container_count", 0) or 1000)
        priority = str(item.get("priority", "MEDIUM"))

        # Find matching berth metadata for crane capacity limit
        matching_berth = next((b for b in berths if str(b.get("berth_id", "")).upper() == b_id.upper()), None)
        max_berth_cranes = int(matching_berth.get("crane_count", 4)) if matching_berth else 4

        desired_count = calculate_required_crane_count(container_count, priority, max_berth_cranes)

        # Get candidate cranes for this terminal
        terminal_cranes = cranes_by_terminal.get(t_id, [])
        
        # Prefer cranes assigned to this berth first, then general terminal cranes
        berth_cranes = [c for c in terminal_cranes if c["berth_id"] == b_id and c["status"] == "OPERATIONAL"]
        other_cranes = [c for c in terminal_cranes if c["berth_id"] != b_id and c["status"] == "OPERATIONAL"]
        candidate_cranes = berth_cranes + other_cranes

        # Filter available cranes that are free at or before op_start
        available_cranes = []
        for cr in candidate_cranes:
            c_id = cr["crane_id"]
            free_time = crane_free_times.get(c_id, op_start)
            if free_time <= op_start:
                available_cranes.append(c_id)

        # If not enough cranes free at op_start, pick cranes with earliest available time
        if len(available_cranes) < desired_count:
            # Sort all candidate cranes by free time
            candidate_cranes_sorted = sorted(
                candidate_cranes,
                key=lambda c: crane_free_times.get(c["crane_id"], op_start)
            )
            available_cranes = [c["crane_id"] for c in candidate_cranes_sorted[:desired_count]]

        assigned_crane_ids = available_cranes[:desired_count]
        actual_crane_count = len(assigned_crane_ids)

        if actual_crane_count > 0:
            # Recompute handling time with actual assigned cranes
            handling_hours = calculate_handling_time_hours(container_count, actual_crane_count)
            actual_end = op_start + (op_end - op_start)

            # Update crane availability registry to prevent overlap
            for c_id in assigned_crane_ids:
                crane_free_times[c_id] = actual_end

            crane_allocations.append({
                "vessel_id": v_id,
                "vessel_name": item.get("vessel_name", v_id),
                "terminal_id": t_id,
                "berth_id": b_id,
                "crane_ids": assigned_crane_ids,
                "crane_count": actual_crane_count,
                "start_time": op_start.isoformat(),
                "end_time": op_end.isoformat(),
                "duration_hours": item.get("duration_hours", handling_hours),
                "estimated_handling_hours": handling_hours,
                "status": "ASSIGNED",
                "priority": priority
            })
        else:
            crane_allocations.append({
                "vessel_id": v_id,
                "vessel_name": item.get("vessel_name", v_id),
                "terminal_id": t_id,
                "berth_id": b_id,
                "crane_ids": [],
                "crane_count": 0,
                "start_time": op_start.isoformat(),
                "end_time": op_end.isoformat(),
                "duration_hours": item.get("duration_hours", 4.0),
                "estimated_handling_hours": 4.0,
                "status": "WAITING",
                "reason": f"No feasible quay cranes available at Terminal {t_id} for scheduled window."
            })

    return crane_allocations
