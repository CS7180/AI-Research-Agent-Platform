"""Document management API routes.

Handles file upload, listing, and deletion.
Processing is delegated to Celery tasks.
"""

from __future__ import annotations

import logging
import uuid
from typing import Annotated

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)

from app.api.dependencies import CurrentUser, SupabaseClient
from app.core.config import settings
from app.core.constants import ALLOWED_MIME_TYPES
from app.schemas.document import (
    DeleteDocumentResponse,
    DocumentListResponse,
    DocumentResponse,
    DocumentStatus,
)
from app.services import document as doc_service
from app.services import storage as storage_service
from app.workers.tasks import process_document

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
        UploadFile,
        File(description="PDF, Markdown, or TXT file (max 50MB)"),
    ],
    current_user: CurrentUser,
    supabase: SupabaseClient,
    folder_path: Annotated[
        str,
        Form(description="Virtual folder path"),
    ] = "/",
) -> DocumentResponse:
    """Accept a file upload, store it, and queue processing."""
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file type: {file.content_type}. "
                "Allowed: PDF, Markdown, TXT."
            ),
        )

    # Read and validate file size
    contents = await file.read()
    size_bytes = len(contents)
    size_mb = size_bytes / (1024 * 1024)
    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit.",
        )

    user_id = current_user["id"]
    document_id = str(uuid.uuid4())
    file_hash = storage_service.compute_file_hash(contents)

    # Check for duplicate
    existing = await doc_service.check_duplicate(
        supabase,
        user_id,
        file_hash,
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Duplicate file detected: '{existing['filename']}' "
                f"(id: {existing['id']}) has the same content."
            ),
        )

    # Upload to Supabase Storage
    storage_path = await storage_service.upload_file(
        supabase,
        user_id=user_id,
        document_id=document_id,
        filename=file.filename or "unnamed",
        contents=contents,
        content_type=file.content_type or "application/octet-stream",
    )

    # Create DB record
    row = await doc_service.create_document(
        supabase,
        document_id=document_id,
        user_id=user_id,
        filename=file.filename or "unnamed",
        file_size_bytes=size_bytes,
        mime_type=file.content_type or "application/octet-stream",
        folder_path=folder_path,
        file_hash=file_hash,
        storage_path=storage_path,
    )

    # Dispatch async Celery task
    process_document.delay(document_id, user_id, storage_path)
    logger.info(
        "Document queued: id=%s user=%s file=%s",
        document_id,
        user_id,
        file.filename,
    )

    return DocumentResponse(
        id=row["id"],
        user_id=row["user_id"],
        filename=row["filename"],
        file_size_bytes=row["file_size_bytes"],
        mime_type=row["mime_type"],
        folder_path=row["folder_path"],
        file_hash=row.get("file_hash"),
        is_starred=row.get("is_starred", False),
        summary=row.get("summary"),
        status=DocumentStatus(row["status"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        error_message=row.get("error_message"),
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
    """Return all documents owned by the authenticated user."""
    user_id = current_user["id"]
    rows = await doc_service.list_documents(supabase, user_id)
    documents = [
        DocumentResponse(
            id=r["id"],
            user_id=r["user_id"],
            filename=r["filename"],
            file_size_bytes=r["file_size_bytes"],
            mime_type=r["mime_type"],
            folder_path=r["folder_path"],
            file_hash=r.get("file_hash"),
            is_starred=r.get("is_starred", False),
            summary=r.get("summary"),
            status=DocumentStatus(r["status"]),
            created_at=r["created_at"],
            updated_at=r["updated_at"],
            error_message=r.get("error_message"),
        )
        for r in rows
    ]
    return DocumentListResponse(
        documents=documents,
        total=len(documents),
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
    """Delete a document from Storage, DB, and vector store."""
    user_id = current_user["id"]

    # Fetch document to get storage path
    doc = await doc_service.get_document(
        supabase,
        document_id,
        user_id,
    )
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    # Delete file from storage
    await storage_service.delete_file(supabase, doc["storage_path"])

    # Delete DB record (chunks cascade-deleted by FK)
    await doc_service.delete_document(
        supabase,
        document_id,
        user_id,
    )

    return DeleteDocumentResponse(id=document_id)
