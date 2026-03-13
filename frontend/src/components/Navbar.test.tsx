import { render, screen } from '@testing-library/react';

import Navbar from './Navbar';
import { getSupabaseServerClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(),
}));

jest.mock('next/link', () => {
  return function MockLink({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

const mockedGetSupabaseServerClient = getSupabaseServerClient as jest.Mock;

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders active navigation link, docs count, and user initials', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              email: 'li@example.com',
              user_metadata: { full_name: 'Li Shanshou' },
            },
          },
        }),
      },
    });

    const ui = await Navbar({ activePath: '/documents', docsCount: 5 });
    render(ui);

    expect(screen.getByText('DocMind')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Documents' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText('5 docs')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Avatar for LS' })).toBeInTheDocument();
  });

  it('falls back to ? initials when no user', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: null,
          },
        }),
      },
    });

    const ui = await Navbar({});
    render(ui);

    expect(screen.getByRole('img', { name: 'Avatar for ?' })).toBeInTheDocument();
  });
});
