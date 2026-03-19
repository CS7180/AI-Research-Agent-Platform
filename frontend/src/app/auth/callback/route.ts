/**
 * OAuth callback route handler.
 *
 * After the user signs in with Google, Supabase redirects here with an
 * authorization code in the URL query params. This route exchanges the
 * code for a session, which sets the auth cookies, then redirects the
 * user to the home page.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  // Use NextRequest's nextUrl which respects x-forwarded-host headers
  // from reverse proxies (e.g. Zeabur). Using `new URL(request.url)`
  // would return the container-internal origin (localhost:8080).
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  // Build the redirect base from the forwarded host header so it
  // works behind reverse proxies (Zeabur, Vercel, etc.)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : url.origin;

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
