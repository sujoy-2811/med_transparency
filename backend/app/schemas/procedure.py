from typing import Optional
from pydantic import BaseModel


class ProcedureOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    name: str
    category: str
    slug: str
    icd_code: Optional[str] = None
    description: Optional[str] = None


class ProcedureStats(BaseModel):
    procedure: ProcedureOut
    avg_cost_usd: Optional[float] = None
    min_cost_usd: Optional[float] = None
    max_cost_usd: Optional[float] = None
    avg_wait_days: Optional[float] = None
    avg_outcome_score: Optional[float] = None
    total_submissions: int = 0
