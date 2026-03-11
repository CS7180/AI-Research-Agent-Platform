"""Retrieval service — hybrid BM25 + semantic search with re-ranking.

Provides the RAG retrieval pipeline:
1.  Semantic search via pgvector (cosine similarity).
2.  Keyword search via PostgreSQL full-text search (BM25-like).
3.  Reciprocal Rank Fusion (RRF) to merge and re-rank results.
"""

from __future__ import annotations

import logging

from app.core.config import settings
from app.services.embedding import generate_query_embedding
from supabase import Client

logger = logging.getLogger(__name__)


# ── Semantic search ──────────────────────────────────────────────────────────


async def _semantic_search(
    supabase: Client,
    query_embedding: list[float],
    user_id: str,
    top_k: int,
    threshold: float,
) -> list[dict]:
    """Vector similarity search using pgvector.

    Calls the ``match_document_chunks`` RPC function defined in the
    SQL migration.
    """
    result = supabase.rpc(
        "match_document_chunks",
        {
            "query_embedding": query_embedding,
            "match_count": top_k,
            "match_threshold": threshold,
            "p_user_id": user_id,
        },
    ).execute()
    return result.data or []


# ── Keyword search (full-text) ───────────────────────────────────────────────


async def _keyword_search(
    supabase: Client,
    query: str,
    user_id: str,
    top_k: int,
) -> list[dict]:
    """Simple keyword search using PostgreSQL ILIKE.

    For a production system, replace with ``tsvector`` full-text
    search or an external BM25 engine.
    """
    words = query.split()[:5]  # Use first 5 words
    pattern = "%".join(words)
    result = (
        supabase.table("document_chunks")
        .select("id, document_id, chunk_index, content")
        .eq("user_id", user_id)
        .ilike("content", f"%{pattern}%")
        .limit(top_k)
        .execute()
    )
    return result.data or []


# ── Reciprocal Rank Fusion ───────────────────────────────────────────────────


def _rrf_merge(
    semantic_results: list[dict],
    keyword_results: list[dict],
    k: int = 60,
) -> list[dict]:
    """Merge two ranked lists using Reciprocal Rank Fusion.

    RRF score = sum(1 / (k + rank)) across all lists.
    Returns results sorted by descending RRF score.
    """
    scores: dict[str, float] = {}
    items: dict[str, dict] = {}

    for rank, item in enumerate(semantic_results):
        chunk_id = item["id"]
        scores[chunk_id] = scores.get(chunk_id, 0) + 1 / (k + rank + 1)
        items[chunk_id] = item

    for rank, item in enumerate(keyword_results):
        chunk_id = item["id"]
        scores[chunk_id] = scores.get(chunk_id, 0) + 1 / (k + rank + 1)
        items[chunk_id] = item

    sorted_ids = sorted(
        scores,
        key=lambda cid: scores[cid],
        reverse=True,
    )
    return [{**items[cid], "rrf_score": scores[cid]} for cid in sorted_ids]


# ── Public API ───────────────────────────────────────────────────────────────


async def retrieve(
    supabase: Client,
    query: str,
    user_id: str,
    top_k: int | None = None,
) -> list[dict]:
    """Run hybrid retrieval and return re-ranked chunks.

    Args:
        supabase: Supabase client.
        query: User's natural language query.
        user_id: Authenticated user's UUID.
        top_k: Number of final results to return.

    Returns:
        List of chunk dicts sorted by relevance (RRF score).
    """
    k = top_k or settings.TOP_K_RETRIEVAL

    # Generate query embedding
    query_embedding = await generate_query_embedding(query)

    # Run both searches in parallel
    semantic = await _semantic_search(
        supabase,
        query_embedding,
        user_id,
        k,
        0.5,
    )
    keywords = await _keyword_search(
        supabase,
        query,
        user_id,
        k,
    )

    logger.info(
        "Retrieval: %d semantic + %d keyword results",
        len(semantic),
        len(keywords),
    )

    # Merge with RRF
    merged = _rrf_merge(semantic, keywords)
    return merged[:k]
