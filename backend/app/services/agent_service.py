"""Agentic AI service — iterative tool-calling loop followed by a streaming final answer."""
import json
from typing import AsyncGenerator, List
import httpx
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.schemas.ai import ChatMessage
from app.tools.medical_tools import TOOL_DEFINITIONS, execute_tool

AGENT_SYSTEM_PROMPT = """You are MedGuide, an AI healthcare cost advisor backed by a live \
database of real crowdsourced patient data from hospitals across 8 countries.

You have tools that query this database. ALWAYS call the appropriate tool before quoting \
prices, wait times, or making hospital recommendations — never guess figures.

Tool strategy:
- User asks about a procedure cost or wait time → call get_cost_stats
- User wants to compare countries → call compare_regions
- User wants hospital recommendations → call get_top_hospitals
- User asks what patients say or what to expect → call get_patient_testimonies
- Procedure name is unfamiliar or ambiguous → call search_procedures first

After retrieving data, write a clear, empathetic response grounded in the actual numbers. \
Format costs as "$X,XXX USD". Cite data_points as "based on N patient reports". \
Always recommend consulting a qualified medical professional before making final decisions."""

MAX_TOOL_ITERATIONS = 5


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def run_agent(messages: List[ChatMessage]) -> AsyncGenerator[str, None]:
    if not settings.OPENROUTER_API_KEY:
        yield _sse("answer", {"content": "AI service not configured. Please set OPENROUTER_API_KEY."})
        yield _sse("done", {})
        return

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://medtransparency.app",
        "X-Title": "MedTransparency",
    }

    conversation: list[dict] = [{"role": "system", "content": AGENT_SYSTEM_PROMPT}]
    conversation += [{"role": m.role, "content": m.content} for m in messages]

    try:
        async with AsyncSessionLocal() as db:
            # ── Phase 1: tool-calling loop (non-streaming) ──────────────────────
            for _ in range(MAX_TOOL_ITERATIONS):
                payload = {
                    "model": settings.OPENROUTER_MODEL,
                    "stream": False,
                    "tools": TOOL_DEFINITIONS,
                    "tool_choice": "auto",
                    "messages": conversation,
                }
                async with httpx.AsyncClient(timeout=60) as client:
                    resp = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        json=payload,
                        headers=headers,
                    )
                    resp.raise_for_status()
                    data = resp.json()

                msg = data["choices"][0]["message"]
                tool_calls = msg.get("tool_calls") or []

                if not tool_calls:
                    break  # no more tools — move to streaming phase

                # Append assistant turn with tool calls
                conversation.append(
                    {
                        "role": "assistant",
                        "content": msg.get("content"),
                        "tool_calls": tool_calls,
                    }
                )

                for tc in tool_calls:
                    fn = tc["function"]
                    tool_name = fn["name"]
                    try:
                        tool_args = json.loads(fn.get("arguments", "{}"))
                    except json.JSONDecodeError:
                        tool_args = {}

                    yield _sse("tool_start", {"id": tc["id"], "name": tool_name, "args": tool_args})

                    result = await execute_tool(tool_name, tool_args, db)

                    yield _sse("tool_result", {"id": tc["id"], "name": tool_name, "result": result})

                    conversation.append(
                        {
                            "role": "tool",
                            "tool_call_id": tc["id"],
                            "content": json.dumps(result),
                        }
                    )

        # ── Phase 2: fetch the complete final answer (non-streaming) ────────────
        answer_payload = {
            "model": settings.OPENROUTER_MODEL,
            "stream": False,
            "messages": conversation,
        }
        async with httpx.AsyncClient(timeout=90) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=answer_payload,
                headers=headers,
            )
            resp.raise_for_status()
            answer = resp.json()["choices"][0]["message"].get("content") or ""

        yield _sse("answer", {"content": answer})

    except httpx.HTTPStatusError as exc:
        yield _sse("answer", {"content": f"API error {exc.response.status_code} — check your OpenRouter API key."})
    except Exception as exc:
        yield _sse("answer", {"content": f"Unexpected error: {exc}"})
    finally:
        yield _sse("done", {})
