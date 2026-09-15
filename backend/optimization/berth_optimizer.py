from typing import List, Dict, Any

SIZE_COMPATIBILITY = {
    "Feeder": ["Feeder", "Medium", "Large", "Ultra Large"],
    "Medium": ["Medium", "Large", "Ultra Large"],
    "Large": ["Large", "Ultra Large"],
    "Ultra Large": ["Ultra Large"]
}

def find_best_berth(vessel: Dict[str, Any], berths: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Greedy selection of best suitable berth for a vessel based on size, capacity, and status.
    """
    vessel_size = vessel.get("vessel_size", "Large")
    target_terminal = vessel.get("recommended_terminal") or vessel.get("current_terminal")
    
    # Priority 1: Match terminal + size compatible + AVAILABLE
    for berth in berths:
        if berth.get("terminal_id") == target_terminal and berth.get("status") == "AVAILABLE":
            berth_max = berth.get("max_vessel_size", "Large")
            if berth_max in SIZE_COMPATIBILITY.get(vessel_size, []):
                return berth
                
    # Priority 2: Any matching terminal berth
    for berth in berths:
        if berth.get("terminal_id") == target_terminal:
            return berth
            
    # Priority 3: Fallback to first available berth anywhere
    return berths[0] if berths else {}
