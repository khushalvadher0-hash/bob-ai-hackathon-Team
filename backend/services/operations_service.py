import pandas as pd
from pathlib import Path
from typing import List, Dict, Any
from .vessel_service import get_all_vessels
from .congestion_service import get_terminal_congestion_status
from ..planner.planner_72h import generate_72h_operations_plan

BASE_DIR = Path(__file__).resolve().parent.parent
BERTHS_PATH = BASE_DIR / "data" / "berths.csv"

def get_berths_data() -> List[Dict[str, Any]]:
    if not BERTHS_PATH.exists():
        return []
    df = pd.read_csv(BERTHS_PATH)
    return df.to_dict(orient="records")

def get_cranes_data() -> List[Dict[str, Any]]:
    berths = get_berths_data()
    cranes = []
    for b in berths:
        crane_count = b.get("crane_count", 2)
        for i in range(1, crane_count + 1):
            cranes.append({
                "crane_id": f"CR-{b['berth_id']}-{i:02d}",
                "berth_id": b["berth_id"],
                "terminal_id": b["terminal_id"],
                "status": "OPERATIONAL" if b["status"] != "MAINTENANCE" else "MAINTENANCE",
                "capacity_teu_per_hour": 35
            })
    return cranes

def get_72h_plan_service() -> Dict[str, Any]:
    vessels = get_all_vessels()
    berths = get_berths_data()
    terminals = get_terminal_congestion_status()
    cong_map = {t["terminal_id"]: t for t in terminals}
    
    return generate_72h_operations_plan(vessels, berths, cong_map)
