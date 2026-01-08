import json
from typing import AsyncGenerator, List
import httpx
from app.core.config import settings
from app.schemas.ai import ChatMessage

SYSTEM_PROMPT = """You are MedGuide, an AI healthcare cost advisor for the MedTransparency platform.
You help patients find affordable, high-quality medical care by comparing real cost data, wait times, and patient outcomes across hospitals and countries.

Key guidelines:
- Always recommend consulting a qualified medical professional before making healthcare decisions
- Provide data-driven, balanced recommendations based on cost, quality, and proximity
- Mention that all cost data is crowd-sourced and should be verified
- Be empathetic — patients are often in stressful situations
- Consider travel costs, recovery time, and language barriers for international options
- Never guarantee specific outcomes or prices
- If asked about a procedure, consider: total cost (procedure + travel + accommodation), wait time, accreditation (JCI, ISO), outcome scores, and language support"""


async def stream_ai_response(
    messages: List[ChatMessage],
    procedure: str | None = None,
    budget: float | None = None,
    region: str | None = None,
) -> AsyncGenerator[str, None]:
    if not settings.OPENROUTER_API_KEY:
        yield "data: " + json.dumps({"content": "AI service not configured. Please set OPENROUTER_API_KEY."}) + "\n\n"
        yield "data: [DONE]\n\n"
        return

    context_parts = []
    if procedure:
        context_parts.append(f"Procedure: {procedure}")
    if budget:
        context_parts.append(f"Budget: ${budget:,.0f} USD")
    if region:
        context_parts.append(f"Preferred region: {region}")

    system_content = SYSTEM_PROMPT
    if context_parts:
        system_content += "\n\nUser context: " + ", ".join(context_parts)

    payload = {
        "model": settings.OPENROUTER_MODEL,
        "stream": True,
        "messages": [{"role": "system", "content": system_content}]
        + [{"role": m.role, "content": m.content} for m in messages],
    }

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://medtransparency.app",
        "X-Title": "MedTransparency",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream(
            "POST",
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload,
            headers=headers,
        ) as response:
            async for line in response.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                data = line[6:]
                if data == "[DONE]":
                    yield "data: [DONE]\n\n"
                    break
                try:
                    chunk = json.loads(data)
                    delta = chunk["choices"][0]["delta"].get("content", "")
                    if delta:
                        yield "data: " + json.dumps({"content": delta}) + "\n\n"
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue
