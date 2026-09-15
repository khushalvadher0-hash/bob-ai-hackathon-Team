import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from .preprocessing import clean_congestion_data
from .feature_engineering import extract_features

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "historical_congestion.csv"
MODEL_PATH = Path(__file__).resolve().parent / "congestion_model.pkl"

def train():
    if not DATA_PATH.exists():
        print(f"Data file not found at {DATA_PATH}")
        return None
        
    df = pd.read_csv(DATA_PATH)
    df_clean = clean_congestion_data(df)
    X = extract_features(df_clean)
    y = df_clean['congestion_level']
    
    # Train simple explainable Random Forest
    clf = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)
    clf.fit(X, y)
    
    joblib.dump(clf, MODEL_PATH)
    print(f"Congestion ML Model saved to {MODEL_PATH}")
    return clf

if __name__ == "__main__":
    train()
