'use client';

import { useState, useEffect } from 'react';
import DocumentRow from '@/components/documents/DocumentRow';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { deleteDocumentClient, listDocumentsClient } from '@/backend/client';
import type { Document } from '@/backend/types';

const HEADERS = ['', 'Name', 'Size', 'Uploaded', 'Status', ''];

export default function DocumentTable({ initialDocuments }: { initialDocuments: Document[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const fresh = await listDocumentsClient();
        setDocuments(fresh);
      } catch (err) {
        console.error('Failed to refresh documents:', err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteDocumentClient(deleteTarget);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete document. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const targetDoc = documents.find((d) => d.id === deleteTarget);

  return (
    <>
      {error && (
        <div className="rounded-lg border border-accent-red/30 bg-accent-red-bg px-3 py-2 text-xs text-accent-red">
          {error}
        </div>
      )}
      <section className="overflow-visible rounded-xl border border-border bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-background">
              {HEADERS.map((h, i) => (
                <th key={`${h}-${i}`} className="px-4 py-2.5 text-[11px] font-semibold tracking-wider text-muted uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {documents.length > 0 ? (
              documents.map((doc) => <DocumentRow key={doc.id} doc={doc} onDelete={setDeleteTarget} />)
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-xs text-muted">
                  No documents yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete document"
        message={targetDoc ? `Are you sure you want to permanently delete "${targetDoc.filename}"?` : ''}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
