import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import Avatar from '@/components/ui/Avatar';

interface NavbarProps {
  activePath?: string;
}

const NAV_LINKS = [
  { label: 'Chat', href: '/' },
  { label: 'Documents', href: '/documents' },
  { label: 'Evaluation', href: '/evaluation' },
  { label: 'Settings', href: '/settings' },
];

/**
 * Top navigation bar (Server Component).
 *
 * Fetches the authenticated user on the server to display their
 * initials in the avatar. Falls back to a generic "?" avatar when
 * the user is not authenticated.
 */
export default async function Navbar({ activePath = '/' }: NavbarProps) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Derive initials from user metadata or email
  let initials = '?';
  if (user) {
    const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? '';
    initials = name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    if (!initials) initials = '?';
  }

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
            const isActive = link.href === activePath;
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'
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

      {/* Right: doc count, model, avatar */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
          8 docs
        </span>
        <span className="rounded-md bg-white/10 px-2 py-1 font-mono text-[11px] text-white/80">
          gemini-2.5-flash
        </span>
        <Avatar initials={initials} color="#6366f1" size="sm" />
      </div>
    </nav>
  );
}
