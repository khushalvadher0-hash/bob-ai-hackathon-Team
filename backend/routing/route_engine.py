"""
Alternate Route Engine for Port Operations
Evaluates feasible terminal alternatives using live MongoDB vessel and port data,
and computes deterministic multi-criteria route scores based on Person 1's real ML congestion forecasts.
"""

import math
from typing import List, Dict, Any, Optional
from ..database.database import get_database
from .route_scoring import (
    score_route,
    calculate_congestion_score,
    calculate_waiting_score,
    calculate_distance_score,
    calculate_capacity_score
)

# Geographic Coordinates of Terminal Piers (Port Metro Complex)
TERMINAL_GEO = {
    "T1": {"name": "North Deepwater Terminal", "lat": 1.2902, "lon": 103.8519, "max_size": "Ultra Large"},
    "T2": {"name": "East Pier Container Terminal", "lat": 1.2954, "lon": 103.8640, "max_size": "Large"},
    "T3": {"name": "South Gateway Terminal", "lat": 1.2801, "lon": 103.8425, "max_size": "Ultra Large"},
    "T4": {"name": "West River Feeder Terminal", "lat": 1.2715, "lon": 103.8290, "max_size": "Feeder"}
}

# Size hierarchy for draft & pier compatibility checks
SIZE_RANKS = {
    "FEEDER": 1,
    "MEDIUM": 2,
    "LARGE": 3,
    "ULTRA LARGE": 4
}

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates approximate nautical distance in kilometers between two geo-coordinates."""
    r = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 2)

def is_terminal_compatible(vessel_size: str, terminal_id: str, berths: List[Dict[str, Any]]) -> bool:
    """
    Checks operational feasibility based on vessel size vs terminal berth draft constraints.
    """
    v_size_clean = str(vessel_size).upper().strip()
    v_rank = SIZE_RANKS.get(v_size_clean, 3)

    # 1. Check berths in database if available
    matching_berths = [b for b in berths if str(b.get("terminal_id", "")).upper() == terminal_id.upper()]
    if matching_berths:
        for b in matching_berths:
            b_max = str(b.get("max_vessel_size", "Large")).upper().strip()
            b_rank = SIZE_RANKS.get(b_max, 3)
            if b_rank >= v_rank:
                return True
        return False

    # 2. Fallback to terminal metadata
    t_info = TERMINAL_GEO.get(terminal_id.upper())
    if t_info:
        t_max_rank = SIZE_RANKS.get(t_info["max_size"].upper(), 3)
        return t_max_rank >= v_rank

    return True

def get_port_berths_from_db() -> List[Dict[str, Any]]:
    """Retrieves all berths from MongoDB with fallback."""
    try:
        db = get_database()
        cursor = db.berths.find({})
        berths = list(cursor)
        if berths:
            return berths
    except Exception:
        pass
    return []

def evaluate_terminal_alternatives(
    vessel: Dict[str, Any],
    terminal_congestion_map: Dict[str, Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Identifies feasible terminal alternatives, computes standardized 4-factor scores,
    and returns ranked alternative options for the vessel.
    """
    current_terminal = str(
        vessel.get("current_terminal") or 
        vessel.get("terminal_id") or 
        "T1"
    ).upper().strip()
    
    vessel_size = str(vessel.get("vessel_size", "Large"))
    berths = get_port_berths_from_db()
    
    current_term_coords = TERMINAL_GEO.get(current_terminal, {"lat": 1.290, "lon": 103.850})
    
    # Range bounds for normalization across terminals
    all_waits = [float(t.get("predicted_wait_hours") or t.get("expected_wait_hours") or 2.0) for t in terminal_congestion_map.values()]
    min_wait = min(all_waits) if all_waits else 0.0
    max_wait = max(all_waits) if all_waits else 20.0
    if min_wait == max_wait:
        max_wait = min_wait + 10.0

    scored_options = []

    for t_id, t_info in terminal_congestion_map.items():
        t_id_clean = t_id.upper().strip()
        
        # Operational Feasibility Check
        compatible = is_terminal_compatible(vessel_size, t_id_clean, berths)
        if not compatible:
            continue # Incompatible vessel size / draft constraint
        
        # 1. Congestion Score (40%)
        cong_level = t_info.get("congestion_level") or t_info.get("level") or "LOW"
        probability = float(t_info.get("probability", 0.50))
        c_score = calculate_congestion_score(cong_level, probability)

        # 2. Waiting Time Score (30%)
        wait_hours = float(t_info.get("predicted_wait_hours") or t_info.get("expected_wait_hours") or 2.0)
        w_score = calculate_waiting_score(wait_hours, min_wait, max_wait)

        # 3. Distance Score (20%)
        target_coords = TERMINAL_GEO.get(t_id_clean, {"lat": 1.290, "lon": 103.850})
        if t_id_clean == current_terminal:
            dist_km = 0.0
        else:
            dist_km = calculate_haversine_distance(
                current_term_coords["lat"], current_term_coords["lon"],
                target_coords["lat"], target_coords["lon"]
            )
        d_score = calculate_distance_score(dist_km, min_dist=0.0, max_dist=10.0)

        # 4. Capacity Score (10%)
        avail_b = int(t_info.get("available_berths", 1))
        tot_b = int(t_info.get("total_berths", 3))
        avail_c = int(t_info.get("available_cranes", 3))
        tot_c = int(t_info.get("total_cranes", 8))
        cap_score = calculate_capacity_score(avail_b, tot_b, avail_c, tot_c)

        # Total Composite Penalty Score (0.0 to 1.0, lower is better)
        total_score = score_route(c_score, w_score, d_score, cap_score)

        terminal_name = t_info.get("terminal_name") or TERMINAL_GEO.get(t_id_clean, {}).get("name", f"Terminal {t_id_clean}")

        scored_options.append({
            "terminal_id": t_id_clean,
            "terminal_name": terminal_name,
            "score": total_score,
            "congestion_level": cong_level,
            "probability": probability,
            "estimated_wait_hours": wait_hours,
            "distance_km": dist_km,
            "available_berths": avail_b,
            "available_cranes": avail_c,
            "is_current": (t_id_clean == current_terminal),
            "score_breakdown": {
                "congestion_score": c_score,
                "waiting_score": w_score,
                "distance_score": d_score,
                "capacity_score": cap_score
            }
        })

    # Sort candidates by composite penalty score (lowest penalty = best alternative)
    scored_options.sort(key=lambda x: x["score"])

    return {
        "vessel_id": vessel.get("vessel_id"),
        "current_terminal": current_terminal,
        "options": scored_options
    }
