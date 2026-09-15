from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from ..services.congestion_service import (
    get_congestion_predictions,
    get_terminal_congestion,
    VALID_TERMINALS
)

router = APIRouter(tags=["Congestion & Optimization"])

@router.get(
    "/api/congestion",
    response_model=List[Dict[str, Any]],
    summary="Get congestion predictions for all terminals",
    description="Returns real-time predicted congestion levels, assigned berths, cranes, recommendations, and wait metrics for all terminals."
)
def list_congestion():
    """
    Returns real-time congestion predictions for all terminals.
    """
    return get_congestion_predictions()

@router.get(
    "/api/congestion/{terminal_id}",
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

@router.get(
    "/optimize",
    response_model=Dict[str, Any],
    summary="Get structured optimization result for demo",
    description="Returns clear, structured demo-friendly port optimization output."
)
@router.get(
    "/api/optimize",
    response_model=Dict[str, Any],
    summary="Get structured optimization result for demo"
)
def get_optimization_summary(terminal_id: Optional[str] = None):
    """
    Returns concise, structured, demo-friendly output for port optimization:
    {
      "congestion_level": "HIGH",
      "assigned_berth": "B07",
      "assigned_cranes": 4,
      "terminal": "South Gateway Terminal",
      "recommendation": "High congestion detected. Redirect vessels to Terminal T3 for optimal flow."
    }
    """
    target_id = terminal_id.strip().upper() if terminal_id and terminal_id.strip().upper() in VALID_TERMINALS else "T1"
    term = get_terminal_congestion(target_id)
    
    # If no specific terminal passed, pick the top hotspot terminal
    if not terminal_id:
        all_terms = get_congestion_predictions()
        if all_terms:
            term = all_terms[0]

    insights = term.get("insights")
    if not insights:
        from ..services.congestion_service import generate_insights
        insights = generate_insights(term)

    return {
        "congestion_level": term.get("congestion_level", "HIGH"),
        "congestion_score": term.get("congestion_score", 75.0),
        "assigned_berth": term.get("assigned_berth", "B01"),
        "assigned_cranes": term.get("assigned_cranes", 4),
        "terminal": term.get("terminal", term.get("terminal_name", "Terminal T1")),
        "recommendation": term.get("recommendation", "Normal operations on schedule."),
        "explanation": term.get("explanation", term.get("recommendation")),
        "why": term.get("why", term.get("recommendation")),
        "insights": insights
    }



