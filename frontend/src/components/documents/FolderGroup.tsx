'use client';

import { useState } from 'react';
import DocumentRow from '@/components/documents/DocumentRow';
import type { Document } from '@/backend/types';

const COL_COUNT = 6;

interface FolderGroupProps {
  name: string;
  docs: Document[];
  onDelete: (id: string) => void;
}

export default function FolderGroup({ name, docs, onDelete }: FolderGroupProps) {
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
      {isOpen && docs.map((doc) => <DocumentRow key={doc.id} doc={doc} onDelete={onDelete} />)}
    </>
  );
}
