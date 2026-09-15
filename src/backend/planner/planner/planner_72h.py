"""
72-Hour Port Operations Planner Module
Synthesizes vessel manifests, real-time ML congestion predictions, alternate routing advice,
greedy berth scheduling, and conflict-free quay crane assignments into an actionable rolling 72-hour operational plan.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..optimization.berth_optimizer import optimize_berth_assignments, parse_iso_datetime
from ..optimization.crane_optimizer import optimize_crane_allocations
from ..routing.recommendations import get_routing_recommendation

def generate_72h_operations_plan(
    vessels: List[Dict[str, Any]],
    berths: List[Dict[str, Any]],
    congestion_map: Dict[str, Dict[str, Any]],
    start_time: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Master 72-Hour Operational Horizon Generator:
    1. Defines rolling 72-hour planning window [start_time -> start_time + 72h].
    2. Enriches vessel manifests with Person 1 ML congestion forecasts & Person 2 alternate routing advice.
    3. Runs greedy, non-overlapping Berth Optimizer.
    4. Executes non-overlapping Crane Optimizer over the berth schedule.
    5. Filters and flags operations within the 72-hour planning window.
    6. Summarizes executive KPIs for port shift supervisors.
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

    # 1. Determine Planning Horizon (default: based on earliest arrival or reference date 2026-09-15T06:00:00)
    if start_time is None:
        arrivals = [parse_iso_datetime(v.get("arrival_time")) for v in vessels if v.get("arrival_time")]
        planning_start = min(arrivals) if arrivals else datetime(2026, 9, 15, 6, 0, 0)
    else:
        planning_start = start_time

    planning_end = planning_start + timedelta(hours=72)

    # 2. Enrich vessels with Alternate Routing advice where applicable
    routing_map = {}
    enriched_vessels = []
    for v in vessels:
        v_copy = dict(v)
        rec = get_routing_recommendation(v, congestion_map)
        rec_term = rec.get("recommended_terminal") or v.get("current_terminal") or v.get("terminal_id") or "T1"
        v_copy["recommended_terminal"] = rec_term
        routing_map[v.get("vessel_id", "")] = rec
        enriched_vessels.append(v_copy)

    # 3. Execute Berth Optimization
    berth_opt_result = optimize_berth_assignments(
        vessels=enriched_vessels,
        berths=berths,
        routing_recommendations=routing_map
    )
    berth_schedule = berth_opt_result.get("schedule", [])
    unassigned_from_berth = berth_opt_result.get("unassigned", [])

    # Inject container_count and priority into berth schedule entries for crane optimizer
    vessel_lookup = {str(v.get("vessel_id")): v for v in enriched_vessels}
    for item in berth_schedule:
        v_match = vessel_lookup.get(str(item.get("vessel_id")), {})
        item["container_count"] = v_match.get("container_count", 1000)
        item["priority"] = v_match.get("priority", "MEDIUM")

    # 4. Execute Crane Optimization
    congestion_predictions_list = list(congestion_map.values())
    crane_allocations = optimize_crane_allocations(
        berth_schedule=berth_schedule,
        berths=berths,
        congestion_predictions=congestion_predictions_list
    )
    crane_lookup = {item["vessel_id"]: item for item in crane_allocations}

    # 5. Compile Master 72-Hour Operational Timeline
    master_operations = []
    waiting_operations = []

    for b_item in berth_schedule:
        v_id = b_item["vessel_id"]
        v_match = vessel_lookup.get(v_id, {})
        c_item = crane_lookup.get(v_id, {})

        st_dt = parse_iso_datetime(b_item["start_time"])
        end_dt = parse_iso_datetime(b_item["end_time"])

        # Determine if scheduled window falls within 72h horizon
        is_within_horizon = (st_dt <= planning_end)

        crane_ids = c_item.get("crane_ids", [])
        crane_count = c_item.get("crane_count", b_item.get("cranes", 2))
        handling_hours = c_item.get("estimated_handling_hours", b_item.get("duration_hours", 4.0))

        op_entry = {
            "vessel_id": v_id,
            "vessel_name": b_item.get("vessel_name") or v_match.get("vessel_name", v_id),
            "terminal_id": b_item.get("terminal_id", "T1"),
            "berth_id": b_item.get("berth_id", "B01"),
            "berth_name": b_item.get("berth_name") or f"Berth {b_item.get('berth_id')}",
            "crane_ids": crane_ids,
            "cranes": crane_count,
            "crane_count": crane_count,
            "start_time": b_item["start_time"],
            "end_time": b_item["end_time"],
            "duration_hours": b_item.get("duration_hours", handling_hours),
            "estimated_wait_hours": b_item.get("estimated_wait_hours", 0.0),
            "estimated_handling_hours": handling_hours,
            "action": "Discharge & Load Containers",
            "status": "SCHEDULED" if is_within_horizon else "DEFERRED",
            "priority": v_match.get("priority", "MEDIUM"),
            "container_count": v_match.get("container_count", 1000)
        }

        if is_within_horizon:
            master_operations.append(op_entry)
        else:
            op_entry["status"] = "WAITING"
            op_entry["reason"] = "Scheduled outside current 72-hour operational horizon."
            waiting_operations.append(op_entry)

    # Incorporate unassigned vessels from berth optimizer
    for unassigned in unassigned_from_berth:
        waiting_operations.append({
            "vessel_id": unassigned.get("vessel_id"),
            "vessel_name": unassigned.get("vessel_name"),
            "terminal_id": unassigned.get("terminal_id"),
            "berth_id": None,
            "crane_ids": [],
            "cranes": 0,
            "crane_count": 0,
            "start_time": None,
            "end_time": None,
            "status": "WAITING",
            "reason": unassigned.get("reason", "No feasible berth or crane capacity within planning horizon"),
            "priority": "MEDIUM"
        })

    # Sort master timeline chronologically by start_time
    master_operations.sort(key=lambda x: parse_iso_datetime(x["start_time"]))

    # 6. Compute Executive Summary KPIs
    total_containers = sum(int(op.get("container_count", 0)) for op in master_operations)
    total_cranes = sum(int(op.get("cranes", 0)) for op in master_operations)
    avg_cranes = round(total_cranes / max(len(master_operations), 1), 1)

    total_wait = sum(float(op.get("estimated_wait_hours", 0.0)) for op in master_operations)
    avg_wait = round(total_wait / max(len(master_operations), 1), 1)

    critical_count = sum(1 for v in vessels if str(v.get("priority", "")).upper() in ["CRITICAL", "HIGH"])
    high_priority_count = sum(1 for v in vessels if str(v.get("priority", "")).upper() in ["HIGH", "1"])

    return {
        "planning_window": {
            "start": planning_start.isoformat(),
            "end": planning_end.isoformat(),
            "horizon_hours": 72
        },
        "planning_horizon_hours": 72,
        "generated_at": datetime.now().isoformat(),
        "total_vessels": len(vessels),
        "total_vessels_planned": len(master_operations),
        "scheduled_vessels": len(master_operations),
        "waiting_vessels": len(waiting_operations),
        "critical_vessels": critical_count,
        "high_priority_vessels": high_priority_count,
        "total_containers_handled": total_containers,
        "average_cranes_per_vessel": avg_cranes,
        "average_wait_hours": avg_wait,
        "schedule": master_operations, # Backward compatibility for frontend
        "operations": master_operations, # Master timeline
        "waiting": waiting_operations
    }
