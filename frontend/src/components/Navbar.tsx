export default function Navbar() {
    return (
        <nav
            className="fixed top-0 left-0 w-full h-[44px] z-50 flex items-center px-6"
            style={{ background: "var(--nav-bg)" }}
        >
            {/* ── Logo ── */}
            <div className="flex items-center gap-2.5">
                <div
                    className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, #0071E3, #5E5CE6)",
                    }}
                >
                    <span className="text-white text-sm font-bold leading-none">D</span>
                </div>
                <span
                    className="text-[15px] font-semibold tracking-[-0.3px]"
                    style={{ color: "var(--nav-text)" }}
                >
                    DocMind
                </span>
            </div>

            {/* ── Nav Links ── */}
            <div className="flex items-center gap-6 ml-10">
                <span
                    className="text-xs font-medium"
                    style={{ color: "var(--nav-text)" }}
                >
                    Chat
                </span>
                <span className="text-xs" style={{ color: "var(--nav-text-dim)" }}>
                    Documents
                </span>
                <span className="text-xs" style={{ color: "var(--nav-text-dim)" }}>
                    Evaluation
                </span>
                <span className="text-xs" style={{ color: "var(--nav-text-dim)" }}>
                    Settings
                </span>
            </div>

            {/* ── Spacer ── */}
            <div className="flex-1" />

            {/* ── Right Side Indicators ── */}
            <div className="flex items-center gap-3">
                {/* Doc count */}
                <div
                    className="h-[22px] px-3 rounded-full flex items-center gap-2"
                    style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <span
                        className="w-[6px] h-[6px] rounded-full inline-block"
                        style={{ background: "var(--color-green)" }}
                    />
                    <span
                        className="text-[11px] font-medium"
                        style={{ color: "rgba(245,245,247,0.8)" }}
                    >
                        8 docs
                    </span>
                </div>

                {/* Model badge */}
                <div
                    className="h-[22px] px-3 rounded-full flex items-center"
                    style={{ background: "rgba(0,113,227,0.15)" }}
                >
                    <span
                        className="text-[11px] font-medium"
                        style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--color-blue-accent)",
                        }}
                    >
                        gemini-2.5-flash
                    </span>
                </div>

                {/* User avatar */}
                <div
                    className="w-[26px] h-[26px] rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                >
                    <span
                        className="text-[10px] font-semibold"
                        style={{ color: "rgba(245,245,247,0.8)" }}
                    >
                        JD
                    </span>
                </div>
            </div>
        </nav>
    );
}
