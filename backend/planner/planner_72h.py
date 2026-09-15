from datetime import datetime
from typing import List, Dict, Any
from ..optimization.scheduler import generate_schedule
from ..routing.recommendations import get_routing_recommendation

def generate_72h_operations_plan(
    vessels: List[Dict[str, Any]],
    berths: List[Dict[str, Any]],
    congestion_map: Dict[str, Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Generates comprehensive 72-hour operational plan integrating predictions, routing, and berth/crane assignments.
    """
    # 1. Enrich vessels with recommended routing
    enriched_vessels = []
    for v in vessels:
        v_copy = dict(v)
        rec = get_routing_recommendation(v, congestion_map)
        v_copy["recommended_terminal"] = rec["recommended_terminal"]
        enriched_vessels.append(v_copy)
        
    # 2. Run Optimization Schedule
    schedule = generate_schedule(enriched_vessels, berths)
    
    # 3. Calculate summary metrics
    total_containers = sum(v.get("container_count", 0) for v in vessels)
    avg_cranes = round(sum(item["cranes"] for item in schedule) / max(len(schedule), 1), 1)
    
    return {
        "planning_horizon_hours": 72,
        "generated_at": datetime.now().isoformat(),
        "total_vessels_planned": len(schedule),
        "total_containers_handled": total_containers,
        "average_cranes_per_vessel": avg_cranes,
        "schedule": schedule
    }
