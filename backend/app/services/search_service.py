from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.submission import Submission
from app.models.hospital import Hospital
from app.models.procedure import Procedure
from app.schemas.search import SearchResult, SearchResponse


SORT_OPTIONS = {"cost", "outcome", "wait"}


async def ranked_search(
    db: AsyncSession,
    procedure_slug: Optional[str] = None,
    region_id: Optional[str] = None,
    budget_min: Optional[float] = None,
    budget_max: Optional[float] = None,
    max_wait_days: Optional[int] = None,
    sort_by: str = "cost",
) -> SearchResponse:
    query = (
        select(
            Submission.hospital_id,
            Submission.procedure_id,
            func.avg(Submission.cost_usd).label("avg_cost"),
            func.min(Submission.cost_usd).label("min_cost"),
            func.max(Submission.cost_usd).label("max_cost"),
            func.avg(Submission.wait_days).label("avg_wait"),
            func.avg(Submission.outcome_score).label("avg_outcome"),
            func.count(Submission.id).label("data_points"),
        )
        .group_by(Submission.hospital_id, Submission.procedure_id)
    )

    if procedure_slug:
        proc_sub = select(Procedure.id).where(Procedure.slug == procedure_slug).scalar_subquery()
        query = query.where(Submission.procedure_id == proc_sub)

    if budget_min is not None:
        query = query.having(func.avg(Submission.cost_usd) >= budget_min)
    if budget_max is not None:
        query = query.having(func.avg(Submission.cost_usd) <= budget_max)
    if max_wait_days is not None:
        query = query.having(func.avg(Submission.wait_days) <= max_wait_days)

    rows = (await db.execute(query)).all()

    results: List[SearchResult] = []
    for row in rows:
        hospital = await db.get(Hospital, row.hospital_id, options=[selectinload(Hospital.region)])
        procedure = await db.get(Procedure, row.procedure_id)
        if not hospital or not procedure:
            continue
        if region_id and hospital.region_id != region_id:
            continue

        avg_cost = round(row.avg_cost, 2)
        avg_outcome = round(row.avg_outcome, 2)
        avg_wait = round(row.avg_wait, 1)

        if sort_by == "cost":
            rank_score = 1 / (avg_cost + 1)
        elif sort_by == "outcome":
            rank_score = avg_outcome / 10
        else:
            rank_score = 1 / (avg_wait + 1)

        results.append(SearchResult(
            hospital=hospital,
            procedure=procedure,
            avg_cost_usd=avg_cost,
            min_cost_usd=round(row.min_cost, 2),
            max_cost_usd=round(row.max_cost, 2),
            avg_wait_days=avg_wait,
            avg_outcome_score=avg_outcome,
            data_points=row.data_points,
            rank_score=rank_score,
        ))

    results.sort(key=lambda r: r.rank_score, reverse=True)

    procedure_name = None
    if procedure_slug and results:
        procedure_name = results[0].procedure.name

    return SearchResponse(
        results=results,
        total=len(results),
        procedure_name=procedure_name,
    )
