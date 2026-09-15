import pandas as pd
import numpy as np
from typing import Dict, Any, Union, List

FEATURE_COLUMNS: List[str] = [
    'vessel_count',
    'container_count',
    'available_berths',
    'available_cranes',
    'average_wait_hours',
    'vessels_per_berth',
    'containers_per_crane',
    'berth_pressure',
    'crane_pressure',
    'containers_per_vessel',
    'capacity_pressure'
]

def create_congestion_features(data: Union[pd.DataFrame, Dict[str, Any]]) -> pd.DataFrame:
    """
    Computes explainable, operational features for terminal congestion classification.
    Safely handles division by zero and NaN values.
    Excludes non-operational metadata (e.g. terminal_id, vessel_id, timestamps) to prevent data leakage.
    """
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    else:
        df = data.copy()

    features = pd.DataFrame()

    # 1. Base operational indicators with numeric casting
    vessel_cnt = pd.to_numeric(df.get('vessel_count', 0), errors='coerce').fillna(0).astype(float)
    container_cnt = pd.to_numeric(df.get('container_count', 0), errors='coerce').fillna(0).astype(float)
    avail_berths = pd.to_numeric(df.get('available_berths', 1), errors='coerce').fillna(1).astype(float)
    avail_cranes = pd.to_numeric(df.get('available_cranes', 2), errors='coerce').fillna(2).astype(float)
    
    # Average wait hours: use actual if present, otherwise estimate based on vessel density
    if 'average_wait_hours' in df.columns:
        avg_wait = pd.to_numeric(df['average_wait_hours'], errors='coerce').fillna(0.0).astype(float)
    else:
        # Default wait time estimate proxy
        avg_wait = (vessel_cnt / avail_berths.clip(lower=0.5)) * 2.0

    features['vessel_count'] = vessel_cnt
    features['container_count'] = container_cnt
    features['available_berths'] = avail_berths
    features['available_cranes'] = avail_cranes
    features['average_wait_hours'] = avg_wait

    # 2. Derived operational pressure ratios (protected against zero-division)
    safe_berths = avail_berths.clip(lower=0.5)
    safe_cranes = avail_cranes.clip(lower=0.5)
    safe_vessels = vessel_cnt.clip(lower=1.0)

    # Berth & Crane density
    features['vessels_per_berth'] = vessel_cnt / safe_berths
    features['containers_per_crane'] = container_cnt / safe_cranes

    # Operational pressure indicators
    features['berth_pressure'] = vessel_cnt / avail_berths.clip(lower=1.0)
    features['crane_pressure'] = container_cnt / (avail_cranes.clip(lower=1.0) * 1000.0)
    features['containers_per_vessel'] = container_cnt / safe_vessels

    # Composite capacity pressure metric: (estimated workload / estimated service capacity)
    workload = (vessel_cnt * 1200.0) + container_cnt
    capacity = (avail_berths.clip(lower=1.0) * 2500.0) + (avail_cranes.clip(lower=1.0) * 600.0)
    features['capacity_pressure'] = workload / capacity.clip(lower=100.0)

    # Return only defined feature columns
    return features[FEATURE_COLUMNS]

def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """Alias for backwards compatibility."""
    return create_congestion_features(df)
