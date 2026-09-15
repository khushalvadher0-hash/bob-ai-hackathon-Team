from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Union
from ..services.operations_service import (
    get_72h_plan_service,
    get_berths_data,
    get_cranes_data,
    get_optimized_berths_service,
    get_vessel_berth_assignment_service,
    generate_simple_72h_plan
)

router = APIRouter(tags=["Operations"])

@router.get("/plan", response_model=List[Dict[str, Any]])
@router.get("/api/plan", response_model=List[Dict[str, Any]])
@router.get("/api/operations/plan", response_model=List[Dict[str, Any]])
def get_simple_72h_plan():
    """
    Returns simple 72-hour operational plan matching vessel handling based on berth availability and arrival time.
    """
    return generate_simple_72h_plan()

@router.get("/api/operations/72h", response_model=Dict[str, Any])
def get_72h_operations_plan():
    """
    Returns rolling 72-hour operational plan with scheduled non-overlapping slots.
    """
    return get_72h_plan_service()

@router.get("/berths", response_model=Union[Dict[str, Any], List[Dict[str, Any]]])
@router.get("/api/operations/berths", response_model=Union[Dict[str, Any], List[Dict[str, Any]]])
def list_optimized_berths(raw: bool = False):
    """
    Returns the current optimized berth schedule (default).
    If ?raw=true is passed, returns the raw berth infrastructure list.
    """
    if raw:
        return get_berths_data()
    return get_optimized_berths_service()

@router.get("/berths/{vessel_id}", response_model=Dict[str, Any])
@router.get("/api/operations/berths/{vessel_id}", response_model=Dict[str, Any])
def get_vessel_berth_assignment(vessel_id: str):
    """
    Returns the optimized berth assignment for a specific vessel.
    """
    assignment = get_vessel_berth_assignment_service(vessel_id)
    if not assignment:
        raise HTTPException(
            status_code=404,
            detail=f"Berth assignment for vessel '{vessel_id}' not found"
        )
    return assignment

@router.get("/cranes", response_model=List[Dict[str, Any]])
@router.get("/api/operations/cranes", response_model=List[Dict[str, Any]])
def list_cranes():
    """
    Returns deployable crane inventory across all port terminals.
    """
    return get_cranes_data()
