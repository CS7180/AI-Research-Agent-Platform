'use client';

import { useRef, useEffect } from 'react';
import { downloadDocumentClient } from '@/backend/client';

interface ActionMenuProps {
  isOpen: boolean;
  docId: string;
  filename: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const ACTIONS = [
  { label: 'Download', icon: '↓' },
  { label: 'Rename', icon: '✎' },
  { label: 'Move', icon: '→' },
  { label: 'Delete', icon: '✕', danger: true },
];

export default function ActionMenu({ isOpen, docId, filename, onClose, onDelete }: ActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className="absolute right-4 top-10 z-10 w-32 rounded-lg border border-border bg-surface py-1 shadow-lg">
      {ACTIONS.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={async () => {
            onClose();
            if (a.label === 'Download') {
              try {
                await downloadDocumentClient(docId, filename);
              } catch (error) {
                console.error('Download failed:', error);
              }
            } else if (a.label === 'Delete') {
              onDelete(docId);
            }
          }}
          className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
            a.danger ? 'text-accent-red hover:bg-accent-red-bg' : 'text-foreground hover:bg-border-light'
          }`}
        >
          <span>{a.icon}</span> {a.label}
        </button>
      ))}
    </div>
  );
}
