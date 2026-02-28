'use client';

export default function ChatArea() {
    return (
        <section className="flex min-w-0 flex-1 flex-col rounded-[18px] bg-surface-card shadow-[0_2px_12px_rgba(0,0,0,0.06),0_0.5px_2px_rgba(0,0,0,0.04)]">
            {/* ── Chat Header ── */}
            <header className="px-6 pt-8 pb-4">
                <h1 className="text-xl font-semibold tracking-tight text-text-primary">
                    What is 2PC?
                </h1>
                <p className="mt-1 text-[12.5px] text-text-tertiary">
                    Based on your distributed systems notes
                </p>
                <hr className="mt-4 border-border-light" />
            </header>

            {/* ── Messages ── */}
            <div
                className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-4"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
            >
                {/* ── User Message ── */}
                <div className="flex items-start justify-end gap-3">
                    <div className="rounded-[20px] bg-primary px-5 py-2.5">
                        <p className="text-[15px] text-white">What is Two-Phase Commit?</p>
                    </div>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-human-avatar-start to-human-avatar-end">
                        <span className="text-[10px] font-semibold text-text-tertiary">JD</span>
                    </div>
                </div>

                {/* ── AI Response ── */}
                <article className="flex items-start gap-3">
                    {/* AI Avatar */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-gradient-end">
                        <span className="text-[10px] font-bold text-white">D</span>
                    </div>

                    {/* Response body */}
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                        {/* Prose */}
                        <div className="text-[14.5px] leading-[22px] tracking-tight text-text-secondary">
                            <p>
                                Two-Phase Commit (2PC) is a distributed protocol that ensures all nodes
                                either <strong className="font-semibold text-text-primary">commit</strong> or{' '}
                                <strong className="font-semibold text-text-primary">abort</strong> a transaction
                                together. From your{' '}
                                <span className="font-medium text-primary">Lecture 11</span> slides:
                            </p>

                            <p className="mt-4">
                                <strong className="font-semibold text-text-primary">Phase 1</strong> — the
                                coordinator sends{' '}
                                <code className="rounded border border-border-light bg-surface px-1.5 py-0.5 font-mono text-xs text-text-secondary">
                                    PREPARE
                                </code>{' '}
                                and each participant votes YES or NO.
                            </p>

                            <p className="mt-4">
                                <strong className="font-semibold text-text-primary">Phase 2</strong> — if all
                                voted YES, broadcast{' '}
                                <code className="rounded border border-border-light bg-surface px-1.5 py-0.5 font-mono text-xs text-text-secondary">
                                    COMMIT
                                </code>
                                ; otherwise{' '}
                                <code className="rounded border border-border-light bg-surface px-1.5 py-0.5 font-mono text-xs text-text-secondary">
                                    ABORT
                                </code>
                                .
                            </p>

                            <p className="mt-4">
                                The key trade-off: 2PC guarantees atomicity but can{' '}
                                <em>block</em> if the coordinator fails mid-protocol.
                            </p>
                        </div>

                        {/* ── Sources Card ── */}
                        <div className="overflow-hidden rounded-xl border border-border-medium">
                            {/* Sources header */}
                            <div className="border-b border-border-light bg-surface px-5 py-2">
                                <span className="text-[10.5px] font-semibold tracking-wider text-text-quaternary">
                                    SOURCES
                                </span>
                            </div>

                            {/* Source 1 */}
                            <div className="flex items-center gap-3 px-5 py-2.5">
                                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-badge-pdf-bg">
                                    <span className="text-[8.5px] font-bold text-badge-pdf">PDF</span>
                                </span>
                                <span className="truncate text-xs font-[450] text-text-secondary">
                                    CS6650_Lecture11_2PC.pdf
                                </span>
                                <span className="ml-auto shrink-0 rounded bg-surface px-2 py-0.5 font-mono text-[9.5px] text-text-quaternary">
                                    slides 28-35
                                </span>
                            </div>

                            <hr className="mx-5 border-border-light" />

                            {/* Source 2 */}
                            <div className="flex items-center gap-3 px-5 py-2.5">
                                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-badge-md-bg">
                                    <span className="text-[8.5px] font-bold text-badge-md">MD</span>
                                </span>
                                <span className="truncate text-xs font-[450] text-text-secondary">
                                    distributed_systems_notes.md
                                </span>
                                <span className="ml-auto shrink-0 rounded bg-surface px-2 py-0.5 font-mono text-[9.5px] text-text-quaternary">
                                    chunk 5
                                </span>
                            </div>
                        </div>

                        {/* ── Retrieval meta ── */}
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-source-kb-bg px-2.5 py-1 text-[10px] font-medium text-primary">
                                Knowledge Base
                            </span>
                            <span className="text-[11px] text-text-quaternary">2 docs · 1.2s</span>
                        </div>
                    </div>
                </article>
            </div>

            {/* ── Input Bar ── */}
            <div className="px-6 pb-3">
                <form
                    className="flex items-center gap-2 rounded-full bg-surface px-5 py-2.5"
                    onSubmit={(e) => e.preventDefault()}
                    aria-label="Chat input"
                >
                    <label htmlFor="chat-input" className="sr-only">
                        Ask a follow-up
                    </label>
                    <input
                        id="chat-input"
                        type="text"
                        placeholder="Ask a follow-up..."
                        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none"
                    />

                    {/* Attach */}
                    <button type="button" aria-label="Attach file" className="text-[15px] text-text-quaternary">
                        📎
                    </button>

                    {/* Camera */}
                    <button type="button" aria-label="Attach image" className="text-[15px] text-text-quaternary">
                        📷
                    </button>

                    {/* Send */}
                    <button
                        type="submit"
                        aria-label="Send message"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-base font-semibold text-white"
                    >
                        ↑
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-2 text-center text-[10.5px] text-text-placeholder">
                    Gemini 2.5 Flash · 8 documents · 523 chunks
                </p>
            </div>
        </section>
    );
}
