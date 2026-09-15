import pandas as pd
import numpy as np
from typing import Set

VALID_CONGESTION_LEVELS: Set[str] = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

def clean_congestion_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans, validates, and standardizes historical congestion records.
    Deduplicates records and handles missing/corrupted values.
    """
    if df is None or df.empty:
        return pd.DataFrame()

    df = df.copy()

    # 1. Normalize column name aliases
    if 'gittimestamp' in df.columns and 'timestamp' not in df.columns:
        df['timestamp'] = df['gittimestamp']

    # 2. Type conversions & missing value imputation
    df['vessel_count'] = pd.to_numeric(df.get('vessel_count', 0), errors='coerce').fillna(0).astype(int)
    df['container_count'] = pd.to_numeric(df.get('container_count', 0), errors='coerce').fillna(0).astype(int)
    df['available_berths'] = pd.to_numeric(df.get('available_berths', 1), errors='coerce').fillna(1).astype(int)
    df['available_cranes'] = pd.to_numeric(df.get('available_cranes', 2), errors='coerce').fillna(2).astype(int)
    
    if 'average_wait_hours' in df.columns:
        df['average_wait_hours'] = pd.to_numeric(df['average_wait_hours'], errors='coerce').fillna(0.0).astype(float)

    # 3. Clean and validate target congestion_level
    if 'congestion_level' in df.columns:
        df['congestion_level'] = df['congestion_level'].astype(str).str.upper().str.strip()
        # Fallback for unexpected label values
        df.loc[~df['congestion_level'].isin(VALID_CONGESTION_LEVELS), 'congestion_level'] = 'MEDIUM'

    # 4. Remove duplicate rows if any
    subset_cols = [c for c in ['terminal_id', 'timestamp', 'vessel_count', 'container_count'] if c in df.columns]
    if subset_cols:
        df = df.drop_duplicates(subset=subset_cols)

    return df
