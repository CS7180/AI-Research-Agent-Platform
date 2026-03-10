'use client';

import { useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <section className="rounded-xl border border-accent-red/30 bg-accent-red-bg p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Danger Zone</h3>
            <p className="mt-0.5 text-xs text-muted">
              Permanently delete all documents and chat history.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="rounded-lg border border-accent-red/40 px-4 py-2 text-xs font-medium text-accent-red transition-colors hover:bg-accent-red hover:text-white"
          >
            Clear Knowledge Base
          </button>
        </div>
      </section>

      <ConfirmModal
        isOpen={showConfirm}
        title="Clear entire Knowledge Base?"
        message="This will permanently delete ALL documents and chat history for your account. This action cannot be undone."
        confirmLabel="Yes, delete everything"
        variant="danger"
        onConfirm={() => setShowConfirm(false)}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
