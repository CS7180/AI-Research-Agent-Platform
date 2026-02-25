"""Celery worker application and document processing tasks."""

from __future__ import annotations

import logging

from celery import Celery

from app.core.config import settings

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
    task_acks_late=True,  # Ensures messages are re-queued on worker crash
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
)


@celery_app.task(
    bind=True,
    max_retries=settings.CELERY_TASK_MAX_RETRIES,
    default_retry_delay=settings.CELERY_TASK_RETRY_DELAY_SECONDS,
    name="tasks.process_document",
)
def process_document(self, document_id: str, user_id: str, storage_path: str) -> None:
    """Async task: extract → chunk → embed → store vectors.

    Args:
        document_id: UUID of the document record.
        user_id: Owner's Supabase user ID.
        storage_path: Path in Supabase Storage bucket.

    Status transitions: PENDING → PROCESSING → READY | FAILED
    # TODO(#3): Implement full extraction/chunking/embedding pipeline.
    """
    logger.info("Processing document: doc_id=%s user=%s", document_id, user_id)
    try:
        # TODO(#3): 1. Download file from Supabase Storage
        # TODO(#3): 2. Extract text (PyMuPDF for PDF, plain read for MD/TXT)
        # TODO(#3): 3. Chunk text (512 tokens, 64 overlap)
        # TODO(#4): 4. Generate embeddings via embedding service
        # TODO(#4): 5. Store vectors in pgvector
        # TODO(#3): 6. Update document status → READY
        raise NotImplementedError(
            "Document processing pipeline not implemented (Issue #3)."
        )
    except Exception as exc:
        logger.error("Document processing failed: doc_id=%s | %s", document_id, exc)
        try:
            self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error(
                "Max retries exceeded for doc_id=%s — marking FAILED", document_id
            )
            # TODO(#3): Update document status → FAILED in Supabase DB
