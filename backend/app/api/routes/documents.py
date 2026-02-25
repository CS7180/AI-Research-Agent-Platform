"""Document management API routes.

Handles file upload, listing, and deletion.
Processing is delegated to Celery tasks.
"""

from __future__ import annotations

import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.api.dependencies import CurrentUser, SupabaseClient
from app.core.config import settings
from app.core.constants import (
    ALLOWED_MIME_TYPES,
)
from app.schemas.document import (
    DeleteDocumentResponse,
    DocumentListResponse,
    DocumentResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload a document for processing",
)
async def upload_document(
    file: Annotated[
        UploadFile, File(description="PDF, Markdown, or TXT file (max 50MB)")
    ],
    current_user: CurrentUser,
    supabase: SupabaseClient,
) -> DocumentResponse:
    """Accept a file upload, store it in Supabase Storage, and queue processing.

    Args:
        file: The uploaded file.
        current_user: Authenticated user from JWT.
        supabase: Supabase client.

    Returns:
        DocumentResponse with status=PENDING.

    Raises:
        HTTPException: 415 for unsupported type; 413 for oversized file.
    """
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Allowed: PDF, Markdown, TXT.",
        )

    # Validate file size
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit.",
        )

    document_id = str(uuid.uuid4())

    # TODO(#3): Store file in Supabase Storage and dispatch Celery task
    # For now, return a stub PENDING response so the API layer is wired.
    # We would use a storage path like {current_user['id']}/{document_id}/{file.filename}
    logger.info(
        "Document upload received: user=%s doc_id=%s file=%s",
        current_user["id"],
        document_id,
        file.filename,
    )

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Document processing pipeline not yet implemented (Issue #3).",
    )


@router.get(
    "",
    response_model=DocumentListResponse,
    summary="List all documents for the current user",
)
async def list_documents(
    current_user: CurrentUser,
    supabase: SupabaseClient,
) -> DocumentListResponse:
    """Return all documents owned by the authenticated user.

    # TODO(#6): Query Supabase documents table with user RLS applied.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Document listing not yet implemented (Issue #6).",
    )


@router.delete(
    "/{document_id}",
    response_model=DeleteDocumentResponse,
    summary="Delete a document and its associated vectors",
)
async def delete_document(
    document_id: str,
    current_user: CurrentUser,
    supabase: SupabaseClient,
) -> DeleteDocumentResponse:
    """Delete a document from Storage, DB, and vector store.

    # TODO(#6): Implement deletion across Supabase Storage, documents table, and vectors.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Document deletion not yet implemented (Issue #6).",
    )
