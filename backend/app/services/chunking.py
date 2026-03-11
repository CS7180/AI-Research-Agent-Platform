"""Text chunking service — split documents into overlapping token chunks.

Uses a simple whitespace-based tokeniser (split on spaces) as a fast
approximation.  For production accuracy, swap in ``tiktoken`` or the
model's own tokeniser.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class TextChunk:
    """A single text chunk with its positional metadata."""

    index: int
    content: str
    token_count: int


def chunk_text(
    text: str,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> list[TextChunk]:
    """Split *text* into overlapping chunks by token count.

    Args:
        text: Full document text.
        chunk_size: Max tokens per chunk (default from settings).
        chunk_overlap: Overlap tokens between chunks.

    Returns:
        List of ``TextChunk`` objects.
    """
    if not text.strip():
        return []

    size = chunk_size if chunk_size is not None else settings.CHUNK_SIZE_TOKENS
    overlap = (
        chunk_overlap
        if chunk_overlap is not None
        else settings.CHUNK_OVERLAP_TOKENS
    )

    # Guard: overlap must be less than size to avoid infinite loop
    if overlap >= size:
        overlap = 0

    tokens = text.split()
    chunks: list[TextChunk] = []
    start = 0
    idx = 0

    step = max(size - overlap, 1)  # Never step by 0 or negative
    while start < len(tokens):
        end = min(start + size, len(tokens))
        chunk_tokens = tokens[start:end]
        content = " ".join(chunk_tokens)
        chunks.append(
            TextChunk(
                index=idx,
                content=content,
                token_count=len(chunk_tokens),
            ),
        )
        idx += 1
        start += step

    logger.info(
        "Chunked text into %d chunks (size=%d, overlap=%d)",
        len(chunks),
        size,
        overlap,
    )
    return chunks
