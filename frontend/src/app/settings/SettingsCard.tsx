'use client';

import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface SettingsCardProps {
  displayName: string;
  email: string;
  initials: string;
}

/**
 * Account settings card with user profile and sign-out action.
 *
 * Receives server-fetched user data as props and handles the
 * client-side sign-out flow via the Supabase browser client.
 */
export default function SettingsCard({ displayName, email, initials }: SettingsCardProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-lg">
      {/* Header */}
      <h1 className="mb-1 text-lg font-semibold text-foreground">Account</h1>
      <p className="mb-8 text-sm text-muted">Manage your profile and session.</p>

      {/* Avatar + user info */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0071E3] to-[#5E5CE6] text-xl font-bold text-white">
          {initials}
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-foreground">{displayName}</p>
          <p className="text-sm text-muted">{email}</p>
        </div>
      </div>

      {/* Sign out */}
      <button
        type="button"
        onClick={handleSignOut}
        className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-accent-red hover:text-accent-red"
        aria-label="Sign out of DocMind"
      >
        Sign Out
      </button>
    </div>
  );
}
