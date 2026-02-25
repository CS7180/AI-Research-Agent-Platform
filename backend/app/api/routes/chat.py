"""Chat API route — SSE streaming query endpoint."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from app.api.dependencies import CurrentUser, SupabaseClient
from app.schemas.chat import ChatRequest

logger = logging.getLogger(__name__)
router = APIRouter()


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
    """Accept a text (+ optional image) query, run the LangGraph agent,
    and stream the response as Server-Sent Events.

    # TODO(#5): Wire up LangGraph agent and SSE streaming (Issue #5, #7, #8).
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Chat agent not yet implemented (Issues #5, #8).",
    )
