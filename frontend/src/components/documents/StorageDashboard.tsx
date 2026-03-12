import type { Document } from '@/backend/types';

const STORAGE_LIMIT_MB = 500;

const MIME_LABELS: Record<string, { label: string; color: string }> = {
  'application/pdf': { label: 'PDF', color: 'bg-accent-red text-white' },
  'text/markdown': { label: 'MD', color: 'bg-accent-blue text-white' },
  'text/plain': { label: 'TXT', color: 'bg-muted-light text-white' },
};

function computeStatsFromDocuments(docs: Document[]) {
  const totalBytes = docs.reduce((sum, d) => sum + d.file_size_bytes, 0);
  const usedMB = totalBytes / 1_000_000;

  const counts: Record<string, number> = {};
  for (const doc of docs) {
    counts[doc.mime_type] = (counts[doc.mime_type] ?? 0) + 1;
  }

  return { usedMB, counts };
}

interface StorageDashboardProps {
  documents: Document[];
}

export default function StorageDashboard({ documents }: StorageDashboardProps) {
  const { usedMB, counts } = computeStatsFromDocuments(documents);
  const pct = Math.min((usedMB / STORAGE_LIMIT_MB) * 100, 100);

  return (
    <section
      className="rounded-xl border border-border bg-surface p-5"
      aria-label="Storage dashboard"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Storage</h2>
        <span className="text-xs text-muted">
          {usedMB.toFixed(1)} MB / {STORAGE_LIMIT_MB} MB
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border-light">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(usedMB)}
          aria-valuemin={0}
          aria-valuemax={STORAGE_LIMIT_MB}
          aria-label="Storage used"
        />
      </div>

      {/* Format breakdown */}
      <div className="mt-3 flex gap-3">
        {Object.entries(counts).map(([mime, count]) => {
          const meta = MIME_LABELS[mime] ?? { label: mime, color: 'bg-muted text-white' };
          return (
            <span key={mime} className="flex items-center gap-1.5 text-xs text-muted">
              <span
                className={`inline-flex h-4 w-7 items-center justify-center rounded text-[8px] font-bold ${meta.color}`}
              >
                {meta.label}
              </span>
              {count} {count === 1 ? 'doc' : 'docs'}
            </span>
          );
        })}
      </div>
    </section>
  );
}
