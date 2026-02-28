export default function ChatArea() {
    return (
        <section className="flex-1 min-w-0 h-full rounded-[18px] bg-white card-shadow flex flex-col overflow-hidden">
            {/* ══════ Chat header ══════ */}
            <div className="pt-6 pb-3 px-6" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <h2
                    className="text-[20px] font-semibold tracking-[-0.4px]"
                    style={{ color: "var(--text-primary)" }}
                >
                    What is 2PC?
                </h2>
                <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    Based on your distributed systems notes
                </p>
            </div>

            {/* ══════ Messages area ══════ */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 flex flex-col gap-5">
                {/* ── User message ── */}
                <div className="flex items-center justify-end gap-3">
                    <div
                        className="px-5 py-2.5 rounded-[20px] text-[15px] text-white max-w-[80%]"
                        style={{ background: "var(--color-primary)" }}
                    >
                        What is Two-Phase Commit?
                    </div>
                    <div
                        className="w-[28px] h-[28px] min-w-[28px] rounded-full flex items-center justify-center"
                        style={{
                            background: "linear-gradient(135deg, #E8E8ED, #D1D1D6)",
                        }}
                    >
                        <span
                            className="text-[10px] font-semibold"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            JD
                        </span>
                    </div>
                </div>

                {/* ── AI response ── */}
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                        className="w-[28px] h-[28px] min-w-[28px] rounded-full flex items-center justify-center mt-0.5"
                        style={{
                            background: "linear-gradient(135deg, #0071E3, #5E5CE6)",
                        }}
                    >
                        <span className="text-[10px] font-bold text-white">D</span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-4 text-[14.5px] tracking-[-0.2px] leading-[22px] max-w-[90%]"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {/* Intro */}
                        <p className="m-0">
                            Two-Phase Commit (2PC) is a distributed protocol that ensures all
                            nodes either{" "}
                            <strong style={{ color: "var(--text-primary)" }}>commit</strong> or{" "}
                            <strong style={{ color: "var(--text-primary)" }}>abort</strong> a
                            transaction together. From your{" "}
                            <span className="font-medium" style={{ color: "var(--color-primary)" }}>
                                Lecture 11
                            </span>{" "}
                            slides:
                        </p>

                        {/* Phase 1 */}
                        <p className="m-0">
                            <strong style={{ color: "var(--text-primary)" }}>Phase 1</strong> — the
                            coordinator sends{" "}
                            <code
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    background: "var(--bg-input)",
                                    border: "1px solid var(--border-light)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                PREPARE
                            </code>{" "}
                            and each participant votes YES or NO.
                        </p>

                        {/* Phase 2 */}
                        <p className="m-0">
                            <strong style={{ color: "var(--text-primary)" }}>Phase 2</strong> — if all
                            voted YES, broadcast{" "}
                            <code
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    background: "var(--bg-input)",
                                    border: "1px solid var(--border-light)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                COMMIT
                            </code>{" "}
                            ; otherwise{" "}
                            <code
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    background: "var(--bg-input)",
                                    border: "1px solid var(--border-light)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                ABORT
                            </code>{" "}
                            .
                        </p>

                        {/* Trade-off */}
                        <p className="m-0">
                            The key trade-off: 2PC guarantees atomicity but can{" "}
                            <em>block</em> if the coordinator fails mid-protocol.
                        </p>

                        {/* ── Sources Card ── */}
                        <div
                            className="rounded-xl overflow-hidden"
                            style={{
                                border: "1px solid var(--border-medium)",
                            }}
                        >
                            {/* Sources header */}
                            <div
                                className="px-5 py-2"
                                style={{
                                    background: "var(--bg-input)",
                                    borderBottom: "1px solid var(--border-light)",
                                }}
                            >
                                <span
                                    className="text-[10.5px] font-semibold tracking-[0.3px]"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    SOURCES
                                </span>
                            </div>

                            {/* Source 1 */}
                            <div className="flex items-center gap-3 px-5 py-2.5"
                                style={{ borderBottom: "1px solid var(--border-light)" }}
                            >
                                <div
                                    className="w-[22px] h-[22px] min-w-[22px] rounded-[5px] flex items-center justify-center"
                                    style={{ background: "rgba(255,59,48,0.08)" }}
                                >
                                    <span className="text-[8.5px] font-bold" style={{ color: "var(--color-red)" }}>
                                        PDF
                                    </span>
                                </div>
                                <span
                                    className="text-xs flex-1 truncate"
                                    style={{ color: "var(--text-secondary)", fontWeight: 450 }}
                                >
                                    CS6650_Lecture11_2PC.pdf
                                </span>
                                <span
                                    className="text-[9.5px] px-2 py-0.5 rounded"
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        background: "var(--bg-input)",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    slides 28-35
                                </span>
                            </div>

                            {/* Source 2 */}
                            <div className="flex items-center gap-3 px-5 py-2.5">
                                <div
                                    className="w-[22px] h-[22px] min-w-[22px] rounded-[5px] flex items-center justify-center"
                                    style={{ background: "rgba(0,113,227,0.07)" }}
                                >
                                    <span className="text-[8.5px] font-bold" style={{ color: "var(--color-primary)" }}>
                                        MD
                                    </span>
                                </div>
                                <span
                                    className="text-xs flex-1 truncate"
                                    style={{ color: "var(--text-secondary)", fontWeight: 450 }}
                                >
                                    distributed_systems_notes.md
                                </span>
                                <span
                                    className="text-[9.5px] px-2 py-0.5 rounded"
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        background: "var(--bg-input)",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    chunk 5
                                </span>
                            </div>
                        </div>

                        {/* ── Retrieval meta badges ── */}
                        <div className="flex items-center gap-2">
                            <span
                                className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                                style={{
                                    background: "rgba(0,113,227,0.07)",
                                    color: "var(--color-primary)",
                                }}
                            >
                                Knowledge Base
                            </span>
                            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                                2 docs · 1.2s
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════ Input bar ══════ */}
            <div className="px-6 pb-4 pt-2">
                <div
                    className="h-[42px] rounded-full flex items-center px-5 gap-2"
                    style={{ background: "var(--bg-input)" }}
                >
                    <span
                        className="flex-1 text-sm"
                        style={{ color: "var(--text-placeholder)" }}
                    >
                        Ask a follow-up...
                    </span>
                    {/* Attach */}
                    <button className="text-[15px] cursor-pointer bg-transparent border-none p-0"
                        style={{ color: "var(--text-muted)" }}
                    >
                        📎
                    </button>
                    {/* Camera */}
                    <button className="text-[15px] cursor-pointer bg-transparent border-none p-0"
                        style={{ color: "var(--text-muted)" }}
                    >
                        📷
                    </button>
                    {/* Send */}
                    <button
                        className="w-[32px] h-[32px] rounded-full flex items-center justify-center cursor-pointer border-none text-base font-semibold text-white"
                        style={{ background: "var(--color-primary)" }}
                    >
                        ↑
                    </button>
                </div>

                {/* Footer text */}
                <p
                    className="text-center text-[10.5px] mt-2 mb-0"
                    style={{ color: "var(--text-placeholder)" }}
                >
                    Gemini 2.5 Flash · 8 documents · 523 chunks
                </p>
            </div>
        </section>
    );
}
