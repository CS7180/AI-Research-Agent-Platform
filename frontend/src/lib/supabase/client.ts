/**
 * Supabase browser client singleton.
 *
 * Uses `@supabase/ssr` createBrowserClient for cookie-based session
 * management in Client Components (marked with 'use client').
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return client;
}
