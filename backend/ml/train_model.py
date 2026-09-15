import sys
from pathlib import Path
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Ensure base directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR.parent) not in sys.path:
    sys.path.insert(0, str(BASE_DIR.parent))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.ml.preprocessing import clean_congestion_data
from backend.ml.feature_engineering import create_congestion_features

DATA_PATH = BASE_DIR / "data" / "historical_congestion.csv"
MODEL_PATH = Path(__file__).resolve().parent / "congestion_model.pkl"

def load_training_data() -> pd.DataFrame:
    """
    Loads historical congestion records from MongoDB or local CSV file.
    """
    try:
        from backend.database.database import get_database
        db = get_database()
        records = list(db.congestion_history.find({}))
        if records:
            for r in records:
                if "_id" in r:
                    del r["_id"]
            return pd.DataFrame(records)
    except Exception as e:
        print(f"[INFO] Notice loading from MongoDB: {e}. Falling back to CSV.")
        
    if DATA_PATH.exists():
        return pd.read_csv(DATA_PATH)
    
    raise FileNotFoundError(f"No training data found at {DATA_PATH} or MongoDB congestion_history collection.")

def train():
    """
    Trains explainable RandomForestClassifier on historical congestion metrics.
    """
    print("=" * 60)
    print("[INFO] Training Random Forest Congestion Classification Model...")
    print("=" * 60)
    
    df_raw = load_training_data()
    df_clean = clean_congestion_data(df_raw)
    
    X = create_congestion_features(df_clean)
    y = df_clean['congestion_level']
    
    print(f"Dataset samples: {len(X)}")
    print(f"Features: {list(X.columns)}")
    print(f"Target distribution:\n{y.value_counts()}")
    
    # Stratified train/test split if minimum samples per class >= 2
    min_class_count = y.value_counts().min()
    stratify_option = y if min_class_count >= 2 and len(X) >= 10 else None
    
    test_size = 0.2 if len(X) >= 15 else 0.1
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=stratify_option
    )
    
    # Train Random Forest Classifier
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        min_samples_split=2,
        random_state=42
    )
    clf.fit(X_train, y_train)
    
    # Evaluate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Validation Accuracy: {acc * 100:.1f}%")
    
    # Save model
    import joblib
    joblib.dump(clf, MODEL_PATH)
    print(f"[SUCCESS] Trained model saved to: {MODEL_PATH}")
    print("=" * 60)
    return clf

if __name__ == "__main__":
    train()
