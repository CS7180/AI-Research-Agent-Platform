import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LoginCard from './LoginCard';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: jest.fn(),
}));

const mockedGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.Mock;

describe('LoginCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts Google OAuth with expected redirect URL', async () => {
    const user = userEvent.setup();
    const signInWithOAuth = jest.fn().mockResolvedValue({ error: null });
    mockedGetSupabaseBrowserClient.mockReturnValue({ auth: { signInWithOAuth } });

    render(<LoginCard />);
    await user.click(screen.getByRole('button', { name: 'Sign in with Google' }));

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  });

  it('resets loading state when OAuth returns an error', async () => {
    const user = userEvent.setup();
    const signInWithOAuth = jest.fn().mockResolvedValue({
      error: { message: 'oauth failed' },
    });
    mockedGetSupabaseBrowserClient.mockReturnValue({ auth: { signInWithOAuth } });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<LoginCard />);
    await user.click(screen.getByRole('button', { name: 'Sign in with Google' }));

    expect(signInWithOAuth).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Continue with Google')).toBeInTheDocument();

    errorSpy.mockRestore();
  });
});
