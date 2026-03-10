"""LangGraph agent workflow graph.

Defines the conditional agent that selects between KB Retrieval,
Web Search, and direct generation based on query intent and
retrieval confidence.
"""

from __future__ import annotations

import logging

from langgraph.graph import END, StateGraph

from app.agent.state import AgentState

logger = logging.getLogger(__name__)

# Confidence threshold: below this, fall back to web search
RETRIEVAL_CONFIDENCE_THRESHOLD = 0.5


# ── Nodes ────────────────────────────────────────────────────────────────────


async def node_retrieve(state: AgentState) -> dict:
    """KB retrieval node — hybrid BM25 + semantic search.

    Calls the retrieval service and stores results + confidence
    in the agent state.
    """
    from app.api.dependencies import get_supabase_client
    from app.services.retrieval import retrieve

    supabase = get_supabase_client()
    query = state.get("query", "")
    user_id = state.get("user_id", "")

    chunks = await retrieve(supabase, query, user_id)

    # Compute average similarity as confidence proxy
    confidence = 0.0
    if chunks:
        scores = [
            c.get("similarity", c.get("rrf_score", 0))
            for c in chunks
        ]
        confidence = sum(scores) / len(scores)

    logger.info(
        "Retrieval: %d chunks, confidence=%.3f",
        len(chunks),
        confidence,
    )

    return {
        "retrieved_chunks": chunks,
        "retrieval_confidence": confidence,
    }


async def node_web_search(state: AgentState) -> dict:
    """Web search fallback node.

    Triggered when KB retrieval yields low confidence.
    Uses a simple web search to supplement context.
    """
    query = state.get("query", "")
    logger.info("Web search fallback for: %s", query[:80])

    # TODO(#8): Integrate real web search API (Tavily, SerpAPI)
    # For now, return empty results with a note
    return {
        "web_search_results": [
            {
                "title": "Web search placeholder",
                "content": (
                    "Web search is not yet integrated. "
                    "Please upload relevant documents to your "
                    "knowledge base for better answers."
                ),
                "url": "",
            },
        ],
    }


async def node_generate(state: AgentState) -> dict:
    """LLM generation node — produces grounded answer.

    Combines KB retrieval results and web search results into
    context, then calls the LLM for answer generation.
    """
    from app.services.llm import generate_answer

    query = state.get("query", "")
    chunks = state.get("retrieved_chunks", [])
    web_results = state.get("web_search_results", [])
    image_base64 = state.get("image_base64")

    # Merge web results into chunks format
    if web_results:
        for wr in web_results:
            chunks.append(
                {
                    "document_id": "web",
                    "chunk_index": 0,
                    "content": wr.get("content", ""),
                },
            )

    answer = await generate_answer(
        query=query,
        chunks=chunks,
        image_base64=image_base64,
    )

    # Build source list
    sources: list[dict] = []
    seen: set[str] = set()
    for chunk in state.get("retrieved_chunks", []):
        doc_id = chunk.get("document_id", "")
        if doc_id and doc_id not in seen and doc_id != "web":
            seen.add(doc_id)
            sources.append(
                {
                    "document_id": doc_id,
                    "chunk_index": chunk.get("chunk_index", 0),
                    "excerpt": chunk.get("content", "")[:150],
                },
            )

    return {"answer": answer, "sources": sources}


# ── Conditional routing ──────────────────────────────────────────────────────


def route_after_retrieval(state: AgentState) -> str:
    """Decide next step after KB retrieval.

    If confidence is above threshold → generate directly.
    If confidence is low → try web search first.
    """
    confidence = state.get("retrieval_confidence", 0.0)
    chunks = state.get("retrieved_chunks", [])

    if not chunks or confidence < RETRIEVAL_CONFIDENCE_THRESHOLD:
        logger.info(
            "Low retrieval confidence (%.3f) → web search",
            confidence,
        )
        return "web_search"
    return "generate"


# ── Build graph ──────────────────────────────────────────────────────────────


def build_agent_graph() -> StateGraph:
    """Construct and compile the LangGraph agent workflow.

    Graph structure:
        retrieve → [confidence check]
                     ├─ high → generate → END
                     └─ low  → web_search → generate → END

    Returns:
        Compiled StateGraph ready to invoke or stream.
    """
    graph = StateGraph(AgentState)

    graph.add_node("retrieve", node_retrieve)
    graph.add_node("web_search", node_web_search)
    graph.add_node("generate", node_generate)

    graph.set_entry_point("retrieve")

    graph.add_conditional_edges(
        "retrieve",
        route_after_retrieval,
        {"generate": "generate", "web_search": "web_search"},
    )
    graph.add_edge("web_search", "generate")
    graph.add_edge("generate", END)

    return graph.compile()


agent_graph = build_agent_graph()
