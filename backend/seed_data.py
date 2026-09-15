"""
Database Seeding Script for Port Operations Optimiser
Populates MongoDB Atlas collections with realistic fleet, berth, and historical congestion data.
Run with: python backend/seed_data.py or python seed_database.py
"""

import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "port_operations")

def get_db():
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return client[DATABASE_NAME]

VESSELS_DATA = [
    {
        "vessel_id": "MSC-001",
        "vessel_name": "MSC Oscar",
        "name": "MSC Oscar",
        "container_count": 2200,
        "teu": 2200,
        "priority": "HIGH",
        "status": "Queued",
        "arrival_time": (datetime.now() - timedelta(hours=3)).isoformat(),
        "terminal_id": "T1",
        "current_terminal": "T1",
        "origin": "Rotterdam",
        "destination": "Port Operations",
        "vessel_size": "Ultra Large Container Vessel (ULCV)"
    },
    {
        "vessel_id": "MSK-002",
        "vessel_name": "Maersk Mc-Kinney Moller",
        "name": "Maersk Mc-Kinney Moller",
        "container_count": 1850,
        "teu": 1850,
        "priority": "HIGH",
        "status": "Queued",
        "arrival_time": (datetime.now() - timedelta(hours=1)).isoformat(),
        "terminal_id": "T1",
        "current_terminal": "T1",
        "origin": "Shanghai",
        "destination": "Port Operations",
        "vessel_size": "Triple-E Class"
    },
    {
        "vessel_id": "CMA-003",
        "vessel_name": "CMA CGM Jacques Saade",
        "name": "CMA CGM Jacques Saade",
        "container_count": 2100,
        "teu": 2100,
        "priority": "MEDIUM",
        "status": "Approaching",
        "arrival_time": (datetime.now() + timedelta(hours=4)).isoformat(),
        "terminal_id": "T2",
        "current_terminal": "T2",
        "origin": "Antwerp",
        "destination": "Port Operations",
        "vessel_size": "LNG Megamax-24"
    },
    {
        "vessel_id": "COS-004",
        "vessel_name": "COSCO Shipping Universe",
        "name": "COSCO Shipping Universe",
        "container_count": 1600,
        "teu": 1600,
        "priority": "MEDIUM",
        "status": "Scheduled",
        "arrival_time": (datetime.now() + timedelta(hours=8)).isoformat(),
        "terminal_id": "T2",
        "current_terminal": "T2",
        "origin": "Ningbo",
        "destination": "Port Operations",
        "vessel_size": "Post-Panamax"
    },
    {
        "vessel_id": "HAP-005",
        "vessel_name": "Hapag-Lloyd Berlin Express",
        "name": "Hapag-Lloyd Berlin Express",
        "container_count": 1950,
        "teu": 1950,
        "priority": "HIGH",
        "status": "Queued",
        "arrival_time": (datetime.now() - timedelta(hours=2)).isoformat(),
        "terminal_id": "T1",
        "current_terminal": "T1",
        "origin": "Hamburg",
        "destination": "Port Operations",
        "vessel_size": "Hamburg Express Class"
    },
    {
        "vessel_id": "ONE-006",
        "vessel_name": "ONE Apus",
        "name": "ONE Apus",
        "container_count": 1400,
        "teu": 1400,
        "priority": "LOW",
        "status": "Scheduled",
        "arrival_time": (datetime.now() + timedelta(hours=14)).isoformat(),
        "terminal_id": "T3",
        "current_terminal": "T3",
        "origin": "Tokyo",
        "destination": "Port Operations",
        "vessel_size": "Neo-Panamax"
    },
    {
        "vessel_id": "EVG-007",
        "vessel_name": "Ever Given",
        "name": "Ever Given",
        "container_count": 2000,
        "teu": 2000,
        "priority": "HIGH",
        "status": "Approaching",
        "arrival_time": (datetime.now() + timedelta(hours=6)).isoformat(),
        "terminal_id": "T1",
        "current_terminal": "T1",
        "origin": "Yantian",
        "destination": "Port Operations",
        "vessel_size": "Golden Class"
    },
    {
        "vessel_id": "HMM-008",
        "vessel_name": "HMM Algeciras",
        "name": "HMM Algeciras",
        "container_count": 2350,
        "teu": 2350,
        "priority": "HIGH",
        "status": "Approaching",
        "arrival_time": (datetime.now() + timedelta(hours=10)).isoformat(),
        "terminal_id": "T1",
        "current_terminal": "T1",
        "origin": "Busan",
        "destination": "Port Operations",
        "vessel_size": "Megamax-24"
    },
    {
        "vessel_id": "PIL-009",
        "vessel_name": "Kota Lembah",
        "name": "Kota Lembah",
        "container_count": 650,
        "teu": 650,
        "priority": "LOW",
        "status": "Scheduled",
        "arrival_time": (datetime.now() + timedelta(hours=18)).isoformat(),
        "terminal_id": "T4",
        "current_terminal": "T4",
        "origin": "Port Klang",
        "destination": "Port Operations",
        "vessel_size": "Feeder"
    },
    {
        "vessel_id": "ZIM-010",
        "vessel_name": "ZIM Sammy Ofer",
        "name": "ZIM Sammy Ofer",
        "container_count": 1250,
        "teu": 1250,
        "priority": "MEDIUM",
        "status": "Scheduled",
        "arrival_time": (datetime.now() + timedelta(hours=22)).isoformat(),
        "terminal_id": "T3",
        "current_terminal": "T3",
        "origin": "Haifa",
        "destination": "Port Operations",
        "vessel_size": "LNG Neo-Panamax"
    },
    {
        "vessel_id": "YML-011",
        "vessel_name": "Yang Ming Witness",
        "name": "Yang Ming Witness",
        "container_count": 1350,
        "teu": 1350,
        "priority": "LOW",
        "status": "Scheduled",
        "arrival_time": (datetime.now() + timedelta(hours=26)).isoformat(),
        "terminal_id": "T3",
        "current_terminal": "T3",
        "origin": "Kaohsiung",
        "destination": "Port Operations",
        "vessel_size": "Post-Panamax"
    },
    {
        "vessel_id": "WHL-012",
        "vessel_name": "Wan Hai 515",
        "name": "Wan Hai 515",
        "container_count": 550,
        "teu": 550,
        "priority": "LOW",
        "status": "Scheduled",
        "arrival_time": (datetime.now() + timedelta(hours=30)).isoformat(),
        "terminal_id": "T4",
        "current_terminal": "T4",
        "origin": "Keelung",
        "destination": "Port Operations",
        "vessel_size": "Regional Feeder"
    }
]

CONGESTION_HISTORY_DATA = [
    {"total_teu": 4200, "total_vessels": 4, "congestion_level": "LOW", "expected_delay": 1.2, "probability": 12.0, "timestamp": "2026-08-01T08:00:00"},
    {"total_teu": 5500, "total_vessels": 5, "congestion_level": "LOW", "expected_delay": 1.8, "probability": 18.5, "timestamp": "2026-08-05T08:00:00"},
    {"total_teu": 7200, "total_vessels": 6, "congestion_level": "LOW", "expected_delay": 2.1, "probability": 24.0, "timestamp": "2026-08-10T08:00:00"},
    {"total_teu": 9000, "total_vessels": 8, "congestion_level": "MEDIUM", "expected_delay": 3.6, "probability": 45.0, "timestamp": "2026-08-15T08:00:00"},
    {"total_teu": 11200, "total_vessels": 9, "congestion_level": "MEDIUM", "expected_delay": 4.8, "probability": 56.0, "timestamp": "2026-08-20T08:00:00"},
    {"total_teu": 13500, "total_vessels": 11, "congestion_level": "HIGH", "expected_delay": 6.9, "probability": 72.0, "timestamp": "2026-08-25T08:00:00"},
    {"total_teu": 15800, "total_vessels": 13, "congestion_level": "HIGH", "expected_delay": 8.4, "probability": 81.5, "timestamp": "2026-09-01T08:00:00"},
    {"total_teu": 18200, "total_vessels": 15, "congestion_level": "HIGH", "expected_delay": 9.8, "probability": 87.0, "timestamp": "2026-09-05T08:00:00"},
    {"total_teu": 21500, "total_vessels": 17, "congestion_level": "CRITICAL", "expected_delay": 12.5, "probability": 93.0, "timestamp": "2026-09-08T08:00:00"},
    {"total_teu": 25000, "total_vessels": 20, "congestion_level": "CRITICAL", "expected_delay": 16.0, "probability": 97.5, "timestamp": "2026-09-12T08:00:00"}
]

BERTHS_DATA = [
    {"berth_id": "B01", "terminal_id": "T1", "terminal_name": "North Deepwater Terminal", "max_vessel_size": "ULCV", "capacity": 24000, "crane_count": 4, "status": "AVAILABLE", "available": True, "available_from": "2026-09-15T06:00:00"},
    {"berth_id": "B02", "terminal_id": "T1", "terminal_name": "North Deepwater Terminal", "max_vessel_size": "ULCV", "capacity": 22000, "crane_count": 4, "status": "OCCUPIED", "available": False, "available_from": "2026-09-15T18:00:00"},
    {"berth_id": "B03", "terminal_id": "T1", "terminal_name": "North Deepwater Terminal", "max_vessel_size": "Triple-E", "capacity": 20000, "crane_count": 3, "status": "AVAILABLE", "available": True, "available_from": "2026-09-15T06:00:00"},
    {"berth_id": "B04", "terminal_id": "T2", "terminal_name": "East Pier Container Terminal", "max_vessel_size": "Post-Panamax", "capacity": 15000, "crane_count": 3, "status": "AVAILABLE", "available": True, "available_from": "2026-09-15T06:00:00"},
    {"berth_id": "B05", "terminal_id": "T2", "terminal_name": "East Pier Container Terminal", "max_vessel_size": "Post-Panamax", "capacity": 14000, "crane_count": 3, "status": "AVAILABLE", "available": True, "available_from": "2026-09-15T06:00:00"},
    {"berth_id": "B06", "terminal_id": "T3", "terminal_name": "South Gateway Terminal", "max_vessel_size": "Neo-Panamax", "capacity": 12000, "crane_count": 3, "status": "AVAILABLE", "available": True, "available_from": "2026-09-15T06:00:00"},
    {"berth_id": "B07", "terminal_id": "T3", "terminal_name": "South Gateway Terminal", "max_vessel_size": "Neo-Panamax", "capacity": 10000, "crane_count": 2, "status": "AVAILABLE", "available": True, "available_from": "2026-09-15T06:00:00"},
    {"berth_id": "B08", "terminal_id": "T4", "terminal_name": "West River Feeder Terminal", "max_vessel_size": "Feeder", "capacity": 6000, "crane_count": 2, "status": "AVAILABLE", "available": True, "available_from": "2026-09-15T06:00:00"}
]

def seed():
    print("=" * 60)
    print("Starting Port Operations MongoDB Database Seeding...")
    print(f"   Database: {DATABASE_NAME}")
    print("=" * 60)

    try:
        db = get_db()
        db.command("ping")
        print("Connected to MongoDB Atlas successfully.\n")

        # 1. Seed Vessels
        print("-> Seeding 'vessels' collection...")
        for v in VESSELS_DATA:
            db.vessels.update_one({"vessel_id": v["vessel_id"]}, {"$set": v}, upsert=True)
        print(f"   Successfully upserted {len(VESSELS_DATA)} vessel documents.")

        # 2. Seed Congestion History
        print("\n-> Seeding 'congestion_history' collection...")
        for h in CONGESTION_HISTORY_DATA:
            db.congestion_history.update_one(
                {"timestamp": h["timestamp"]},
                {"$set": h},
                upsert=True
            )
        print(f"   Successfully upserted {len(CONGESTION_HISTORY_DATA)} historical records.")

        # 3. Seed Berths
        print("\n-> Seeding 'berths' collection...")
        for b in BERTHS_DATA:
            db.berths.update_one({"berth_id": b["berth_id"]}, {"$set": b}, upsert=True)
        print(f"   Successfully upserted {len(BERTHS_DATA)} berth records.")

        # 4. Generate Initial Congestion Prediction
        print("\n-> Generating initial 'congestion_predictions' snapshot...")
        total_teu = sum(v["container_count"] for v in VESSELS_DATA)
        db.congestion_predictions.update_one(
            {"type": "port_overall_forecast"},
            {"$set": {
                "type": "port_overall_forecast",
                "total_teu": total_teu,
                "total_vessels": len(VESSELS_DATA),
                "high_risk_vessels": len([v for v in VESSELS_DATA if v["priority"] == "HIGH"]),
                "congestion_level": "HIGH",
                "expected_delay": 7.5,
                "probability": 82.0,
                "congestion_probability": 82.0,
                "timestamp": datetime.now().isoformat()
            }},
            upsert=True
        )
        print("   Successfully stored prediction snapshot in 'congestion_predictions'.")

        print("\n" + "=" * 60)
        print("Database seeding completed successfully!")
        print("   Collections populated in MongoDB Compass:")
        print("   - vessels")
        print("   - congestion_history")
        print("   - berths")
        print("   - congestion_predictions")
        print("=" * 60)

    except Exception as e:
        print(f"Error during database seeding: {e}")


if __name__ == "__main__":
    seed()
