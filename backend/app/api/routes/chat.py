"""Chat API route — Agentic RAG via LangGraph + SSE streaming.

Instead of a fixed retrieve → generate pipeline, this endpoint
invokes the LangGraph agent which autonomously decides:
  1. Whether to query the KB.
  2. Whether retrieval quality is sufficient.
  3. Whether to fall back to web search.
  4. How to generate the final grounded answer.
"""

from __future__ import annotations

import json
import logging
import uuid
from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.agent.graph import agent_graph
from app.api.dependencies import CurrentUser, SupabaseClient
from app.schemas.chat import ChatRequest

logger = logging.getLogger(__name__)
router = APIRouter()


async def _sse_generator(
    request: ChatRequest,
    user_id: str,
    supabase,
) -> AsyncIterator[str]:
    """Stream agent execution as Server-Sent Events.

    Event types:
        - step:    agent reasoning step (intent, retrieval, etc.)
        - token:   incremental answer text
        - sources: citation metadata
        - error:   on failure
        - [DONE]:  end of stream
    """
    conversation_id = (
        request.conversation_id or str(uuid.uuid4())
    )

    try:
        # Build initial agent state
        initial_state = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "query": request.message,
            "image_base64": request.image_base64,
            "supabase": supabase,
            "retrieved_chunks": [],
            "web_search_results": [],
            "reasoning_steps": [],
            "sources": [],
            "answer": "",
        }

        # Invoke the LangGraph agent
        final_state = await agent_graph.ainvoke(initial_state)

        # 1. Stream reasoning steps (agent transparency)
        for step in final_state.get("reasoning_steps", []):
            event = json.dumps({"type": "step", "content": step})
            yield f"data: {event}\n\n"

        # 2. Stream the answer token by token
        answer = final_state.get("answer", "")
        # Chunk the answer into ~20-char segments for smooth streaming
        chunk_size = 20
        for i in range(0, len(answer), chunk_size):
            token = answer[i : i + chunk_size]
            event = json.dumps(
                {"type": "token", "content": token},
            )
            yield f"data: {event}\n\n"

        # 3. Send source citations
        sources = final_state.get("sources", [])
        sources_event = json.dumps(
            {"type": "sources", "sources": sources},
        )
        yield f"data: {sources_event}\n\n"

        # 4. Done
        yield "data: [DONE]\n\n"

    except Exception as exc:
        logger.error(
            "Agent streaming error: %s", exc, exc_info=True,
        )
        error_event = json.dumps(
            {"type": "error", "content": str(exc)},
        )
        yield f"data: {error_event}\n\n"
        yield "data: [DONE]\n\n"


@router.post(
    "",
    summary="Send a chat query — powered by LangGraph Agentic RAG",
    response_description="SSE stream with agent reasoning + answer",
)
async def chat(
    request: ChatRequest,
    current_user: CurrentUser,
    supabase: SupabaseClient,
) -> StreamingResponse:
    """Accept a query, run the LangGraph agent, and stream the
    response as Server-Sent Events with full reasoning trace.
    """
    user_id = current_user["id"]
    logger.info(
        "Agentic RAG request: user=%s message=%s",
        user_id,
        request.message[:80],
    )

    return StreamingResponse(
        _sse_generator(request, user_id, supabase),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
