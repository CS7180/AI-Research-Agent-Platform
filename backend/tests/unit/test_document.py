"""Unit tests for app.services.document — Supabase DB CRUD."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from app.services.document import (
    check_duplicate,
    create_document,
    delete_document,
    get_document,
    insert_chunks,
    list_documents,
    update_document_status,
)

USER_ID = "test-user-uuid"
DOC_ID = "test-doc-uuid"


def _mock_supabase(select_data=None, insert_data=None, delete_data=None):
    """Build a mock Supabase client with chainable table methods."""
    mock = MagicMock()

    # Mock .table().select()...execute()
    result = MagicMock()
    result.data = select_data or []

    chain = mock.table.return_value
    chain.select.return_value.eq.return_value.eq.return_value.execute.return_value = (
        result
    )
    eq_chain = chain.select.return_value.eq.return_value.eq.return_value
    eq_chain.limit.return_value.execute.return_value = result
    order_chain = chain.select.return_value.eq.return_value.order
    order_chain.return_value.execute.return_value = result

    # Mock .table().insert().execute()
    insert_result = MagicMock()
    insert_result.data = insert_data or [{"id": DOC_ID}]
    chain.insert.return_value.execute.return_value = insert_result

    # Mock .table().delete()...execute()
    delete_result = MagicMock()
    delete_result.data = delete_data or []
    chain.delete.return_value.eq.return_value.eq.return_value.execute.return_value = (
        delete_result
    )

    # Mock .table().update()...execute()
    chain.update.return_value.eq.return_value.execute.return_value = MagicMock()
    chain.update.return_value.eq.return_value.eq.return_value.execute.return_value = (
        MagicMock()
    )

    return mock


class TestCreateDocument:
    @pytest.mark.asyncio
    async def test_creates_document_returns_row(self) -> None:
        row = {
            "id": DOC_ID,
            "user_id": USER_ID,
            "filename": "test.pdf",
            "status": "PENDING",
        }
        mock = _mock_supabase(insert_data=[row])

        result = await create_document(
            mock,
            document_id=DOC_ID,
            user_id=USER_ID,
            filename="test.pdf",
            file_size_bytes=1024,
            mime_type="application/pdf",
            folder_path="/",
            file_hash="abc123",
            storage_path="user/doc/test.pdf",
        )

        assert result["id"] == DOC_ID
        mock.table.assert_called_with("documents")


class TestGetDocument:
    @pytest.mark.asyncio
    async def test_returns_document_when_found(self) -> None:
        row = {"id": DOC_ID, "user_id": USER_ID, "filename": "test.pdf"}
        mock = _mock_supabase(select_data=[row])

        result = await get_document(mock, DOC_ID, USER_ID)
        assert result is not None
        assert result["id"] == DOC_ID

    @pytest.mark.asyncio
    async def test_returns_none_when_not_found(self) -> None:
        mock = _mock_supabase(select_data=[])

        result = await get_document(mock, DOC_ID, USER_ID)
        assert result is None


class TestListDocuments:
    @pytest.mark.asyncio
    async def test_returns_list_of_documents(self) -> None:
        rows = [
            {"id": "doc1", "filename": "a.pdf"},
            {"id": "doc2", "filename": "b.pdf"},
        ]
        mock = _mock_supabase(select_data=rows)

        result = await list_documents(mock, USER_ID)
        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_returns_empty_list(self) -> None:
        mock = _mock_supabase(select_data=[])
        result = await list_documents(mock, USER_ID)
        assert result == []


class TestCheckDuplicate:
    @pytest.mark.asyncio
    async def test_finds_duplicate(self) -> None:
        row = {"id": DOC_ID, "filename": "dup.pdf"}
        mock = _mock_supabase(select_data=[row])

        result = await check_duplicate(mock, USER_ID, "hash123")
        assert result is not None
        assert result["id"] == DOC_ID

    @pytest.mark.asyncio
    async def test_no_duplicate(self) -> None:
        mock = _mock_supabase(select_data=[])
        result = await check_duplicate(mock, USER_ID, "uniquehash")
        assert result is None


class TestUpdateDocumentStatus:
    @pytest.mark.asyncio
    async def test_updates_status(self) -> None:
        mock = _mock_supabase()
        # Should not raise
        await update_document_status(mock, DOC_ID, "READY")
        mock.table.assert_called_with("documents")

    @pytest.mark.asyncio
    async def test_updates_status_with_error(self) -> None:
        mock = _mock_supabase()
        await update_document_status(
            mock,
            DOC_ID,
            "FAILED",
            error_message="Parse failure",
        )
        mock.table.assert_called_with("documents")


class TestDeleteDocument:
    @pytest.mark.asyncio
    async def test_returns_true_when_deleted(self) -> None:
        mock = _mock_supabase(delete_data=[{"id": DOC_ID}])
        result = await delete_document(mock, DOC_ID, USER_ID)
        assert result is True

    @pytest.mark.asyncio
    async def test_returns_false_when_not_found(self) -> None:
        mock = _mock_supabase(delete_data=[])
        result = await delete_document(mock, DOC_ID, USER_ID)
        assert result is False


class TestInsertChunks:
    @pytest.mark.asyncio
    async def test_inserts_batch(self) -> None:
        mock = _mock_supabase()
        chunks = [
            {
                "document_id": DOC_ID,
                "user_id": USER_ID,
                "chunk_index": 0,
                "content": "Hello world",
                "token_count": 2,
                "embedding": [0.1] * 768,
            },
        ]
        await insert_chunks(mock, chunks)
        mock.table.assert_called_with("document_chunks")
