'use client';

import { useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu from '@/components/documents/ActionMenu';
import type { Document } from '@/backend/types';

const MIME_TAGS: Record<string, { label: string; color: string }> = {
  'application/pdf': { label: 'PDF', color: 'bg-accent-red text-white' },
  'text/markdown': { label: 'MD', color: 'bg-accent-blue text-white' },
  'text/plain': { label: 'TXT', color: 'bg-muted-light text-white' },
};

const formatBytes = (bytes: number) => bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${(bytes / 1_000).toFixed(0)} KB`;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function DocumentRow({ doc, onDelete }: { doc: Document; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [starred, setStarred] = useState(doc.is_starred);
  const tag = MIME_TAGS[doc.mime_type] ?? { label: '?', color: 'bg-muted text-white' };

  return (
    <tr className="border-b border-border-light transition-colors hover:bg-background">
      <td className="px-2 py-3 text-center">
        <button
          type="button"
          onClick={() => setStarred((s) => !s)}
          className="text-lg transition-colors hover:scale-110"
          aria-label={starred ? 'Unstar document' : 'Star document'}
          aria-pressed={starred}
        >
          {starred ? <span className="text-accent-yellow">★</span> : <span className="text-border">☆</span>}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`flex h-5 w-6 shrink-0 items-center justify-center rounded text-[8px] font-bold ${tag.color}`}>
            {tag.label}
          </span>
          <p className="min-w-0 truncate text-xs font-medium text-foreground">{doc.filename}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted">{formatBytes(doc.file_size_bytes)}</td>
      <td className="px-4 py-3 text-xs text-muted">{formatDate(doc.created_at)}</td>
      <td className="px-4 py-3">
        <StatusBadge status={doc.status.toLowerCase() as 'pending' | 'processing' | 'ready' | 'failed'} />
      </td>
      <td className="relative px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => setMenuOpen((p) => !p)}
          className="rounded-md px-2 py-1 text-muted transition-colors hover:bg-border-light hover:text-foreground"
          aria-label={`Actions for ${doc.filename}`}
          aria-expanded={menuOpen}
        >
          ⋯
        </button>
        <ActionMenu isOpen={menuOpen} docId={doc.id} filename={doc.filename} onClose={() => setMenuOpen(false)} onDelete={onDelete} />
      </td>
    </tr>
  );
}
