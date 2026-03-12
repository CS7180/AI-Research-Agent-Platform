"""Unit tests for app.workers.tasks — Celery document processing.

Tests the _guess_mime helper, _run_pipeline success/failure, and
the process_document Celery task entry point.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.workers.tasks import _guess_mime, _run_pipeline, _update_failed

# ── _guess_mime ──────────────────────────────────────────────────────────────


class TestGuessMime:
    def test_pdf_extension(self) -> None:
        assert _guess_mime("path/to/file.pdf") == "application/pdf"

    def test_pdf_uppercase(self) -> None:
        assert _guess_mime("FILE.PDF") == "application/pdf"

    def test_md_extension(self) -> None:
        assert _guess_mime("notes.md") == "text/markdown"

    def test_txt_extension(self) -> None:
        assert _guess_mime("data.txt") == "text/plain"

    def test_unknown_defaults_to_plain(self) -> None:
        assert _guess_mime("file.csv") == "text/plain"


# ── _run_pipeline ────────────────────────────────────────────────────────────


class TestRunPipeline:
    @pytest.mark.asyncio
    async def test_successful_pipeline(self) -> None:
        """Full pipeline: download → extract → chunk → embed → store."""
        from app.services.chunking import TextChunk

        chunks = [
            TextChunk(index=0, content="Hello world", token_count=2),
        ]

        with (
            patch(
                "app.workers.tasks._get_supabase",
                return_value=MagicMock(),
            ),
            patch(
                "app.workers.tasks.update_document_status",
                new_callable=AsyncMock,
            ) as mock_status,
            patch(
                "app.workers.tasks.download_file",
                new_callable=AsyncMock,
                return_value=b"file contents",
            ),
            patch(
                "app.workers.tasks.extract_text",
                return_value="Extracted text content",
            ),
            patch(
                "app.workers.tasks.chunk_text",
                return_value=chunks,
            ),
            patch(
                "app.workers.tasks.generate_embeddings",
                new_callable=AsyncMock,
                return_value=[[0.1] * 768],
            ),
            patch(
                "app.workers.tasks.insert_chunks",
                new_callable=AsyncMock,
            ) as mock_insert,
        ):
            await _run_pipeline("doc-1", "user-1", "path/file.pdf")

        # Should update status to PROCESSING then READY
        assert mock_status.call_count == 2
        calls = [c.args for c in mock_status.call_args_list]
        assert calls[0][1] == "doc-1"
        assert calls[0][2] == "PROCESSING"
        assert calls[1][2] == "READY"
        mock_insert.assert_called_once()

    @pytest.mark.asyncio
    async def test_empty_text_marks_failed(self) -> None:
        """If no text is extracted, pipeline should mark FAILED."""
        with (
            patch(
                "app.workers.tasks._get_supabase",
                return_value=MagicMock(),
            ),
            patch(
                "app.workers.tasks.update_document_status",
                new_callable=AsyncMock,
            ) as mock_status,
            patch(
                "app.workers.tasks.download_file",
                new_callable=AsyncMock,
                return_value=b"",
            ),
            patch(
                "app.workers.tasks.extract_text",
                return_value="   ",
            ),
        ):
            await _run_pipeline("doc-1", "user-1", "path/empty.pdf")

        # Should be called twice: PROCESSING, then FAILED
        assert mock_status.call_count == 2
        last_call = mock_status.call_args_list[-1]
        assert last_call.args[2] == "FAILED"


# ── _update_failed ───────────────────────────────────────────────────────────


class TestUpdateFailed:
    @pytest.mark.asyncio
    async def test_marks_document_failed(self) -> None:
        with patch(
            "app.workers.tasks.update_document_status",
            new_callable=AsyncMock,
        ) as mock_status:
            await _update_failed(MagicMock(), "doc-1", "some error")
        mock_status.assert_called_once()
        args = mock_status.call_args
        assert args.args[1] == "doc-1"
        assert args.args[2] == "FAILED"
