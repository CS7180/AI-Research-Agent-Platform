'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { clearKnowledgeBaseClient } from '@/backend/client';

export default function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClear = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await clearKnowledgeBaseClient();
      setShowConfirm(false);
      // Refresh the page to reload documents
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Failed to clear knowledge base:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="rounded-xl border border-accent-red/30 bg-accent-red-bg p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Danger Zone</h3>
            <p className="mt-0.5 text-xs text-muted">
              Permanently delete all documents and chat history.
            </p>
            {error && <p className="mt-2 text-xs text-accent-red">{error}</p>}
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isLoading}
            className="rounded-lg border border-accent-red/40 px-4 py-2 text-xs font-medium text-accent-red transition-colors hover:bg-accent-red hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Clearing...' : 'Clear Knowledge Base'}
          </button>
        </div>
      </section>

      <ConfirmModal
        isOpen={showConfirm}
        title="Clear entire Knowledge Base?"
        message="This will permanently delete ALL documents and chat history for your account. This action cannot be undone."
        confirmLabel={isLoading ? 'Clearing...' : 'Yes, delete everything'}
        variant="danger"
        onConfirm={handleClear}
        onCancel={() => !isLoading && setShowConfirm(false)}
      />
    </>
  );
}
