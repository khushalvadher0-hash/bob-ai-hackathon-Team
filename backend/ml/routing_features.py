import pandas as pd
import numpy as np
from typing import Dict, Any, Union, List

ROUTING_FEATURE_COLUMNS: List[str] = [
    'curr_is_T1',
    'curr_is_T2',
    'curr_is_T3',
    'curr_is_T4',
    'container_count',
    'is_high_priority',
    'is_ultra_large',
    'is_large',
    'curr_vessel_count',
    'curr_container_count',
    'curr_available_berths',
    'curr_available_cranes',
    'curr_wait_hours',
    'curr_is_critical_or_high',
    'alt_available_berths',
    'alt_available_cranes',
    'alt_wait_hours',
    'berth_deficit',
    'wait_time_pressure'
]

def create_routing_features(
    vessel: Dict[str, Any],
    congestion_map: Dict[str, Dict[str, Any]],
    alt_terminal_id: str = "T3"
) -> pd.DataFrame:
    """
    Constructs operational feature vector for ML-based Alternate Routing Classifier.
    Evaluates current terminal saturation versus candidate alternative terminals.
    """
    curr_term = str(vessel.get("current_terminal") or vessel.get("terminal_id") or "T1").upper()
    alt_term = str(alt_terminal_id).upper()

    curr_cong = congestion_map.get(curr_term, {})
    alt_cong = congestion_map.get(alt_term, {})

    container_count = float(vessel.get("container_count", 1000) or 1000)
    priority = str(vessel.get("priority", "MEDIUM")).upper()
    v_size = str(vessel.get("vessel_size", "Large")).upper()

    curr_vessels = float(curr_cong.get("vessel_count", 3) or 3)
    curr_containers = float(curr_cong.get("container_count", 6000) or 6000)
    curr_berths = float(curr_cong.get("available_berths", 1) or 1)
    curr_cranes = float(curr_cong.get("available_cranes", 2) or 2)
    curr_wait = float(curr_cong.get("predicted_wait_hours", curr_cong.get("expected_wait_hours", 4.0)) or 4.0)
    curr_level = str(curr_cong.get("congestion_level", "MEDIUM")).upper()

    alt_berths = float(alt_cong.get("available_berths", 2) or 2)
    alt_cranes = float(alt_cong.get("available_cranes", 4) or 4)
    alt_wait = float(alt_cong.get("predicted_wait_hours", alt_cong.get("expected_wait_hours", 2.0)) or 2.0)

    data = {
        'curr_is_T1': 1.0 if curr_term == "T1" else 0.0,
        'curr_is_T2': 1.0 if curr_term == "T2" else 0.0,
        'curr_is_T3': 1.0 if curr_term == "T3" else 0.0,
        'curr_is_T4': 1.0 if curr_term == "T4" else 0.0,
        'container_count': container_count,
        'is_high_priority': 1.0 if priority in ["HIGH", "CRITICAL", "1"] else 0.0,
        'is_ultra_large': 1.0 if "ULTRA" in v_size else 0.0,
        'is_large': 1.0 if v_size == "LARGE" else 0.0,
        'curr_vessel_count': curr_vessels,
        'curr_container_count': curr_containers,
        'curr_available_berths': curr_berths,
        'curr_available_cranes': curr_cranes,
        'curr_wait_hours': curr_wait,
        'curr_is_critical_or_high': 1.0 if curr_level in ["CRITICAL", "HIGH"] else 0.0,
        'alt_available_berths': alt_berths,
        'alt_available_cranes': alt_cranes,
        'alt_wait_hours': alt_wait,
        'berth_deficit': max(0.0, curr_vessels - curr_berths),
        'wait_time_pressure': curr_wait / max(0.5, alt_wait)
    }

    df = pd.DataFrame([data])
    return df[ROUTING_FEATURE_COLUMNS]
