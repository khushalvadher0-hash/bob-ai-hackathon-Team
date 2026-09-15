"""
72-Hour Port Operations Planner Module (Model-Driven Orchestrator)
Synthesizes ML congestion forecasts, ML routing recommendations, ML berth selection,
ML crane allocation, and ML turnaround duration prediction into an actionable 72-hour operational plan.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..optimization.berth_optimizer import optimize_berth_assignments, parse_iso_datetime
from ..optimization.crane_optimizer import optimize_crane_allocations
from ..routing.recommendations import get_routing_recommendation
from ..ml.predict_planning import predict_service_duration

def generate_72h_operations_plan(
    vessels: List[Dict[str, Any]],
    berths: List[Dict[str, Any]],
    congestion_map: Dict[str, Dict[str, Any]],
    start_time: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Master Model-Driven 72-Hour Operational Horizon Generator:
    Orchestrates the entire ML prediction pipeline:
    Vessel Data -> ML Congestion -> ML Routing -> ML Berth -> ML Crane -> ML Duration -> 72h Master Schedule
    """
    if not vessels:
        now_dt = datetime.now()
        return {
            "planning_window": {
                "start": now_dt.isoformat(),
                "end": (now_dt + timedelta(hours=72)).isoformat(),
                "horizon_hours": 72
            },
            "total_vessels": 0,
            "scheduled_vessels": 0,
            "waiting_vessels": 0,
            "critical_vessels": 0,
            "high_priority_vessels": 0,
            "total_containers_handled": 0,
            "average_cranes_per_vessel": 0.0,
            "average_wait_hours": 0.0,
            "schedule": [],
            "operations": []
        }

    # 1. Determine Planning Horizon
    if start_time is None:
        arrivals = [parse_iso_datetime(v.get("arrival_time")) for v in vessels if v.get("arrival_time")]
        planning_start = min(arrivals) if arrivals else datetime(2026, 9, 15, 6, 0, 0)
    else:
        planning_start = start_time

    planning_end = planning_start + timedelta(hours=72)

    # 2. Enrich vessels with ML-Based Alternate Routing decisions
    routing_map = {}
    enriched_vessels = []
    for v in vessels:
        v_copy = dict(v)
        rec = get_routing_recommendation(v, congestion_map)
        rec_term = rec.get("recommended_terminal") or v.get("current_terminal") or "T1"
        v_copy["recommended_terminal"] = rec_term
        v_copy["routing_recommendation"] = rec
        routing_map[v.get("vessel_id", "")] = rec
        enriched_vessels.append(v_copy)

    # 3. Execute ML Berth Optimization
    berth_opt_result = optimize_berth_assignments(
        vessels=enriched_vessels,
        berths=berths,
        routing_recommendations=routing_map,
        default_start_time=planning_start
    )
    berth_schedule = berth_opt_result.get("schedule", [])
    unassigned_from_berth = berth_opt_result.get("unassigned", [])

    # Enrich berth schedule entries for crane optimizer
    vessel_lookup = {str(v.get("vessel_id")): v for v in enriched_vessels}
    for item in berth_schedule:
        v_match = vessel_lookup.get(str(item.get("vessel_id")), {})
        item["container_count"] = v_match.get("container_count", 1000)
        item["priority"] = v_match.get("priority", "MEDIUM")

    # 4. Execute ML Crane Optimization
    congestion_predictions_list = list(congestion_map.values())
    crane_allocations = optimize_crane_allocations(
        berth_schedule=berth_schedule,
        berths=berths,
        congestion_predictions=congestion_predictions_list
    )
    crane_lookup = {item["vessel_id"]: item for item in crane_allocations}

    # 5. Execute ML Service Duration and Turnaround Integration
    master_operations = []
    waiting_operations = []

    for b_item in berth_schedule:
        v_id = b_item["vessel_id"]
        v_match = vessel_lookup.get(v_id, {})
        c_item = crane_lookup.get(v_id, {})
        assigned_cranes = c_item.get("crane_ids", [])
        crane_count = len(assigned_cranes) if assigned_cranes else int(b_item.get("cranes", 2))

        # Call ML Planning Duration Model
        t_id = b_item.get("terminal_id", "T1")
        c_lvl = congestion_map.get(t_id, {}).get("congestion_level", "LOW")
        ml_dur_res = predict_service_duration(
            vessel=v_match,
            crane_count=crane_count,
            congestion_level=c_lvl,
            wait_hours=float(b_item.get("estimated_wait_hours", 0.0))
        )
        duration_hours = ml_dur_res.get("predicted_duration_hours", float(b_item.get("duration_hours", 10.0)))

        start_dt = parse_iso_datetime(b_item.get("start_time"))
        end_dt = start_dt + timedelta(hours=duration_hours)

        op_entry = {
            "vessel_id": v_id,
            "vessel_name": b_item.get("vessel_name", v_id),
            "terminal_id": b_item.get("terminal_id"),
            "berth_id": b_item.get("berth_id"),
            "crane_ids": assigned_cranes,
            "crane_count": crane_count,
            "cranes": crane_count,
            "start_time": start_dt.isoformat(),
            "end_time": end_dt.isoformat(),
            "duration_hours": duration_hours,
            "estimated_wait_hours": b_item.get("estimated_wait_hours", 0.0),
            "estimated_handling_hours": duration_hours,
            "action": "Discharge & Load Containers",
            "priority": v_match.get("priority", "MEDIUM"),
            "status": "SCHEDULED",
            "routing_reason": v_match.get("routing_recommendation", {}).get("reason", ""),
            "model_version": "pipeline_rf_v1"
        }

        # Check if operation falls within 72-hour planning window
        if start_dt < planning_end:
            master_operations.append(op_entry)
        else:
            op_entry["status"] = "WAITING"
            op_entry["reason"] = "Scheduled beyond active 72-hour operational window."
            waiting_operations.append(op_entry)

    for un_item in unassigned_from_berth:
        waiting_operations.append({
            "vessel_id": un_item.get("vessel_id"),
            "vessel_name": un_item.get("vessel_name"),
            "terminal_id": "UNASSIGNED",
            "berth_id": "NONE",
            "crane_ids": [],
            "crane_count": 0,
            "cranes": 0,
            "start_time": None,
            "end_time": None,
            "duration_hours": 0.0,
            "estimated_wait_hours": 24.0,
            "estimated_handling_hours": 0.0,
            "action": "AWAIT_BERTH_ALLOCATION",
            "priority": "MEDIUM",
            "status": "WAITING",
            "reason": un_item.get("reason", "No feasible berth available."),
            "model_version": "pipeline_rf_v1"
        })

    # 6. Aggregate Executive KPIs
    total_planned = len(master_operations)
    total_waiting = len(waiting_operations)
    total_containers = sum(int(vessel_lookup.get(op["vessel_id"], {}).get("container_count", 0)) for op in master_operations)
    
    avg_cranes = round(
        sum(op["crane_count"] for op in master_operations) / max(1, total_planned), 1
    ) if master_operations else 0.0
    
    avg_wait = round(
        sum(op["estimated_wait_hours"] for op in master_operations) / max(1, total_planned), 1
    ) if master_operations else 0.0

    critical_count = sum(1 for op in master_operations if str(op.get("priority")).upper() in ["CRITICAL", "HIGH"])

    return {
        "planning_window": {
            "start": planning_start.isoformat(),
            "end": planning_end.isoformat(),
            "horizon_hours": 72
        },
        "planning_horizon_hours": 72,
        "total_vessels": len(vessels),
        "total_vessels_planned": total_planned,
        "scheduled_vessels": total_planned,
        "waiting_vessels": total_waiting,
        "critical_vessels": critical_count,
        "high_priority_vessels": critical_count,
        "total_containers_handled": total_containers,
        "average_cranes_per_vessel": avg_cranes,
        "average_wait_hours": avg_wait,
        "schedule": master_operations,
        "operations": master_operations + waiting_operations,
        "model_version": "pipeline_rf_v1"
    }
