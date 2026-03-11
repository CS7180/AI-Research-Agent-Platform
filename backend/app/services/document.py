"""Document CRUD service — Supabase DB operations.

Handles creating, reading, updating, and deleting document records
in the ``documents`` table.  All queries use the service-role client
(RLS is enforced at the API layer via JWT validation).
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime

from supabase import Client

logger = logging.getLogger(__name__)

DOCUMENTS_TABLE = "documents"
CHUNKS_TABLE = "document_chunks"


# ── Create ───────────────────────────────────────────────────────────────────


async def create_document(
    supabase: Client,
    *,
    document_id: str,
    user_id: str,
    filename: str,
    file_size_bytes: int,
    mime_type: str,
    folder_path: str,
    file_hash: str | None,
    storage_path: str,
) -> dict:
    """Insert a new document record with status PENDING.

    Returns:
        The inserted row as a dict.
    """
    row = {
        "id": document_id,
        "user_id": user_id,
        "filename": filename,
        "file_size_bytes": file_size_bytes,
        "mime_type": mime_type,
        "folder_path": folder_path,
        "file_hash": file_hash,
        "storage_path": storage_path,
        "status": "PENDING",
    }
    result = supabase.table(DOCUMENTS_TABLE).insert(row).execute()
    logger.info("Document created: id=%s", document_id)
    return result.data[0]


# ── Read ─────────────────────────────────────────────────────────────────────


async def get_document(
    supabase: Client,
    document_id: str,
    user_id: str,
) -> dict | None:
    """Fetch a single document by ID, scoped to the user.

    Returns:
        The document row as a dict, or ``None`` if not found.
    """
    result = (
        supabase.table(DOCUMENTS_TABLE)
        .select("*")
        .eq("id", document_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0] if result.data else None


async def list_documents(
    supabase: Client,
    user_id: str,
) -> list[dict]:
    """Return all documents for a user, newest first.

    Returns:
        List of document row dicts.
    """
    result = (
        supabase.table(DOCUMENTS_TABLE)
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


async def check_duplicate(
    supabase: Client,
    user_id: str,
    file_hash: str,
) -> dict | None:
    """Check if a document with the same hash already exists.

    Returns:
        The existing document row dict, or ``None``.
    """
    result = (
        supabase.table(DOCUMENTS_TABLE)
        .select("id, filename")
        .eq("user_id", user_id)
        .eq("file_hash", file_hash)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


# ── Update ───────────────────────────────────────────────────────────────────


async def update_document_status(
    supabase: Client,
    document_id: str,
    status: str,
    error_message: str | None = None,
) -> None:
    """Update the processing status of a document.

    Args:
        supabase: Supabase client.
        document_id: UUID of the document.
        status: New status (PROCESSING, READY, FAILED).
        error_message: Optional error description (for FAILED).
    """
    update: dict = {
        "status": status,
        "updated_at": datetime.now(UTC).isoformat(),
    }
    if error_message is not None:
        update["error_message"] = error_message
    supabase.table(DOCUMENTS_TABLE).update(update).eq(
        "id",
        document_id,
    ).execute()
    logger.info(
        "Document status updated: id=%s → %s",
        document_id,
        status,
    )


async def update_document_summary(
    supabase: Client,
    document_id: str,
    summary: str,
) -> None:
    """Set the AI-generated summary for a document."""
    supabase.table(DOCUMENTS_TABLE).update(
        {"summary": summary},
    ).eq("id", document_id).execute()


async def toggle_star(
    supabase: Client,
    document_id: str,
    user_id: str,
    is_starred: bool,
) -> None:
    """Toggle the starred status of a document."""
    supabase.table(DOCUMENTS_TABLE).update(
        {"is_starred": is_starred},
    ).eq("id", document_id).eq("user_id", user_id).execute()


# ── Delete ───────────────────────────────────────────────────────────────────


async def delete_document(
    supabase: Client,
    document_id: str,
    user_id: str,
) -> bool:
    """Delete a document and all associated chunks.

    Chunks are cascade-deleted by the FK constraint.

    Returns:
        True if a row was deleted, False if not found.
    """
    result = (
        supabase.table(DOCUMENTS_TABLE)
        .delete()
        .eq("id", document_id)
        .eq("user_id", user_id)
        .execute()
    )
    deleted = len(result.data) > 0
    if deleted:
        logger.info("Document deleted: id=%s", document_id)
    return deleted


# ── Chunks ───────────────────────────────────────────────────────────────────


async def insert_chunks(
    supabase: Client,
    chunks: list[dict],
) -> None:
    """Batch-insert document chunks with embeddings.

    Args:
        chunks: List of dicts with keys: document_id, user_id,
                chunk_index, content, token_count, embedding.
    """
    supabase.table(CHUNKS_TABLE).insert(chunks).execute()
    logger.info(
        "Inserted %d chunks for document %s",
        len(chunks),
        chunks[0]["document_id"] if chunks else "?",
    )
