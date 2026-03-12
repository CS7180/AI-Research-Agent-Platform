'use client';

import { useState } from 'react';
import DocumentRow from '@/components/documents/DocumentRow';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { deleteDocumentClient } from '@/backend/client';
import type { Document } from '@/backend/types';

const HEADERS = ['', 'Name', 'Size', 'Uploaded', 'Status', ''];
const COL_COUNT = HEADERS.length;

interface DocumentTableProps {
  initialDocuments: Document[];
}

/** Group documents by folder_path. */
function groupByFolder(documents: Document[]) {
  const groups = new Map<string, Document[]>();
  for (const doc of documents) {
    const folder = doc.folder_path.replace(/^\//, '') || 'Uncategorized';
    const list = groups.get(folder) ?? [];
    list.push(doc);
    groups.set(folder, list);
  }
  return Array.from(groups.entries());
}

function FolderGroup({
  name,
  docs,
  onDelete,
}: {
  name: string;
  docs: Document[];
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [starred, setStarred] = useState(false);

  return (
    <>
      <tr
        className="cursor-pointer bg-background transition-colors hover:bg-border-light"
        onClick={() => setIsOpen((p) => !p)}
      >
        <td className="px-2 py-2.5 text-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setStarred((s) => !s);
            }}
            className="text-lg transition-colors hover:scale-110"
            aria-label={starred ? 'Unstar folder' : 'Star folder'}
            aria-pressed={starred}
          >
            {starred ? (
              <span className="text-accent-yellow">★</span>
            ) : (
              <span className="text-border">☆</span>
            )}
          </button>
        </td>
        <td colSpan={COL_COUNT - 1} className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            <svg
              className={`h-3 w-3 text-muted transition-transform ${isOpen ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            <span className="text-xs font-semibold text-foreground">{name}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-border-light text-[10px] text-muted">
              {docs.length}
            </span>
          </div>
        </td>
      </tr>
      {isOpen &&
        docs.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} onDelete={onDelete} />
        ))}
    </>
  );
}

export default function DocumentTable({ initialDocuments }: DocumentTableProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetDoc = documents.find((d) => d.id === deleteTarget);
  const folders = groupByFolder(documents);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteDocumentClient(deleteTarget);
      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteTarget));
      setDeleteTarget(null);
    } catch {
      setErrorMessage('Failed to delete document. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {errorMessage && (
        <div className="rounded-lg border border-accent-red/30 bg-accent-red-bg px-3 py-2 text-xs text-accent-red">
          {errorMessage}
        </div>
      )}

      <section className="overflow-visible rounded-xl border border-border bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-background">
              {HEADERS.map((h, i) => (
                <th
                  key={`${h}-${i}`}
                  className="px-4 py-2.5 text-[11px] font-semibold tracking-wider text-muted uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {folders.length > 0 ? (
              folders.map(([name, docs]) => (
                <FolderGroup
                  key={name}
                  name={name}
                  docs={docs}
                  onDelete={(id) => setDeleteTarget(id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={COL_COUNT} className="px-4 py-6 text-center text-xs text-muted">
                  No documents yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete document"
        message={
          targetDoc
            ? `Are you sure you want to permanently delete "${targetDoc.filename}"? This action cannot be undone.`
            : ''
        }
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
