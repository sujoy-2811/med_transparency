from fastapi import APIRouter
from app.api.v1.endpoints import auth, procedures, search, hospitals, submissions, regions, ai, users, alerts

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(procedures.router)
api_router.include_router(search.router)
api_router.include_router(hospitals.router)
api_router.include_router(submissions.router)
api_router.include_router(regions.router)
api_router.include_router(ai.router)
api_router.include_router(users.router)
api_router.include_router(alerts.router)
