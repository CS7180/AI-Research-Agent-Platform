import ChatItem from '@/components/chat/ChatItem';

const CHATS = [
  { title: 'What is 2PC?', date: 'Just now', isActive: true },
  { title: 'Paxos vs Raft comparison', date: 'Yesterday', isActive: false },
  { title: 'RAG chunking strategies', date: 'Feb 23', isActive: false },
  { title: 'LangGraph agent design', date: 'Feb 20', isActive: false },
  { title: 'BM25 hybrid search', date: 'Feb 18', isActive: false },
];

export default function ChatSidebar() {
  return (
    <aside
      className="flex h-full w-full flex-col rounded-xl border border-border bg-surface"
      aria-label="Chat history"
    >
      <div className="p-4 pb-2">
        <h2 className="text-base font-semibold text-foreground">Chats</h2>
        <p className="text-xs text-muted-light">Your conversations</p>
      </div>

      <div className="px-3 pb-2">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1 rounded-lg border border-border py-2 text-xs font-medium text-muted transition-colors hover:bg-border-light"
        >
          <span>+</span> New Chat
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        <ul className="space-y-0.5" role="list">
          {CHATS.map((chat) => (
            <li key={chat.title}>
              <ChatItem title={chat.title} date={chat.date} isActive={chat.isActive} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
