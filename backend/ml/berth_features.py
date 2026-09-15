import pandas as pd
import numpy as np
from typing import Dict, Any, Union, List

BERTH_FEATURE_COLUMNS: List[str] = [
    'container_count',
    'is_ultra_large',
    'is_large',
    'is_medium',
    'is_feeder',
    'is_high_priority',
    'dest_terminal_T1',
    'dest_terminal_T2',
    'dest_terminal_T3',
    'dest_terminal_T4',
    'estimated_service_duration'
]

def create_berth_features(
    vessel: Dict[str, Any],
    target_terminal: str = "T1"
) -> pd.DataFrame:
    """
    Constructs operational feature vector for ML Berth Assignment Classifier.
    Encodes vessel draft size, container workload, operational priority, and destination terminal.
    """
    v_size = str(vessel.get("vessel_size", "Large")).upper()
    c_count = float(vessel.get("container_count", 1000) or 1000)
    priority = str(vessel.get("priority", "MEDIUM")).upper()
    term = str(target_terminal or vessel.get("recommended_terminal") or vessel.get("current_terminal") or "T1").upper()

    duration = max(2.5, c_count / (2.0 * 35.0)) # benchmark 2 cranes * 35 TEU/hr

    data = {
        'container_count': c_count,
        'is_ultra_large': 1.0 if "ULTRA" in v_size else 0.0,
        'is_large': 1.0 if v_size == "LARGE" else 0.0,
        'is_medium': 1.0 if v_size == "MEDIUM" else 0.0,
        'is_feeder': 1.0 if v_size == "FEEDER" else 0.0,
        'is_high_priority': 1.0 if priority in ["HIGH", "CRITICAL", "1"] else 0.0,
        'dest_terminal_T1': 1.0 if term == "T1" else 0.0,
        'dest_terminal_T2': 1.0 if term == "T2" else 0.0,
        'dest_terminal_T3': 1.0 if term == "T3" else 0.0,
        'dest_terminal_T4': 1.0 if term == "T4" else 0.0,
        'estimated_service_duration': duration
    }

    df = pd.DataFrame([data])
    return df[BERTH_FEATURE_COLUMNS]
