from pydantic import BaseModel, Field

class Berth(BaseModel):
    berth_id: str
    terminal_id: str
    terminal_name: str
    capacity: int
    max_vessel_size: str
    crane_count: int
    available_from: str
    status: str = Field(default="AVAILABLE") # AVAILABLE, OCCUPIED, MAINTENANCE
