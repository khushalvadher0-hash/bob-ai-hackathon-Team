from typing import Dict, Any
from .route_engine import evaluate_terminal_alternatives

def get_routing_recommendation(
    vessel: Dict[str, Any],
    terminal_congestion_map: Dict[str, Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Generates actionable rerouting advice for a vessel based on terminal congestion.
    """
    eval_result = evaluate_terminal_alternatives(vessel, terminal_congestion_map)
    current_term = eval_result["current_terminal"]
    options = eval_result["options"]
    
    best_option = options[0] if options else {"terminal_id": current_term, "score": 0.5, "estimated_wait_hours": 3.0}
    
    should_reroute = best_option["terminal_id"] != current_term and best_option["score"] < 0.65
    
    if should_reroute:
        reason = f"Lower predicted congestion at {best_option['terminal_name']} saving ~{max(1.0, 6.0 - best_option['estimated_wait_hours']):.1f}h queue time."
        rec_term = best_option["terminal_id"]
    else:
        reason = "Current terminal schedule remains optimal given navigation cost and draft constraints."
        rec_term = current_term
        
    return {
        "vessel_id": vessel.get("vessel_id"),
        "vessel_name": vessel.get("vessel_name"),
        "current_terminal": current_term,
        "recommended_terminal": rec_term,
        "score": best_option["score"],
        "reason": reason,
        "estimated_wait_hours": best_option["estimated_wait_hours"],
        "all_options": options
    }
