"""
Alternate Route Recommendations Module
Synthesizes route options, compares current terminal vs alternatives,
calculates wait hour reductions, and generates clear, explainable reasoning.
"""

from typing import Dict, Any, Optional
from .route_engine import evaluate_terminal_alternatives

def build_recommendation_reason(
    current_term_id: str,
    recommended_term_id: str,
    current_option: Optional[Dict[str, Any]],
    best_option: Dict[str, Any],
    wait_reduction: float
) -> str:
    """Generates human-readable, explainable reasoning based on actual score comparisons."""
    if current_term_id == recommended_term_id:
        c_level = best_option.get("congestion_level", "LOW")
        return f"Current terminal {current_term_id} operates with acceptable {c_level} congestion. Maintaining existing schedule avoids transit overhead."

    reasons = []
    
    # 1. Congestion comparison
    curr_cong = current_option.get("congestion_level") if current_option else "HIGH"
    rec_cong = best_option.get("congestion_level", "LOW")
    if curr_cong in ["HIGH", "CRITICAL"] and rec_cong in ["LOW", "MEDIUM"]:
        reasons.append(f"alleviates {curr_cong} congestion at {current_term_id} by diverting to {best_option['terminal_name']} ({rec_cong} load)")

    # 2. Waiting time savings
    if wait_reduction >= 1.0:
        reasons.append(f"saves approximately {wait_reduction:.1f} hours of turnaround queue time")

    # 3. Capacity & Berths
    rec_berths = best_option.get("available_berths", 0)
    if rec_berths > 0:
        reasons.append(f"secures immediate docking at {rec_berths} available berth(s)")

    if not reasons:
        reasons.append(f"provides lower composite penalty score ({best_option['score']}) compared to current terminal")

    explanation = f"Recommended because {best_option['terminal_name']} " + ", and ".join(reasons) + "."
    return explanation

def get_routing_recommendation(
    vessel: Dict[str, Any],
    terminal_congestion_map: Dict[str, Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Computes dynamic alternate routing recommendation for a vessel.
    Returns complete comparison between current terminal and best feasible alternative.
    """
    eval_result = evaluate_terminal_alternatives(vessel, terminal_congestion_map)
    current_term = eval_result["current_terminal"]
    options = eval_result["options"]

    if not options:
        return {
            "vessel_id": vessel.get("vessel_id"),
            "vessel_name": vessel.get("vessel_name"),
            "current_terminal": current_term,
            "recommended_terminal": None,
            "current_wait_hours": 0.0,
            "estimated_wait_hours": 0.0,
            "wait_reduction_hours": 0.0,
            "route_score": 0.0,
            "score_breakdown": {},
            "reason": "No feasible alternative terminal is currently available due to draft/size constraints.",
            "all_options": []
        }

    # Find the current terminal's option metrics
    current_option = next((opt for opt in options if opt["terminal_id"] == current_term), None)
    current_wait = float(current_option.get("estimated_wait_hours", 2.0)) if current_option else 2.0
    current_cong = current_option.get("congestion_level", "LOW") if current_option else "LOW"

    # Evaluate best alternative terminal excluding current terminal
    alternatives = [opt for opt in options if opt["terminal_id"] != current_term]
    
    # Decision: should we reroute?
    # Reroute if current terminal is congested (HIGH/CRITICAL) and a better alternative exists
    is_current_congested = current_cong in ["HIGH", "CRITICAL"]
    
    if alternatives:
        best_alt = alternatives[0]
        alt_wait = float(best_alt.get("estimated_wait_hours", 2.0))
        wait_reduction = max(0.0, round(current_wait - alt_wait, 1))

        # Check if alternative has meaningfully lower penalty score
        curr_score = current_option.get("score", 0.5) if current_option else 0.8
        score_diff = curr_score - best_alt["score"]

        if (is_current_congested or score_diff >= 0.10) and wait_reduction >= 0.5:
            rec_term = best_alt["terminal_id"]
            best_choice = best_alt
            reason = build_recommendation_reason(current_term, rec_term, current_option, best_alt, wait_reduction)
        else:
            rec_term = current_term
            best_choice = current_option or best_alt
            wait_reduction = 0.0
            reason = build_recommendation_reason(current_term, rec_term, current_option, best_choice, 0.0)
    else:
        rec_term = current_term
        best_choice = current_option or options[0]
        wait_reduction = 0.0
        reason = "Current terminal is the only feasible facility meeting vessel draft dimensions."

    return {
        "vessel_id": vessel.get("vessel_id"),
        "vessel_name": vessel.get("vessel_name"),
        "current_terminal": current_term,
        "recommended_terminal": rec_term,
        "current_wait_hours": current_wait,
        "estimated_wait_hours": best_choice["estimated_wait_hours"],
        "wait_reduction_hours": wait_reduction,
        "route_score": best_choice["score"],
        "score_breakdown": best_choice.get("score_breakdown", {}),
        "reason": reason,
        "all_options": options
    }
