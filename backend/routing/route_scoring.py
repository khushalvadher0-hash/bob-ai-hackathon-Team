from typing import List, Dict, Any

def score_route(
    congestion_score: float, # 0 (free) to 1.0 (heavily congested)
    waiting_score: float,    # 0 (no wait) to 1.0 (long wait)
    distance_score: float,   # normalized distance penalty 0 to 1.0
    capacity_score: float    # 0 (abundant capacity) to 1.0 (full)
) -> float:
    """
    Calculates weighted route penalty score. Lower score is better.
    route_score = 0.40 * congestion_score + 0.30 * waiting_score + 0.20 * distance_score + 0.10 * capacity_score
    """
    score = (
        0.40 * congestion_score +
        0.30 * waiting_score +
        0.20 * distance_score +
        0.10 * capacity_score
    )
    return round(score, 3)
