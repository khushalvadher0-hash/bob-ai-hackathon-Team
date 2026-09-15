import pytest
from ..optimization.berth_optimizer import find_best_berth
from ..optimization.crane_optimizer import allocate_cranes
from ..optimization.scheduler import generate_schedule
from ..planner.planner_72h import generate_72h_operations_plan

def test_find_best_berth():
    vessel = {"vessel_id": "V1", "vessel_size": "Large", "current_terminal": "T1"}
    berths = [
        {"berth_id": "B01", "terminal_id": "T1", "max_vessel_size": "Ultra Large", "status": "OCCUPIED"},
        {"berth_id": "B02", "terminal_id": "T1", "max_vessel_size": "Large", "status": "AVAILABLE"}
    ]
    best = find_best_berth(vessel, berths)
    assert best["berth_id"] == "B02"

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
