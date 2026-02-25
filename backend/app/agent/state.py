"""LangGraph agent state schema.

The AgentState flows through the graph and is updated by each node.
"""

from __future__ import annotations

from typing import TypedDict

from langchain_core.messages import BaseMessage


class AgentState(TypedDict, total=False):
    """Shared state passed between LangGraph nodes."""

    # Conversation
    conversation_id: str
    user_id: str
    messages: list[BaseMessage]

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

    # Control flow
    next_tool: str | None  # "retrieve" | "web_search" | "code_exec" | "generate"
    error: str | None
