"""LangGraph agent workflow graph.

Defines the conditional agent that selects between KB Retrieval,
Web Search, and Code Execution based on query intent.

# TODO(#8): Implement full graph with nodes and conditional edges.
"""

from __future__ import annotations

from langgraph.graph import END, StateGraph

from app.agent.state import AgentState

# ── Placeholder nodes ─────────────────────────────────────────────────────────


def route_intent(state: AgentState) -> str:
    """Conditional edge: decide which tool to run next.

    Returns: one of 'retrieve', 'web_search', 'code_exec', 'generate'.
    """
    # TODO(#8): Implement intent classification using LLM
    return "retrieve"


def node_retrieve(state: AgentState) -> AgentState:
    """KB retrieval node — hybrid BM25 + semantic search.

    # TODO(#5): Implement retrieval service call.
    """
    return {**state, "next_tool": "generate"}


def node_web_search(state: AgentState) -> AgentState:
    """Web search fallback node.

    # TODO(#8): Implement web search tool integration.
    """
    return {**state, "next_tool": "generate"}


def node_generate(state: AgentState) -> AgentState:
    """LLM generation node — produces grounded answer with citations.

    # TODO(#5): Implement LLM call with retrieved context.
    """
    return {**state, "answer": "Not yet implemented.", "sources": []}


# ── Build graph ───────────────────────────────────────────────────────────────


def build_agent_graph() -> StateGraph:
    """Construct and compile the LangGraph agent workflow.

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
        route_intent,
        {"generate": "generate", "web_search": "web_search"},
    )
    graph.add_edge("web_search", "generate")
    graph.add_edge("generate", END)

    return graph.compile()


agent_graph = build_agent_graph()
