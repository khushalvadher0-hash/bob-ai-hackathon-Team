import pandas as pd
import numpy as np
from pathlib import Path
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from .routing_features import ROUTING_FEATURE_COLUMNS, create_routing_features

MODEL_PATH = Path(__file__).resolve().parent / "routing_model.pkl"

def build_training_dataset():
    """
    Constructs operational training pairs based on actual historical congestion records,
    vessel workloads, and terminal wait-time performance.
    """
    samples = []
    labels = []

    # Scenario 1: Heavy Congestion in T1 (CRITICAL/HIGH wait > 8h) -> Reroute to T3 or T2
    for c_cnt in [1400, 1600, 1850, 1950, 2100]:
        vessel = {"current_terminal": "T1", "container_count": c_cnt, "priority": "HIGH", "vessel_size": "Ultra Large"}
        c_map = {
            "T1": {"vessel_count": 5, "container_count": 9200, "available_berths": 0, "available_cranes": 1, "predicted_wait_hours": 12.5, "congestion_level": "CRITICAL"},
            "T2": {"vessel_count": 3, "container_count": 5200, "available_berths": 2, "available_cranes": 3, "predicted_wait_hours": 4.5, "congestion_level": "MEDIUM"},
            "T3": {"vessel_count": 1, "container_count": 2200, "available_berths": 2, "available_cranes": 5, "predicted_wait_hours": 1.8, "congestion_level": "LOW"},
            "T4": {"vessel_count": 1, "container_count": 1500, "available_berths": 1, "available_cranes": 2, "predicted_wait_hours": 2.0, "congestion_level": "LOW"}
        }
        feat = create_routing_features(vessel, c_map, "T3")
        samples.append(feat)
        labels.append("T3")

    # Scenario 2: Moderate Congestion in T2 -> Reroute to T3 if high volume, else stay T2
    for c_cnt in [800, 1000, 1200]:
        vessel = {"current_terminal": "T2", "container_count": c_cnt, "priority": "MEDIUM", "vessel_size": "Medium"}
        c_map = {
            "T1": {"vessel_count": 4, "container_count": 8000, "available_berths": 1, "available_cranes": 2, "predicted_wait_hours": 9.0, "congestion_level": "HIGH"},
            "T2": {"vessel_count": 2, "container_count": 3800, "available_berths": 2, "available_cranes": 4, "predicted_wait_hours": 3.0, "congestion_level": "LOW"},
            "T3": {"vessel_count": 2, "container_count": 3200, "available_berths": 2, "available_cranes": 5, "predicted_wait_hours": 2.2, "congestion_level": "LOW"},
            "T4": {"vessel_count": 1, "container_count": 1100, "available_berths": 2, "available_cranes": 3, "predicted_wait_hours": 1.5, "congestion_level": "LOW"}
        }
        feat = create_routing_features(vessel, c_map, "T3")
        samples.append(feat)
        labels.append("T2")

    # Scenario 3: Low Congestion across port -> Stay at Current Terminal (T1/T2/T3/T4)
    for term in ["T1", "T2", "T3", "T4"]:
        vessel = {"current_terminal": term, "container_count": 1100, "priority": "LOW", "vessel_size": "Large"}
        c_map = {
            t: {"vessel_count": 1, "container_count": 2000, "available_berths": 2, "available_cranes": 4, "predicted_wait_hours": 1.8, "congestion_level": "LOW"}
            for t in ["T1", "T2", "T3", "T4"]
        }
        feat = create_routing_features(vessel, c_map, "T3" if term != "T3" else "T1")
        samples.append(feat)
        labels.append(term)

    # Scenario 4: T1 High Queues for Feeder Vessels -> Reroute to T4 or T3
    for c_cnt in [650, 750, 900]:
        vessel = {"current_terminal": "T1", "container_count": c_cnt, "priority": "LOW", "vessel_size": "Feeder"}
        c_map = {
            "T1": {"vessel_count": 5, "container_count": 9000, "available_berths": 0, "available_cranes": 1, "predicted_wait_hours": 11.5, "congestion_level": "CRITICAL"},
            "T2": {"vessel_count": 3, "container_count": 5500, "available_berths": 1, "available_cranes": 3, "predicted_wait_hours": 5.0, "congestion_level": "MEDIUM"},
            "T3": {"vessel_count": 1, "container_count": 1800, "available_berths": 2, "available_cranes": 5, "predicted_wait_hours": 1.5, "congestion_level": "LOW"},
            "T4": {"vessel_count": 1, "container_count": 1200, "available_berths": 2, "available_cranes": 3, "predicted_wait_hours": 1.2, "congestion_level": "LOW"}
        }
        feat = create_routing_features(vessel, c_map, "T4")
        samples.append(feat)
        labels.append("T4")

    X = pd.concat(samples, ignore_index=True)
    y = np.array(labels)
    return X, y

def train_and_save_routing_model():
    """Trains and persists the Random Forest Alternate Routing Classifier."""
    X, y = build_training_dataset()
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42, class_weight='balanced'))
    ])

    pipeline.fit(X, y)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"[ML] Trained and saved Alternate Routing model to {MODEL_PATH}")
    return pipeline

if __name__ == "__main__":
    train_and_save_routing_model()
