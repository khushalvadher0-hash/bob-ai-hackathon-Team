from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..services.vessel_service import get_all_vessels, get_vessel_by_id

router = APIRouter(prefix="/api/vessels", tags=["Vessels"])

@router.get("", response_model=Dict[str, Any])
def list_vessels():
    """
    Returns all vessels in the fleet with total count.
    """
    vessels = get_all_vessels()
    return {
        "count": len(vessels),
        "vessels": vessels
    }

@router.get("/{vessel_id}", response_model=Dict[str, Any])
def get_vessel(vessel_id: str):
    """
    Returns a single vessel by its vessel_id.
    """
    vessel = get_vessel_by_id(vessel_id)
    if not vessel:
        raise HTTPException(
            status_code=404,
            detail=f"Vessel '{vessel_id}' not found in port registry."
        )
    return vessel
