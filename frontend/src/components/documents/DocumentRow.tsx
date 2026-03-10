'use client';

import { useState, useRef, useEffect } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Document } from '@/lib/mock-documents';

interface DocumentRowProps {
  doc: Document;
  onDelete: (id: string) => void;
}

const MIME_TAGS: Record<string, { label: string; color: string }> = {
  'application/pdf': { label: 'PDF', color: 'bg-accent-red text-white' },
  'text/markdown': { label: 'MD', color: 'bg-accent-blue text-white' },
  'text/plain': { label: 'TXT', color: 'bg-muted-light text-white' },
};

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DocumentRow({ doc, onDelete }: DocumentRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [starred, setStarred] = useState(doc.is_starred);
  const menuRef = useRef<HTMLDivElement>(null);
  const tag = MIME_TAGS[doc.mime_type] ?? { label: '?', color: 'bg-muted text-white' };

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  const actions = [
    { label: 'Download', icon: '↓' },
    { label: 'Rename', icon: '✎' },
    { label: 'Move', icon: '→' },
    { label: 'Delete', icon: '✕', danger: true },
  ];

  return (
    <tr className="border-b border-border-light transition-colors hover:bg-background">
      {/* Star */}
      <td className="px-2 py-3 text-center">
        <button
          type="button"
          onClick={() => setStarred((s) => !s)}
          className="text-lg transition-colors hover:scale-110"
          aria-label={starred ? 'Unstar document' : 'Star document'}
          aria-pressed={starred}
        >
          {starred ? (
            <span className="text-accent-yellow">★</span>
          ) : (
            <span className="text-border">☆</span>
          )}
        </button>
      </td>
      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-5 w-6 shrink-0 items-center justify-center rounded text-[8px] font-bold ${tag.color}`}
          >
            {tag.label}
          </span>
          <p className="min-w-0 truncate text-xs font-medium text-foreground">{doc.filename}</p>
        </div>
      </td>
      {/* Size */}
      <td className="px-4 py-3 text-xs text-muted">{formatBytes(doc.file_size_bytes)}</td>
      {/* Uploaded */}
      <td className="px-4 py-3 text-xs text-muted">{formatDate(doc.created_at)}</td>
      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={doc.status.toLowerCase() as 'ready' | 'processing' | 'pending' | 'failed'} />
      </td>
      {/* Actions */}
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
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-4 top-10 z-10 w-32 rounded-lg border border-border bg-surface py-1 shadow-lg"
          >
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (a.label === 'Delete') onDelete(doc.id);
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                  a.danger
                    ? 'text-accent-red hover:bg-accent-red-bg'
                    : 'text-foreground hover:bg-border-light'
                }`}
              >
                <span>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}
