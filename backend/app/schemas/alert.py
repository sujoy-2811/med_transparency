from typing import Optional
from pydantic import BaseModel, Field


class AlertCreate(BaseModel):
    procedure_id: str
    region_id: Optional[str] = None
    target_cost_usd: float = Field(gt=0)


class AlertOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    procedure_id: str
    region_id: Optional[str] = None
    target_cost_usd: float
    is_active: bool
