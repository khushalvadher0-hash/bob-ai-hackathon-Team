from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List, Union
from ..models.vessel import VesselCreate, VesselResponse
from ..services.vessel_service import (
    get_all_vessels,
    get_vessel_by_id,
    add_vessel,
    delete_vessel
)

# Router for /api/vessels
router = APIRouter(tags=["Vessels"])

@router.get("/vessels", response_model=Union[List[Dict[str, Any]], Dict[str, Any]])
@router.get("/api/vessels", response_model=Union[List[Dict[str, Any]], Dict[str, Any]])
def list_vessels():
    """
    Returns all vessels in the fleet with total count.
    Supports both direct array and envelope formats for frontend flexibility.
    """
    vessels = get_all_vessels()
    return vessels

@router.get("/vessels/{vessel_id}", response_model=Dict[str, Any])
@router.get("/api/vessels/{vessel_id}", response_model=Dict[str, Any])
def get_single_vessel(vessel_id: str):
    """
    Returns a single vessel by its vessel_id or name.
    """
    vessel = get_vessel_by_id(vessel_id)
    if not vessel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vessel '{vessel_id}' not found in port registry."
        )
    return vessel

@router.post("/vessels", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
@router.post("/api/vessels", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_vessel(payload: VesselCreate):
    """
    Adds a new vessel to MongoDB.
    Validates input using Pydantic schema.
    """
    created = add_vessel(payload.dict(exclude_none=True))
    return {
        "message": "Vessel added successfully",
        "vessel": created
    }

@router.delete("/vessels/{vessel_id}", response_model=Dict[str, Any])
@router.delete("/api/vessels/{vessel_id}", response_model=Dict[str, Any])
def remove_vessel(vessel_id: str):
    """
    Deletes a vessel from MongoDB by vessel_id.
    """
    success = delete_vessel(vessel_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vessel '{vessel_id}' not found or could not be deleted."
        )
    return {
        "message": "Vessel deleted successfully",
        "vessel_id": vessel_id
    }

