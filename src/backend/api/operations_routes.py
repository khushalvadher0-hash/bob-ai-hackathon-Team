from fastapi import APIRouter
from typing import List, Dict, Any
from ..services.operations_service import get_72h_plan_service, get_berths_data, get_cranes_data

router = APIRouter(prefix="/api/operations", tags=["Operations"])

@router.get("/72h", response_model=Dict[str, Any])
def get_72h_operations_plan():
    return get_72h_plan_service()

@router.get("/berths", response_model=List[Dict[str, Any]])
def list_berths():
    return get_berths_data()

@router.get("/cranes", response_model=List[Dict[str, Any]])
def list_cranes():
    return get_cranes_data()
