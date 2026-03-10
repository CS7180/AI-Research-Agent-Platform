interface ChatItemProps {
  title: string;
  date: string;
  isActive?: boolean;
}

export default function ChatItem({ title, date, isActive = false }: ChatItemProps) {
  return (
    <button
      type="button"
      className={`flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-foreground hover:bg-border-light'
      }`}
      aria-current={isActive ? 'true' : undefined}
    >
      <span className="truncate text-sm font-medium">{title}</span>
      <span
        className={`text-[11px] ${isActive ? 'text-white/70' : 'text-muted-light'}`}
      >
        {date}
      </span>
    </button>
  );
}
