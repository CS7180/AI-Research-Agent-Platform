const sessions = [
    { id: 1, title: "What is 2PC?", time: "Just now", active: true },
    { id: 2, title: "Paxos vs Raft comparison", time: "Yesterday", active: false },
    { id: 3, title: "RAG chunking strategies", time: "Feb 22", active: false },
    { id: 4, title: "LangGraph agent design", time: "Feb 20", active: false },
    { id: 5, title: "BM25 hybrid search", time: "Feb 18", active: false },
];

export default function LeftSidebar() {
    return (
        <aside className="w-[260px] min-w-[260px] h-full rounded-[18px] bg-white card-shadow flex flex-col overflow-hidden">
            {/* ── Header ── */}
            <div className="pt-6 pb-2 px-5">
                <h2
                    className="text-[20px] font-semibold tracking-[-0.4px]"
                    style={{ color: "var(--text-primary)" }}
                >
                    Chats
                </h2>
                <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Your conversations
                </p>
            </div>

            {/* ── New Chat button ── */}
            <div className="px-3 pt-1 pb-2">
                <button
                    className="w-full h-[36px] rounded-[10px] flex items-center justify-center gap-1 cursor-pointer border-none"
                    style={{ background: "var(--bg-input)" }}
                >
                    <span className="text-base font-light" style={{ color: "var(--text-muted)" }}>
                        +
                    </span>
                    <span
                        className="text-[13px] font-medium"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        New Chat
                    </span>
                </button>
            </div>

            {/* ── Sessions ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4">
                {sessions.map((s) => (
                    <div
                        key={s.id}
                        className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 mb-1 cursor-pointer transition-colors duration-150"
                        style={{
                            background: s.active ? "var(--color-primary)" : "transparent",
                        }}
                    >
                        {/* Icon circle */}
                        <div
                            className="w-[28px] h-[28px] min-w-[28px] rounded-full flex items-center justify-center text-xs"
                            style={{
                                background: s.active ? "rgba(255,255,255,0.2)" : "var(--bg-input)",
                                color: s.active ? "rgba(255,255,255,0.9)" : "var(--text-tertiary)",
                            }}
                        >
                            💬
                        </div>

                        {/* Text */}
                        <div className="flex flex-col min-w-0">
                            <span
                                className="text-[13px] font-medium truncate"
                                style={{
                                    color: s.active ? "#FFFFFF" : "var(--text-primary)",
                                }}
                            >
                                {s.title}
                            </span>
                            <span
                                className="text-[11px]"
                                style={{
                                    color: s.active ? "rgba(255,255,255,0.65)" : "var(--text-muted)",
                                }}
                            >
                                {s.time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
