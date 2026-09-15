import pandas as pd
import numpy as np
from typing import Dict, Any, Union, List

CRANE_FEATURE_COLUMNS: List[str] = [
    'container_count',
    'is_high_priority',
    'is_medium_priority',
    'is_ultra_large',
    'is_large',
    'is_medium',
    'is_feeder',
    'berth_crane_capacity',
    'terminal_congestion_pressure'
]

def create_crane_features(
    vessel: Dict[str, Any],
    berth: Dict[str, Any],
    congestion_level: str = "MEDIUM"
) -> pd.DataFrame:
    """
    Constructs operational feature vector for ML Crane Allocation Regressor.
    Encodes container workload volume, vessel draft, berth max cranes, and congestion severity.
    """
    c_count = float(vessel.get("container_count", 1000) or 1000)
    priority = str(vessel.get("priority", "MEDIUM")).upper()
    v_size = str(vessel.get("vessel_size", "Large")).upper()
    max_cranes = float(berth.get("crane_count", 3) or 3)
    c_level = str(congestion_level or "MEDIUM").upper()

    c_pressure_map = {"CRITICAL": 4.0, "HIGH": 3.0, "MEDIUM": 2.0, "LOW": 1.0}
    c_pressure = c_pressure_map.get(c_level, 2.0)

    data = {
        'container_count': c_count,
        'is_high_priority': 1.0 if priority in ["HIGH", "CRITICAL", "1"] else 0.0,
        'is_medium_priority': 1.0 if priority in ["MEDIUM", "2"] else 0.0,
        'is_ultra_large': 1.0 if "ULTRA" in v_size else 0.0,
        'is_large': 1.0 if v_size == "LARGE" else 0.0,
        'is_medium': 1.0 if v_size == "MEDIUM" else 0.0,
        'is_feeder': 1.0 if v_size == "FEEDER" else 0.0,
        'berth_crane_capacity': max_cranes,
        'terminal_congestion_pressure': c_pressure
    }

    df = pd.DataFrame([data])
    return df[CRANE_FEATURE_COLUMNS]
