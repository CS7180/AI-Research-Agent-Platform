import { render, screen } from '@testing-library/react';

import StorageDashboard from './StorageDashboard';

const documents = [
  {
    id: '1',
    user_id: 'u1',
    filename: 'slides.pdf',
    file_size_bytes: 2_000_000,
    mime_type: 'application/pdf',
    folder_path: '/',
    file_hash: null,
    is_starred: false,
    summary: null,
    status: 'READY',
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
    error_message: null,
  },
  {
    id: '2',
    user_id: 'u1',
    filename: 'notes.md',
    file_size_bytes: 1_500_000,
    mime_type: 'text/markdown',
    folder_path: '/',
    file_hash: null,
    is_starred: false,
    summary: null,
    status: 'READY',
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
    error_message: null,
  },
] as const;

describe('StorageDashboard', () => {
  it('renders storage totals and progress', () => {
    render(<StorageDashboard documents={[...documents]} />);

    expect(screen.getByText('3.5 MB / 500 MB')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Storage used' })).toHaveAttribute(
      'aria-valuenow',
      '4',
    );
  });

  it('renders format breakdown counts', () => {
    render(<StorageDashboard documents={[...documents]} />);

    expect(screen.getAllByText('1 doc')).toHaveLength(2);
    expect(screen.getByText('MD')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });
});
