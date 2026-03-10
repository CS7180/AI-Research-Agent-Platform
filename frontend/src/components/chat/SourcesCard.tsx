interface Source {
  name: string;
  type: 'pdf' | 'md' | 'txt';
  detail: string;
}

interface SourcesCardProps {
  sources: Source[];
  label?: string;
}

const TYPE_COLORS: Record<Source['type'], string> = {
  pdf: 'bg-accent-red text-white',
  md: 'bg-accent-blue text-white',
  txt: 'bg-muted-light text-white',
};

export default function SourcesCard({ sources, label = 'Knowledge Base' }: SourcesCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h4 className="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">
        Sources
      </h4>
      <ul className="space-y-2" role="list">
        {sources.map((source) => (
          <li key={source.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-7 items-center justify-center rounded text-[9px] font-bold uppercase ${TYPE_COLORS[source.type]}`}
              >
                {source.type}
              </span>
              <span className="text-sm text-foreground">{source.name}</span>
            </div>
            <span className="rounded-full bg-border-light px-2 py-0.5 text-[10px] text-muted">
              {source.detail}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2 border-t border-border-light pt-3">
        <span className="rounded-md bg-accent-green-bg px-2 py-0.5 text-[10px] font-semibold text-accent-green">
          {label}
        </span>
        <span className="text-[11px] text-muted">
          {sources.length} docs · 12s
        </span>
      </div>
    </div>
  );
}
