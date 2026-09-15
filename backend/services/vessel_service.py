import pandas as pd
from pathlib import Path
from typing import List, Dict, Any, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "vessels.csv"

def get_all_vessels() -> List[Dict[str, Any]]:
    if not DATA_PATH.exists():
        return []
    df = pd.read_csv(DATA_PATH)
    
    # Calculate simple vessel risk based on priority and container load
    def assess_risk(row):
        if row.get("priority") == "HIGH" or row.get("container_count", 0) > 1800:
            return "HIGH"
        elif row.get("priority") == "MEDIUM":
            return "MEDIUM"
        return "LOW"
        
    df["risk_level"] = df.apply(assess_risk, axis=1)
    return df.to_dict(orient="records")

def get_vessel_by_id(vessel_id: str) -> Optional[Dict[str, Any]]:
    vessels = get_all_vessels()
    for v in vessels:
        if str(v.get("vessel_id")).upper() == vessel_id.upper():
            return v
    return None
