# Machine Learning Congestion Model

## Architecture & Explainability
The ML module utilizes a supervised **Random Forest Classifier** implemented via `scikit-learn` to forecast terminal congestion levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) along with confidence probabilities.

### Input Features & Engineering
1. **`vessel_count`**: Total inbound and queued vessels.
2. **`container_count`**: Aggregate TEU cargo volume.
3. **`available_berths`**: Free quay slots.
4. **`available_cranes`**: Total functional quay cranes.
5. **`vessels_per_berth`**: Engineered ratio representing physical berth pressure.
6. **`containers_per_crane`**: Engineered ratio representing crane workload intensity.

### Model Training Workflow
```
historical_congestion.csv
         ↓
preprocessing.py (cleaning & missing value handling)
         ↓
feature_engineering.py (ratio calculation)
         ↓
train_model.py (RandomForestClassifier, max_depth=5, 50 estimators)
         ↓
congestion_model.pkl
```

### Inference Output
The inference module (`predict.py`) loads `congestion_model.pkl` and provides automated fallback heuristics if the serialized model is absent:
```json
{
  "probability": 0.87,
  "level": "HIGH",
  "predicted_wait_hours": 8.0
}
```
