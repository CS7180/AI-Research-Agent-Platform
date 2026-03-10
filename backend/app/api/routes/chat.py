"""Chat API route — SSE streaming query endpoint."""

from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.api.dependencies import CurrentUser, SupabaseClient
from app.schemas.chat import ChatRequest
from app.services import llm as llm_service
from app.services import retrieval as retrieval_service

logger = logging.getLogger(__name__)
router = APIRouter()


async def _sse_generator(
    request: ChatRequest,
    user_id: str,
    supabase,
) -> AsyncIterator[str]:
    """Generate Server-Sent Events for a chat query.

    Event types:
        - token: incremental text chunk
        - sources: citation metadata
        - error: on failure
        - [DONE]: end of stream
    """

    try:
        # 1. Retrieve relevant chunks
        chunks = await retrieval_service.retrieve(
            supabase, request.message, user_id,
        )

        # 2. Build source citations
        sources = []
        seen_docs: set[str] = set()
        for chunk in chunks:
            doc_id = chunk.get("document_id", "")
            if doc_id and doc_id not in seen_docs:
                seen_docs.add(doc_id)
                sources.append({
                    "document_id": doc_id,
                    "chunk_index": chunk.get("chunk_index", 0),
                    "excerpt": (
                        chunk.get("content", "")[:150] + "..."
                    ),
                })

        # 3. Stream LLM answer tokens
        async for token in llm_service.stream_answer(
            query=request.message,
            chunks=chunks,
            image_base64=request.image_base64,
        ):
            event = json.dumps(
                {"type": "token", "content": token},
            )
            yield f"data: {event}\n\n"

        # 4. Send source citations
        sources_event = json.dumps(
            {"type": "sources", "sources": sources},
        )
        yield f"data: {sources_event}\n\n"

        # 5. Done
        yield "data: [DONE]\n\n"

    except Exception as exc:
        logger.error("Chat streaming error: %s", exc, exc_info=True)
        error_event = json.dumps(
            {"type": "error", "content": str(exc)},
        )
        yield f"data: {error_event}\n\n"
        yield "data: [DONE]\n\n"


@router.post(
    "",
    summary="Send a chat query and receive a streamed response",
    response_description="Server-Sent Events stream of the agent's answer",
)
async def chat(
    request: ChatRequest,
    current_user: CurrentUser,
    supabase: SupabaseClient,
) -> StreamingResponse:
    """Accept a text (+ optional image) query, retrieve context,
    run the LLM, and stream the response as Server-Sent Events.
    """
    user_id = current_user["id"]
    logger.info(
        "Chat request: user=%s message=%s",
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
