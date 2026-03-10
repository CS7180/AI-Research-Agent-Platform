"""Provider-agnostic LLM service — grounded answer generation.

Generates answers using retrieved context chunks.  Supports Gemini,
OpenAI, and Qwen via LangChain adapters.
"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are DocMind, an AI research assistant for CS students.
Answer the user's question based ONLY on the provided context chunks.
If the context doesn't contain enough information, say so honestly.

Rules:
- Ground every claim in a specific source. Cite sources as [Source N].
- Be concise but thorough.
- If the user provides an image, describe what you see and relate it
  to the context from their documents.
- If no relevant context is found, acknowledge this and suggest what
  the user could search for or upload."""


def _get_chat_model() -> BaseChatModel:
    """Return the configured LLM instance."""
    provider = settings.LLM_PROVIDER.lower()
    if provider == "gemini":
        return ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.3,
            streaming=True,
        )
    if provider == "openai":
        return ChatOpenAI(
            model=settings.LLM_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
            temperature=0.3,
            streaming=True,
        )
    msg = f"Unsupported LLM provider: {provider}"
    raise ValueError(msg)


def _build_context_block(chunks: list[dict]) -> str:
    """Format retrieved chunks into a numbered context block."""
    if not chunks:
        return "(No relevant context found in the knowledge base.)"
    parts: list[str] = []
    for i, chunk in enumerate(chunks, 1):
        source_info = chunk.get("document_id", "unknown")
        parts.append(
            f"[Source {i}] (doc: {source_info}, "
            f"chunk: {chunk.get('chunk_index', '?')})\n"
            f"{chunk.get('content', '')}"
        )
    return "\n\n---\n\n".join(parts)


async def generate_answer(
    query: str,
    chunks: list[dict],
    image_base64: str | None = None,
) -> str:
    """Generate a grounded answer (non-streaming).

    Args:
        query: User's question.
        chunks: Retrieved context chunks.
        image_base64: Optional base64 image for multi-modal.

    Returns:
        Full answer text.
    """
    model = _get_chat_model()
    context = _build_context_block(chunks)
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(
            content=(
                f"## Context\n{context}\n\n"
                f"## Question\n{query}"
            ),
        ),
    ]
    response = await model.ainvoke(messages)
    return response.content


async def stream_answer(
    query: str,
    chunks: list[dict],
    image_base64: str | None = None,
) -> AsyncIterator[str]:
    """Stream a grounded answer token by token.

    Yields:
        Individual text tokens as they are generated.
    """
    model = _get_chat_model()
    context = _build_context_block(chunks)
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(
            content=(
                f"## Context\n{context}\n\n"
                f"## Question\n{query}"
            ),
        ),
    ]
    async for chunk in model.astream(messages):
        if chunk.content:
            yield chunk.content
