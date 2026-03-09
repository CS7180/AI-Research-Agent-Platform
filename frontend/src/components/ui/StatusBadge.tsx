type BadgeStatus = 'ready' | 'processing' | 'pending' | 'failed';

interface StatusBadgeProps {
  status: BadgeStatus;
}

const STATUS_STYLES: Record<BadgeStatus, string> = {
  ready: 'bg-accent-green-bg text-accent-green',
  processing: 'bg-accent-blue-bg text-accent-blue',
  pending: 'bg-accent-yellow-bg text-accent-yellow',
  failed: 'bg-accent-red-bg text-accent-red',
};

const STATUS_LABELS: Record<BadgeStatus, string> = {
  ready: 'READY',
  processing: 'PROCESSING',
  pending: 'PENDING',
  failed: 'FAILED',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${STATUS_STYLES[status]}`}
      aria-label={`Status: ${STATUS_LABELS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
