from pydantic import BaseModel, Field
from typing import Optional

class Vessel(BaseModel):
    vessel_id: str
    vessel_name: str
    imo: Optional[str] = None
    terminal_id: Optional[str] = None
    current_terminal: Optional[str] = None
    arrival_time: str
    departure_time: Optional[str] = None
    departure_deadline: Optional[str] = None
    container_count: int = 0
    vessel_size: str = Field(default="Large")
    priority: str = Field(default="MEDIUM")  # LOW, MEDIUM, HIGH
    status: str = Field(default="Scheduled")   # Approaching, Queued, Scheduled, Berthed
    origin: Optional[str] = None
    destination: Optional[str] = None
    current_port: Optional[str] = None
    risk_level: Optional[str] = "LOW"
