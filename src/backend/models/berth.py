from pydantic import BaseModel, Field
from typing import Optional

class Berth(BaseModel):
    berth_id: str
    terminal_id: str
    terminal_name: Optional[str] = None
    berth_name: Optional[str] = None
    capacity: int = 2000
    length_capacity: Optional[int] = None
    max_vessel_size: str = Field(default="Large")
    crane_count: int = 2
    available: Optional[bool] = None
    occupied: Optional[bool] = None
    available_from: str = "2026-09-15T06:00:00"
    status: str = Field(default="AVAILABLE")  # AVAILABLE, OCCUPIED, MAINTENANCE
