import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DocumentRow from './DocumentRow';

jest.mock('@/components/documents/ActionMenu', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onRename,
  }: {
    isOpen: boolean;
    onRename?: (newFilename: string) => void;
  }) =>
    isOpen ? (
      <div data-testid="action-menu">
        <button type="button" onClick={() => onRename?.('renamed.pdf')}>
          Mock Rename
        </button>
      </div>
    ) : null,
}));

const baseDoc = {
  id: 'doc-1',
  user_id: 'u1',
  filename: 'lecture.pdf',
  file_size_bytes: 1_500_000,
  mime_type: 'application/pdf',
  folder_path: '/',
  file_hash: null,
  is_starred: false,
  summary: null,
  status: 'READY',
  created_at: '2026-03-10T10:00:00Z',
  updated_at: '2026-03-10T10:00:00Z',
  error_message: null,
} as const;

describe('DocumentRow', () => {
  it('renders filename, size, date and status', () => {
    render(
      <table>
        <tbody>
          <DocumentRow doc={{ ...baseDoc }} onDelete={jest.fn()} />
        </tbody>
      </table>,
    );

    expect(screen.getByText('lecture.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.5 MB')).toBeInTheDocument();
    expect(screen.getByText('Mar 10, 2026')).toBeInTheDocument();
    expect(screen.getByLabelText('Status: READY')).toBeInTheDocument();
  });

  it('toggles star state and opens actions menu', async () => {
    const user = userEvent.setup();
    render(
      <table>
        <tbody>
          <DocumentRow doc={{ ...baseDoc }} onDelete={jest.fn()} />
        </tbody>
      </table>,
    );

    const starButton = screen.getByRole('button', { name: 'Star document' });
    await user.click(starButton);
    expect(screen.getByRole('button', { name: 'Unstar document' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: /actions for lecture.pdf/i }));
    expect(screen.getByTestId('action-menu')).toBeInTheDocument();
  });
});
