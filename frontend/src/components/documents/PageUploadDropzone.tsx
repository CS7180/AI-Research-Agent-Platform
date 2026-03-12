'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadDocumentClient } from '@/backend/client';

export default function PageUploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      await uploadDocumentClient(file, '/');
      router.refresh();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <section
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface py-10 transition-colors hover:border-primary hover:bg-primary-light"
        role="button"
        tabIndex={0}
        aria-label="Upload documents"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          void handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <svg
          className="mb-3 h-10 w-10 text-muted-light"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm font-medium text-foreground">
          <span className="text-primary">Drop files</span> or click to browse
        </p>
        <p className="mt-1 text-xs text-muted-light">
          Supports PDF, Markdown, and TXT · Max 50 MB per file
        </p>
        {isUploading && <p className="mt-2 text-xs text-primary">Uploading...</p>}
        {error && <p className="mt-2 text-xs text-accent-red">{error}</p>}
      </section>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.md,.txt,text/plain,text/markdown,application/pdf"
        onChange={(e) => {
          void handleFile(e.target.files?.[0] ?? null);
        }}
      />
    </>
  );
}
