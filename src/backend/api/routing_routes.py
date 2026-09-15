from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..services.routing_service import get_vessel_routing_service

router = APIRouter(prefix="/api/routes", tags=["Routing"])

@router.get("/{vessel_id}", response_model=Dict[str, Any])
def get_route(vessel_id: str):
    recommendation = get_vessel_routing_service(vessel_id)
    if not recommendation:
        raise HTTPException(status_code=404, detail=f"Routing recommendation for vessel {vessel_id} not available")
    return recommendation
