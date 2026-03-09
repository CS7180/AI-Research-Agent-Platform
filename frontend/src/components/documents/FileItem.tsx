import StatusBadge from '@/components/ui/StatusBadge';

interface FileItemProps {
  name: string;
  type: 'pdf' | 'md' | 'txt';
  size: string;
  detail: string;
  status: 'ready' | 'processing' | 'pending' | 'failed';
}

const TYPE_COLORS: Record<FileItemProps['type'], string> = {
  pdf: 'bg-accent-red text-white',
  md: 'bg-accent-blue text-white',
  txt: 'bg-muted-light text-white',
};

export default function FileItem({ name, type, size, detail, status }: FileItemProps) {
  return (
    <li className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 overflow-hidden">
        <span
          className={`flex h-5 w-6 shrink-0 items-center justify-center rounded text-[8px] font-bold uppercase ${TYPE_COLORS[type]}`}
        >
          {type}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{name}</p>
          <p className="text-[10px] text-muted-light">
            {size} · {detail}
          </p>
        </div>
      </div>
      <StatusBadge status={status} />
    </li>
  );
}
