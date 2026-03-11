'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/components/auth/useAuth';

const NAV_LINKS = [
  { label: 'Chat', href: '/' },
  { label: 'Documents', href: '/documents' },
  { label: 'Evaluation', href: '/evaluation' },
  { label: 'Settings', href: '/settings' },
];

/** Derive initials from an email address: "jane.doe@gmail.com" → "JD" */
function getInitials(email: string): string {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[.\-_]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.email ? getInitials(user.email) : '??';

  return (
    <nav
      className="flex h-12 items-center justify-between bg-navbar px-4 text-white"
      aria-label="Main navigation"
    >
      {/* Left: logo + nav links */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold">
            D
          </div>
          <span className="text-sm font-semibold tracking-tight">DocMind</span>
        </Link>

        <ul className="flex items-center gap-1" role="list">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === pathname;
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white'
                    }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right: doc count, model, avatar + sign-out */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
          8 docs
        </span>
        <span className="rounded-md bg-white/10 px-2 py-1 font-mono text-[11px] text-white/80">
          gemini-2.5-flash
        </span>

        {/* Avatar with sign-out dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full outline-none ring-white/30 transition-shadow focus-visible:ring-2"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            <Avatar initials={initials} color="#6366f1" size="sm" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-xl border border-white/10 bg-navbar p-1 shadow-xl">
              <div className="border-b border-white/10 px-3 py-2">
                <p className="truncate text-xs font-medium text-white">
                  {user?.email ?? 'Unknown'}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  await signOut();
                }}
                className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
