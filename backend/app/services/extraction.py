"""Text extraction service — PDF, Markdown, and plain text.

Uses PyMuPDF (fitz) for PDF extraction and plain read for MD/TXT.
"""

from __future__ import annotations

import logging

import fitz  # PyMuPDF

logger = logging.getLogger(__name__)


def extract_text(
    contents: bytes,
    mime_type: str,
    filename: str = "",
) -> str:
    """Extract plain text from a document.

    Args:
        contents: Raw file bytes.
        mime_type: MIME type of the file.
        filename: Original filename (for logging).

    Returns:
        Extracted text as a single string.

    Raises:
        ValueError: If the MIME type is unsupported.
    """
    if mime_type == "application/pdf":
        return _extract_pdf(contents, filename)
    if mime_type in ("text/markdown", "text/x-markdown", "text/plain"):
        return _extract_text_file(contents, filename)
    msg = f"Unsupported MIME type for extraction: {mime_type}"
    raise ValueError(msg)


def _extract_pdf(contents: bytes, filename: str) -> str:
    """Extract text from a PDF using PyMuPDF."""
    logger.info("Extracting text from PDF: %s", filename)
    doc = fitz.open(stream=contents, filetype="pdf")
    pages: list[str] = []
    for page_num, page in enumerate(doc):
        text = page.get_text("text")
        if text.strip():
            pages.append(text)
        else:
            logger.debug(
                "Page %d of %s yielded no text (may be image-only)",
                page_num + 1,
                filename,
            )
    doc.close()
    full_text = "\n\n".join(pages)
    logger.info(
        "PDF extraction complete: %s — %d pages, %d chars",
        filename,
        len(pages),
        len(full_text),
    )
    return full_text


def _extract_text_file(
    contents: bytes,
    filename: str,
) -> str:
    """Decode a plain text or Markdown file."""
    logger.info("Reading text file: %s", filename)
    text = contents.decode("utf-8", errors="replace")
    logger.info(
        "Text file read: %s — %d chars",
        filename,
        len(text),
    )
    return text
