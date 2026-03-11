"""LangGraph agent state schema.

The AgentState flows through the graph and is updated by each node.
It carries the Supabase client reference so that nodes can access
the database and storage without global imports.
"""

from __future__ import annotations

from typing import Any, TypedDict

from langchain_core.messages import BaseMessage


class AgentState(TypedDict, total=False):
    """Shared state passed between LangGraph nodes."""

    # Conversation
    conversation_id: str
    user_id: str
    messages: list[BaseMessage]

    # Runtime dependency — injected by the chat route
    supabase: Any  # supabase.Client (Any avoids import issues)

    # Query
    query: str
    image_base64: str | None

    # Retrieved context
    retrieved_chunks: list[dict]
    retrieval_confidence: float

    # Tool results
    web_search_results: list[dict]
    code_exec_result: str | None

    # Generation
    answer: str
    sources: list[dict]

    # Agent reasoning trace (for observability)
    reasoning_steps: list[str]

    # Control flow
    error: str | None
