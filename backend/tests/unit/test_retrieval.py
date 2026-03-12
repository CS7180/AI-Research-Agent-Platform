"""Unit tests for app.services.retrieval — hybrid search and RRF merge.

Tests the RRF merge logic directly and mocks Supabase + embedding calls
for the full retrieve() pipeline.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.retrieval import _rrf_merge, retrieve

# ── _rrf_merge ───────────────────────────────────────────────────────────────


class TestRRFMerge:
    def test_merges_two_result_lists(self) -> None:
        semantic = [
            {"id": "a", "content": "alpha"},
            {"id": "b", "content": "beta"},
        ]
        keyword = [
            {"id": "b", "content": "beta"},
            {"id": "c", "content": "gamma"},
        ]
        merged = _rrf_merge(semantic, keyword)
        ids = [r["id"] for r in merged]
        # 'b' appears in both lists → highest RRF score → first
        assert ids[0] == "b"
        assert set(ids) == {"a", "b", "c"}

    def test_all_results_have_rrf_score(self) -> None:
        items = [{"id": "x", "content": "test"}]
        merged = _rrf_merge(items, [])
        assert "rrf_score" in merged[0]
        assert merged[0]["rrf_score"] > 0

    def test_empty_inputs_return_empty(self) -> None:
        assert _rrf_merge([], []) == []

    def test_single_list_preserves_order(self) -> None:
        items = [
            {"id": "a", "content": "1"},
            {"id": "b", "content": "2"},
            {"id": "c", "content": "3"},
        ]
        merged = _rrf_merge(items, [])
        ids = [r["id"] for r in merged]
        assert ids == ["a", "b", "c"]


# ── retrieve ─────────────────────────────────────────────────────────────────


class TestRetrieve:
    @pytest.mark.asyncio
    async def test_runs_hybrid_search_and_returns_merged(
        self,
    ) -> None:
        mock_supabase = MagicMock()

        # Mock semantic search via RPC
        rpc_result = MagicMock()
        rpc_result.data = [
            {"id": "s1", "content": "semantic result"},
        ]
        rpc_chain = MagicMock()
        rpc_chain.execute.return_value = rpc_result
        mock_supabase.rpc.return_value = rpc_chain

        # Mock keyword search via table query
        kw_result = MagicMock()
        kw_result.data = [
            {"id": "k1", "content": "keyword result"},
        ]
        chain = mock_supabase.table.return_value
        select = chain.select.return_value
        eq = select.eq.return_value
        ilike = eq.ilike.return_value
        ilike.limit.return_value.execute.return_value = kw_result

        # Mock embedding generation
        with patch(
            "app.services.retrieval.generate_query_embedding",
            new_callable=AsyncMock,
            return_value=[0.1] * 768,
        ):
            results = await retrieve(mock_supabase, "test query", "user-1", top_k=5)

        assert len(results) == 2
        ids = {r["id"] for r in results}
        assert ids == {"s1", "k1"}

    @pytest.mark.asyncio
    async def test_returns_empty_when_no_results(self) -> None:
        mock_supabase = MagicMock()

        rpc_result = MagicMock()
        rpc_result.data = []
        rpc_chain = MagicMock()
        rpc_chain.execute.return_value = rpc_result
        mock_supabase.rpc.return_value = rpc_chain

        kw_result = MagicMock()
        kw_result.data = []
        chain = mock_supabase.table.return_value
        select = chain.select.return_value
        eq = select.eq.return_value
        ilike = eq.ilike.return_value
        ilike.limit.return_value.execute.return_value = kw_result

        with patch(
            "app.services.retrieval.generate_query_embedding",
            new_callable=AsyncMock,
            return_value=[0.1] * 768,
        ):
            results = await retrieve(mock_supabase, "unknown", "user-1")

        assert results == []
