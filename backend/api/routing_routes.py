"""
Routing API Endpoints
REST endpoints for retrieving alternate routing recommendations.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from ..services.routing_service import (
    get_vessel_routing_service,
    get_all_routing_recommendations_service
)

router = APIRouter(prefix="/api/routes", tags=["Routing"])

@router.get("", response_model=List[Dict[str, Any]])
def get_all_routes():
    """
    Returns alternate routing evaluations for all vessels in the fleet.
    """
    return get_all_routing_recommendations_service()

@router.get("/{vessel_id}", response_model=Dict[str, Any])
def get_route(vessel_id: str):
    """
    Returns dynamic alternate routing recommendation for a single vessel by its vessel_id.
    """
    clean_id = vessel_id.strip()
    recommendation = get_vessel_routing_service(clean_id)
    if not recommendation:
        raise HTTPException(
            status_code=404,
            detail=f"Vessel '{vessel_id}' not found or routing recommendation unavailable"
        )
    return recommendation
