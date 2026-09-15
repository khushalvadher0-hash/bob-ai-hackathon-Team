"""
Routing Service Layer
Coordinates data fetching from MongoDB vessel and congestion services,
executes the alternate route engine, and returns synthesized routing recommendations.
"""

from typing import Dict, Any, Optional, List
from .vessel_service import get_vessel_by_id, get_all_vessels
from .congestion_service import get_congestion_predictions
from ..routing.recommendations import get_routing_recommendation

def get_vessel_routing_service(vessel_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetches vessel data from MongoDB/CSV, retrieves live ML congestion forecasts
    for all terminals, and generates an optimized alternate routing recommendation.
    """
    if not vessel_id:
        return None

    vessel = get_vessel_by_id(vessel_id)
    if not vessel:
        return None

    # Retrieve real congestion predictions from Person 1's ML service
    predictions = get_congestion_predictions()
    congestion_map = {
        str(pred.get("terminal_id", "")).upper(): pred 
        for pred in predictions
    }

    # Generate dynamic, explainable recommendation
    recommendation = get_routing_recommendation(vessel, congestion_map)
    return recommendation

def get_all_routing_recommendations_service() -> List[Dict[str, Any]]:
    """
    Generates routing recommendations for all active port vessels.
    Used for bulk fleet overview in operations command dashboard.
    """
    vessels = get_all_vessels()
    if not vessels:
        return []

    predictions = get_congestion_predictions()
    congestion_map = {
        str(pred.get("terminal_id", "")).upper(): pred 
        for pred in predictions
    }

    recommendations = []
    for vessel in vessels:
        rec = get_routing_recommendation(vessel, congestion_map)
        recommendations.append(rec)
    return recommendations
