"""Unit tests for app.services.extraction — text extraction."""

from __future__ import annotations

import pytest

from app.services.extraction import extract_text


# ── PDF extraction ───────────────────────────────────────────────────────────


class TestPdfExtraction:
    def test_extracts_text_from_simple_pdf(self) -> None:
        """Create a minimal PDF in memory and extract its text."""
        import fitz  # PyMuPDF

        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((50, 50), "Hello, DocMind!")
        pdf_bytes = doc.tobytes()
        doc.close()

        result = extract_text(pdf_bytes, "application/pdf", "test.pdf")
        assert "Hello, DocMind!" in result

    def test_empty_pdf_returns_empty_string(self) -> None:
        import fitz

        doc = fitz.open()
        doc.new_page()  # blank page, no text
        pdf_bytes = doc.tobytes()
        doc.close()

        result = extract_text(pdf_bytes, "application/pdf", "blank.pdf")
        assert result.strip() == ""

    def test_multipage_pdf_joins_pages(self) -> None:
        import fitz

        doc = fitz.open()
        for i in range(3):
            page = doc.new_page()
            page.insert_text((50, 50), f"Page {i + 1}")
        pdf_bytes = doc.tobytes()
        doc.close()

        result = extract_text(pdf_bytes, "application/pdf", "multi.pdf")
        assert "Page 1" in result
        assert "Page 2" in result
        assert "Page 3" in result


# ── Text / Markdown extraction ───────────────────────────────────────────────


class TestTextExtraction:
    def test_plain_text_decoded(self) -> None:
        content = b"This is plain text content."
        result = extract_text(content, "text/plain", "readme.txt")
        assert result == "This is plain text content."

    def test_markdown_decoded(self) -> None:
        content = b"# Heading\n\nSome **bold** text."
        result = extract_text(content, "text/markdown", "notes.md")
        assert "# Heading" in result
        assert "**bold**" in result

    def test_x_markdown_mime_type_accepted(self) -> None:
        content = b"## Section"
        result = extract_text(content, "text/x-markdown", "doc.md")
        assert "Section" in result

    def test_utf8_with_special_chars(self) -> None:
        content = "日本語テスト 🎉".encode("utf-8")
        result = extract_text(content, "text/plain", "unicode.txt")
        assert "日本語" in result
        assert "🎉" in result

    def test_empty_text_file(self) -> None:
        result = extract_text(b"", "text/plain", "empty.txt")
        assert result == ""


# ── Unsupported types ────────────────────────────────────────────────────────


class TestUnsupportedTypes:
    def test_unsupported_mime_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="Unsupported MIME type"):
            extract_text(b"data", "image/png", "photo.png")

    def test_docx_not_supported(self) -> None:
        with pytest.raises(ValueError):
            extract_text(b"data", "application/vnd.openxmlformats", "doc.docx")
