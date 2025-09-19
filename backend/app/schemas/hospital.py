from typing import Optional
from pydantic import BaseModel
from app.schemas.region import RegionOut


class HospitalOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    name: str
    city: str
    accreditation: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    website: Optional[str] = None
    region: RegionOut
