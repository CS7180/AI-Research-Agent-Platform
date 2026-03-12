-- ============================================================================
-- DocMind — Migration 002: Create Supabase Storage Bucket
-- ============================================================================
-- Purpose:
--   Create the private Storage bucket used by backend/services/storage.py.
--   Bucket name must match SUPABASE_DOCUMENTS_BUCKET in app/core/constants.py.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', FALSE)
ON CONFLICT (id) DO NOTHING;
