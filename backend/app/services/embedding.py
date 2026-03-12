"""Provider-agnostic embedding service.

Generates vector embeddings for text chunks.  The provider (Gemini,
OpenAI, or Qwen) is selected via ``EMBEDDING_PROVIDER`` in settings.
"""

from __future__ import annotations

import logging

from langchain_core.embeddings import Embeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import OpenAIEmbeddings

from app.core.constants import EMBEDDING_DIMENSION
from app.core.config import settings

logger = logging.getLogger(__name__)


def _get_embeddings_model() -> Embeddings:
    """Return the configured embedding model instance."""
    provider = settings.EMBEDDING_PROVIDER.lower()
    if provider == "gemini":
        return GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            output_dimensionality=EMBEDDING_DIMENSION,
        )
    if provider == "openai":
        return OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
        )
    msg = f"Unsupported embedding provider: {provider}"
    raise ValueError(msg)


async def generate_embeddings(
    texts: list[str],
) -> list[list[float]]:
    """Generate embeddings for a batch of text chunks.

    Args:
        texts: List of text strings to embed.

    Returns:
        List of embedding vectors (each a list of floats).
    """
    model = _get_embeddings_model()
    logger.info(
        "Generating embeddings: provider=%s model=%s count=%d",
        settings.EMBEDDING_PROVIDER,
        settings.EMBEDDING_MODEL,
        len(texts),
    )
    embeddings = await model.aembed_documents(texts)
    if embeddings:
        dims = {len(vec) for vec in embeddings}
        if dims != {EMBEDDING_DIMENSION}:
            msg = (
                f"Embedding dimension mismatch: expected "
                f"{EMBEDDING_DIMENSION}, got {sorted(dims)}"
            )
            raise ValueError(msg)
    logger.info("Embeddings generated: %d vectors", len(embeddings))
    return embeddings


async def generate_query_embedding(
    query: str,
) -> list[float]:
    """Generate a single embedding for a search query.

    Args:
        query: The user's search query text.

    Returns:
        A single embedding vector.
    """
    model = _get_embeddings_model()
    embedding = await model.aembed_query(query)
    if len(embedding) != EMBEDDING_DIMENSION:
        msg = (
            f"Query embedding dimension mismatch: expected "
            f"{EMBEDDING_DIMENSION}, got {len(embedding)}"
        )
        raise ValueError(msg)
    return embedding
