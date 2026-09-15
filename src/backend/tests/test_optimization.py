import pytest
from datetime import datetime
from ..optimization.berth_optimizer import (
    optimize_berth_assignments,
    find_best_berth,
    check_berth_feasibility,
    calculate_berth_score,
    estimate_service_duration_hours
)
from ..optimization.crane_optimizer import allocate_cranes
from ..planner.planner_72h import generate_72h_operations_plan

def test_check_berth_feasibility():
    vessel_ultra = {"vessel_size": "Ultra Large", "container_count": 2000}
    vessel_feeder = {"vessel_size": "Feeder", "container_count": 500}

    berth_feeder = {"berth_id": "B10", "terminal_id": "T4", "max_vessel_size": "Feeder", "status": "AVAILABLE"}
    berth_ultra = {"berth_id": "B01", "terminal_id": "T1", "max_vessel_size": "Ultra Large", "status": "AVAILABLE"}
    berth_maint = {"berth_id": "B02", "terminal_id": "T1", "max_vessel_size": "Ultra Large", "status": "MAINTENANCE"}

    # Ultra Large cannot fit into Feeder berth
    ok, _ = check_berth_feasibility(vessel_ultra, berth_feeder)
    assert ok is False

    # Ultra Large fits into Ultra Large berth
    ok, _ = check_berth_feasibility(vessel_ultra, berth_ultra)
    assert ok is True

    # Feeder fits into both Feeder and Ultra Large berths
    ok_f1, _ = check_berth_feasibility(vessel_feeder, berth_feeder)
    ok_f2, _ = check_berth_feasibility(vessel_feeder, berth_ultra)
    assert ok_f1 is True and ok_f2 is True

    # Maintenance berth is rejected
    ok_m, _ = check_berth_feasibility(vessel_feeder, berth_maint)
    assert ok_m is False

def test_calculate_berth_score():
    vessel = {"vessel_size": "Large", "recommended_terminal": "T2"}
    berth_t2 = {"berth_id": "B04", "terminal_id": "T2", "max_vessel_size": "Large", "status": "AVAILABLE"}
    berth_t1 = {"berth_id": "B01", "terminal_id": "T1", "max_vessel_size": "Ultra Large", "status": "AVAILABLE"}

    v_arrival = datetime(2026, 9, 15, 6, 0, 0)
    score_t2, b_t2 = calculate_berth_score(vessel, berth_t2, v_arrival, v_arrival, "T2")
    score_t1, b_t1 = calculate_berth_score(vessel, berth_t1, v_arrival, v_arrival, "T2")

    # Berth in recommended terminal T2 with exact size match should score higher
    assert score_t2 > score_t1
    assert 0.0 <= score_t2 <= 1.0

def test_estimate_service_duration():
    vessel = {"container_count": 2100}
    berth = {"crane_count": 3}
    duration = estimate_service_duration_hours(vessel, berth)
    # 2100 / (3 * 35) = 20.0 hours
    assert duration == 20.0

def test_optimize_berth_assignments_no_overlap():
    vessels = [
        {"vessel_id": "V1", "vessel_name": "Ship 1", "priority": "HIGH", "arrival_time": "2026-09-15T06:00:00", "container_count": 1400, "current_terminal": "T1", "vessel_size": "Large"},
        {"vessel_id": "V2", "vessel_name": "Ship 2", "priority": "HIGH", "arrival_time": "2026-09-15T06:00:00", "container_count": 1400, "current_terminal": "T1", "vessel_size": "Large"}
    ]
    # Single available berth
    berths = [
        {"berth_id": "B01", "terminal_id": "T1", "max_vessel_size": "Large", "status": "AVAILABLE", "crane_count": 2, "available_from": "2026-09-15T06:00:00"}
    ]

    result = optimize_berth_assignments(vessels, berths)
    assert result["total_vessels"] == 2
    assert result["assigned_vessels"] == 2
    
    schedule = result["schedule"]
    v1_op = next(item for item in schedule if item["vessel_id"] == "V1")
    v2_op = next(item for item in schedule if item["vessel_id"] == "V2")

    # Enforce non-overlapping start/end times
    v1_end = datetime.fromisoformat(v1_op["end_time"])
    v2_start = datetime.fromisoformat(v2_op["start_time"])
    assert v2_start >= v1_end

def test_allocate_cranes():
    vessel_high = {"container_count": 2000, "priority": "HIGH"}
    berth = {"crane_count": 4}
    cranes = allocate_cranes(vessel_high, berth)
    assert cranes == 4

def test_scheduler_and_planner():
    vessels = [
        {"vessel_id": "V1", "vessel_name": "Ship A", "priority": "HIGH", "arrival_time": "2026-09-15T06:00:00", "container_count": 1000, "current_terminal": "T1"},
        {"vessel_id": "V2", "vessel_name": "Ship B", "priority": "LOW", "arrival_time": "2026-09-15T08:00:00", "container_count": 800, "current_terminal": "T1"}
    ]
    berths = [
        {"berth_id": "B01", "terminal_id": "T1", "max_vessel_size": "Ultra Large", "status": "AVAILABLE", "crane_count": 3, "available_from": "2026-09-15T06:00:00"}
    ]
    cong_map = {"T1": {"level": "LOW", "predicted_wait_hours": 1.0}}

    plan = generate_72h_operations_plan(vessels, berths, cong_map)
    assert plan["planning_horizon_hours"] == 72
    assert len(plan["schedule"]) == 2
    assert plan["total_containers_handled"] == 1800
