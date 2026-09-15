import pytest
from ..routing.route_scoring import (
    score_route,
    calculate_congestion_score,
    calculate_waiting_score,
    calculate_distance_score,
    calculate_capacity_score
)
from ..routing.route_engine import is_terminal_compatible, calculate_haversine_distance
from ..routing.recommendations import get_routing_recommendation

def test_score_route():
    score_low = score_route(0.1, 0.1, 0.0, 0.1)
    score_high = score_route(0.9, 0.8, 0.5, 0.9)
    assert score_low < score_high
    assert 0.0 <= score_low <= 1.0

def test_component_score_calculators():
    c_low = calculate_congestion_score("LOW", 0.2)
    c_crit = calculate_congestion_score("CRITICAL", 0.95)
    assert c_low < c_crit

    w_short = calculate_waiting_score(1.5, min_wait=1.0, max_wait=15.0)
    w_long = calculate_waiting_score(14.0, min_wait=1.0, max_wait=15.0)
    assert w_short < w_long

    d_near = calculate_distance_score(0.5, min_dist=0.0, max_dist=10.0)
    d_far = calculate_distance_score(8.0, min_dist=0.0, max_dist=10.0)
    assert d_near < d_far

    cap_good = calculate_capacity_score(available_berths=3, total_berths=3)
    cap_bad = calculate_capacity_score(available_berths=0, total_berths=3)
    assert cap_good < cap_bad

def test_draft_compatibility():
    berths = [
        {"berth_id": "B01", "terminal_id": "T1", "max_vessel_size": "Ultra Large"},
        {"berth_id": "B10", "terminal_id": "T4", "max_vessel_size": "Feeder"}
    ]
    assert is_terminal_compatible("Ultra Large", "T1", berths) is True
    assert is_terminal_compatible("Ultra Large", "T4", berths) is False
    assert is_terminal_compatible("Feeder", "T4", berths) is True

def test_routing_recommendation_congested_reroute():
    sample_vessel = {
        "vessel_id": "V001",
        "vessel_name": "Test Carrier",
        "current_terminal": "T1",
        "vessel_size": "Large",
        "container_count": 1800,
        "priority": "HIGH"
    }

    congestion_map = {
        "T1": {"terminal_id": "T1", "terminal_name": "North Deepwater Terminal", "congestion_level": "CRITICAL", "probability": 0.92, "predicted_wait_hours": 14.0, "available_berths": 0, "total_berths": 3, "available_cranes": 1, "total_cranes": 10},
        "T2": {"terminal_id": "T2", "terminal_name": "East Pier Container Terminal", "congestion_level": "LOW", "probability": 0.20, "predicted_wait_hours": 2.5, "available_berths": 2, "total_berths": 3, "available_cranes": 6, "total_cranes": 8},
        "T3": {"terminal_id": "T3", "terminal_name": "South Gateway Terminal", "congestion_level": "LOW", "probability": 0.18, "predicted_wait_hours": 2.0, "available_berths": 3, "total_berths": 3, "available_cranes": 7, "total_cranes": 7},
        "T4": {"terminal_id": "T4", "terminal_name": "West River Feeder Terminal", "congestion_level": "LOW", "probability": 0.15, "predicted_wait_hours": 1.0, "available_berths": 2, "total_berths": 2, "available_cranes": 4, "total_cranes": 4}
    }

    rec = get_routing_recommendation(sample_vessel, congestion_map)
    assert rec["vessel_id"] == "V001"
    assert rec["current_terminal"] == "T1"
    # Should recommend rerouting to less congested terminal (T2, T3 or T4)
    assert rec["recommended_terminal"] in ["T2", "T3", "T4"]
    assert rec["wait_reduction_hours"] > 5.0
    assert "score_breakdown" in rec
    assert rec["score_breakdown"]["congestion_score"] >= 0.0
    assert "reason" in rec
    assert len(rec["reason"]) > 10

def test_routing_recommendation_uncongested_maintain():
    sample_vessel = {
        "vessel_id": "V002",
        "vessel_name": "Uncongested Vessel",
        "current_terminal": "T3",
        "vessel_size": "Large",
        "container_count": 900,
        "priority": "LOW"
    }

    congestion_map = {
        "T1": {"terminal_id": "T1", "terminal_name": "North Deepwater Terminal", "congestion_level": "HIGH", "probability": 0.80, "predicted_wait_hours": 8.0, "available_berths": 1, "total_berths": 3, "available_cranes": 2, "total_cranes": 10},
        "T2": {"terminal_id": "T2", "terminal_name": "East Pier Container Terminal", "congestion_level": "MEDIUM", "probability": 0.50, "predicted_wait_hours": 4.5, "available_berths": 1, "total_berths": 3, "available_cranes": 4, "total_cranes": 8},
        "T3": {"terminal_id": "T3", "terminal_name": "South Gateway Terminal", "congestion_level": "LOW", "probability": 0.15, "predicted_wait_hours": 1.5, "available_berths": 2, "total_berths": 3, "available_cranes": 6, "total_cranes": 7},
        "T4": {"terminal_id": "T4", "terminal_name": "West River Feeder Terminal", "congestion_level": "LOW", "probability": 0.20, "predicted_wait_hours": 1.8, "available_berths": 2, "total_berths": 2, "available_cranes": 3, "total_cranes": 4}
    }

    rec = get_routing_recommendation(sample_vessel, congestion_map)
    # Since T3 is already low congestion, it should maintain T3
    assert rec["recommended_terminal"] == "T3"
    assert rec["wait_reduction_hours"] == 0.0
