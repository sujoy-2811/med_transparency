from typing import Optional
from pydantic import BaseModel


class RegionOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    name: str
    country_code: str
    healthcare_summary: Optional[str] = None
    flag_emoji: Optional[str] = None
