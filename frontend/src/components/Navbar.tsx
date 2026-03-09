import Avatar from '@/components/ui/Avatar';

export default function Navbar() {
  const navLinks = [
    { label: 'Chat', href: '/', isActive: true },
    { label: 'Documents', href: '/documents', isActive: false },
    { label: 'Evaluation', href: '/evaluation', isActive: false },
    { label: 'Settings', href: '/settings', isActive: false },
  ];

  return (
    <nav
      className="flex h-12 items-center justify-between bg-navbar px-4 text-white"
      aria-label="Main navigation"
    >
      {/* Left: logo + nav links */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold">
            D
          </div>
          <span className="text-sm font-semibold tracking-tight">DocMind</span>
        </div>

        <ul className="flex items-center gap-1" role="list">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  link.isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
                aria-current={link.isActive ? 'page' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: doc count, model, avatar */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
          8 docs
        </span>
        <span className="rounded-md bg-white/10 px-2 py-1 font-mono text-[11px] text-white/80">
          gemini-2.5-flash
        </span>
        <Avatar initials="JD" color="#6366f1" size="sm" />
      </div>
    </nav>
  );
}
