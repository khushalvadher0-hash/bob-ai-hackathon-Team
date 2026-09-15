from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..services.congestion_service import get_congestion_predictions, get_terminal_congestion

router = APIRouter(prefix="/api/congestion", tags=["Congestion"])

@router.get("", response_model=Dict[str, Any])
def list_congestion():
    """
    Returns real-time ML congestion predictions for all terminals.
    """
    predictions = get_congestion_predictions()
    return {
        "count": len(predictions),
        "predictions": predictions
    }

@router.get("/{terminal_id}", response_model=Dict[str, Any])
def get_terminal_congestion_endpoint(terminal_id: str):
    """
    Returns congestion prediction metrics for a specific terminal.
    """
    terminal = get_terminal_congestion(terminal_id)
    if not terminal:
        raise HTTPException(
            status_code=404,
            detail=f"Terminal '{terminal_id}' not found. Valid terminals are T1, T2, T3, T4."
        )
    return terminal
