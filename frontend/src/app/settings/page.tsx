import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import SettingsCard from './SettingsCard';

export const metadata = {
  title: 'Settings — DocMind',
  description: 'Manage your DocMind account.',
};

/**
 * Settings page (Server Component).
 *
 * Fetches the authenticated user on the server and passes the profile
 * data to the client-side SettingsCard for rendering and sign-out action.
 */
export default async function SettingsPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const displayName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'DocMind User';

  const email = user.email ?? '';

  // Derive initials from the display name
  const initials = displayName
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen flex-col">
      <Navbar activePath="/settings" />
      <main className="flex flex-1 items-center justify-center bg-background px-4">
        <SettingsCard displayName={displayName} email={email} initials={initials} />
      </main>
    </div>
  );
}
