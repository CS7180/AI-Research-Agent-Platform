"""Unit tests for app.agent.graph — Agentic RAG workflow nodes.

Tests each node function and routing function in isolation by mocking
external dependencies (LLM, retrieval, config).
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.agent.graph import (
    RETRIEVAL_CONFIDENCE_THRESHOLD,
    build_agent_graph,
    node_classify_intent,
    node_generate,
    node_retrieve,
    node_web_search,
    route_after_retrieval,
    route_by_intent,
)

# ── Fixtures ─────────────────────────────────────────────────────────────────


def _base_state(**overrides) -> dict:
    """Create a minimal AgentState dict for tests."""
    state = {
        "query": "What is 2PC?",
        "user_id": "user-uuid",
        "retrieved_chunks": [],
        "web_search_results": [],
        "reasoning_steps": [],
        "answer": "",
        "sources": [],
    }
    state.update(overrides)
    return state


# ── route_by_intent ──────────────────────────────────────────────────────────


class TestRouteByIntent:
    def test_general_intent_routes_to_generate(self) -> None:
        state = _base_state(intent="general")
        assert route_by_intent(state) == "generate"

    def test_kb_query_intent_routes_to_retrieve(self) -> None:
        state = _base_state(intent="kb_query")
        assert route_by_intent(state) == "retrieve"

    def test_missing_intent_defaults_to_retrieve(self) -> None:
        state = _base_state()
        assert route_by_intent(state) == "retrieve"


# ── route_after_retrieval ────────────────────────────────────────────────────


class TestRouteAfterRetrieval:
    def test_high_confidence_routes_to_generate(self) -> None:
        state = _base_state(
            retrieved_chunks=[{"id": "c1"}],
            retrieval_confidence=0.8,
        )
        assert route_after_retrieval(state) == "generate"

    def test_low_confidence_routes_to_web_search(self) -> None:
        state = _base_state(
            retrieved_chunks=[{"id": "c1"}],
            retrieval_confidence=0.2,
        )
        assert route_after_retrieval(state) == "web_search"

    def test_empty_chunks_routes_to_web_search(self) -> None:
        state = _base_state(
            retrieved_chunks=[],
            retrieval_confidence=0.9,
        )
        assert route_after_retrieval(state) == "web_search"

    def test_threshold_boundary_routes_to_generate(self) -> None:
        state = _base_state(
            retrieved_chunks=[{"id": "c1"}],
            retrieval_confidence=RETRIEVAL_CONFIDENCE_THRESHOLD,
        )
        assert route_after_retrieval(state) == "generate"


# ── node_classify_intent ─────────────────────────────────────────────────────


class TestNodeClassifyIntent:
    @pytest.mark.asyncio
    async def test_classifies_kb_query(self) -> None:
        with patch(
            "app.agent.graph.classify_intent",
            new_callable=AsyncMock,
            return_value="kb_query",
        ):
            result = await node_classify_intent(
                _base_state(query="What is 2PC?"),
            )
        assert result["intent"] == "kb_query"
        assert len(result["reasoning_steps"]) == 1
        assert "[Intent]" in result["reasoning_steps"][0]

    @pytest.mark.asyncio
    async def test_classifies_general(self) -> None:
        with patch(
            "app.agent.graph.classify_intent",
            new_callable=AsyncMock,
            return_value="general",
        ):
            result = await node_classify_intent(
                _base_state(query="Hello!"),
            )
        assert result["intent"] == "general"


# ── node_retrieve ────────────────────────────────────────────────────────────


class TestNodeRetrieve:
    @pytest.mark.asyncio
    async def test_returns_chunks_and_confidence(self) -> None:
        mock_chunks = [
            {"id": "c1", "similarity": 0.9, "content": "two phase"},
            {"id": "c2", "similarity": 0.7, "content": "commit"},
        ]
        with patch(
            "app.agent.graph.retrieve",
            new_callable=AsyncMock,
            return_value=mock_chunks,
        ):
            result = await node_retrieve(
                _base_state(supabase=MagicMock()),
            )
        assert result["retrieved_chunks"] == mock_chunks
        assert result["retrieval_confidence"] == 0.8
        assert "[Retrieve]" in result["reasoning_steps"][0]

    @pytest.mark.asyncio
    async def test_empty_retrieval_returns_zero_confidence(
        self,
    ) -> None:
        with patch(
            "app.agent.graph.retrieve",
            new_callable=AsyncMock,
            return_value=[],
        ):
            result = await node_retrieve(
                _base_state(supabase=MagicMock()),
            )
        assert result["retrieved_chunks"] == []
        assert result["retrieval_confidence"] == 0.0


# ── node_web_search ──────────────────────────────────────────────────────────


class TestNodeWebSearch:
    @pytest.mark.asyncio
    async def test_no_api_key_returns_placeholder(self) -> None:
        with patch(
            "app.agent.graph.settings",
            TAVILY_API_KEY="",
        ):
            result = await node_web_search(_base_state())
        assert len(result["web_search_results"]) == 1
        assert "No web search" in result["web_search_results"][0]["content"]
        assert "[WebSearch]" in result["reasoning_steps"][0]

    @pytest.mark.asyncio
    async def test_tavily_success(self) -> None:
        mock_client = MagicMock()
        mock_client.search.return_value = {
            "results": [
                {
                    "title": "Result 1",
                    "content": "Content 1",
                    "url": "https://example.com",
                }
            ]
        }
        with (
            patch(
                "app.agent.graph.settings",
                TAVILY_API_KEY="test-key",
            ),
            patch(
                "app.agent.graph.TavilyClient",
                return_value=mock_client,
            ),
        ):
            result = await node_web_search(_base_state())
        assert len(result["web_search_results"]) == 1
        assert result["web_search_results"][0]["title"] == "Result 1"

    @pytest.mark.asyncio
    async def test_tavily_exception_returns_placeholder(
        self,
    ) -> None:
        mock_client = MagicMock()
        mock_client.search.side_effect = RuntimeError("API down")
        with (
            patch(
                "app.agent.graph.settings",
                TAVILY_API_KEY="test-key",
            ),
            patch(
                "app.agent.graph.TavilyClient",
                return_value=mock_client,
            ),
        ):
            result = await node_web_search(_base_state())
        assert "No web search" in result["web_search_results"][0]["content"]


# ── node_generate ────────────────────────────────────────────────────────────


class TestNodeGenerate:
    @pytest.mark.asyncio
    async def test_generates_answer_with_sources(self) -> None:
        state = _base_state(
            retrieved_chunks=[
                {
                    "document_id": "doc-1",
                    "chunk_index": 0,
                    "content": "Two phase commit ensures atomicity",
                },
                {
                    "document_id": "doc-1",
                    "chunk_index": 1,
                    "content": "Coordinator sends PREPARE",
                },
            ],
        )
        with patch(
            "app.agent.graph.generate_answer",
            new_callable=AsyncMock,
            return_value="2PC ensures atomicity.",
        ):
            result = await node_generate(state)
        assert result["answer"] == "2PC ensures atomicity."
        # doc-1 appears twice but should be deduplicated
        assert len(result["sources"]) == 1
        assert result["sources"][0]["document_id"] == "doc-1"
        assert "[Generate]" in result["reasoning_steps"][0]

    @pytest.mark.asyncio
    async def test_merges_web_results_into_chunks(self) -> None:
        state = _base_state(
            web_search_results=[{"content": "Web context here", "url": "example.com"}],
        )
        with patch(
            "app.agent.graph.generate_answer",
            new_callable=AsyncMock,
            return_value="Answer from web.",
        ):
            result = await node_generate(state)
        assert result["answer"] == "Answer from web."
        # Web results should not appear in sources
        assert result["sources"] == []

    @pytest.mark.asyncio
    async def test_handles_image_base64(self) -> None:
        state = _base_state(image_base64="base64data")
        with patch(
            "app.agent.graph.generate_answer",
            new_callable=AsyncMock,
            return_value="Image analysis.",
        ) as mock_gen:
            result = await node_generate(state)
        assert result["answer"] == "Image analysis."
        mock_gen.assert_called_once()
        call_kwargs = mock_gen.call_args
        assert call_kwargs.kwargs["image_base64"] == "base64data"


# ── build_agent_graph ────────────────────────────────────────────────────────


class TestBuildAgentGraph:
    def test_graph_compiles_without_error(self) -> None:
        graph = build_agent_graph()
        assert graph is not None
