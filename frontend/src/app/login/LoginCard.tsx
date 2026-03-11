'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Google OAuth login card.
 *
 * Displays the DocMind branding and a single "Continue with Google" button
 * that triggers the Supabase OAuth flow with redirect.
 */
export default function LoginCard() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('OAuth error:', error.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-lg">
      {/* Branding */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0071E3] to-[#5E5CE6] text-lg font-bold text-white">
          D
        </div>
        <h1 className="text-xl font-semibold text-foreground">Welcome to DocMind</h1>
        <p className="text-center text-sm text-muted">
          Sign in to access your AI-powered research knowledge base.
        </p>
      </div>

      {/* Google sign-in button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Sign in with Google"
      >
        {/* Google "G" icon */}
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            d="M17.64 9.2a10.3 10.3 0 0 0-.164-1.84H9v3.48h4.844a4.14 4.14 0 0 1-1.796 2.716v2.264h2.908c1.702-1.567 2.684-3.874 2.684-6.62Z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.264c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.338A8.997 8.997 0 0 0 9 18Z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.705a5.41 5.41 0 0 1 0-3.41V4.957H.957a8.997 8.997 0 0 0 0 8.086l3.007-2.338Z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58a4.862 4.862 0 0 1 3.44 1.346l2.581-2.58A8.653 8.653 0 0 0 9 0 8.997 8.997 0 0 0 .957 4.957L3.964 7.3C4.672 5.17 6.656 3.58 9 3.58Z"
            fill="#EA4335"
          />
        </svg>
        {loading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <p className="mt-6 text-center text-xs text-muted-light">
        By signing in you agree to our Terms of Service.
      </p>
    </div>
  );
}
