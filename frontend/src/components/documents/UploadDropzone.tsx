'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadDocumentClient } from '@/backend/client';

export default function UploadDropzone() {
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
      setError('Upload failed.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <div className="px-3 pb-3">
        <div
          className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border py-4 transition-colors hover:border-primary hover:bg-primary-light"
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
          <p className="text-xs text-muted">
            <span className="font-medium text-primary">Drop files</span> or click to upload
            {isUploading && ' · uploading...'}
          </p>
        </div>
        {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
      </div>

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
