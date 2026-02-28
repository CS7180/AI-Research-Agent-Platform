export default function Navbar() {
    return (
        <nav
            className="fixed top-0 left-0 z-50 flex h-[44px] w-full items-center justify-between bg-gradient-to-b from-nav-bg to-nav-bg-end px-6"
            aria-label="Main navigation"
        >
            {/* ── Left: Logo + Brand + Links ── */}
            <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-gradient-to-br from-primary to-primary-gradient-end">
                        <span className="text-sm font-bold text-white">D</span>
                    </div>
                    <span className="text-[15px] font-semibold tracking-tight text-text-nav">
                        DocMind
                    </span>
                </div>

                {/* Nav links */}
                <ul className="flex items-center gap-5" role="menubar">
                    <li role="none">
                        <a
                            href="/chat"
                            role="menuitem"
                            className="text-xs font-medium text-text-nav"
                            aria-current="page"
                        >
                            Chat
                        </a>
                    </li>
                    <li role="none">
                        <a href="/documents" role="menuitem" className="text-xs font-normal text-text-nav-muted">
                            Documents
                        </a>
                    </li>
                    <li role="none">
                        <a href="/evaluation" role="menuitem" className="text-xs font-normal text-text-nav-muted">
                            Evaluation
                        </a>
                    </li>
                    <li role="none">
                        <a href="/settings" role="menuitem" className="text-xs font-normal text-text-nav-muted">
                            Settings
                        </a>
                    </li>
                </ul>
            </div>

            {/* ── Right: Status + Model + Avatar ── */}
            <div className="flex items-center gap-3">
                {/* Status pill */}
                <div className="flex h-[22px] items-center gap-2 rounded-full border border-pill-border bg-pill-bg px-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-ready" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-text-nav-semi">8 docs</span>
                </div>

                {/* Model pill */}
                <div className="flex h-[22px] items-center rounded-full bg-pill-model-bg px-3.5">
                    <span className="font-mono text-[11px] font-medium text-pill-model-text">
                        gemini-2.5-flash
                    </span>
                </div>

                {/* User avatar */}
                <button
                    type="button"
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-avatar-nav-bg"
                    aria-label="User menu"
                >
                    <span className="text-[10px] font-semibold text-text-nav-semi">JD</span>
                </button>
            </div>
        </nav>
    );
}
