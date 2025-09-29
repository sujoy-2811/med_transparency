from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SubmissionCreate(BaseModel):
    procedure_id: str
    hospital_id: str
    cost_usd: float = Field(gt=0)
    original_cost: float = Field(gt=0)
    currency: str = Field(default="USD", max_length=3)
    wait_days: int = Field(ge=0)
    outcome_score: int = Field(ge=1, le=10)
    testimony: Optional[str] = Field(default=None, max_length=2000)


class SubmissionOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    procedure_id: str
    hospital_id: str
    cost_usd: float
    original_cost: float
    currency: str
    wait_days: int
    outcome_score: int
    testimony: Optional[str] = None
    is_verified: bool
    created_at: datetime
