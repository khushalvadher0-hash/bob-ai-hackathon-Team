from pydantic import BaseModel, Field
from typing import Optional, Union
from datetime import datetime

class VesselCreate(BaseModel):
    """
    Schema for adding a new vessel via POST /vessels.
    Accepts both standard and extended fields with automatic defaults.
    """
    name: Optional[str] = Field(default=None, description="Vessel display name")
    vessel_name: Optional[str] = Field(default=None, description="Alias for vessel name")
    teu: Optional[int] = Field(default=None, description="Container capacity / load in TEU")
    container_count: Optional[int] = Field(default=None, description="Alias for TEU count")
    priority: Union[str, int] = Field(default="MEDIUM", description="'LOW' | 'MEDIUM' | 'HIGH'")
    status: str = Field(default="Scheduled", description="'Scheduled' | 'Queued' | 'Approaching'")
    arrival_time: Optional[Union[datetime, str]] = Field(default=None, description="ETA arrival timestamp")
    terminal_id: Optional[str] = Field(default="T1", description="Assigned terminal (e.g., T1, T2, T3, T4)")
    current_terminal: Optional[str] = Field(default=None, description="Current terminal location")
    vessel_id: Optional[str] = Field(default=None, description="Unique vessel code (e.g., VSL-001)")
    origin: Optional[str] = Field(default="Singapore", description="Port of departure")
    destination: Optional[str] = Field(default="Port Operations", description="Destination terminal")
    vessel_size: Optional[str] = Field(default="Large", description="Vessel class / size")

class VesselResponse(BaseModel):
    """
    Standardized response model for vessel operations.
    """
    vessel_id: str
    vessel_name: str
    name: Optional[str] = None
    container_count: int = 0
    teu: Optional[int] = 0
    priority: str = "MEDIUM"
    status: str = "Scheduled"
    arrival_time: str
    terminal_id: Optional[str] = "T1"
    current_terminal: Optional[str] = "T1"
    risk_level: Optional[str] = "LOW"
    origin: Optional[str] = None
    destination: Optional[str] = None
    vessel_size: Optional[str] = "Large"

class Vessel(VesselResponse):
    """Alias for backwards compatibility."""
    pass

