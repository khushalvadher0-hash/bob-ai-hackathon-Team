from pydantic import BaseModel
from typing import Optional

class Port(BaseModel):
    port_id: str
    port_name: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_berths: int = 10
    total_cranes: int = 30
    capacity: Optional[int] = None
    daily_capacity: Optional[int] = None
