import pandas as pd

def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract and engineer explainable features for congestion prediction."""
    features = pd.DataFrame()
    features['vessel_count'] = df['vessel_count']
    features['container_count'] = df['container_count']
    features['available_berths'] = df['available_berths']
    features['available_cranes'] = df['available_cranes']
    
    # Capacity utilization proxies
    features['vessels_per_berth'] = df['vessel_count'] / (df['available_berths'].replace(0, 0.5))
    features['containers_per_crane'] = df['container_count'] / (df['available_cranes'].replace(0, 0.5))
    
    return features
