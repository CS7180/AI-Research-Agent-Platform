"""Unit tests for app.services.llm — LLM adapter and intent classification.

Mocks LangChain chat models to test prompt construction, response
parsing, and provider selection without making real API calls.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.llm import (
    _build_context_block,
    _build_user_content,
    _get_chat_model,
    classify_intent,
    generate_answer,
    stream_answer,
)

# ── _get_chat_model ──────────────────────────────────────────────────────────


class TestGetChatModel:
    def test_gemini_provider(self) -> None:
        with patch("app.services.llm.settings") as mock_s:
            mock_s.LLM_PROVIDER = "gemini"
            mock_s.LLM_MODEL = "gemini-2.5-flash"
            mock_s.GOOGLE_API_KEY = "test-key"
            model = _get_chat_model()
        assert model is not None

    def test_openai_provider(self) -> None:
        with patch("app.services.llm.settings") as mock_s:
            mock_s.LLM_PROVIDER = "openai"
            mock_s.LLM_MODEL = "gpt-4o-mini"
            mock_s.OPENAI_API_KEY = "test-key"
            model = _get_chat_model()
        assert model is not None

    def test_unsupported_provider_raises(self) -> None:
        with (
            patch("app.services.llm.settings") as mock_s,
            pytest.raises(ValueError, match="Unsupported"),
        ):
            mock_s.LLM_PROVIDER = "qwen"
            _get_chat_model()


# ── _build_context_block ─────────────────────────────────────────────────────


class TestBuildContextBlock:
    def test_empty_chunks(self) -> None:
        result = _build_context_block([])
        assert "No relevant context" in result

    def test_formats_numbered_sources(self) -> None:
        chunks = [
            {
                "document_id": "doc-1",
                "chunk_index": 0,
                "content": "hello world",
            },
            {
                "document_id": "doc-2",
                "chunk_index": 3,
                "content": "foo bar",
            },
        ]
        result = _build_context_block(chunks)
        assert "[Source 1]" in result
        assert "[Source 2]" in result
        assert "hello world" in result


# ── _build_user_content ──────────────────────────────────────────────────────


class TestBuildUserContent:
    def test_text_only(self) -> None:
        result = _build_user_content("q?", "ctx")
        assert isinstance(result, str)
        assert "q?" in result

    def test_with_image_returns_list(self) -> None:
        result = _build_user_content("q?", "ctx", "base64img")
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["type"] == "image_url"


# ── generate_answer ──────────────────────────────────────────────────────────


class TestGenerateAnswer:
    @pytest.mark.asyncio
    async def test_returns_model_content(self) -> None:
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.content = "Generated answer."
        mock_model.ainvoke = AsyncMock(return_value=mock_response)

        with patch(
            "app.services.llm._get_chat_model",
            return_value=mock_model,
        ):
            result = await generate_answer("q?", [])
        assert result == "Generated answer."


# ── stream_answer ────────────────────────────────────────────────────────────


class TestStreamAnswer:
    @pytest.mark.asyncio
    async def test_yields_tokens(self) -> None:
        mock_model = MagicMock()
        chunk1 = MagicMock(content="Hello ")
        chunk2 = MagicMock(content="world")

        async def mock_astream(_messages):
            yield chunk1
            yield chunk2

        mock_model.astream = mock_astream

        with patch(
            "app.services.llm._get_chat_model",
            return_value=mock_model,
        ):
            tokens = [t async for t in stream_answer("q?", [])]
        assert tokens == ["Hello ", "world"]


# ── classify_intent ──────────────────────────────────────────────────────────


class TestClassifyIntent:
    @pytest.mark.asyncio
    async def test_returns_kb_query(self) -> None:
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.content = "kb_query"
        mock_model.ainvoke = AsyncMock(return_value=mock_response)

        with patch(
            "app.services.llm._get_chat_model",
            return_value=mock_model,
        ):
            result = await classify_intent("What is 2PC?")
        assert result == "kb_query"

    @pytest.mark.asyncio
    async def test_returns_general(self) -> None:
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.content = "general"
        mock_model.ainvoke = AsyncMock(return_value=mock_response)

        with patch(
            "app.services.llm._get_chat_model",
            return_value=mock_model,
        ):
            result = await classify_intent("Hello!")
        assert result == "general"

    @pytest.mark.asyncio
    async def test_unexpected_intent_defaults_to_kb(self) -> None:
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.content = "something_weird"
        mock_model.ainvoke = AsyncMock(return_value=mock_response)

        with patch(
            "app.services.llm._get_chat_model",
            return_value=mock_model,
        ):
            result = await classify_intent("random input")
        assert result == "kb_query"
