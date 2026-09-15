import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING
from pymongo.database import Database

# Explicitly load backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
load_dotenv()

MONGODB_URI: str = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://Darshan:MOVIE...@cluster0.h2a5qe7.mongodb.net/?retryWrites=true&w=majority"
)
DATABASE_NAME: str = os.getenv("DATABASE_NAME", "port_operations")

_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def get_client() -> MongoClient:
    """
    Returns a shared singleton MongoClient instance.
    Sets a fast 800ms timeout so the application never hangs when offline/falling back.
    """
    global _client
    if _client is None:
        _client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=800,
            connectTimeoutMS=800
        )
    return _client

def get_database() -> Database:
    """
    Returns the port_operations database object.
    """
    global _db
    if _db is None:
        client = get_client()
        _db = client[DATABASE_NAME]
    return _db

def check_connection() -> bool:
    """
    Validates MongoDB connection with a ping command.
    Returns True if connected, False otherwise.
    """
    try:
        client = get_client()
        client.admin.command("ping")
        print("MongoDB connected successfully")
        return True
    except Exception as e:
        print("=" * 60)
        print("[NOTICE] MongoDB Connection Status:")
        print(f"   Could not connect to MongoDB Atlas at: {DATABASE_NAME}")
        print("   Please check:")
        print("   1. MONGODB_URI in backend/.env has your real username and password")
        print("   2. Network Access in MongoDB Atlas allows your IP address (0.0.0.0/0)")
        print(f"   Details: {e}")
        print("=" * 60)
        return False

def initialize_database() -> None:
    """
    Ensures the 6 required collections exist and creates essential indexes.
    Does not drop or delete existing data.
    """
    try:
        db = get_database()
        required_collections = [
            "users",
            "vessels",
            "berths",
            "ports",
            "congestion_history",
            "congestion_predictions",
            "operations"
        ]
        existing_cols = db.list_collection_names()
        for col_name in required_collections:
            if col_name not in existing_cols:
                db.create_collection(col_name)

        # Create useful indexes
        db.users.create_index([("email", ASCENDING)], unique=True)
        db.vessels.create_index([("vessel_id", ASCENDING)], unique=True)
        db.vessels.create_index([("terminal_id", ASCENDING)])

        db.berths.create_index([("berth_id", ASCENDING)], unique=True)
        db.berths.create_index([("terminal_id", ASCENDING)])

        db.ports.create_index([("port_id", ASCENDING)], unique=True)

        db.congestion_history.create_index([("terminal_id", ASCENDING)])
        db.congestion_predictions.create_index([("terminal_id", ASCENDING)])

        db.operations.create_index([("vessel_id", ASCENDING)])
        db.operations.create_index([("berth_id", ASCENDING)])

        print("MongoDB database collections & indexes initialized.")
    except Exception as e:
        print(f"Database initialization deferred (MongoDB not reachable yet): {e}")

if __name__ == "__main__":
    check_connection()
    initialize_database()
