import type { ChatSession } from '@/types/chat';

const SESSIONS: ChatSession[] = [
    { id: 1, title: 'What is 2PC?', time: 'Just now', active: true },
    { id: 2, title: 'Paxos vs Raft comparison', time: 'Yesterday', active: false },
    { id: 3, title: 'RAG chunking strategies', time: 'Feb 22', active: false },
    { id: 4, title: 'LangGraph agent design', time: 'Feb 20', active: false },
    { id: 5, title: 'BM25 hybrid search', time: 'Feb 18', active: false },
];

/** Left sidebar — chat session list with "New Chat" button. */
export default function ChatSidebar() {
    return (
        <aside className="w-[260px] min-w-[260px] h-full rounded-[18px] bg-card-bg card-shadow flex flex-col overflow-hidden">
            {/* ── Header ── */}
            <header className="pt-6 pb-2 px-5">
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">Chats</h2>
                <p className="text-[12.5px] mt-0.5 text-text-tertiary">Your conversations</p>
            </header>

            {/* ── New Chat button ── */}
            <div className="px-3 pt-1 pb-2">
                <button
                    className="w-full h-9 rounded-[10px] flex items-center justify-center gap-1 cursor-pointer border-none bg-input-bg"
                    type="button"
                    aria-label="Start a new chat"
                >
                    <span className="text-base font-light text-text-muted">+</span>
                    <span className="text-[13px] font-medium text-text-secondary">New Chat</span>
                </button>
            </div>

            {/* ── Session list ── */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4" aria-label="Chat history">
                <ul className="list-none m-0 p-0">
                    {SESSIONS.map((session) => (
                        <li key={session.id}>
                            <button
                                type="button"
                                className={`w-full flex items-center gap-3 rounded-[10px] px-3 py-2.5 mb-1 cursor-pointer border-none text-left transition-colors duration-150 ${session.active ? 'bg-primary' : 'bg-transparent hover:bg-input-bg'
                                    }`}
                                aria-current={session.active ? 'page' : undefined}
                            >
                                {/* Icon */}
                                <span
                                    className={`w-7 h-7 min-w-7 rounded-full flex items-center justify-center text-xs ${session.active
                                            ? 'bg-white/20 text-white/90'
                                            : 'bg-input-bg text-text-tertiary'
                                        }`}
                                    aria-hidden="true"
                                >
                                    💬
                                </span>

                                {/* Text */}
                                <span className="flex flex-col min-w-0">
                                    <span
                                        className={`text-[13px] font-medium truncate ${session.active ? 'text-white' : 'text-text-primary'
                                            }`}
                                    >
                                        {session.title}
                                    </span>
                                    <span
                                        className={`text-[11px] ${session.active ? 'text-white/65' : 'text-text-muted'
                                            }`}
                                    >
                                        {session.time}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
