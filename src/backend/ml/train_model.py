import sys
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    classification_report
)

# Ensure base directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR.parent) not in sys.path:
    sys.path.insert(0, str(BASE_DIR.parent))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.ml.preprocessing import clean_congestion_data
from backend.ml.feature_engineering import create_congestion_features, FEATURE_COLUMNS

DATA_PATH = BASE_DIR / "data" / "historical_congestion.csv"
MODEL_PATH = Path(__file__).resolve().parent / "congestion_model.pkl"

def load_training_data() -> pd.DataFrame:
    """
    Loads historical congestion dataset from MongoDB congestion_history collection,
    falling back to backend/data/historical_congestion.csv if database is unavailable.
    """
    try:
        from backend.database.database import get_database
        db = get_database()
        records = list(db.congestion_history.find({}))
        if records and len(records) >= 10:
            for r in records:
                if "_id" in r:
                    del r["_id"]
            print(f"[INFO] Loaded {len(records)} training records from MongoDB Atlas.")
            return pd.DataFrame(records)
    except Exception as e:
        print(f"[INFO] MongoDB load notice: {e}. Using CSV data.")

    if DATA_PATH.exists():
        print(f"[INFO] Loaded historical records from {DATA_PATH.name}.")
        return pd.read_csv(DATA_PATH)

    raise FileNotFoundError(f"No historical congestion dataset found at {DATA_PATH} or MongoDB.")

def train():
    """
    Trains explainable RandomForestClassifier on engineered operational features.
    Evaluates multi-class accuracy, precision, recall, F1, confusion matrix, ROC-AUC,
    and logs feature importances.
    """
    print("=" * 65)
    print("[INFO] Training Random Forest Port Congestion Prediction Model...")
    print("=" * 65)

    df_raw = load_training_data()
    df_clean = clean_congestion_data(df_raw)

    X = create_congestion_features(df_clean)
    y = df_clean['congestion_level']

    print(f"Total training samples: {len(X)}")
    print(f"Engineered Features ({len(FEATURE_COLUMNS)}): {list(X.columns)}")
    print("\nClass Distribution:")
    print(y.value_counts().to_string())

    # Stratified train/validation split
    min_class_samples = y.value_counts().min()
    stratify_target = y if min_class_samples >= 2 and len(X) >= 10 else None
    test_size = 0.2 if len(X) >= 15 else 0.1

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=42,
        stratify=stratify_target
    )

    print(f"\nTrain set size: {len(X_train)} | Validation set size: {len(X_test)}")

    # Initialize Random Forest with balanced class weights
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        min_samples_split=2,
        class_weight="balanced",
        random_state=42
    )

    clf.fit(X_train, y_train)

    # ── Evaluation ───────────────────────────────────────────────────────────
    y_pred = clf.predict(X_test)
    y_pred_proba = clf.predict_proba(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec_macro = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec_macro = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    print("\n" + "-" * 65)
    print("Model Evaluation Metrics on Validation Set:")
    print(f"  • Accuracy:         {acc * 100:.1f}%")
    print(f"  • Precision (wt):   {prec_macro * 100:.1f}%")
    print(f"  • Recall (wt):      {rec_macro * 100:.1f}%")
    print(f"  • F1-Score (wt):    {f1_macro * 100:.1f}%")

    # Multiclass ROC-AUC (OVR)
    try:
        auc = roc_auc_score(y_test, y_pred_proba, multi_class="ovr", average="weighted")
        print(f"  • ROC-AUC (OVR):    {auc:.3f}")
    except Exception as e:
        print(f"  • ROC-AUC (OVR):    N/A (Subset contains single class in test slice: {e})")

    # Confusion Matrix
    print("\nConfusion Matrix:")
    labels = sorted(list(set(y_test) | set(y_pred)))
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    cm_df = pd.DataFrame(cm, index=[f"Actual_{l}" for l in labels], columns=[f"Pred_{l}" for l in labels])
    print(cm_df.to_string())

    # Feature Importances
    print("\nOperational Feature Importance Breakdown:")
    importances = clf.feature_importances_
    feat_imp = pd.DataFrame({
        "Feature": X.columns,
        "Importance": importances
    }).sort_values(by="Importance", ascending=False)
    for _, row in feat_imp.iterrows():
        print(f"  • {row['Feature']:<24}: {row['Importance'] * 100:5.2f}%")

    # Save model artifact
    joblib.dump(clf, MODEL_PATH)
    print("\n" + "=" * 65)
    print(f"[SUCCESS] Trained model successfully saved to:\n  {MODEL_PATH}")
    print("=" * 65)

    return clf

if __name__ == "__main__":
    train()
