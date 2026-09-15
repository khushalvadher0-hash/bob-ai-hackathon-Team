from typing import List, Dict, Any, Optional
from datetime import datetime
from ..database.database import get_database
from ..ml.predict import predict_congestion
from .vessel_service import get_all_vessels

VALID_TERMINALS = ["T1", "T2", "T3", "T4"]
TERMINAL_METADATA = {
    "T1": {"name": "North Deepwater Terminal", "type": "Deepwater", "berths": 3, "cranes": 10},
    "T2": {"name": "East Pier Container Terminal", "type": "Container", "berths": 3, "cranes": 8},
    "T3": {"name": "South Gateway Terminal", "type": "General Cargo", "berths": 3, "cranes": 7},
    "T4": {"name": "West River Feeder Terminal", "type": "Feeder", "berths": 2, "cranes": 4}
}

SEVERITY_RANK = {
    "CRITICAL": 0,
    "HIGH": 1,
    "MEDIUM": 2,
    "LOW": 3
}

def _clean_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Removes MongoDB internal _id from returned document for clean JSON serialization."""
    if doc and "_id" in doc:
        del doc["_id"]
    return doc

def generate_insights(data: Dict[str, Any]) -> List[str]:
    """
    Converts raw operational outputs into intelligent, human-readable insights that simulate an AI assistant.
    """
    insights: List[str] = []

    # 1. Based on congestion_level
    lvl = str(data.get("congestion_level", "LOW")).upper()
    if lvl in ["HIGH", "CRITICAL"]:
        insights.append("⚠ High congestion expected. Immediate action required. Consider rerouting vessels to alternate terminals.")
    elif lvl in ["MEDIUM", "MED"]:
        insights.append("⚡ Moderate congestion detected. Optimize berth allocation to prevent delays.")
    else:
        insights.append("✅ Port operating under optimal conditions. No immediate action required.")

    # 2. Based on crane usage
    crane_util = float(data.get("crane_utilization", 0.0))
    avail_cranes = int(data.get("available_cranes", 1))
    assigned_cranes = int(data.get("assigned_cranes", 0))

    if crane_util >= 0.70 or avail_cranes == 0 or assigned_cranes >= 4:
        insights.append("🚧 Crane capacity is fully utilized. Risk of delay increases.")
    else:
        insights.append("🟢 Crane capacity is sufficient.")

    return insights

def predict_congestion_engine(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Task 1: AI Congestion Prediction Engine
    Calculates multi-factor normalized score (0–100):
      congestion_score = (vessels_norm * 0.40) + (avg_wait_norm * 0.30) + (berth_util * 0.20) + (crane_util * 0.10)
    Classification:
      score > 70  -> HIGH (or CRITICAL if > 85)
      40 <= score <= 70 -> MEDIUM
      score < 40  -> LOW
    """
    v_count = float(features.get("vessel_count", 0))
    avg_wait = float(features.get("expected_wait_hours", 2.0))
    berth_util = float(features.get("berth_utilization", 0.0))
    crane_util = float(features.get("crane_utilization", 0.0))

    # Normalized components (0 to 100)
    vessels_norm = min(100.0, (v_count / 5.0) * 100.0)
    wait_norm = min(100.0, (avg_wait / 12.0) * 100.0)
    berth_norm = min(100.0, berth_util * 100.0)
    crane_norm = min(100.0, crane_util * 100.0)

    # Multi-criteria weighted sum
    raw_score = (vessels_norm * 0.40) + (wait_norm * 0.30) + (berth_norm * 0.20) + (crane_norm * 0.10)
    congestion_score = round(max(5.0, min(99.0, raw_score)), 1)

    if congestion_score > 85.0:
        level = "CRITICAL"
    elif congestion_score > 70.0:
        level = "HIGH"
    elif congestion_score >= 40.0:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "congestion_score": congestion_score,
        "congestion_level": level,
        "probability": round(congestion_score, 1),
        "factors": {
            "vessels_norm": round(vessels_norm, 1),
            "wait_norm": round(wait_norm, 1),
            "berth_util_norm": round(berth_norm, 1),
            "crane_util_norm": round(crane_norm, 1)
        }
    }

def predict_terminal_congestion(terminal_id: str) -> Optional[Dict[str, Any]]:
    """
    Computes real-time AI congestion prediction for a given terminal based on
    actual vessel manifests, berth occupancy, and quay crane availability.
    """
    t_id_clean = terminal_id.strip().upper()
    if t_id_clean not in VALID_TERMINALS:
        return None

    # 1. Fetch current vessels targeting this terminal
    vessels = get_all_vessels()
    sub_vessels = [
        v for v in vessels
        if str(v.get("current_terminal") or v.get("terminal_id", "")).upper() == t_id_clean
    ]
    v_count = len(sub_vessels)
    c_count = sum(int(v.get("container_count", v.get("teu", 0))) for v in sub_vessels)

    # 2. Fetch berth status from MongoDB
    berths = []
    try:
        db = get_database()
        berths = [_clean_doc(b) for b in db.berths.find({"terminal_id": t_id_clean})]
    except Exception:
        pass

    if berths:
        avail_berths = len([b for b in berths if b.get("status") == "AVAILABLE" or b.get("available") is True])
        avail_cranes = sum(int(b.get("crane_count", 2)) for b in berths if b.get("status") == "AVAILABLE" or b.get("available") is True)
        total_berths = len(berths)
        total_cranes = sum(int(b.get("crane_count", 2)) for b in berths)
    else:
        # Fallback to standard terminal layout
        meta = TERMINAL_METADATA.get(t_id_clean, {"berths": 3, "cranes": 8})
        total_berths = meta["berths"]
        total_cranes = meta["cranes"]
        avail_berths = max(1, total_berths - min(v_count, total_berths))
        avail_cranes = max(2, int(total_cranes * (avail_berths / max(total_berths, 1))))

    # 3. Calculate utilization metrics
    occupied_berths = max(0, total_berths - avail_berths)
    used_cranes = max(0, total_cranes - avail_cranes)
    berth_utilization = round(occupied_berths / max(total_berths, 1), 2)
    crane_utilization = round(used_cranes / max(total_cranes, 1), 2)

    # Estimated queue wait based on container workload vs active crane capacity (35 TEU/hr/crane)
    active_crane_rate = max(70, (total_cranes - used_cranes) * 35)
    est_wait_hours = max(1.5, round((c_count / active_crane_rate) + (v_count * 1.2), 1))

    # 4. Prepare operational feature payload for AI engine
    features_payload = {
        "vessel_count": v_count,
        "container_count": c_count,
        "available_berths": avail_berths,
        "available_cranes": avail_cranes,
        "berth_utilization": berth_utilization,
        "crane_utilization": crane_utilization,
        "expected_wait_hours": est_wait_hours
    }

    # 5. Execute AI Congestion Prediction Engine
    ai_prediction = predict_congestion_engine(features_payload)
    final_level = ai_prediction["congestion_level"]
    congestion_score = ai_prediction["congestion_score"]

    # Determine assigned berth and crane allocation
    terminal_name = TERMINAL_METADATA.get(t_id_clean, {}).get("name", f"Terminal {t_id_clean}")
    avail_berth_objs = [b for b in berths if b.get("status") == "AVAILABLE" or b.get("available") is True]
    
    if avail_berth_objs:
        primary_berth = avail_berth_objs[0].get("berth_id", f"B01")
        primary_cranes = int(avail_berth_objs[0].get("crane_count", 3))
    elif berths:
        primary_berth = berths[0].get("berth_id", "B01")
        primary_cranes = int(berths[0].get("crane_count", 3))
    else:
        default_berth_map = {"T1": "B01", "T2": "B04", "T3": "B06", "T4": "B08"}
        primary_berth = default_berth_map.get(t_id_clean, "B01")
        primary_cranes = 4 if t_id_clean in ["T1", "T2"] else 3

    # Generate transparent AI Explanation (WHY)
    if final_level in ["HIGH", "CRITICAL"]:
        alt_target = "Terminal T3" if t_id_clean != "T3" else "Terminal T2"
        why_text = f"High bottleneck risk detected (Score: {congestion_score}/100) due to {v_count} vessels waiting ({c_count:,} TEU) and {int(berth_utilization*100)}% berth occupancy. Divert approaching traffic to {alt_target}."
        recommendation_text = f"High congestion at {terminal_name}. Reroute inbound vessels to {alt_target} to save ~{est_wait_hours:.1f}h queue time."
    elif final_level == "MEDIUM":
        why_text = f"Moderate traffic flow (Score: {congestion_score}/100). {avail_berths} open berth(s) available. Allocate Berth {primary_berth} with {primary_cranes} cranes to clear queue."
        recommendation_text = f"Moderate traffic at {terminal_name}. Berth {primary_berth} is assigned with {primary_cranes} cranes ready."
    else:
        why_text = f"Optimal port efficiency (Score: {congestion_score}/100). {avail_berths} of {total_berths} berths free with immediate docking."
        recommendation_text = f"Normal operations at {terminal_name}. Immediate berthing scheduled at {primary_berth} with {primary_cranes} cranes."

    now_iso = datetime.now().isoformat()
    record = {
        "terminal_id": t_id_clean,
        "terminal_name": terminal_name,
        "terminal": terminal_name,
        "congestion_level": final_level,
        "congestion_score": congestion_score,
        "assigned_berth": primary_berth,
        "assigned_cranes": primary_cranes,
        "recommendation": recommendation_text,
        "explanation": why_text,
        "why": why_text,
        "prediction_time": now_iso,
        "created_at": now_iso,
        "probability": ai_prediction["probability"],
        "expected_queue": v_count,
        "expected_wait_hours": est_wait_hours,
        "predicted_wait_hours": est_wait_hours,
        "available_berths": avail_berths,
        "available_cranes": avail_cranes,
        "total_berths": total_berths,
        "total_cranes": total_cranes,
        "berth_utilization": berth_utilization,
        "crane_utilization": crane_utilization,
        "vessel_count": v_count,
        "container_count": c_count,
    }

    # Generate smart AI-style insights
    record["insights"] = generate_insights(record)




    # 6. Save prediction in MongoDB congestion_predictions collection
    try:
        db = get_database()
        db.congestion_predictions.update_one(
            {"terminal_id": t_id_clean},
            {"$set": record},
            upsert=True
        )
    except Exception as e:
        print(f"[INFO] Notice persisting prediction in MongoDB: {e}")

    return record

def get_congestion_predictions() -> List[Dict[str, Any]]:
    """
    Returns real-time predictions for all port terminals, sorted by severity order:
    CRITICAL -> HIGH -> MEDIUM -> LOW, with secondary sort by probability descending.
    """
    predictions = []
    for t_id in VALID_TERMINALS:
        pred = predict_terminal_congestion(t_id)
        if pred:
            predictions.append(pred)

    # Sort terminals by severity rank (CRITICAL first), then probability descending
    predictions.sort(
        key=lambda x: (
            SEVERITY_RANK.get(x.get("congestion_level", "LOW"), 3),
            -float(x.get("probability", 0.0)),
            -float(x.get("expected_wait_hours", 0.0))
        )
    )

    return predictions

def get_terminal_congestion(terminal_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves or calculates prediction metrics for a specific terminal ID.
    Returns None if terminal ID is invalid.
    """
    if not terminal_id:
        return None
    return predict_terminal_congestion(terminal_id)

def get_terminal_congestion_by_id(terminal_id: str) -> Optional[Dict[str, Any]]:
    """Alias for backwards compatibility."""
    return get_terminal_congestion(terminal_id)

def get_terminal_congestion_status() -> List[Dict[str, Any]]:
    """Alias for backwards compatibility (used by Person 2 modules)."""
    return get_congestion_predictions()

def save_congestion_prediction(prediction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Explicitly saves a congestion prediction document into MongoDB."""
    t_id = prediction_data.get("terminal_id")
    if not t_id:
        raise ValueError("terminal_id is required")
    db = get_database()
    clean_data = dict(prediction_data)
    if "_id" in clean_data:
        del clean_data["_id"]
    db.congestion_predictions.update_one({"terminal_id": t_id}, {"$set": clean_data}, upsert=True)
    return clean_data
