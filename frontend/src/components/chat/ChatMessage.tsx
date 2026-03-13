import Avatar from '@/components/ui/Avatar';

interface ChatMessageProps {
  variant: 'user' | 'assistant';
  children: React.ReactNode;
}

export default function ChatMessage({ variant, children }: ChatMessageProps) {
  if (variant === 'user') {
    return (
      <div className="flex items-start justify-end gap-2">
        <div className="max-w-md rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-white">
          {children}
        </div>
        <Avatar initials="JD" color="#6366f1" size="sm" />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar initials="D" color="#ef4444" size="sm" />
      <div className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}
