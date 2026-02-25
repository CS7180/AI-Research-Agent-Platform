"""App-wide constants.

Named constants only — no business logic here.
"""


# ── Document Status ───────────────────────────────────────────────────────────
class DocumentStatus:
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    READY = "READY"
    FAILED = "FAILED"


# ── Allowed MIME Types for Upload ─────────────────────────────────────────────
ALLOWED_MIME_TYPES: frozenset[str] = frozenset(
    {
        "application/pdf",
        "text/markdown",
        "text/plain",
        "text/x-markdown",
    }
)

# ── Supabase Storage ──────────────────────────────────────────────────────────
SUPABASE_DOCUMENTS_BUCKET = "documents"

# ── Vector Search ─────────────────────────────────────────────────────────────
EMBEDDING_DIMENSION = 768  # gemini-embedding-001 output dimension
VECTOR_SIMILARITY_THRESHOLD = 0.7
