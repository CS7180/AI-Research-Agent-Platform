/**
 * Supabase server-side client factory.
 *
 * Uses `@supabase/ssr` createServerClient with Next.js cookies() API
 * for reading/writing auth cookies in Server Components, Route Handlers,
 * and Server Actions.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll is called from Server Components where cookies
            // cannot be mutated. This is safe to ignore — the middleware
            // will refresh the session before the page renders.
          }
        },
      },
    },
  );
}
