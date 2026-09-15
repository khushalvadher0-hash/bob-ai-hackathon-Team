import pytest
from ..routing.route_scoring import score_route
from ..routing.recommendations import get_routing_recommendation

def test_score_route():
    score_low = score_route(0.1, 0.1, 0.0, 0.1)
    score_high = score_route(0.9, 0.8, 0.5, 0.9)
    assert score_low < score_high
    assert 0 <= score_low <= 1.0

def test_routing_recommendation():
    sample_vessel = {
        "vessel_id": "V001",
        "vessel_name": "Test Vessel",
        "current_terminal": "T1",
        "vessel_size": "Large",
        "container_count": 1500,
        "priority": "HIGH"
    }
    
    congestion_map = {
        "T1": {"terminal_id": "T1", "terminal_name": "T1 Pier", "level": "CRITICAL", "predicted_wait_hours": 12.0, "available_berths": 0},
        "T2": {"terminal_id": "T2", "terminal_name": "T2 Pier", "level": "LOW", "predicted_wait_hours": 1.5, "available_berths": 2},
        "T3": {"terminal_id": "T3", "terminal_name": "T3 Pier", "level": "LOW", "predicted_wait_hours": 2.0, "available_berths": 2},
        "T4": {"terminal_id": "T4", "terminal_name": "T4 Pier", "level": "LOW", "predicted_wait_hours": 1.0, "available_berths": 2}
    }
    
    rec = get_routing_recommendation(sample_vessel, congestion_map)
    assert rec["vessel_id"] == "V001"
    assert rec["current_terminal"] == "T1"
    # Should recommend rerouting to less congested terminal
    assert rec["recommended_terminal"] in ["T2", "T3", "T4"]
    assert "estimated_wait_hours" in rec
