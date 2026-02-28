import type { ChatSession } from '@/types/chat';

const SESSIONS: ChatSession[] = [
    { id: '1', title: 'What is 2PC?', timestamp: 'Just now', isActive: true },
    { id: '2', title: 'Paxos vs Raft comparison', timestamp: 'Yesterday', isActive: false },
    { id: '3', title: 'RAG chunking strategies', timestamp: 'Feb 22', isActive: false },
    { id: '4', title: 'LangGraph agent design', timestamp: 'Feb 20', isActive: false },
    { id: '5', title: 'BM25 hybrid search', timestamp: 'Feb 18', isActive: false },
];

export default function ChatSidebar() {
    return (
        <aside className="flex w-[260px] shrink-0 flex-col rounded-[18px] bg-surface-card shadow-[0_2px_12px_rgba(0,0,0,0.06),0_0.5px_2px_rgba(0,0,0,0.04)]">
            {/* ── Header ── */}
            <header className="px-5 pt-8 pb-2">
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">Chats</h2>
                <p className="mt-1 text-[12.5px] text-text-tertiary">Your conversations</p>
            </header>

            {/* ── New Chat Button ── */}
            <div className="px-3">
                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-surface py-2 text-[13px] font-medium text-text-secondary"
                    aria-label="Start a new chat"
                >
                    <span className="text-base font-light text-text-quaternary">+</span>
                    New Chat
                </button>
            </div>

            {/* ── Session List ── */}
            <ul className="mt-3 flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4" role="list">
                {SESSIONS.map((session) => (
                    <li key={session.id} role="listitem">
                        <button
                            type="button"
                            className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left ${session.isActive
                                    ? 'bg-primary'
                                    : 'hover:bg-surface'
                                }`}
                            aria-current={session.isActive ? 'true' : undefined}
                        >
                            {/* Icon circle */}
                            <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${session.isActive
                                        ? 'bg-active-session-icon text-white/90'
                                        : 'bg-surface text-text-tertiary'
                                    }`}
                                aria-hidden="true"
                            >
                                💬
                            </span>

                            {/* Text */}
                            <span className="flex min-w-0 flex-col">
                                <span
                                    className={`truncate text-[13px] font-medium ${session.isActive ? 'text-white' : 'text-text-primary'
                                        }`}
                                >
                                    {session.title}
                                </span>
                                <span
                                    className={`text-[11px] ${session.isActive ? 'text-active-session-sub' : 'text-text-quaternary'
                                        }`}
                                >
                                    {session.timestamp}
                                </span>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
