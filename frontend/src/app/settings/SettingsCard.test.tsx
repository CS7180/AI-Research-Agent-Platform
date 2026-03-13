import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SettingsCard from './SettingsCard';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockedGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

describe('SettingsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user profile information', () => {
    render(<SettingsCard displayName="Li Shanshou" email="li@example.com" initials="LS" />);

    expect(screen.getByText('Li Shanshou')).toBeInTheDocument();
    expect(screen.getByText('li@example.com')).toBeInTheDocument();
    expect(screen.getByText('LS')).toBeInTheDocument();
  });

  it('signs out and redirects to login', async () => {
    const user = userEvent.setup();
    const signOut = jest.fn().mockResolvedValue(undefined);
    const push = jest.fn();
    mockedGetSupabaseBrowserClient.mockReturnValue({ auth: { signOut } });
    mockedUseRouter.mockReturnValue({ push });

    render(<SettingsCard displayName="Li Shanshou" email="li@example.com" initials="LS" />);
    await user.click(screen.getByRole('button', { name: 'Sign out of DocMind' }));

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/login');
  });
});
