from fastapi import APIRouter
from typing import List, Dict, Any
from ..services.congestion_service import get_terminal_congestion_status, get_terminal_congestion_by_id

router = APIRouter(prefix="/api/congestion", tags=["Congestion"])

@router.get("", response_model=List[Dict[str, Any]])
def list_congestion():
    return get_terminal_congestion_status()

@router.get("/{terminal_id}", response_model=Dict[str, Any])
def get_terminal_congestion(terminal_id: str):
    return get_terminal_congestion_by_id(terminal_id)
