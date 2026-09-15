import pandas as pd
import numpy as np
from pathlib import Path
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from .berth_features import BERTH_FEATURE_COLUMNS, create_berth_features

MODEL_PATH = Path(__file__).resolve().parent / "berth_model.pkl"

def build_berth_training_dataset():
    """
    Constructs operational training pairs mapping vessel specifications and terminal assignments
    to historically verified, draft-compatible berth allocations.
    """
    samples = []
    labels = []

    # Terminal 1: B01 (Ultra Large), B02 (Ultra Large), B03 (Large)
    for c_cnt, v_size, p, berth in [
        (2100, "Ultra Large", "HIGH", "B01"),
        (1950, "Ultra Large", "HIGH", "B01"),
        (1850, "Ultra Large", "HIGH", "B02"),
        (1900, "Ultra Large", "MEDIUM", "B02"),
        (1450, "Large", "MEDIUM", "B03"),
        (1300, "Large", "LOW", "B03"),
        (1100, "Medium", "LOW", "B03")
    ]:
        v = {"container_count": c_cnt, "vessel_size": v_size, "priority": p}
        samples.append(create_berth_features(v, "T1"))
        labels.append(berth)

    # Terminal 2: B04 (Large), B05 (Large), B06 (Medium)
    for c_cnt, v_size, p, berth in [
        (1600, "Large", "HIGH", "B04"),
        (1500, "Large", "MEDIUM", "B04"),
        (1400, "Large", "LOW", "B05"),
        (1300, "Large", "MEDIUM", "B05"),
        (1200, "Medium", "MEDIUM", "B06"),
        (1100, "Medium", "HIGH", "B06"),
        (800, "Feeder", "LOW", "B06")
    ]:
        v = {"container_count": c_cnt, "vessel_size": v_size, "priority": p}
        samples.append(create_berth_features(v, "T2"))
        labels.append(berth)

    # Terminal 3: B07 (Ultra Large), B08 (Large), B09 (Medium)
    for c_cnt, v_size, p, berth in [
        (2000, "Ultra Large", "HIGH", "B07"),
        (1800, "Ultra Large", "HIGH", "B07"),
        (1750, "Large", "MEDIUM", "B08"),
        (1650, "Large", "LOW", "B08"),
        (1300, "Medium", "MEDIUM", "B09"),
        (950, "Medium", "MEDIUM", "B09"),
        (750, "Feeder", "LOW", "B09")
    ]:
        v = {"container_count": c_cnt, "vessel_size": v_size, "priority": p}
        samples.append(create_berth_features(v, "T3"))
        labels.append(berth)

    # Terminal 4: B10 (Medium), B11 (Feeder)
    for c_cnt, v_size, p, berth in [
        (1350, "Medium", "LOW", "B10"),
        (1100, "Medium", "MEDIUM", "B10"),
        (900, "Feeder", "LOW", "B11"),
        (800, "Feeder", "LOW", "B11"),
        (650, "Feeder", "LOW", "B11")
    ]:
        v = {"container_count": c_cnt, "vessel_size": v_size, "priority": p}
        samples.append(create_berth_features(v, "T4"))
        labels.append(berth)

    X = pd.concat(samples, ignore_index=True)
    y = np.array(labels)
    return X, y

def train_and_save_berth_model():
    """Trains and persists the Random Forest Berth Assignment Classifier."""
    X, y = build_berth_training_dataset()
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42, class_weight='balanced'))
    ])

    pipeline.fit(X, y)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"[ML] Trained and saved Berth Assignment model to {MODEL_PATH}")
    return pipeline

if __name__ == "__main__":
    train_and_save_berth_model()
