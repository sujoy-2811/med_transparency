from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.procedure import Procedure
from app.repositories.base import BaseRepository


class ProcedureRepository(BaseRepository[Procedure]):
    def __init__(self, db: AsyncSession):
        super().__init__(Procedure, db)

    async def get_by_slug(self, slug: str) -> Optional[Procedure]:
        result = await self.db.execute(select(Procedure).where(Procedure.slug == slug))
        return result.scalar_one_or_none()

    async def search(self, q: str, limit: int = 10) -> List[Procedure]:
        result = await self.db.execute(
            select(Procedure)
            .where(func.lower(Procedure.name).contains(q.lower()))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_by_category(self, category: str) -> List[Procedure]:
        result = await self.db.execute(
            select(Procedure).where(Procedure.category == category)
        )
        return list(result.scalars().all())
