from typing import Optional, List
from pydantic import BaseModel
from app.schemas.hospital import HospitalOut
from app.schemas.procedure import ProcedureOut


class SearchResult(BaseModel):
    hospital: HospitalOut
    procedure: ProcedureOut
    avg_cost_usd: float
    min_cost_usd: float
    max_cost_usd: float
    avg_wait_days: float
    avg_outcome_score: float
    data_points: int
    rank_score: float


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    procedure_name: Optional[str] = None
    region_name: Optional[str] = None
