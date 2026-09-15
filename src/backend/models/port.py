from pydantic import BaseModel

class Port(BaseModel):
    port_id: str
    port_name: str
    latitude: float
    longitude: float
    total_berths: int
    total_cranes: int
    daily_capacity: int
