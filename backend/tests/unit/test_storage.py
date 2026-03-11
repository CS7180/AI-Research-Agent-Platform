"""Unit tests for app.services.storage — Supabase Storage operations."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from app.services.storage import (
    _build_storage_path,
    compute_file_hash,
    delete_file,
    download_file,
    upload_file,
)

USER_ID = "test-user-uuid"
DOC_ID = "test-doc-uuid"


class TestBuildStoragePath:
    def test_builds_correct_path(self) -> None:
        path = _build_storage_path(USER_ID, DOC_ID, "paper.pdf")
        assert path == f"{USER_ID}/{DOC_ID}/paper.pdf"

    def test_preserves_filename_with_spaces(self) -> None:
        path = _build_storage_path(USER_ID, DOC_ID, "my file.pdf")
        assert path.endswith("my file.pdf")


class TestComputeFileHash:
    def test_deterministic_hash(self) -> None:
        data = b"Hello, DocMind!"
        h1 = compute_file_hash(data)
        h2 = compute_file_hash(data)
        assert h1 == h2
        assert len(h1) == 64  # SHA-256 hex digest

    def test_different_content_different_hash(self) -> None:
        h1 = compute_file_hash(b"file_a")
        h2 = compute_file_hash(b"file_b")
        assert h1 != h2

    def test_empty_bytes_has_hash(self) -> None:
        h = compute_file_hash(b"")
        assert len(h) == 64


class TestUploadFile:
    @pytest.mark.asyncio
    async def test_upload_returns_path(self) -> None:
        mock = MagicMock()
        mock.storage.from_.return_value.upload.return_value = None

        path = await upload_file(
            mock,
            user_id=USER_ID,
            document_id=DOC_ID,
            filename="test.pdf",
            contents=b"fake pdf data",
            content_type="application/pdf",
        )

        assert path == f"{USER_ID}/{DOC_ID}/test.pdf"
        mock.storage.from_.assert_called_once_with("documents")


class TestDownloadFile:
    @pytest.mark.asyncio
    async def test_download_returns_bytes(self) -> None:
        mock = MagicMock()
        mock.storage.from_.return_value.download.return_value = b"pdf data"

        result = await download_file(mock, "user/doc/test.pdf")
        assert result == b"pdf data"


class TestDeleteFile:
    @pytest.mark.asyncio
    async def test_delete_calls_remove(self) -> None:
        mock = MagicMock()
        mock.storage.from_.return_value.remove.return_value = None

        await delete_file(mock, "user/doc/test.pdf")
        mock.storage.from_.return_value.remove.assert_called_once_with(
            ["user/doc/test.pdf"],
        )
