"""Pydantic schemas for chat request/response payloads."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Incoming chat query from the user."""

    message: str = Field(..., min_length=1, max_length=4096)
    image_base64: str | None = Field(
        default=None,
        description="Optional base64-encoded image for multi-modal queries.",
    )
    conversation_id: str | None = Field(
        default=None,
        description="Existing conversation ID for multi-turn context.",
    )


class CitationSource(BaseModel):
    """Source document citation included in the agent's response."""

    document_id: str
    filename: str
    chunk_index: int
    excerpt: str


class ChatResponse(BaseModel):
    """Non-streaming chat response (for summary / error payloads)."""

    conversation_id: str
    answer: str
    sources: list[CitationSource] = []
