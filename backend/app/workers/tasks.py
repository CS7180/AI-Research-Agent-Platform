"""Celery worker application and document processing tasks."""

from __future__ import annotations

import asyncio
import logging

from celery import Celery

from app.core.config import settings
from app.services.chunking import chunk_text
from app.services.document import insert_chunks, update_document_status
from app.services.embedding import generate_embeddings
from app.services.extraction import extract_text
from app.services.storage import download_file
from supabase import create_client

logger = logging.getLogger(__name__)

broker_url = settings.CELERY_BROKER_URL or settings.REDIS_URL

celery_app = Celery(
    "docmind",
    broker=broker_url,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
)


def _get_supabase():
    """Create a Supabase client for the worker process."""
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_KEY,
    )


async def _run_pipeline(
    document_id: str,
    user_id: str,
    storage_path: str,
) -> None:
    """Execute the full document processing pipeline.

    Steps:
        1. Update status → PROCESSING
        2. Download file from Supabase Storage
        3. Extract text (PDF / MD / TXT)
        4. Chunk text (512 tokens, 64 overlap)
        5. Generate embeddings
        6. Store chunks + embeddings in pgvector
        7. Update status → READY
    """
    supabase = _get_supabase()

    # 1. Mark as PROCESSING
    await update_document_status(
        supabase,
        document_id,
        "PROCESSING",
    )

    # 2. Download file
    contents = await download_file(supabase, storage_path)

    # 3. Detect MIME type from storage path extension
    mime_type = _guess_mime(storage_path)

    # 4. Extract text
    text = extract_text(contents, mime_type, storage_path)
    if not text.strip():
        await update_document_status(
            supabase,
            document_id,
            "FAILED",
            error_message="No text could be extracted.",
        )
        return

    # 5. Chunk
    chunks = chunk_text(text)
    logger.info(
        "Document %s: %d chunks created",
        document_id,
        len(chunks),
    )

    # 6. Generate embeddings
    texts = [c.content for c in chunks]
    embeddings = await generate_embeddings(texts)

    # 7. Store chunks in pgvector
    chunk_rows = [
        {
            "document_id": document_id,
            "user_id": user_id,
            "chunk_index": c.index,
            "content": c.content,
            "token_count": c.token_count,
            "embedding": emb,
        }
        for c, emb in zip(chunks, embeddings)
    ]
    await insert_chunks(supabase, chunk_rows)

    # 8. Mark as READY
    await update_document_status(
        supabase,
        document_id,
        "READY",
    )
    logger.info("Document %s processed successfully", document_id)


def _guess_mime(path: str) -> str:
    """Guess MIME type from file extension."""
    lower = path.lower()
    if lower.endswith(".pdf"):
        return "application/pdf"
    if lower.endswith(".md"):
        return "text/markdown"
    return "text/plain"


@celery_app.task(
    bind=True,
    max_retries=settings.CELERY_TASK_MAX_RETRIES,
    default_retry_delay=settings.CELERY_TASK_RETRY_DELAY_SECONDS,
    name="tasks.process_document",
)
def process_document(
    self,
    document_id: str,
    user_id: str,
    storage_path: str,
) -> None:
    """Celery task entry point for document processing.

    Runs the async pipeline in a new event loop (Celery workers
    are synchronous by default).
    """
    logger.info(
        "Processing document: doc_id=%s user=%s",
        document_id,
        user_id,
    )
    try:
        asyncio.run(
            _run_pipeline(document_id, user_id, storage_path),
        )
    except Exception as exc:
        logger.error(
            "Document processing failed: doc_id=%s | %s",
            document_id,
            exc,
        )
        try:
            self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error(
                "Max retries exceeded for doc_id=%s — FAILED",
                document_id,
            )
            supabase = _get_supabase()
            asyncio.run(
                _update_failed(supabase, document_id, str(exc)),
            )


async def _update_failed(
    supabase,
    document_id: str,
    error: str,
) -> None:
    """Mark a document as FAILED after max retries."""
    await update_document_status(
        supabase,
        document_id,
        "FAILED",
        error_message=error,
    )
