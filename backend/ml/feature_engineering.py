import pandas as pd
import numpy as np
from typing import Dict, Any, Union

def create_congestion_features(data: Union[pd.DataFrame, Dict[str, Any]]) -> pd.DataFrame:
    """
    Creates explainable, robust features for congestion classification.
    Handles single dict or pandas DataFrame inputs.
    Safely avoids division by zero or NaN errors.
    """
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    else:
        df = data.copy()

    features = pd.DataFrame()
    
    # Base operational features with robust numeric conversion
    features['vessel_count'] = pd.to_numeric(df.get('vessel_count', 0), errors='coerce').fillna(0).astype(float)
    features['container_count'] = pd.to_numeric(df.get('container_count', 0), errors='coerce').fillna(0).astype(float)
    
    # Ensure available berths and cranes are at least 0.5 to prevent division by zero
    avail_berths = pd.to_numeric(df.get('available_berths', 1), errors='coerce').fillna(1).clip(lower=0.5).astype(float)
    avail_cranes = pd.to_numeric(df.get('available_cranes', 2), errors='coerce').fillna(2).clip(lower=0.5).astype(float)
    
    features['available_berths'] = avail_berths
    features['available_cranes'] = avail_cranes
    
    # Capacity utilization proxy ratios
    features['vessels_per_berth'] = features['vessel_count'] / avail_berths
    features['containers_per_crane'] = features['container_count'] / avail_cranes
    
    return features

def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """Alias for backwards compatibility."""
    return create_congestion_features(df)
