"""Pydantic schemas for document request/response payloads."""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class DocumentStatus(StrEnum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    READY = "READY"
    FAILED = "FAILED"


class DocumentResponse(BaseModel):
    """Schema for a document returned by the API."""

    id: str
    user_id: str
    filename: str
    status: DocumentStatus
    created_at: datetime
    updated_at: datetime
    error_message: str | None = None


class DocumentListResponse(BaseModel):
    """Paginated list of documents."""

    documents: list[DocumentResponse]
    total: int


class DeleteDocumentResponse(BaseModel):
    """Confirmation of document deletion."""

    id: str
    message: str = "Document deleted successfully."
