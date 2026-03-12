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
        <p className="px-2 py-3 text-xs text-muted-light">No chat history yet.</p>
      </nav>
    </aside>
  );
}
