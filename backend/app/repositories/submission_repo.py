from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.submission import Submission
from app.repositories.base import BaseRepository


class SubmissionRepository(BaseRepository[Submission]):
    def __init__(self, db: AsyncSession):
        super().__init__(Submission, db)

    async def list_by_user(self, user_id: str) -> List[Submission]:
        result = await self.db.execute(
            select(Submission)
            .options(selectinload(Submission.procedure), selectinload(Submission.hospital))
            .where(Submission.user_id == user_id)
            .order_by(Submission.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_by_hospital_procedure(self, hospital_id: str, procedure_id: str) -> List[Submission]:
        result = await self.db.execute(
            select(Submission)
            .where(Submission.hospital_id == hospital_id, Submission.procedure_id == procedure_id)
            .order_by(Submission.created_at.desc())
        )
        return list(result.scalars().all())

    async def aggregate_by_hospital_procedure(self, hospital_id: str, procedure_id: str) -> dict:
        result = await self.db.execute(
            select(
                func.avg(Submission.cost_usd).label("avg_cost"),
                func.min(Submission.cost_usd).label("min_cost"),
                func.max(Submission.cost_usd).label("max_cost"),
                func.avg(Submission.wait_days).label("avg_wait"),
                func.avg(Submission.outcome_score).label("avg_outcome"),
                func.count(Submission.id).label("count"),
            ).where(Submission.hospital_id == hospital_id, Submission.procedure_id == procedure_id)
        )
        row = result.one()
        return {
            "avg_cost_usd": round(row.avg_cost, 2) if row.avg_cost else 0,
            "min_cost_usd": round(row.min_cost, 2) if row.min_cost else 0,
            "max_cost_usd": round(row.max_cost, 2) if row.max_cost else 0,
            "avg_wait_days": round(row.avg_wait, 1) if row.avg_wait else 0,
            "avg_outcome_score": round(row.avg_outcome, 2) if row.avg_outcome else 0,
            "data_points": row.count or 0,
        }
