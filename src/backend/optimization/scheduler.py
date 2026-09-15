from datetime import datetime, timedelta
from typing import List, Dict, Any
from .berth_optimizer import find_best_berth
from .crane_optimizer import allocate_cranes

def generate_schedule(vessels: List[Dict[str, Any]], berths: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Greedy scheduling: sorts vessels by priority and ETA, assigns berths, cranes, and calculates non-overlapping windows.
    """
    priority_map = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    sorted_vessels = sorted(
        vessels,
        key=lambda x: (priority_map.get(x.get("priority", "MEDIUM"), 1), x.get("arrival_time", ""))
    )
    
    berth_available_time = {}
    for b in berths:
        b_id = b["berth_id"]
        try:
            berth_available_time[b_id] = datetime.fromisoformat(b.get("available_from", "2026-09-15T06:00:00"))
        except Exception:
            berth_available_time[b_id] = datetime(2026, 9, 15, 6, 0, 0)
            
    schedule = []
    
    for v in sorted_vessels:
        assigned_berth = find_best_berth(v, berths)
        berth_id = assigned_berth.get("berth_id", "B01")
        cranes = allocate_cranes(v, assigned_berth)
        
        try:
            v_arrival = datetime.fromisoformat(v.get("arrival_time", "2026-09-15T06:00:00"))
        except Exception:
            v_arrival = datetime(2026, 9, 15, 6, 0, 0)
            
        b_free_time = berth_available_time.get(berth_id, v_arrival)
        start_time = max(v_arrival, b_free_time)
        
        # Unloading duration estimation: container count / (cranes * 35 containers/hour)
        containers = v.get("container_count", 1000)
        crane_productivity_per_hour = max(cranes * 35, 30)
        duration_hours = max(2.5, round(containers / crane_productivity_per_hour, 1))
        
        end_time = start_time + timedelta(hours=duration_hours)
        
        # Update berth available time
        berth_available_time[berth_id] = end_time + timedelta(minutes=30) # 30 min buffer
        
        schedule.append({
            "vessel_id": v.get("vessel_id"),
            "vessel_name": v.get("vessel_name"),
            "berth_id": berth_id,
            "terminal_id": assigned_berth.get("terminal_id", "T1"),
            "cranes": cranes,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_hours": duration_hours,
            "action": "Discharge & Load Containers",
            "priority": v.get("priority", "MEDIUM")
        })
        
    return schedule
