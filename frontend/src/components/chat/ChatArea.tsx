'use client';

/** Center chat panel — messages, AI response with sources, and input bar. */
export default function ChatArea() {
    return (
        <section
            className="flex-1 min-w-0 h-full rounded-[18px] bg-card-bg card-shadow flex flex-col overflow-hidden"
            aria-label="Chat conversation"
        >
            {/* ══════ Header ══════ */}
            <header className="pt-6 pb-3 px-6 border-b border-border-light">
                <h1 className="text-xl font-semibold tracking-tight text-text-primary">
                    What is 2PC?
                </h1>
                <p className="text-[12.5px] mt-0.5 text-text-tertiary">
                    Based on your distributed systems notes
                </p>
            </header>

            {/* ══════ Messages ══════ */}
            <div
                className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 flex flex-col gap-5"
                role="log"
                aria-live="polite"
            >
                {/* ── User message ── */}
                <div className="flex items-center justify-end gap-3">
                    <div className="px-5 py-2.5 rounded-[20px] text-[15px] text-white bg-primary max-w-[80%]">
                        What is Two-Phase Commit?
                    </div>
                    <div
                        className="w-7 h-7 min-w-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E8E8ED] to-[#D1D1D6]"
                        aria-hidden="true"
                    >
                        <span className="text-[10px] font-semibold text-text-tertiary">JD</span>
                    </div>
                </div>

                {/* ── AI response ── */}
                <article className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                        className="w-7 h-7 min-w-7 rounded-full flex items-center justify-center mt-0.5 bg-gradient-to-br from-primary to-primary-dark"
                        aria-hidden="true"
                    >
                        <span className="text-[10px] font-bold text-white">D</span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-4 text-[14.5px] tracking-tight leading-[22px] max-w-[90%] text-text-secondary">
                        {/* Intro */}
                        <p className="m-0">
                            Two-Phase Commit (2PC) is a distributed protocol that ensures all nodes
                            either <strong className="text-text-primary">commit</strong> or{' '}
                            <strong className="text-text-primary">abort</strong> a transaction
                            together. From your{' '}
                            <span className="font-medium text-primary">Lecture 11</span> slides:
                        </p>

                        {/* Phase 1 */}
                        <p className="m-0">
                            <strong className="text-text-primary">Phase 1</strong> — the coordinator
                            sends{' '}
                            <code className="text-xs px-2 py-0.5 rounded font-mono bg-input-bg border border-border-light text-text-secondary">
                                PREPARE
                            </code>{' '}
                            and each participant votes YES or NO.
                        </p>

                        {/* Phase 2 */}
                        <p className="m-0">
                            <strong className="text-text-primary">Phase 2</strong> — if all voted YES,
                            broadcast{' '}
                            <code className="text-xs px-2 py-0.5 rounded font-mono bg-input-bg border border-border-light text-text-secondary">
                                COMMIT
                            </code>{' '}
                            ; otherwise{' '}
                            <code className="text-xs px-2 py-0.5 rounded font-mono bg-input-bg border border-border-light text-text-secondary">
                                ABORT
                            </code>{' '}
                            .
                        </p>

                        {/* Trade-off */}
                        <p className="m-0">
                            The key trade-off: 2PC guarantees atomicity but can <em>block</em> if the
                            coordinator fails mid-protocol.
                        </p>

                        {/* ── Sources card ── */}
                        <div className="rounded-xl overflow-hidden border border-border-medium">
                            {/* Header */}
                            <div className="px-5 py-2 bg-input-bg border-b border-border-light">
                                <span className="text-[10.5px] font-semibold tracking-wider text-text-muted">
                                    SOURCES
                                </span>
                            </div>

                            {/* Source 1 */}
                            <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border-light">
                                <span className="w-[22px] h-[22px] min-w-[22px] rounded-[5px] flex items-center justify-center bg-status-red/[0.08]">
                                    <span className="text-[8.5px] font-bold text-status-red">PDF</span>
                                </span>
                                <span className="text-xs flex-1 truncate font-[450] text-text-secondary">
                                    CS6650_Lecture11_2PC.pdf
                                </span>
                                <span className="text-[9.5px] px-2 py-0.5 rounded font-mono bg-input-bg text-text-muted">
                                    slides 28-35
                                </span>
                            </div>

                            {/* Source 2 */}
                            <div className="flex items-center gap-3 px-5 py-2.5">
                                <span className="w-[22px] h-[22px] min-w-[22px] rounded-[5px] flex items-center justify-center bg-primary/[0.07]">
                                    <span className="text-[8.5px] font-bold text-primary">MD</span>
                                </span>
                                <span className="text-xs flex-1 truncate font-[450] text-text-secondary">
                                    distributed_systems_notes.md
                                </span>
                                <span className="text-[9.5px] px-2 py-0.5 rounded font-mono bg-input-bg text-text-muted">
                                    chunk 5
                                </span>
                            </div>
                        </div>

                        {/* ── Retrieval meta badges ── */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-primary/[0.07] text-primary">
                                Knowledge Base
                            </span>
                            <span className="text-[11px] text-text-muted">2 docs · 1.2s</span>
                        </div>
                    </div>
                </article>
            </div>

            {/* ══════ Input bar ══════ */}
            <div className="px-6 pb-4 pt-2">
                <form
                    className="h-[42px] rounded-full flex items-center px-5 gap-2 bg-input-bg"
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
                        className="flex-1 text-sm bg-transparent border-none outline-none text-text-primary placeholder:text-text-placeholder"
                    />
                    {/* Attach */}
                    <button
                        type="button"
                        className="text-[15px] cursor-pointer bg-transparent border-none p-0 text-text-muted"
                        aria-label="Attach file"
                    >
                        📎
                    </button>
                    {/* Camera */}
                    <button
                        type="button"
                        className="text-[15px] cursor-pointer bg-transparent border-none p-0 text-text-muted"
                        aria-label="Upload image"
                    >
                        📷
                    </button>
                    {/* Send */}
                    <button
                        type="submit"
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none text-base font-semibold text-white bg-primary"
                        aria-label="Send message"
                    >
                        ↑
                    </button>
                </form>

                {/* Footer text */}
                <p className="text-center text-[10.5px] mt-2 mb-0 text-text-placeholder">
                    Gemini 2.5 Flash · 8 documents · 523 chunks
                </p>
            </div>
        </section>
    );
}
