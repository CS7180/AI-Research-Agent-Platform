/** Top navigation bar — logo, links, status pills, user avatar. */
export default function Navbar() {
    return (
        <nav
            className="fixed top-0 left-0 w-full h-11 z-50 flex items-center px-6 bg-nav-bg"
            aria-label="Main navigation"
        >
            {/* ── Logo ── */}
            <div className="flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
                    <span className="text-white text-sm font-bold leading-none">D</span>
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-nav-text">
                    DocMind
                </span>
            </div>

            {/* ── Nav links ── */}
            <div className="flex items-center gap-6 ml-10" role="menubar">
                <span className="text-xs font-medium text-nav-text" role="menuitem" tabIndex={0}>
                    Chat
                </span>
                <span className="text-xs text-nav-text-dim" role="menuitem" tabIndex={0}>
                    Documents
                </span>
                <span className="text-xs text-nav-text-dim" role="menuitem" tabIndex={0}>
                    Evaluation
                </span>
                <span className="text-xs text-nav-text-dim" role="menuitem" tabIndex={0}>
                    Settings
                </span>
            </div>

            {/* ── Spacer ── */}
            <div className="flex-1" />

            {/* ── Right-side indicators ── */}
            <div className="flex items-center gap-3">
                {/* Doc count pill */}
                <div className="h-[22px] px-3 rounded-full flex items-center gap-2 bg-white/10 border border-white/[0.08]">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-green" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-white/80">8 docs</span>
                </div>

                {/* Model badge */}
                <div className="h-[22px] px-3 rounded-full flex items-center bg-primary/15">
                    <span className="text-[11px] font-medium font-mono text-blue-accent">
                        gemini-2.5-flash
                    </span>
                </div>

                {/* User avatar */}
                <button
                    className="w-[26px] h-[26px] rounded-full flex items-center justify-center bg-white/15 border-none cursor-pointer"
                    aria-label="User menu"
                    type="button"
                >
                    <span className="text-[10px] font-semibold text-white/80">JD</span>
                </button>
            </div>
        </nav>
    );
}
