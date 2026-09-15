from typing import Dict, Any
from .route_scoring import score_route

TERMINAL_COORDINATES = {
    "T1": {"lat": 1.290, "lon": 103.850, "name": "North Deepwater Terminal"},
    "T2": {"lat": 1.295, "lon": 103.860, "name": "East Pier Container Terminal"},
    "T3": {"lat": 1.280, "lon": 103.840, "name": "South Gateway Terminal"},
    "T4": {"lat": 1.270, "lon": 103.830, "name": "West River Feeder Terminal"},
}

def evaluate_terminal_alternatives(
    vessel: Dict[str, Any],
    terminal_congestion_map: Dict[str, Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Evaluates alternate terminals and calculates scores for each.
    """
    current_terminal = vessel.get("current_terminal", "T1")
    vessel_size = vessel.get("vessel_size", "Large")
    
    scored_terminals = []
    
    for t_id, t_info in terminal_congestion_map.items():
        # Feasibility check for Ultra Large vessels
        if vessel_size == "Ultra Large" and t_id in ["T4"]:
            continue # T4 cannot berth Ultra Large
            
        cong_level = t_info.get("level", "LOW")
        cong_weights = {"LOW": 0.15, "MEDIUM": 0.5, "HIGH": 0.85, "CRITICAL": 1.0}
        cong_score = cong_weights.get(cong_level, 0.5)
        
        wait_hours = t_info.get("predicted_wait_hours", 2.0)
        wait_score = min(wait_hours / 15.0, 1.0)
        
        distance_penalty = 0.0 if t_id == current_terminal else 0.25
        capacity_score = 0.2 if t_info.get("available_berths", 1) > 0 else 0.9
        
        total_score = score_route(cong_score, wait_score, distance_penalty, capacity_score)
        
        scored_terminals.append({
            "terminal_id": t_id,
            "terminal_name": TERMINAL_COORDINATES.get(t_id, {}).get("name", t_id),
            "score": total_score,
            "congestion_level": cong_level,
            "estimated_wait_hours": wait_hours
        })
        
    scored_terminals.sort(key=lambda x: x["score"])
    return {
        "current_terminal": current_terminal,
        "options": scored_terminals
    }
