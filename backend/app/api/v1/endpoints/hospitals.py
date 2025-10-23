from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.hospital_repo import HospitalRepository
from app.repositories.submission_repo import SubmissionRepository
from app.schemas.hospital import HospitalOut
from app.schemas.submission import SubmissionOut

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.get("/", response_model=List[HospitalOut])
async def list_hospitals(
    region_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    repo = HospitalRepository(db)
    if region_id:
        return await repo.list_by_region(region_id)
    return await repo.list_all()


@router.get("/{hospital_id}", response_model=HospitalOut)
async def get_hospital(hospital_id: str, db: AsyncSession = Depends(get_db)):
    repo = HospitalRepository(db)
    hospital = await repo.get_with_region(hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital


@router.get("/{hospital_id}/submissions/{procedure_id}", response_model=List[SubmissionOut])
async def get_hospital_submissions(hospital_id: str, procedure_id: str, db: AsyncSession = Depends(get_db)):
    repo = SubmissionRepository(db)
    return await repo.list_by_hospital_procedure(hospital_id, procedure_id)
