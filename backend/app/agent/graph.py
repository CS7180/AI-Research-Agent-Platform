"""LangGraph Agentic RAG workflow graph.

This is the **core intelligence** of DocMind.  Instead of a fixed
retrieve → generate pipeline (Naive RAG), the agent makes autonomous
decisions at each step:

    1. Classify the user's intent (KB query vs. general question).
    2. Retrieve from the knowledge base.
    3. **Evaluate** retrieval quality (confidence check).
    4. Decide whether to supplement with web search.
    5. Generate a grounded, cited answer.

Graph structure:

    classify_intent
        ├─ "kb_query"  → retrieve → evaluate_retrieval
        │                                ├─ high → generate → END
        │                                └─ low  → web_search → generate → END
        └─ "general"   → generate → END
"""

from __future__ import annotations

import logging

from langgraph.graph import END, StateGraph

from app.agent.state import AgentState

logger = logging.getLogger(__name__)

RETRIEVAL_CONFIDENCE_THRESHOLD = 0.5


# ── Node: Intent Classification ─────────────────────────────────────────────


async def node_classify_intent(state: AgentState) -> dict:
    """Classify the user's query intent using the LLM.

    Determines whether the query requires knowledge base retrieval
    or can be answered with general knowledge.
    """
    from app.services.llm import classify_intent

    query = state.get("query", "")
    intent = await classify_intent(query)

    step = f"[Intent] Classified as '{intent}' for: {query[:60]}"
    logger.info(step)
    prev_steps = list(state.get("reasoning_steps", []))
    prev_steps.append(step)

    return {"reasoning_steps": prev_steps, "intent": intent}


def route_by_intent(state: AgentState) -> str:
    """Conditional edge after intent classification."""
    intent = state.get("intent", "kb_query")
    if intent == "general":
        return "generate"
    return "retrieve"


# ── Node: KB Retrieval ───────────────────────────────────────────────────────


async def node_retrieve(state: AgentState) -> dict:
    """Hybrid BM25 + semantic search over the user's knowledge base."""
    from app.services.retrieval import retrieve

    supabase = state.get("supabase")
    query = state.get("query", "")
    user_id = state.get("user_id", "")

    chunks = await retrieve(supabase, query, user_id)

    confidence = 0.0
    if chunks:
        scores = [c.get("similarity", c.get("rrf_score", 0)) for c in chunks]
        confidence = sum(scores) / len(scores)

    step = f"[Retrieve] Found {len(chunks)} chunks, " f"confidence={confidence:.3f}"
    logger.info(step)
    prev_steps = list(state.get("reasoning_steps", []))
    prev_steps.append(step)

    return {
        "retrieved_chunks": chunks,
        "retrieval_confidence": confidence,
        "reasoning_steps": prev_steps,
    }


# ── Node: Evaluate Retrieval (Agent Decision Point) ─────────────────────────


def route_after_retrieval(state: AgentState) -> str:
    """Agent decides: is the retrieved context good enough?

    If confidence is above threshold → generate directly.
    If confidence is low → supplement with web search.
    """
    confidence = state.get("retrieval_confidence", 0.0)
    chunks = state.get("retrieved_chunks", [])

    if not chunks or confidence < RETRIEVAL_CONFIDENCE_THRESHOLD:
        logger.info(
            "Agent decision: low confidence (%.3f) → web search",
            confidence,
        )
        return "web_search"
    logger.info(
        "Agent decision: sufficient confidence (%.3f) → generate",
        confidence,
    )
    return "generate"


# ── Node: Web Search Fallback ────────────────────────────────────────────────


async def node_web_search(state: AgentState) -> dict:
    """Web search tool invoked when KB retrieval is insufficient.

    Uses the Tavily API for academic/technical search.
    Falls back to a placeholder if the API key is not configured.
    """
    from app.core.config import settings

    query = state.get("query", "")
    logger.info("Web search for: %s", query[:80])

    results: list[dict] = []

    if settings.TAVILY_API_KEY:
        try:
            from tavily import TavilyClient

            client = TavilyClient(api_key=settings.TAVILY_API_KEY)
            response = client.search(
                query=query,
                search_depth="advanced",
                max_results=5,
            )
            for r in response.get("results", []):
                results.append(
                    {
                        "title": r.get("title", ""),
                        "content": r.get("content", ""),
                        "url": r.get("url", ""),
                    }
                )
        except Exception as exc:
            logger.warning("Tavily search failed: %s", exc)
    else:
        logger.info("Tavily API key not set, skip web search")

    if not results:
        results = [
            {
                "title": "Web search",
                "content": (
                    "No web search results available. "
                    "Consider uploading relevant documents."
                ),
                "url": "",
            }
        ]

    step = f"[WebSearch] Retrieved {len(results)} web results"
    prev_steps = list(state.get("reasoning_steps", []))
    prev_steps.append(step)

    return {
        "web_search_results": results,
        "reasoning_steps": prev_steps,
    }


# ── Node: Generate Answer ───────────────────────────────────────────────────


async def node_generate(state: AgentState) -> dict:
    """LLM generation — produces a grounded answer with citations.

    Merges KB chunks and web search results into a unified context
    before calling the LLM.
    """
    from app.services.llm import generate_answer

    query = state.get("query", "")
    chunks = list(state.get("retrieved_chunks", []))
    web_results = state.get("web_search_results", [])
    image = state.get("image_base64")

    # Merge web results into the context
    for wr in web_results:
        chunks.append(
            {
                "document_id": "web",
                "chunk_index": 0,
                "content": wr.get("content", ""),
            }
        )

    answer = await generate_answer(
        query=query,
        chunks=chunks,
        image_base64=image,
    )

    # Build source citations (exclude web-sourced chunks)
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
                }
            )

    step = f"[Generate] Produced answer ({len(answer)} chars)"
    prev_steps = list(state.get("reasoning_steps", []))
    prev_steps.append(step)

    return {
        "answer": answer,
        "sources": sources,
        "reasoning_steps": prev_steps,
    }


# ── Build the Agentic Graph ─────────────────────────────────────────────────


def build_agent_graph():
    """Construct and compile the LangGraph Agentic RAG workflow.

    Graph:
        classify_intent
          ├─ "kb_query"  → retrieve → [confidence?]
          │                               ├─ high → generate → END
          │                               └─ low  → web_search → generate → END
          └─ "general"   → generate → END
    """
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("classify_intent", node_classify_intent)
    graph.add_node("retrieve", node_retrieve)
    graph.add_node("web_search", node_web_search)
    graph.add_node("generate", node_generate)

    # Entry point
    graph.set_entry_point("classify_intent")

    # Intent routing
    graph.add_conditional_edges(
        "classify_intent",
        route_by_intent,
        {"retrieve": "retrieve", "generate": "generate"},
    )

    # Post-retrieval confidence routing
    graph.add_conditional_edges(
        "retrieve",
        route_after_retrieval,
        {"generate": "generate", "web_search": "web_search"},
    )

    # Fixed edges
    graph.add_edge("web_search", "generate")
    graph.add_edge("generate", END)

    return graph.compile()


agent_graph = build_agent_graph()
