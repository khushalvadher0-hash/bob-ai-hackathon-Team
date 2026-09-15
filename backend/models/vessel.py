from pydantic import BaseModel, Field
from typing import Optional

class Vessel(BaseModel):
    vessel_id: str
    vessel_name: str
    arrival_time: str
    departure_deadline: str
    container_count: int
    origin: str
    destination: str
    current_port: str
    current_terminal: str
    priority: str = Field(default="MEDIUM")  # LOW, MEDIUM, HIGH
    vessel_size: str = Field(default="Large")  # Feeder, Medium, Large, Ultra Large
    status: str = Field(default="Scheduled")   # Approaching, Queued, Scheduled, Berthed
    risk_level: Optional[str] = "LOW"
