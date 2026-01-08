from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from app.schemas.ai import ChatRequest
from app.schemas.agent import AgentRequest
from app.services.ai_service import stream_ai_response
from app.services.agent_service import run_agent

router = APIRouter(prefix="/ai", tags=["ai"])

_SSE_HEADERS = {"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}


@router.post("/chat")
async def ai_chat(body: ChatRequest, request: Request):
    return StreamingResponse(
        stream_ai_response(
            messages=body.messages,
            procedure=body.procedure,
            budget=body.budget,
            region=body.region,
        ),
        media_type="text/event-stream",
        headers=_SSE_HEADERS,
    )


@router.post("/agent")
async def ai_agent(body: AgentRequest, request: Request):
    """Agentic endpoint — autonomously queries the live DB via tools before answering."""
    return StreamingResponse(
        run_agent(messages=body.messages),
        media_type="text/event-stream",
        headers=_SSE_HEADERS,
    )
