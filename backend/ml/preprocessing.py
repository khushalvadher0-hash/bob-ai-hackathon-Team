import pandas as pd
import numpy as np

def clean_congestion_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans and standardizes raw historical congestion records.
    Handles column name variations, NaN values, and type conversions.
    """
    df = df.copy()
    
    # Handle timestamp column aliases if present
    if 'gittimestamp' in df.columns and 'timestamp' not in df.columns:
        df['timestamp'] = df['gittimestamp']
        
    # Clean numeric columns with sensible defaults
    df['vessel_count'] = pd.to_numeric(df.get('vessel_count', 0), errors='coerce').fillna(0).astype(int)
    df['container_count'] = pd.to_numeric(df.get('container_count', 0), errors='coerce').fillna(0).astype(int)
    df['available_berths'] = pd.to_numeric(df.get('available_berths', 1), errors='coerce').fillna(1).astype(int)
    df['available_cranes'] = pd.to_numeric(df.get('available_cranes', 2), errors='coerce').fillna(2).astype(int)
    
    if 'average_wait_hours' in df.columns:
        df['average_wait_hours'] = pd.to_numeric(df['average_wait_hours'], errors='coerce').fillna(0.0).astype(float)
        
    # Clean and validate congestion target level
    if 'congestion_level' in df.columns:
        valid_levels = {'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'}
        df['congestion_level'] = df['congestion_level'].astype(str).str.upper().str.strip()
        # Fallback if unmapped
        df.loc[~df['congestion_level'].isin(valid_levels), 'congestion_level'] = 'MEDIUM'
        
    return df
