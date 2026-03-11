"""Unit tests for app.services.chunking — text chunking."""

from __future__ import annotations

from app.services.chunking import TextChunk, chunk_text


class TestChunkText:
    def test_basic_chunking(self) -> None:
        text = " ".join(f"word{i}" for i in range(100))
        chunks = chunk_text(text, chunk_size=20, chunk_overlap=5)

        assert len(chunks) > 1
        assert all(isinstance(c, TextChunk) for c in chunks)
        assert chunks[0].index == 0
        assert chunks[0].token_count <= 20

    def test_chunk_indices_are_sequential(self) -> None:
        text = " ".join(f"w{i}" for i in range(50))
        chunks = chunk_text(text, chunk_size=10, chunk_overlap=2)

        for i, chunk in enumerate(chunks):
            assert chunk.index == i

    def test_overlap_creates_shared_tokens(self) -> None:
        """With overlap=5, consecutive chunks should share tokens."""
        words = [f"token{i}" for i in range(30)]
        text = " ".join(words)
        chunks = chunk_text(text, chunk_size=10, chunk_overlap=5)

        # Chunk 0: tokens 0-9, Chunk 1: tokens 5-14
        c0_words = chunks[0].content.split()
        c1_words = chunks[1].content.split()
        overlap = set(c0_words) & set(c1_words)
        assert len(overlap) == 5

    def test_no_overlap(self) -> None:
        text = " ".join(f"w{i}" for i in range(20))
        chunks = chunk_text(text, chunk_size=10, chunk_overlap=0)

        assert len(chunks) == 2
        c0 = set(chunks[0].content.split())
        c1 = set(chunks[1].content.split())
        assert len(c0 & c1) == 0

    def test_text_shorter_than_chunk_size(self) -> None:
        text = "short text here"
        chunks = chunk_text(text, chunk_size=100, chunk_overlap=10)

        assert len(chunks) == 1
        assert chunks[0].content == text
        assert chunks[0].token_count == 3

    def test_empty_string_returns_no_chunks(self) -> None:
        assert chunk_text("", chunk_size=10, chunk_overlap=2) == []

    def test_whitespace_only_returns_no_chunks(self) -> None:
        assert chunk_text("   \n\t  ", chunk_size=10, chunk_overlap=2) == []

    def test_single_word(self) -> None:
        chunks = chunk_text("hello", chunk_size=5, chunk_overlap=1)
        assert len(chunks) == 1
        assert chunks[0].content == "hello"
        assert chunks[0].token_count == 1

    def test_exact_chunk_size(self) -> None:
        text = " ".join(f"w{i}" for i in range(10))
        chunks = chunk_text(text, chunk_size=10, chunk_overlap=0)
        assert len(chunks) == 1
        assert chunks[0].token_count == 10

    def test_token_count_is_accurate(self) -> None:
        text = "a b c d e f g h i j"
        chunks = chunk_text(text, chunk_size=4, chunk_overlap=1)
        for chunk in chunks:
            actual = len(chunk.content.split())
            assert chunk.token_count == actual

    def test_uses_default_settings(self) -> None:
        """Without explicit args, uses config defaults."""
        text = " ".join(f"w{i}" for i in range(600))
        chunks = chunk_text(text)
        # Default is 512 tokens, so 600 words → 2 chunks
        assert len(chunks) >= 2
        assert chunks[0].token_count <= 512
