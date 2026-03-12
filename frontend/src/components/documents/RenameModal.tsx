'use client';

import { renameDocumentClient } from '@/backend/client';

interface RenameModalProps {
  isOpen: boolean;
  filename: string;
  newName: string;
  isRenaming: boolean;
  onNameChange: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const getExt = (name: string) => (name.includes('.') ? name.substring(name.lastIndexOf('.')) : '');
const getNameOnly = (name: string) => {
  const ext = getExt(name);
  return ext ? name.substring(0, name.lastIndexOf('.')) : name;
};

export default function RenameModal({ isOpen, filename, newName, isRenaming, onNameChange, onConfirm, onCancel }: RenameModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="rounded-lg border border-border bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Rename Document</h3>
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm();
              if (e.key === 'Escape') onCancel();
            }}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
            autoFocus
          />
          <span className="flex items-center px-2 text-xs text-muted">{getExt(filename)}</span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-border-light"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRenaming}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isRenaming ? 'Renaming...' : 'Rename'}
          </button>
        </div>
      </div>
    </div>
  );
}
