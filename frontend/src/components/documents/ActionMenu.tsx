'use client';

import { useRef, useEffect, useState } from 'react';
import RenameModal from '@/components/documents/RenameModal';
import { renameDocumentClient } from '@/backend/client';

interface ActionMenuProps {
  isOpen: boolean;
  docId: string;
  filename: string;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRename?: (newFilename: string) => void;
}

const ACTIONS = [
  { label: 'Download', icon: '↓' },
  { label: 'Rename', icon: '✎' },
  { label: 'Delete', icon: '✕', danger: true },
];

const getExt = (name: string) => (name.includes('.') ? name.substring(name.lastIndexOf('.')) : '');
const getNameOnly = (name: string) => {
  const ext = getExt(name);
  return ext ? name.substring(0, name.lastIndexOf('.')) : name;
};

export default function ActionMenu({ isOpen, docId, filename, onClose, onDelete, onRename }: ActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isOpen, onClose]);

  const handleRename = async () => {
    if (!newName.trim()) {
      setRenameOpen(false);
      return;
    }
    const ext = getExt(filename);
    const nameWithExt = newName.endsWith(ext) ? newName : newName + ext;
    setIsRenaming(true);
    try {
      await renameDocumentClient(docId, nameWithExt);
      onRename?.(nameWithExt);
      setRenameOpen(false);
      onClose();
    } catch (error) {
      console.error('Rename failed:', error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleAction = async (label: string) => {
    onClose();
    if (label === 'Download') {
      try {
        const { downloadDocumentClient } = await import('@/backend/client');
        await downloadDocumentClient(docId, filename);
      } catch (error) {
        console.error('Download failed:', error);
      }
    } else if (label === 'Rename') {
      setNewName(getNameOnly(filename));
      setRenameOpen(true);
    } else if (label === 'Delete') {
      onDelete(docId);
    }
  };

  if (!isOpen && !renameOpen) return null;

  return (
    <>
      {isOpen && (
        <div ref={menuRef} className="absolute right-4 top-10 z-10 w-32 rounded-lg border border-border bg-surface py-1 shadow-lg">
          {ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => handleAction(a.label)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                a.danger ? 'text-accent-red hover:bg-accent-red-bg' : 'text-foreground hover:bg-border-light'
              }`}
            >
              <span>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>
      )}
      <RenameModal
        isOpen={renameOpen}
        filename={filename}
        newName={newName}
        isRenaming={isRenaming}
        onNameChange={setNewName}
        onConfirm={handleRename}
        onCancel={() => setRenameOpen(false)}
      />
    </>
  );
}
