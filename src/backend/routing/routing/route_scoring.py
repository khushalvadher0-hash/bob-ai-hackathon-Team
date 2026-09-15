"""
Alternate Route Scoring Module for Port Operations
Calculates explainable, normalized multi-criteria route scores for alternative container terminals.

Weight Configuration:
- Congestion Score: 40% (ML predicted level and probability)
- Waiting Time Score: 30% (Expected wait in hours)
- Distance Score: 20% (Relative terminal distance / navigation penalty)
- Capacity Score: 10% (Berth and crane availability ratio)
"""

from typing import Dict, Any

# Transparent scoring weights (Must sum to 1.0)
WEIGHT_CONGESTION: float = 0.40
WEIGHT_WAITING: float = 0.30
WEIGHT_DISTANCE: float = 0.20
WEIGHT_CAPACITY: float = 0.10

# Congestion severity penalty base mapping (lower is better)
CONGESTION_LEVEL_PENALTY = {
    "LOW": 0.15,
    "MEDIUM": 0.45,
    "HIGH": 0.75,
    "CRITICAL": 0.95
}

def calculate_congestion_score(congestion_level: str, probability: float = 0.5) -> float:
    """
    Computes a normalized congestion penalty score between 0.0 (free) and 1.0 (heavily congested).
    Incorporates both discrete level and ML model probability confidence.
    """
    lvl_clean = str(congestion_level).upper().strip()
    base_penalty = CONGESTION_LEVEL_PENALTY.get(lvl_clean, 0.50)
    prob = max(0.0, min(1.0, float(probability)))
    
    # Refine base penalty with actual ML probability (e.g. CRITICAL 90% is worse than CRITICAL 55%)
    # Blended score: 70% level category, 30% model probability
    score = (0.70 * base_penalty) + (0.30 * prob)
    return round(max(0.0, min(1.0, score)), 4)

def calculate_waiting_score(wait_hours: float, min_wait: float = 0.0, max_wait: float = 24.0) -> float:
    """
    Computes a normalized waiting time penalty score between 0.0 and 1.0.
    Lower wait time = lower penalty (better).
    """
    try:
        w = max(0.0, float(wait_hours))
    except (TypeError, ValueError):
        w = 2.0

    if max_wait <= min_wait:
        return 0.5
    
    normalized = (w - min_wait) / (max_wait - min_wait)
    return round(max(0.0, min(1.0, normalized)), 4)

def calculate_distance_score(dist_km: float, min_dist: float = 0.0, max_dist: float = 20.0) -> float:
    """
    Computes a normalized distance penalty score between 0.0 and 1.0.
    Closer distance = lower penalty (better).
    """
    try:
        d = max(0.0, float(dist_km))
    except (TypeError, ValueError):
        d = 0.0

    if max_dist <= min_dist:
        return 0.1
    
    normalized = (d - min_dist) / (max_dist - min_dist)
    return round(max(0.0, min(1.0, normalized)), 4)

def calculate_capacity_score(available_berths: int, total_berths: int = 3, available_cranes: int = 4, total_cranes: int = 8) -> float:
    """
    Computes a normalized capacity penalty score between 0.0 and 1.0.
    More free berths and cranes = lower penalty (better score).
    """
    try:
        avail_b = max(0, int(available_berths))
        tot_b = max(1, int(total_berths))
        avail_c = max(0, int(available_cranes))
        tot_c = max(1, int(total_cranes))
    except (TypeError, ValueError):
        return 0.5

    berth_ratio = avail_b / tot_b
    crane_ratio = avail_c / tot_c
    
    # Combined operational availability (higher is better, so penalty is 1 - availability)
    combined_availability = (0.60 * berth_ratio) + (0.40 * crane_ratio)
    penalty = 1.0 - combined_availability
    return round(max(0.0, min(1.0, penalty)), 4)

def score_route(
    congestion_score: float, # 0 (free) to 1.0 (congested)
    waiting_score: float,    # 0 (no wait) to 1.0 (long wait)
    distance_score: float,   # 0 (immediate) to 1.0 (far)
    capacity_score: float    # 0 (abundant capacity) to 1.0 (full)
) -> float:
    """
    Calculates weighted composite penalty score. Lower score is better.
    route_score = 0.40 * congestion + 0.30 * waiting + 0.20 * distance + 0.10 * capacity
    """
    c_score = max(0.0, min(1.0, float(congestion_score)))
    w_score = max(0.0, min(1.0, float(waiting_score)))
    d_score = max(0.0, min(1.0, float(distance_score)))
    cap_score = max(0.0, min(1.0, float(capacity_score)))

    composite_score = (
        WEIGHT_CONGESTION * c_score +
        WEIGHT_WAITING * w_score +
        WEIGHT_DISTANCE * d_score +
        WEIGHT_CAPACITY * cap_score
    )
    return round(composite_score, 3)
