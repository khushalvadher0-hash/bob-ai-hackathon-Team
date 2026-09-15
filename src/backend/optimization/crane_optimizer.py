from typing import Dict, Any

def allocate_cranes(vessel: Dict[str, Any], berth: Dict[str, Any]) -> int:
    """
    Greedy crane allocation based on container volume and priority.
    """
    max_berth_cranes = berth.get("crane_count", 3)
    container_count = vessel.get("container_count", 1000)
    priority = vessel.get("priority", "MEDIUM")
    
    if priority == "HIGH" or container_count >= 1800:
        return min(max_berth_cranes, 4)
    elif priority == "MEDIUM" or container_count >= 1000:
        return min(max_berth_cranes, 3)
    else:
        return max(1, min(max_berth_cranes, 2))
