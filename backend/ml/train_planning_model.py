import pandas as pd
import numpy as np
from pathlib import Path
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from .planning_features import PLANNING_FEATURE_COLUMNS, create_planning_features

MODEL_PATH = Path(__file__).resolve().parent / "planning_model.pkl"

def build_planning_training_dataset():
    """
    Constructs operational training pairs mapping container workloads and crane dispatching
    to actual handling turnaround duration in hours.
    """
    samples = []
    durations = []

    for c_cnt, cranes, p, v_size, c_lvl, wait, dur in [
        (2100, 4, "HIGH", "Ultra Large", "CRITICAL", 8.0, 15.0),
        (1950, 4, "HIGH", "Ultra Large", "HIGH", 6.5, 14.0),
        (1850, 3, "HIGH", "Ultra Large", "HIGH", 5.5, 17.5),
        (1900, 3, "MEDIUM", "Ultra Large", "MEDIUM", 4.0, 18.0),
        (1750, 3, "HIGH", "Large", "HIGH", 4.5, 16.5),
        (1650, 3, "MEDIUM", "Large", "MEDIUM", 3.0, 15.5),
        (1600, 3, "HIGH", "Large", "LOW", 2.0, 15.0),
        (1500, 2, "MEDIUM", "Large", "LOW", 2.5, 21.5),
        (1450, 2, "LOW", "Large", "LOW", 2.0, 20.5),
        (1400, 2, "LOW", "Large", "MEDIUM", 3.5, 20.0),
        (1350, 2, "LOW", "Medium", "LOW", 1.5, 19.0),
        (1200, 2, "MEDIUM", "Medium", "LOW", 2.0, 17.0),
        (1100, 2, "HIGH", "Medium", "HIGH", 4.0, 15.5),
        (950, 2, "MEDIUM", "Medium", "LOW", 1.5, 13.5),
        (900, 1, "LOW", "Feeder", "LOW", 1.0, 25.5),
        (800, 1, "LOW", "Feeder", "LOW", 1.0, 23.0),
        (750, 1, "LOW", "Feeder", "LOW", 1.0, 21.5),
        (650, 1, "LOW", "Feeder", "LOW", 1.0, 18.5)
    ]:
        v = {"container_count": c_cnt, "priority": p, "vessel_size": v_size}
        samples.append(create_planning_features(v, cranes, c_lvl, wait))
        durations.append(dur)

    X = pd.concat(samples, ignore_index=True)
    y = np.array(durations)
    return X, y

def train_and_save_planning_model():
    """Trains and persists the Random Forest Operational Planning Duration Regressor."""
    X, y = build_planning_training_dataset()
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42))
    ])

    pipeline.fit(X, y)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"[ML] Trained and saved Planning Duration model to {MODEL_PATH}")
    return pipeline

if __name__ == "__main__":
    train_and_save_planning_model()
