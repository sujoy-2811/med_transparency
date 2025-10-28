from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.cache import cache_get, cache_set, make_cache_key
from app.schemas.search import SearchResponse
from app.services.search_service import ranked_search

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/", response_model=SearchResponse)
async def search(
    procedure: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    budget_min: Optional[float] = Query(None),
    budget_max: Optional[float] = Query(None),
    max_wait_days: Optional[int] = Query(None),
    sort_by: str = Query(default="cost", pattern="^(cost|outcome|wait)$"),
    db: AsyncSession = Depends(get_db),
):
    cache_key = "search:" + make_cache_key(
        str(procedure), str(region), str(budget_min),
        str(budget_max), str(max_wait_days), sort_by
    )
    cached = await cache_get(cache_key)
    if cached:
        return SearchResponse(**cached)

    result = await ranked_search(
        db=db,
        procedure_slug=procedure,
        region_id=region,
        budget_min=budget_min,
        budget_max=budget_max,
        max_wait_days=max_wait_days,
        sort_by=sort_by,
    )
    await cache_set(cache_key, result.model_dump(), ttl=300)
    return result
