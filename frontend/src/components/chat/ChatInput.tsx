export default function ChatInput() {
  return (
    <div className="border-t border-border-light px-4 pb-3 pt-2">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5">
        <input
          type="text"
          placeholder="Ask a follow-up…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-light outline-none"
          aria-label="Chat message input"
          readOnly
        />
        {/* Paperclip icon */}
        <button
          type="button"
          className="text-muted-light transition-colors hover:text-muted"
          aria-label="Attach file"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
        </button>
        {/* Image icon */}
        <button
          type="button"
          className="text-muted-light transition-colors hover:text-muted"
          aria-label="Attach image"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        </button>
        {/* Send button */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover"
          aria-label="Send message"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
          </svg>
        </button>
      </div>
      <p className="mt-1.5 text-center text-[11px] text-muted-light">
        Gemini 2.5 Flash · 8 documents · 523 chunks
      </p>
    </div>
  );
}
