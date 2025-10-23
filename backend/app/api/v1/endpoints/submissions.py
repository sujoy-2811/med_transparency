from typing import Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_optional_user
from app.models.submission import Submission
from app.models.user import User
from app.repositories.submission_repo import SubmissionRepository
from app.schemas.submission import SubmissionCreate, SubmissionOut

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("/", response_model=SubmissionOut, status_code=201)
async def create_submission(
    body: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    repo = SubmissionRepository(db)
    submission = Submission(
        user_id=current_user.id if current_user else None,
        procedure_id=body.procedure_id,
        hospital_id=body.hospital_id,
        cost_usd=body.cost_usd,
        original_cost=body.original_cost,
        currency=body.currency,
        wait_days=body.wait_days,
        outcome_score=body.outcome_score,
        testimony=body.testimony,
    )
    return await repo.create(submission)
