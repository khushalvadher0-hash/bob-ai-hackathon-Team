import sqlite3
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "port_operations.db"
DATA_DIR = BASE_DIR / "data"

def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Load CSVs to tables if needed for persistence
    vessels_csv = DATA_DIR / "vessels.csv"
    berths_csv = DATA_DIR / "berths.csv"
    ports_csv = DATA_DIR / "ports.csv"
    congestion_csv = DATA_DIR / "historical_congestion.csv"

    if vessels_csv.exists():
        df_vessels = pd.read_csv(vessels_csv)
        df_vessels.to_sql("vessels", conn, if_exists="replace", index=False)

    if berths_csv.exists():
        df_berths = pd.read_csv(berths_csv)
        df_berths.to_sql("berths", conn, if_exists="replace", index=False)

    if ports_csv.exists():
        df_ports = pd.read_csv(ports_csv)
        df_ports.to_sql("ports", conn, if_exists="replace", index=False)

    if congestion_csv.exists():
        df_congestion = pd.read_csv(congestion_csv)
        df_congestion.to_sql("historical_congestion", conn, if_exists="replace", index=False)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
