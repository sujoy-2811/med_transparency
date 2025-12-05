from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.hospital import Hospital
from app.repositories.base import BaseRepository


class HospitalRepository(BaseRepository[Hospital]):
    def __init__(self, db: AsyncSession):
        super().__init__(Hospital, db)

    async def get_with_region(self, id: str) -> Optional[Hospital]:
        result = await self.db.execute(
            select(Hospital).options(selectinload(Hospital.region)).where(Hospital.id == id)
        )
        return result.scalar_one_or_none()

    async def list_by_region(self, region_id: str) -> List[Hospital]:
        result = await self.db.execute(
            select(Hospital)
            .options(selectinload(Hospital.region))
            .where(Hospital.region_id == region_id)
            .order_by(Hospital.name)
        )
        return list(result.scalars().all())

    async def list_all(self) -> List[Hospital]:
        result = await self.db.execute(
            select(Hospital).options(selectinload(Hospital.region)).order_by(Hospital.name)
        )
        return list(result.scalars().all())
