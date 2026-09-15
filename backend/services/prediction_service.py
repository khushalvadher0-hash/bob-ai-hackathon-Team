import math
from datetime import datetime
from typing import Dict, Any, List, Optional
from ..database.database import get_database
from .vessel_service import get_all_vessels

def get_congestion_history() -> List[Dict[str, Any]]:
    """Fetches past port congestion snapshots from MongoDB."""
    try:
        db = get_database()
        cursor = db.congestion_history.find({})
        history = []
        for doc in cursor:
            if "_id" in doc:
                del doc["_id"]
            history.append(doc)
        if history:
            return history
    except Exception as e:
        print(f"Notice reading congestion_history: {e}")

    # Fallback default historical distribution if database is fresh
    return [
        {"total_teu": 4200, "total_vessels": 4, "congestion_level": "LOW", "expected_delay": 1.5, "probability": 15.0},
        {"total_teu": 7800, "total_vessels": 7, "congestion_level": "LOW", "expected_delay": 2.2, "probability": 28.0},
        {"total_teu": 11500, "total_vessels": 10, "congestion_level": "MEDIUM", "expected_delay": 4.5, "probability": 54.0},
        {"total_teu": 14200, "total_vessels": 12, "congestion_level": "HIGH", "expected_delay": 7.8, "probability": 79.5},
        {"total_teu": 18500, "total_vessels": 15, "congestion_level": "HIGH", "expected_delay": 9.2, "probability": 86.0},
        {"total_teu": 23000, "total_vessels": 18, "congestion_level": "CRITICAL", "expected_delay": 14.0, "probability": 94.5},
        {"total_teu": 28000, "total_vessels": 22, "congestion_level": "CRITICAL", "expected_delay": 18.5, "probability": 98.0}
    ]

def predict_port_congestion_similarity() -> Dict[str, Any]:
    """
    Nearest Neighbor (Similarity Matching) Congestion Prediction:
    1. Aggregates current live fleet metrics (total TEU, total vessels, status breakdown, high-risk ships).
    2. Compares current total TEU and vessel count against historical congestion records in `congestion_history`.
    3. Finds the top-k nearest historical records using normalized Euclidean distance.
    4. Computes interpolated congestion level, expected delay hours, and congestion probability %.
    5. Persists the prediction snapshot into `congestion_predictions`.
    """
    vessels = get_all_vessels()
    total_vessels = len(vessels)
    total_teu = sum(int(v.get("container_count", v.get("teu", 0))) for v in vessels)

    # Calculate status distribution
    scheduled_count = 0
    queued_count = 0
    approaching_count = 0
    high_risk_count = 0

    for v in vessels:
        st = str(v.get("status", "")).upper()
        if st in ["QUEUED", "WAITING"]:
            queued_count += 1
        elif st in ["APPROACHING", "IN_TRANSIT"]:
            approaching_count += 1
        else:
            scheduled_count += 1

        risk = str(v.get("risk_level", "LOW")).upper()
        priority = str(v.get("priority", "MEDIUM")).upper()
        teu = int(v.get("container_count", v.get("teu", 0)))
        if risk == "HIGH" or priority == "HIGH" or teu > 1800:
            high_risk_count += 1

    # Load historical congestion dataset
    history = get_congestion_history()

    # Nearest Neighbor Similarity Calculation
    # Normalize TEU by 30,000 and Vessels by 25
    scored_history = []
    for record in history:
        hist_teu = float(record.get("total_teu", 10000))
        hist_vessels = float(record.get("total_vessels", 10))

        # Euclidean distance in normalized feature space
        d_teu = (total_teu - hist_teu) / 30000.0
        d_vsl = (total_vessels - hist_vessels) / 25.0
        dist = math.sqrt(d_teu ** 2 + d_vsl ** 2)

        scored_history.append((dist, record))

    # Sort by distance (ascending) -> closest historical matches
    scored_history.sort(key=lambda x: x[0])
    
    # Take top 3 nearest neighbors (k=3)
    k_nearest = scored_history[:3] if len(scored_history) >= 3 else scored_history
    
    # Weighted average based on inverse distance
    total_weight = 0.0
    weighted_delay = 0.0
    weighted_prob = 0.0

    level_votes = {}
    for dist, rec in k_nearest:
        weight = 1.0 / (dist + 0.05) # smoothing
        total_weight += weight
        weighted_delay += float(rec.get("expected_delay", 4.0)) * weight
        weighted_prob += float(rec.get("probability", 50.0)) * weight

        lvl = rec.get("congestion_level", "MEDIUM")
        level_votes[lvl] = level_votes.get(lvl, 0) + weight

    pred_delay = round(weighted_delay / max(total_weight, 0.001), 1)
    pred_prob = round(weighted_prob / max(total_weight, 0.001), 1)

    # Determine dominant congestion level
    pred_level = max(level_votes.items(), key=lambda x: x[1])[0] if level_votes else "MEDIUM"

    now_iso = datetime.now().isoformat()

    prediction_doc = {
        "total_teu": total_teu,
        "total_vessels": total_vessels,
        "high_risk_vessels": high_risk_count,
        "congestion_level": pred_level,
        "expected_delay": pred_delay,
        "probability": pred_prob,
        "congestion_probability": pred_prob,
        "timestamp": now_iso,
        "nearest_match": k_nearest[0][1] if k_nearest else {}
    }

    # Save to congestion_predictions collection in MongoDB
    try:
        db = get_database()
        db.congestion_predictions.update_one(
            {"type": "port_overall_forecast"},
            {"$set": prediction_doc},
            upsert=True
        )
    except Exception as e:
        print(f"Notice saving congestion_predictions to MongoDB: {e}")

    return prediction_doc

def get_dashboard_summary_data() -> Dict[str, Any]:
    """
    Computes dashboard summary matching the frontend UI requirements:
    - total_vessels
    - high_risk_vessels
    - congested_terminals
    - available_berths
    - active_cranes
    - congestion_probability
    - expected_delay
    - vessel_distribution: { scheduled, queued, approaching }
    """
    vessels = get_all_vessels()
    pred = predict_port_congestion_similarity()

    # Berths and cranes lookup from MongoDB / defaults
    available_berths = 4
    active_cranes = 18
    congested_terminals = 1

    try:
        db = get_database()
        berths = list(db.berths.find({}))
        if berths:
            available_berths = len([b for b in berths if b.get("status") == "AVAILABLE" or b.get("available") is True])
            active_cranes = sum(int(b.get("crane_count", 2)) for b in berths)

        # Count congested terminals
        if pred["congestion_level"] in ["HIGH", "CRITICAL"]:
            congested_terminals = 2
        elif pred["congestion_level"] == "MEDIUM":
            congested_terminals = 1
        else:
            congested_terminals = 0
    except Exception:
        pass

    scheduled_count = 0
    queued_count = 0
    approaching_count = 0

    for v in vessels:
        st = str(v.get("status", "")).upper()
        if st in ["QUEUED", "WAITING"]:
            queued_count += 1
        elif st in ["APPROACHING", "IN_TRANSIT"]:
            approaching_count += 1
        else:
            scheduled_count += 1

    return {
        "total_vessels": len(vessels),
        "high_risk_vessels": pred.get("high_risk_vessels", 0),
        "congested_terminals": congested_terminals,
        "available_berths": available_berths,
        "active_cranes": active_cranes,
        "congestion_probability": pred.get("probability", 75.0),
        "expected_delay": pred.get("expected_delay", 5.0),
        "vessel_distribution": {
            "scheduled": scheduled_count,
            "queued": queued_count,
            "approaching": approaching_count
        }
    }
