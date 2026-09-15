import pandas as pd
import numpy as np
from pathlib import Path
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from .crane_features import CRANE_FEATURE_COLUMNS, create_crane_features

MODEL_PATH = Path(__file__).resolve().parent / "crane_model.pkl"

def build_crane_training_dataset():
    """
    Constructs operational training pairs mapping vessel container volumes, priorities,
    and berth capacities to verified required crane allocations.
    """
    samples = []
    targets = []

    # High Workload / High Priority / Critical Congestion -> 3 to 4 cranes
    for c_cnt, v_size, p, b_cranes, c_lvl, opt_cranes in [
        (2100, "Ultra Large", "HIGH", 4, "CRITICAL", 4.0),
        (1950, "Ultra Large", "HIGH", 4, "HIGH", 4.0),
        (1850, "Ultra Large", "HIGH", 3, "CRITICAL", 3.0),
        (1900, "Ultra Large", "MEDIUM", 4, "MEDIUM", 3.0),
        (1750, "Large", "HIGH", 3, "HIGH", 3.0),
        (1650, "Large", "MEDIUM", 3, "MEDIUM", 3.0),
        (1600, "Large", "HIGH", 3, "LOW", 3.0),
        (1500, "Large", "MEDIUM", 3, "LOW", 2.0),
        (1450, "Large", "LOW", 3, "LOW", 2.0),
        (1400, "Large", "LOW", 2, "MEDIUM", 2.0),
        (1350, "Medium", "LOW", 2, "LOW", 2.0),
        (1200, "Medium", "MEDIUM", 2, "LOW", 2.0),
        (1100, "Medium", "HIGH", 2, "HIGH", 2.0),
        (950, "Medium", "MEDIUM", 2, "LOW", 2.0),
        (900, "Feeder", "LOW", 2, "LOW", 1.0),
        (800, "Feeder", "LOW", 2, "LOW", 1.0),
        (750, "Feeder", "LOW", 2, "LOW", 1.0),
        (650, "Feeder", "LOW", 2, "LOW", 1.0)
    ]:
        v = {"container_count": c_cnt, "vessel_size": v_size, "priority": p}
        b = {"crane_count": b_cranes}
        samples.append(create_crane_features(v, b, c_lvl))
        targets.append(opt_cranes)

    X = pd.concat(samples, ignore_index=True)
    y = np.array(targets)
    return X, y

def train_and_save_crane_model():
    """Trains and persists the Random Forest Crane Allocation Regressor."""
    X, y = build_crane_training_dataset()
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42))
    ])

    pipeline.fit(X, y)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"[ML] Trained and saved Crane Allocation model to {MODEL_PATH}")
    return pipeline

if __name__ == "__main__":
    train_and_save_crane_model()
