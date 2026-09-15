import sys
from pathlib import Path
import pandas as pd

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR.parent) not in sys.path:
    sys.path.insert(0, str(BASE_DIR.parent))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.database.database import get_database, check_connection, initialize_database

DATA_DIR = BASE_DIR / "data"

def seed_vessels(db) -> int:
    csv_file = DATA_DIR / "vessels.csv"
    if not csv_file.exists():
        return 0
    df = pd.read_csv(csv_file).fillna("")
    count = 0
    for _, row in df.iterrows():
        doc = row.to_dict()
        v_id = str(doc.get("vessel_id", "")).strip()
        if not v_id:
            continue
        if "current_terminal" in doc and "terminal_id" not in doc:
            doc["terminal_id"] = doc["current_terminal"]
        if "departure_deadline" in doc and "departure_time" not in doc:
            doc["departure_time"] = doc["departure_deadline"]
        if "container_count" in doc:
            try:
                doc["container_count"] = int(doc["container_count"])
            except (ValueError, TypeError):
                doc["container_count"] = 0
        db.vessels.update_one({"vessel_id": v_id}, {"$set": doc}, upsert=True)
        count += 1
    return count

def seed_berths(db) -> int:
    csv_file = DATA_DIR / "berths.csv"
    if not csv_file.exists():
        return 0
    df = pd.read_csv(csv_file).fillna("")
    count = 0
    for _, row in df.iterrows():
        doc = row.to_dict()
        b_id = str(doc.get("berth_id", "")).strip()
        if not b_id:
            continue
        if "capacity" in doc:
            try:
                doc["capacity"] = int(doc["capacity"])
                doc["length_capacity"] = doc["capacity"]
            except (ValueError, TypeError):
                doc["capacity"] = 2000
        if "crane_count" in doc:
            try:
                doc["crane_count"] = int(doc["crane_count"])
            except (ValueError, TypeError):
                doc["crane_count"] = 2
        doc["available"] = (doc.get("status") == "AVAILABLE")
        doc["occupied"] = (doc.get("status") == "OCCUPIED")
        db.berths.update_one({"berth_id": b_id}, {"$set": doc}, upsert=True)
        count += 1
    return count

def seed_ports(db) -> int:
    csv_file = DATA_DIR / "ports.csv"
    if not csv_file.exists():
        return 0
    df = pd.read_csv(csv_file).fillna("")
    count = 0
    for _, row in df.iterrows():
        doc = row.to_dict()
        p_id = str(doc.get("port_id", "")).strip()
        if not p_id:
            continue
        for num_field in ["total_berths", "total_cranes", "daily_capacity"]:
            if num_field in doc:
                try:
                    doc[num_field] = int(doc[num_field])
                except (ValueError, TypeError):
                    doc[num_field] = 0
        for float_field in ["latitude", "longitude"]:
            if float_field in doc:
                try:
                    doc[float_field] = float(doc[float_field])
                except (ValueError, TypeError):
                    pass
        doc["capacity"] = doc.get("daily_capacity", 50000)
        db.ports.update_one({"port_id": p_id}, {"$set": doc}, upsert=True)
        count += 1
    return count

def seed_congestion_history(db) -> int:
    csv_file = DATA_DIR / "historical_congestion.csv"
    if not csv_file.exists():
        return 0
    df = pd.read_csv(csv_file).fillna("")
    count = 0
    for _, row in df.iterrows():
        doc = row.to_dict()
        t_id = str(doc.get("terminal_id", "")).strip()
        ts = str(doc.get("gittimestamp") or doc.get("timestamp") or "").strip()
        if not t_id or not ts:
            continue
        doc["timestamp"] = ts
        if "gittimestamp" in doc:
            del doc["gittimestamp"]
        for num_field in ["vessel_count", "container_count", "available_berths", "available_cranes"]:
            if num_field in doc:
                try:
                    doc[num_field] = int(doc[num_field])
                except (ValueError, TypeError):
                    pass
        if "average_wait_hours" in doc:
            try:
                doc["average_wait_hours"] = float(doc["average_wait_hours"])
            except (ValueError, TypeError):
                pass
        db.congestion_history.update_one(
            {"terminal_id": t_id, "timestamp": ts},
            {"$set": doc},
            upsert=True
        )
        count += 1
    return count

def seed_initial_predictions_and_operations(db):
    terminals = [
        {"terminal_id": "T1", "terminal_name": "North Deepwater Terminal", "congestion_level": "HIGH", "probability": 0.85, "expected_queue": 8, "expected_wait_hours": 9.5},
        {"terminal_id": "T2", "terminal_name": "East Pier Container Terminal", "congestion_level": "LOW", "probability": 0.25, "expected_queue": 2, "expected_wait_hours": 2.0},
        {"terminal_id": "T3", "terminal_name": "South Gateway Terminal", "congestion_level": "MEDIUM", "probability": 0.55, "expected_queue": 4, "expected_wait_hours": 4.5},
        {"terminal_id": "T4", "terminal_name": "West River Feeder Terminal", "congestion_level": "LOW", "probability": 0.15, "expected_queue": 1, "expected_wait_hours": 1.2},
    ]
    pred_count = 0
    for t in terminals:
        doc = {
            "terminal_id": t["terminal_id"],
            "terminal_name": t["terminal_name"],
            "prediction_time": "2026-09-15T12:00:00",
            "congestion_level": t["congestion_level"],
            "probability": t["probability"],
            "expected_queue": t["expected_queue"],
            "expected_wait_hours": t["expected_wait_hours"],
            "predicted_wait_hours": t["expected_wait_hours"]
        }
        db.congestion_predictions.update_one(
            {"terminal_id": t["terminal_id"]},
            {"$set": doc},
            upsert=True
        )
        pred_count += 1

    operations_samples = [
        {"vessel_id": "V001", "vessel_name": "Maersk Mc-Kinney", "terminal_id": "T1", "berth_id": "B01", "cranes": 4, "start_time": "2026-09-15T06:00:00", "end_time": "2026-09-15T19:00:00", "action": "BERTH_ASSIGNED", "status": "PLANNED", "priority": "HIGH"},
        {"vessel_id": "V002", "vessel_name": "Ever Given", "terminal_id": "T1", "berth_id": "B02", "cranes": 3, "start_time": "2026-09-15T08:00:00", "end_time": "2026-09-15T23:00:00", "action": "BERTH_ASSIGNED", "status": "PLANNED", "priority": "HIGH"},
        {"vessel_id": "V003", "vessel_name": "CMA CGM Jacques Saade", "terminal_id": "T2", "berth_id": "B04", "cranes": 3, "start_time": "2026-09-15T09:00:00", "end_time": "2026-09-15T22:00:00", "action": "BERTH_ASSIGNED", "status": "PLANNED", "priority": "MEDIUM"},
        {"vessel_id": "V004", "vessel_name": "MSC Gulsun", "terminal_id": "T3", "berth_id": "B07", "cranes": 4, "start_time": "2026-09-15T10:15:00", "end_time": "2026-09-16T01:00:00", "action": "REROUTED_AND_ASSIGNED", "status": "PLANNED", "priority": "HIGH"},
    ]
    ops_count = 0
    for op in operations_samples:
        db.operations.update_one(
            {"vessel_id": op["vessel_id"]},
            {"$set": op},
            upsert=True
        )
        ops_count += 1

    return pred_count, ops_count

def seed_database():
    """Main seed routine."""
    print("=" * 60)
    print("Seeding MongoDB Database (port_operations)...")
    print("=" * 60)
    if not check_connection():
        print("[NOTICE] Cannot connect to MongoDB Atlas. Please configure MONGODB_URI in backend/.env")
        return

    initialize_database()
    db = get_database()

    v_count = seed_vessels(db)
    b_count = seed_berths(db)
    p_count = seed_ports(db)
    h_count = seed_congestion_history(db)
    pred_count, ops_count = seed_initial_predictions_and_operations(db)

    print("-" * 60)
    print(f"Vessels inserted/updated: {v_count}")
    print(f"Berths inserted/updated: {b_count}")
    print(f"Ports inserted/updated: {p_count}")
    print(f"Congestion history inserted/updated: {h_count}")
    print(f"Congestion predictions inserted/updated: {pred_count}")
    print(f"Operations inserted/updated: {ops_count}")
    print("=" * 60)
    print("MongoDB seeding completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    seed_database()
