from typing import Dict, Any, Optional
from .vessel_service import get_vessel_by_id
from .congestion_service import get_terminal_congestion_status
from ..routing.recommendations import get_routing_recommendation

def get_vessel_routing_service(vessel_id: str) -> Optional[Dict[str, Any]]:
    vessel = get_vessel_by_id(vessel_id)
    if not vessel:
        return None
        
    terminals = get_terminal_congestion_status()
    cong_map = {t["terminal_id"]: t for t in terminals}
    
    return get_routing_recommendation(vessel, cong_map)
