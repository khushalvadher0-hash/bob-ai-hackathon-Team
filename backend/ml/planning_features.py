import pandas as pd
import numpy as np
from typing import Dict, Any, Union, List

PLANNING_FEATURE_COLUMNS: List[str] = [
    'container_count',
    'crane_count',
    'is_high_priority',
    'is_ultra_large',
    'is_large',
    'terminal_congestion_level_numeric',
    'initial_wait_hours'
]

def create_planning_features(
    vessel: Dict[str, Any],
    crane_count: int = 2,
    congestion_level: str = "LOW",
    wait_hours: float = 2.0
) -> pd.DataFrame:
    """
    Constructs operational feature vector for ML Service Duration & Turnaround Regressor.
    """
    c_count = float(vessel.get("container_count", 1000) or 1000)
    priority = str(vessel.get("priority", "MEDIUM")).upper()
    v_size = str(vessel.get("vessel_size", "Large")).upper()
    cranes = float(max(1, crane_count))
    
    lvl_num = {"CRITICAL": 4.0, "HIGH": 3.0, "MEDIUM": 2.0, "LOW": 1.0}.get(str(congestion_level).upper(), 1.0)

    data = {
        'container_count': c_count,
        'crane_count': cranes,
        'is_high_priority': 1.0 if priority in ["HIGH", "CRITICAL", "1"] else 0.0,
        'is_ultra_large': 1.0 if "ULTRA" in v_size else 0.0,
        'is_large': 1.0 if v_size == "LARGE" else 0.0,
        'terminal_congestion_level_numeric': lvl_num,
        'initial_wait_hours': float(wait_hours)
    }

    df = pd.DataFrame([data])
    return df[PLANNING_FEATURE_COLUMNS]
