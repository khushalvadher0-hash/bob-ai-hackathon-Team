from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..services.vessel_service import get_all_vessels, get_vessel_by_id

router = APIRouter(prefix="/api/vessels", tags=["Vessels"])

@router.get("", response_model=List[Dict[str, Any]])
def list_vessels():
    return get_all_vessels()

@router.get("/{vessel_id}", response_model=Dict[str, Any])
def get_vessel(vessel_id: str):
    vessel = get_vessel_by_id(vessel_id)
    if not vessel:
        raise HTTPException(status_code=404, detail=f"Vessel {vessel_id} not found")
    return vessel
