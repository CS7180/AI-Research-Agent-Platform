"""Unit tests for app.services.embedding — provider-agnostic embeddings.

Mocks LangChain embedding models to avoid real API calls.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.embedding import (
    _get_embeddings_model,
    generate_embeddings,
    generate_query_embedding,
)

# ── _get_embeddings_model ────────────────────────────────────────────────────


class TestGetEmbeddingsModel:
    def test_gemini_provider(self) -> None:
        with patch("app.services.embedding.settings") as mock_s:
            mock_s.EMBEDDING_PROVIDER = "gemini"
            mock_s.EMBEDDING_MODEL = "gemini-embedding-001"
            mock_s.GOOGLE_API_KEY = "test-key"
            model = _get_embeddings_model()
        assert model is not None

    def test_openai_provider(self) -> None:
        with patch("app.services.embedding.settings") as mock_s:
            mock_s.EMBEDDING_PROVIDER = "openai"
            mock_s.EMBEDDING_MODEL = "text-embedding-3-small"
            mock_s.OPENAI_API_KEY = "test-key"
            model = _get_embeddings_model()
        assert model is not None

    def test_unsupported_provider_raises(self) -> None:
        with (
            patch("app.services.embedding.settings") as mock_s,
            pytest.raises(ValueError, match="Unsupported"),
        ):
            mock_s.EMBEDDING_PROVIDER = "unknown"
            _get_embeddings_model()


# ── generate_embeddings ──────────────────────────────────────────────────────


class TestGenerateEmbeddings:
    @pytest.mark.asyncio
    async def test_returns_embedding_vectors(self) -> None:
        v1 = [0.1] * 768
        v2 = [0.2] * 768
        mock_model = MagicMock()
        mock_model.aembed_documents = AsyncMock(
            return_value=[v1, v2],
        )
        with (
            patch(
                "app.services.embedding._get_embeddings_model",
                return_value=mock_model,
            ),
            patch("app.services.embedding.settings") as mock_s,
        ):
            mock_s.EMBEDDING_PROVIDER = "gemini"
            mock_s.EMBEDDING_MODEL = "test"
            result = await generate_embeddings(["hello", "world"])

        assert len(result) == 2
        assert result[0] == v1
        mock_model.aembed_documents.assert_called_once_with(
            ["hello", "world"],
        )

    @pytest.mark.asyncio
    async def test_raises_when_dimension_mismatch(self) -> None:
        mock_model = MagicMock()
        mock_model.aembed_documents = AsyncMock(return_value=[[0.1, 0.2]])
        with (
            patch(
                "app.services.embedding._get_embeddings_model",
                return_value=mock_model,
            ),
            patch("app.services.embedding.settings") as mock_s,
            pytest.raises(ValueError, match="Embedding dimension mismatch"),
        ):
            mock_s.EMBEDDING_PROVIDER = "gemini"
            mock_s.EMBEDDING_MODEL = "test"
            await generate_embeddings(["hello"])


# ── generate_query_embedding ─────────────────────────────────────────────────


class TestGenerateQueryEmbedding:
    @pytest.mark.asyncio
    async def test_returns_single_vector(self) -> None:
        vec = [0.5] * 768
        mock_model = MagicMock()
        mock_model.aembed_query = AsyncMock(
            return_value=vec,
        )
        with patch(
            "app.services.embedding._get_embeddings_model",
            return_value=mock_model,
        ):
            result = await generate_query_embedding("test query")

        assert result == vec
        mock_model.aembed_query.assert_called_once_with("test query")

    @pytest.mark.asyncio
    async def test_raises_when_query_dimension_mismatch(self) -> None:
        mock_model = MagicMock()
        mock_model.aembed_query = AsyncMock(return_value=[0.1, 0.2])
        with (
            patch(
                "app.services.embedding._get_embeddings_model",
                return_value=mock_model,
            ),
            pytest.raises(ValueError, match="Query embedding dimension mismatch"),
        ):
            await generate_query_embedding("test query")
