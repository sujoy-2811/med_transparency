from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.region import Region
from app.schemas.region import RegionOut

router = APIRouter(prefix="/regions", tags=["regions"])


@router.get("/", response_model=List[RegionOut])
async def list_regions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Region).order_by(Region.name))
    return list(result.scalars().all())


@router.get("/{region_id}", response_model=RegionOut)
async def get_region(region_id: str, db: AsyncSession = Depends(get_db)):
    region = await db.get(Region, region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    return region
