from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.procedure_repo import ProcedureRepository
from app.repositories.submission_repo import SubmissionRepository
from app.schemas.procedure import ProcedureOut, ProcedureStats

router = APIRouter(prefix="/procedures", tags=["procedures"])


@router.get("/", response_model=List[ProcedureOut])
async def list_procedures(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    repo = ProcedureRepository(db)
    if category:
        return await repo.list_by_category(category)
    return await repo.list()


@router.get("/autocomplete", response_model=List[ProcedureOut])
async def autocomplete(q: str = Query(min_length=2), db: AsyncSession = Depends(get_db)):
    repo = ProcedureRepository(db)
    return await repo.search(q)


@router.get("/{slug}", response_model=ProcedureStats)
async def get_procedure(slug: str, db: AsyncSession = Depends(get_db)):
    proc_repo = ProcedureRepository(db)
    sub_repo = SubmissionRepository(db)
    procedure = await proc_repo.get_by_slug(slug)
    if not procedure:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Procedure not found")

    from sqlalchemy import select, func
    from app.models.submission import Submission
    result = await db.execute(
        select(
            func.avg(Submission.cost_usd),
            func.min(Submission.cost_usd),
            func.max(Submission.cost_usd),
            func.avg(Submission.wait_days),
            func.avg(Submission.outcome_score),
            func.count(Submission.id),
        ).where(Submission.procedure_id == procedure.id)
    )
    row = result.one()
    return ProcedureStats(
        procedure=procedure,
        avg_cost_usd=round(row[0], 2) if row[0] else None,
        min_cost_usd=round(row[1], 2) if row[1] else None,
        max_cost_usd=round(row[2], 2) if row[2] else None,
        avg_wait_days=round(row[3], 1) if row[3] else None,
        avg_outcome_score=round(row[4], 2) if row[4] else None,
        total_submissions=row[5] or 0,
    )
