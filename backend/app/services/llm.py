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
- Use plain text only (no Markdown syntax like **bold** or heading markers).
- Always format the final answer in this exact structure:
  Summary:
  <1-2 sentences>

  Key Points:
  - <point 1>
  - <point 2>
  - <point 3>

  Evidence:
  - [Source N] <what supports the claim>
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


def _build_user_content(
    query: str,
    context: str,
    image_base64: str | None = None,
) -> str | list[dict]:
    """Build the user message content.

    If an image is provided, returns a multi-part list for
    multi-modal models (Gemini Vision). Otherwise returns
    a plain text string.
    """
    text_part = f"## Context\n{context}\n\n## Question\n{query}"

    if not image_base64:
        return text_part

    # Multi-modal: include image data inline
    return [
        {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{image_base64}",
            },
        },
        {"type": "text", "text": text_part},
    ]


async def generate_answer(
    query: str,
    chunks: list[dict],
    image_base64: str | None = None,
) -> str:
    """Generate a grounded answer (non-streaming).

    Supports multi-modal queries: if *image_base64* is provided,
    the image is included in the prompt for vision models
    (e.g., Gemini 2.5 Flash).

    Args:
        query: User's question.
        chunks: Retrieved context chunks.
        image_base64: Optional base64 image for multi-modal.

    Returns:
        Full answer text.
    """
    model = _get_chat_model()
    context = _build_context_block(chunks)

    # Build the user message content
    user_content = _build_user_content(query, context, image_base64)

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_content),
    ]
    response = await model.ainvoke(messages)
    return response.content


async def stream_answer(
    query: str,
    chunks: list[dict],
    image_base64: str | None = None,
) -> AsyncIterator[str]:
    """Stream a grounded answer token by token.

    Supports multi-modal queries via image_base64.

    Yields:
        Individual text tokens as they are generated.
    """
    model = _get_chat_model()
    context = _build_context_block(chunks)
    user_content = _build_user_content(query, context, image_base64)

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_content),
    ]
    async for chunk in model.astream(messages):
        if chunk.content:
            yield chunk.content


# ── Intent Classification ────────────────────────────────────────────────────

INTENT_PROMPT = """Classify this user query into one of two categories:
- "kb_query": The user is asking about specific documents, papers,
  lecture notes, or topics they have uploaded to their knowledge base.
- "general": The user is asking a general programming/CS question,
  greeting, or something that does NOT require searching their
  uploaded documents.

Respond with ONLY the category name, nothing else.

Query: {query}"""


async def classify_intent(query: str) -> str:
    """Classify the user's query intent.

    Returns:
        "kb_query" or "general".
    """
    model = _get_chat_model()
    messages = [
        HumanMessage(content=INTENT_PROMPT.format(query=query)),
    ]
    response = await model.ainvoke(messages)
    intent = response.content.strip().lower()

    if intent in ("kb_query", "general"):
        return intent
    # Default to kb_query for safety (will attempt retrieval)
    logger.warning(
        "Unexpected intent classification '%s', defaulting to kb_query",
        intent,
    )
    return "kb_query"
