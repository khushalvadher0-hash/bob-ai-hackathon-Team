import pandas as pd
import numpy as np

def clean_congestion_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean and fill missing historical congestion records."""
    df = df.copy()
    df['vessel_count'] = df['vessel_count'].fillna(0).astype(int)
    df['container_count'] = df['container_count'].fillna(0).astype(int)
    df['available_berths'] = df['available_berths'].fillna(1).astype(int)
    df['available_cranes'] = df['available_cranes'].fillna(1).astype(int)
    df['average_wait_hours'] = df['average_wait_hours'].fillna(0.0).astype(float)
    return df
