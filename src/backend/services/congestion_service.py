import pandas as pd
from pathlib import Path
from typing import List, Dict, Any
from ..ml.predict import predict_congestion

BASE_DIR = Path(__file__).resolve().parent.parent
BERTHS_PATH = BASE_DIR / "data" / "berths.csv"
VESSELS_PATH = BASE_DIR / "data" / "vessels.csv"

def get_terminal_congestion_status() -> List[Dict[str, Any]]:
    # Aggregate data per terminal from vessels and berths
    df_vessels = pd.read_csv(VESSELS_PATH) if VESSELS_PATH.exists() else pd.DataFrame()
    df_berths = pd.read_csv(BERTHS_PATH) if BERTHS_PATH.exists() else pd.DataFrame()
    
    terminals = ["T1", "T2", "T3", "T4"]
    terminal_names = {
        "T1": "North Deepwater Terminal",
        "T2": "East Pier Container Terminal",
        "T3": "South Gateway Terminal",
        "T4": "West River Feeder Terminal"
    }
    
    results = []
    for t_id in terminals:
        v_count = 0
        c_count = 0
        if not df_vessels.empty and "current_terminal" in df_vessels.columns:
            sub_v = df_vessels[df_vessels["current_terminal"] == t_id]
            v_count = len(sub_v)
            c_count = int(sub_v["container_count"].sum())
            
        avail_berths = 1
        avail_cranes = 3
        if not df_berths.empty and "terminal_id" in df_berths.columns:
            sub_b = df_berths[df_berths["terminal_id"] == t_id]
            avail_berths = len(sub_b[sub_b["status"] == "AVAILABLE"])
            avail_cranes = int(sub_b["crane_count"].sum())
            
        pred = predict_congestion({
            "vessel_count": v_count,
            "container_count": c_count,
            "available_berths": avail_berths,
            "available_cranes": avail_cranes
        })
        
        results.append({
            "terminal_id": t_id,
            "terminal_name": terminal_names.get(t_id, t_id),
            "vessel_count": v_count,
            "container_count": c_count,
            "available_berths": avail_berths,
            "available_cranes": avail_cranes,
            "congestion_level": pred["level"],
            "probability": pred["probability"],
            "predicted_wait_hours": pred["predicted_wait_hours"]
        })
        
    return results

def get_terminal_congestion_by_id(terminal_id: str) -> Dict[str, Any]:
    all_statuses = get_terminal_congestion_status()
    for item in all_statuses:
        if item["terminal_id"].upper() == terminal_id.upper():
            return item
    return {
        "terminal_id": terminal_id,
        "terminal_name": f"Terminal {terminal_id}",
        "congestion_level": "LOW",
        "probability": 0.20,
        "predicted_wait_hours": 1.5,
        "available_berths": 2,
        "available_cranes": 4
    }
