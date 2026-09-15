"""
Berth Optimizer Module for Port Operations
Assigns incoming and queued vessels to optimal, draft-compatible berths using
a deterministic, priority-aware greedy scheduling algorithm that eliminates temporal overlaps.

Scoring Weights (sum = 1.0):
- Berth Availability / Status: 35%
- Waiting-time Reduction: 30%
- Vessel-Berth Physical Fit: 20%
- Terminal Suitability: 15%
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta

# Transparent Scoring Weights
WEIGHT_AVAILABILITY: float = 0.35
WEIGHT_WAITING: float = 0.30
WEIGHT_FIT: float = 0.20
WEIGHT_TERMINAL: float = 0.15

# Vessel & Berth Size Hierarchy (Rank 1: Feeder -> Rank 4: Ultra Large)
SIZE_RANKS = {
    "FEEDER": 1,
    "MEDIUM": 2,
    "LARGE": 3,
    "ULTRA LARGE": 4
}

# Operational Priority Weighting (Rank 1: Highest operational urgency)
PRIORITY_ORDER = {
    "HIGH": 1,
    "1": 1,
    1: 1,
    "MEDIUM": 2,
    "2": 2,
    2: 2,
    "LOW": 3,
    "3": 3,
    3: 3
}

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

def estimate_service_duration_hours(vessel: Dict[str, Any], berth: Dict[str, Any]) -> float:
    """
    Computes explainable container service duration (hours) based on TEU volume and crane count.
    Formula: max(2.5, container_count / (cranes * 35 TEU/hour))
    """
    try:
        containers = int(vessel.get("container_count", 1000))
    except (ValueError, TypeError):
        containers = 1000

    try:
        cranes = int(berth.get("crane_count", 2))
    except (ValueError, TypeError):
        cranes = 2

    handling_productivity_per_hour = max(35, cranes * 35) # 35 TEU per crane per hour
    raw_duration = containers / handling_productivity_per_hour
    duration_hours = max(2.5, round(raw_duration, 1))
    return duration_hours

def check_berth_feasibility(vessel: Dict[str, Any], berth: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validates operational constraints:
    1. Berth status (must not be in MAINTENANCE or permanently INACTIVE)
    2. Physical draft / vessel size compatibility (vessel_size <= max_vessel_size)
    3. Container capacity constraint (if specified)
    """
    berth_status = str(berth.get("status", "AVAILABLE")).upper().strip()
    if berth_status == "MAINTENANCE" or berth_status == "INACTIVE":
        return False, f"Berth {berth.get('berth_id')} is under maintenance/inactive."

    v_size = str(vessel.get("vessel_size", "Large")).upper().strip()
    b_max_size = str(berth.get("max_vessel_size", "Large")).upper().strip()

    v_rank = SIZE_RANKS.get(v_size, 3)
    b_rank = SIZE_RANKS.get(b_max_size, 3)

    if v_rank > b_rank:
        return False, f"Vessel size '{v_size}' exceeds berth maximum '{b_max_size}'."

    # Capacity check if berth capacity is specified
    try:
        b_capacity = int(berth.get("capacity", 0))
        v_containers = int(vessel.get("container_count", 0))
        if b_capacity > 0 and v_containers > b_capacity * 1.5:
            return False, f"Vessel cargo ({v_containers} TEU) exceeds berth throughput limit."
    except (ValueError, TypeError):
        pass

    return True, "Feasible"

def calculate_berth_score(
    vessel: Dict[str, Any],
    berth: Dict[str, Any],
    berth_free_time: datetime,
    vessel_arrival_time: datetime,
    target_terminal: str
) -> Tuple[float, Dict[str, float]]:
    """
    Computes explainable 4-factor composite berth score (0.0 to 1.0, higher is better):
    1. Availability Score (35%): Based on immediate or ready availability
    2. Waiting-time Score (30%): Lower wait -> higher score
    3. Vessel-Berth Fit Score (20%): Proximity of vessel size to berth rating
    4. Terminal Suitability Score (15%): Match with target/recommended terminal
    """
    # 1. Availability (35%)
    raw_status = str(berth.get("status", "AVAILABLE")).upper()
    avail_score = 1.0 if raw_status == "AVAILABLE" else 0.5

    # 2. Waiting-Time Score (30%)
    wait_seconds = max(0.0, (berth_free_time - vessel_arrival_time).total_seconds())
    wait_hours = wait_seconds / 3600.0
    # Normalize: 0 hours wait = 1.0; 24+ hours wait = 0.0
    wait_score = max(0.0, min(1.0, 1.0 - (wait_hours / 24.0)))

    # 3. Fit Score (20%)
    v_size = str(vessel.get("vessel_size", "Large")).upper().strip()
    b_max_size = str(berth.get("max_vessel_size", "Large")).upper().strip()
    v_rank = SIZE_RANKS.get(v_size, 3)
    b_rank = SIZE_RANKS.get(b_max_size, 3)
    # Exact size match gives highest score (efficient resource use)
    size_diff = abs(b_rank - v_rank)
    fit_score = max(0.4, 1.0 - (size_diff * 0.25))

    # 4. Terminal Suitability Score (15%)
    b_terminal = str(berth.get("terminal_id", "")).upper().strip()
    target_clean = str(target_terminal).upper().strip()
    if b_terminal == target_clean:
        terminal_score = 1.0
    else:
        terminal_score = 0.50 # Penalty for cross-terminal assignment

    composite_score = (
        WEIGHT_AVAILABILITY * avail_score +
        WEIGHT_WAITING * wait_score +
        WEIGHT_FIT * fit_score +
        WEIGHT_TERMINAL * terminal_score
    )

    breakdown = {
        "availability_score": round(avail_score, 3),
        "waiting_score": round(wait_score, 3),
        "fit_score": round(fit_score, 3),
        "terminal_score": round(terminal_score, 3)
    }

    return round(composite_score, 3), breakdown

def find_best_berth(
    vessel: Dict[str, Any],
    berths: List[Dict[str, Any]],
    berth_available_times: Optional[Dict[str, datetime]] = None
) -> Optional[Dict[str, Any]]:
    """
    Greedy evaluation: selects the single highest-scoring feasible berth for a vessel.
    """
    if not berths:
        return None

    target_terminal = str(
        vessel.get("recommended_terminal") or 
        vessel.get("current_terminal") or 
        vessel.get("terminal_id") or 
        "T1"
    ).upper().strip()

    v_arrival = parse_iso_datetime(vessel.get("arrival_time"))
    
    if berth_available_times is None:
        berth_available_times = {}

    candidates = []

    for berth in berths:
        b_id = str(berth.get("berth_id", ""))
        is_feasible, _ = check_berth_feasibility(vessel, berth)
        if not is_feasible:
            continue

        b_free_time = berth_available_times.get(
            b_id,
            parse_iso_datetime(berth.get("available_from"), default_dt=v_arrival)
        )

        score, breakdown = calculate_berth_score(
            vessel=vessel,
            berth=berth,
            berth_free_time=b_free_time,
            vessel_arrival_time=v_arrival,
            target_terminal=target_terminal
        )

        candidates.append({
            "berth": berth,
            "score": score,
            "breakdown": breakdown,
            "berth_free_time": b_free_time
        })

    if not candidates:
        return None

    # Pick candidate with highest composite score
    candidates.sort(key=lambda x: x["score"], reverse=True)
    return candidates[0]["berth"]

def optimize_berth_assignments(
    vessels: List[Dict[str, Any]],
    berths: List[Dict[str, Any]],
    routing_recommendations: Optional[Dict[str, Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Master Greedy Berth Optimizer:
    1. Sorts vessels by (Operational Priority, Arrival Time, Container Load).
    2. Integrates recommended terminals from alternate routing module.
    3. Finds best feasible berth per vessel via 4-factor scoring.
    4. Enforces strict temporal non-overlapping windows (adds 30-min buffer between turns).
    5. Returns structured schedule and summary metrics.
    """
    if not vessels:
        return {
            "total_vessels": 0,
            "assigned_vessels": 0,
            "waiting_vessels": 0,
            "average_wait_hours": 0.0,
            "schedule": [],
            "unassigned": []
        }

    # 1. Sort vessels by operational priority
    def vessel_sort_key(v):
        p_val = v.get("priority", "MEDIUM")
        p_rank = PRIORITY_ORDER.get(str(p_val).upper(), 2)
        arr_dt = parse_iso_datetime(v.get("arrival_time"))
        c_count = int(v.get("container_count", 0) or 0)
        return (p_rank, arr_dt, -c_count)

    sorted_vessels = sorted(vessels, key=vessel_sort_key)

    # 2. Initialize berth timeline registry to prevent overlapping assignments
    berth_timeline: Dict[str, datetime] = {}
    for b in berths:
        b_id = str(b.get("berth_id", ""))
        init_avail = parse_iso_datetime(b.get("available_from"), default_dt=datetime(2026, 9, 15, 6, 0, 0))
        berth_timeline[b_id] = init_avail

    assigned_schedule = []
    unassigned_vessels = []

    # 3. Greedy assignment loop
    for v in sorted_vessels:
        v_id = str(v.get("vessel_id", ""))
        v_name = str(v.get("vessel_name", v_id))
        
        # Inject recommended terminal if provided by routing module
        target_term = None
        if routing_recommendations and v_id in routing_recommendations:
            target_term = routing_recommendations[v_id].get("recommended_terminal")
        if not target_term:
            target_term = v.get("recommended_terminal") or v.get("current_terminal") or v.get("terminal_id") or "T1"

        v_copy = dict(v)
        v_copy["recommended_terminal"] = target_term

        v_arrival = parse_iso_datetime(v.get("arrival_time"))

        # Evaluate candidate berths with current timeline
        candidates = []
        for b in berths:
            b_id = str(b.get("berth_id", ""))
            is_feasible, reason = check_berth_feasibility(v_copy, b)
            if not is_feasible:
                continue

            b_free = berth_timeline.get(b_id, v_arrival)
            score, breakdown = calculate_berth_score(
                vessel=v_copy,
                berth=b,
                berth_free_time=b_free,
                vessel_arrival_time=v_arrival,
                target_terminal=str(target_term)
            )
            candidates.append({
                "berth": b,
                "score": score,
                "breakdown": breakdown,
                "b_free": b_free
            })

        if not candidates:
            unassigned_vessels.append({
                "vessel_id": v_id,
                "vessel_name": v_name,
                "terminal_id": target_term,
                "berth_id": None,
                "status": "WAITING",
                "reason": "No draft-compatible or operational berth available."
            })
            continue

        # Choose highest-scoring feasible berth
        candidates.sort(key=lambda x: x["score"], reverse=True)
        best_candidate = candidates[0]
        selected_berth = best_candidate["berth"]
        berth_id = str(selected_berth.get("berth_id", ""))

        # Non-overlapping time window calculation
        b_avail_time = berth_timeline.get(berth_id, v_arrival)
        start_time = max(v_arrival, b_avail_time)
        wait_seconds = max(0.0, (start_time - v_arrival).total_seconds())
        wait_hours = round(wait_seconds / 3600.0, 1)

        duration_hours = estimate_service_duration_hours(v_copy, selected_berth)
        end_time = start_time + timedelta(hours=duration_hours)

        # Advance berth availability timeline with 30-minute safety buffer
        berth_timeline[berth_id] = end_time + timedelta(minutes=30)

        cranes_count = int(selected_berth.get("crane_count", 2))

        assigned_schedule.append({
            "vessel_id": v_id,
            "vessel_name": v_name,
            "terminal_id": selected_berth.get("terminal_id", target_term),
            "berth_id": berth_id,
            "berth_name": selected_berth.get("terminal_name") or f"Berth {berth_id}",
            "cranes": cranes_count,
            "arrival_time": v_arrival.isoformat(),
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_hours": duration_hours,
            "estimated_wait_hours": wait_hours,
            "berth_score": best_candidate["score"],
            "score_breakdown": best_candidate["breakdown"],
            "status": "ASSIGNED",
            "priority": v.get("priority", "MEDIUM")
        })

    # Sort final schedule by start_time
    assigned_schedule.sort(key=lambda x: x["start_time"])

    total_wait = sum(item["estimated_wait_hours"] for item in assigned_schedule)
    avg_wait = round(total_wait / max(len(assigned_schedule), 1), 1)

    return {
        "total_vessels": len(vessels),
        "assigned_vessels": len(assigned_schedule),
        "waiting_vessels": len(unassigned_vessels),
        "average_wait_hours": avg_wait,
        "schedule": assigned_schedule,
        "unassigned": unassigned_vessels
    }
