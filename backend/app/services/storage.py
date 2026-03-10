"""Supabase Storage service — file upload, download, and deletion.

All file operations go through the Supabase Storage bucket defined by
SUPABASE_DOCUMENTS_BUCKET.  Storage paths follow the convention:
    {user_id}/{document_id}/{filename}
"""

from __future__ import annotations

import hashlib
import logging

from app.core.constants import SUPABASE_DOCUMENTS_BUCKET
from supabase import Client

logger = logging.getLogger(__name__)


def _build_storage_path(
    user_id: str,
    document_id: str,
    filename: str,
) -> str:
    """Build the canonical storage path for a document file."""
    return f"{user_id}/{document_id}/{filename}"


def compute_file_hash(contents: bytes) -> str:
    """Return the SHA-256 hex digest of *contents*."""
    return hashlib.sha256(contents).hexdigest()


async def upload_file(
    supabase: Client,
    *,
    user_id: str,
    document_id: str,
    filename: str,
    contents: bytes,
    content_type: str,
) -> str:
    """Upload a file to Supabase Storage.

    Args:
        supabase: Authenticated Supabase client.
        user_id: Owner's Supabase Auth UID.
        document_id: UUID of the document record.
        filename: Original filename.
        contents: Raw file bytes.
        content_type: MIME type of the file.

    Returns:
        The storage path of the uploaded file.
    """
    path = _build_storage_path(user_id, document_id, filename)
    logger.info(
        "Uploading file to storage: path=%s size=%d",
        path,
        len(contents),
    )
    supabase.storage.from_(SUPABASE_DOCUMENTS_BUCKET).upload(
        path=path,
        file=contents,
        file_options={"content-type": content_type},
    )
    return path


async def download_file(
    supabase: Client,
    storage_path: str,
) -> bytes:
    """Download a file from Supabase Storage.

    Args:
        supabase: Supabase client.
        storage_path: Full storage path.

    Returns:
        Raw file bytes.
    """
    logger.info("Downloading file from storage: path=%s", storage_path)
    response = supabase.storage.from_(
        SUPABASE_DOCUMENTS_BUCKET,
    ).download(storage_path)
    return response


async def delete_file(
    supabase: Client,
    storage_path: str,
) -> None:
    """Delete a file from Supabase Storage.

    Args:
        supabase: Supabase client.
        storage_path: Full storage path.
    """
    logger.info("Deleting file from storage: path=%s", storage_path)
    supabase.storage.from_(SUPABASE_DOCUMENTS_BUCKET).remove(
        [storage_path],
    )
