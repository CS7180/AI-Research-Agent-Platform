-- ============================================================================
-- DocMind — Migration 001: Documents + pgvector Chunks
-- ============================================================================
-- Prerequisites:
--   1. Enable pgvector: Supabase Dashboard → Database → Extensions → vector
--   2. Run this SQL in the SQL Editor (Supabase Dashboard → SQL Editor)
-- ============================================================================

-- Enable pgvector extension (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Documents table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- File metadata
    filename         TEXT    NOT NULL,
    file_size_bytes  BIGINT  NOT NULL DEFAULT 0,
    mime_type        TEXT    NOT NULL DEFAULT 'application/octet-stream',
    folder_path      TEXT    NOT NULL DEFAULT '/',
    file_hash        TEXT,                       -- SHA-256 for duplicate detection
    storage_path     TEXT    NOT NULL,            -- Path in Supabase Storage bucket

    -- AI-generated metadata (populated after processing)
    summary          TEXT,

    -- User preferences
    is_starred       BOOLEAN NOT NULL DEFAULT FALSE,

    -- Processing lifecycle
    status           TEXT    NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING', 'PROCESSING', 'READY', 'FAILED')),
    error_message    TEXT,

    -- Timestamps
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user-scoped queries (RLS + listing)
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
-- Index for duplicate detection
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);
-- Index for folder browsing
CREATE INDEX IF NOT EXISTS idx_documents_folder_path ON documents(folder_path);

-- Auto-update `updated_at` on row modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


-- ── Document Chunks table (pgvector) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_chunks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id   UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Content
    chunk_index   INT     NOT NULL,              -- 0-based position within the document
    content       TEXT    NOT NULL,              -- Raw text of the chunk
    token_count   INT     NOT NULL DEFAULT 0,

    -- Embedding (768-dim for gemini-embedding-001)
    embedding     vector(768),

    -- Timestamps
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast document-scoped chunk retrieval
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);
-- Index for user-scoped retrieval (needed by RLS)
CREATE INDEX IF NOT EXISTS idx_chunks_user_id ON document_chunks(user_id);
-- HNSW index for fast approximate nearest-neighbor search
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);


-- ── Row Level Security (RLS) ────────────────────────────────────────────────

-- Documents: users can only see/modify their own documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
    ON documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
    ON documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
    ON documents FOR DELETE
    USING (auth.uid() = user_id);

-- Document Chunks: users can only see their own chunks
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chunks"
    ON document_chunks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chunks"
    ON document_chunks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chunks"
    ON document_chunks FOR DELETE
    USING (auth.uid() = user_id);


-- ── Helper: Similarity search function ──────────────────────────────────────
-- Called by the retrieval service for semantic search.
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(768),
    match_count     INT DEFAULT 10,
    match_threshold FLOAT DEFAULT 0.7,
    p_user_id       UUID DEFAULT auth.uid()
)
RETURNS TABLE(
    id            UUID,
    document_id   UUID,
    chunk_index   INT,
    content       TEXT,
    similarity    FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.chunk_index,
        dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    WHERE dc.user_id = p_user_id
      AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
