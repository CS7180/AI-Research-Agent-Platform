"""Integration tests for primary API endpoints."""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch


def test_list_documents_endpoint(client):
    row = {
        "id": "doc-1",
        "user_id": "test-user-uuid",
        "filename": "notes.pdf",
        "file_size_bytes": 1024,
        "mime_type": "application/pdf",
        "folder_path": "/",
        "file_hash": "abc123",
        "is_starred": False,
        "summary": "test summary",
        "status": "READY",
        "created_at": datetime(2026, 3, 1, tzinfo=UTC).isoformat(),
        "updated_at": datetime(2026, 3, 1, tzinfo=UTC).isoformat(),
        "error_message": None,
    }

    with patch(
        "app.api.routes.documents.doc_service.list_documents",
        AsyncMock(return_value=[row]),
    ):
        response = client.get("/api/documents")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["documents"][0]["id"] == "doc-1"
    assert payload["documents"][0]["filename"] == "notes.pdf"


def test_chat_endpoint_streams_sse(client):
    final_state = {
        "reasoning_steps": ["intent: kb_query"],
        "answer": "hello world",
        "sources": [],
    }

    with patch(
        "app.api.routes.chat.agent_graph.ainvoke",
        AsyncMock(return_value=final_state),
    ):
        response = client.post(
            "/api/chat",
            json={"message": "hello"},
        )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert 'data: {"type": "step"' in response.text
    assert 'data: {"type": "token"' in response.text
    assert "data: [DONE]" in response.text
