import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import KnowledgeSidebar from './KnowledgeSidebar';

jest.mock('@/components/documents/UploadDropzone', () => ({
  __esModule: true,
  default: () => <div data-testid="upload-dropzone">Upload Dropzone</div>,
}));

const documents = [
  {
    id: '1',
    user_id: 'u1',
    filename: 'Lecture-1.pdf',
    file_size_bytes: 1_200_000,
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
    file_size_bytes: 44_000,
    mime_type: 'text/markdown',
    folder_path: '/',
    file_hash: null,
    is_starred: false,
    summary: null,
    status: 'PROCESSING',
    created_at: '2026-03-11T10:00:00Z',
    updated_at: '2026-03-11T10:00:00Z',
    error_message: null,
  },
] as const;

describe('KnowledgeSidebar', () => {
  it('shows total file count and file names', () => {
    render(<KnowledgeSidebar documents={[...documents]} />);

    expect(screen.getByText('2 files')).toBeInTheDocument();
    expect(screen.getByText('Lecture-1.pdf')).toBeInTheDocument();
    expect(screen.getByText('notes.md')).toBeInTheDocument();
    expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument();
  });

  it('filters documents by search query', async () => {
    const user = userEvent.setup();
    render(<KnowledgeSidebar documents={[...documents]} />);

    await user.type(screen.getByRole('searchbox', { name: 'Search knowledge base' }), 'lecture');

    expect(screen.getByText('Lecture-1.pdf')).toBeInTheDocument();
    expect(screen.queryByText('notes.md')).not.toBeInTheDocument();
  });

  it('shows empty search result message', async () => {
    const user = userEvent.setup();
    render(<KnowledgeSidebar documents={[...documents]} />);

    await user.type(screen.getByRole('searchbox', { name: 'Search knowledge base' }), 'missing');

    expect(screen.getByText(/No files matching/i)).toBeInTheDocument();
  });
});
