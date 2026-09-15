from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..services.congestion_service import (
    get_congestion_predictions,
    get_terminal_congestion,
    VALID_TERMINALS
)

router = APIRouter(prefix="/api/congestion", tags=["Congestion"])

@router.get(
    "",
    response_model=List[Dict[str, Any]],
    summary="Get congestion predictions for all terminals",
    description="Returns real-time ML-predicted congestion levels, probabilities, expected queues, and wait hours for all terminals (T1, T2, T3, T4), ordered by severity (CRITICAL > HIGH > MEDIUM > LOW)."
)
def list_congestion():
    """
    Returns real-time ML congestion predictions for all terminals.
    """
    return get_congestion_predictions()

@router.get(
    "/{terminal_id}",
    response_model=Dict[str, Any],
    summary="Get congestion prediction for a specific terminal",
    description="Returns congestion prediction metrics for a specific terminal by terminal_id (e.g. T1, T2, T3, T4)."
)
def get_terminal_congestion_endpoint(terminal_id: str):
    """
    Returns congestion prediction metrics for a specific terminal.
    """
    terminal = get_terminal_congestion(terminal_id)
    if not terminal:
        raise HTTPException(
            status_code=404,
            detail=f"Terminal '{terminal_id}' not found. Valid terminal IDs are: {', '.join(VALID_TERMINALS)}."
        )
    return terminal
