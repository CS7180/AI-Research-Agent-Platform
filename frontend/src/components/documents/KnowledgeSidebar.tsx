'use client';

import { useState, useMemo } from 'react';
import FolderSection from '@/components/documents/FolderSection';
import UploadDropzone from '@/components/documents/UploadDropzone';
import type { Document } from '@/backend/types';

/** Map mime_type to the file type tag used in UI components. */
function getFileType(mimeType: string): 'pdf' | 'md' | 'txt' {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'text/markdown') return 'md';
  return 'txt';
}

/** Format bytes to a human-readable string (e.g. "2.4 MB"). */
function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

/** Group flat document list into folder sections, hiding empty folders. */
function groupByFolder(documents: Document[]) {
  const groups = new Map<string, Document[]>();
  for (const doc of documents) {
    const folder = doc.folder_path.replace(/^\//, '') || 'Uncategorized';
    const list = groups.get(folder) ?? [];
    list.push(doc);
    groups.set(folder, list);
  }
  return Array.from(groups.entries()).map(([name, docs]) => ({
    name,
    fileCount: docs.length,
    files: docs.map((d) => ({
      name: d.filename,
      type: getFileType(d.mime_type),
      size: formatFileSize(d.file_size_bytes),
      status: d.status.toLowerCase() as 'ready' | 'processing' | 'pending' | 'failed',
    })),
  }));
}

interface KnowledgeSidebarProps {
  documents: Document[];
}

export default function KnowledgeSidebar({ documents }: KnowledgeSidebarProps) {
  const [query, setQuery] = useState('');
  const allFolders = useMemo(() => groupByFolder(documents), [documents]);

  const filteredFolders = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return allFolders;

    return allFolders
      .map((folder) => ({
        ...folder,
        files: folder.files.filter((f) => f.name.toLowerCase().includes(trimmed)),
      }))
      .filter((folder) => folder.files.length > 0)
      .map((folder) => ({ ...folder, fileCount: folder.files.length }));
  }, [allFolders, query]);

  return (
    <aside
      className="flex h-full w-full flex-col rounded-xl border border-border bg-surface"
      aria-label="Knowledge base"
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <h2 className="text-base font-semibold text-foreground">Knowledge Base</h2>
        <p className="text-xs text-muted-light">
          {documents.length} files in {allFolders.length} folders
        </p>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <input
          type="search"
          placeholder="Search files and folders"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-light outline-none focus:border-primary"
          aria-label="Search knowledge base"
        />
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2">
        {filteredFolders.length > 0 ? (
          filteredFolders.map((folder) => (
            <FolderSection key={folder.name} {...folder} />
          ))
        ) : query.trim().length > 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-light">
            No files matching &ldquo;{query}&rdquo;
          </p>
        ) : null}
      </div>

      {/* Upload */}
      <UploadDropzone />
    </aside>
  );
}
