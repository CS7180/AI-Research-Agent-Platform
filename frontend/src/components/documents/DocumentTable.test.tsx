import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DocumentTable from './DocumentTable';
import { deleteDocumentClient, listDocumentsClient } from '@/backend/client';

jest.mock('@/backend/client', () => ({
  deleteDocumentClient: jest.fn(),
  listDocumentsClient: jest.fn(),
}));

jest.mock('@/components/documents/DocumentRow', () => ({
  __esModule: true,
  default: ({
    doc,
    onDelete,
  }: {
    doc: { id: string; filename: string };
    onDelete: (id: string) => void;
  }) => (
    <tr>
      <td>{doc.filename}</td>
      <td>
        <button type="button" onClick={() => onDelete(doc.id)}>
          Delete {doc.id}
        </button>
      </td>
    </tr>
  ),
}));

const mockedDeleteDocumentClient = deleteDocumentClient as jest.Mock;
const mockedListDocumentsClient = listDocumentsClient as jest.Mock;

const initialDocuments = [
  {
    id: 'doc-1',
    user_id: 'u1',
    filename: 'lecture.pdf',
    file_size_bytes: 1000,
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
] as const;

describe('DocumentTable', () => {
  let intervalCallback: (() => void | Promise<void>) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(global, 'setInterval')
      .mockImplementation(((cb: TimerHandler) => {
        intervalCallback = cb as () => void | Promise<void>;
        return 1 as unknown as ReturnType<typeof setInterval>;
      }) as typeof setInterval);
    jest.spyOn(global, 'clearInterval').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders empty state when no documents', () => {
    render(<DocumentTable initialDocuments={[]} />);

    expect(screen.getByText('No documents yet.')).toBeInTheDocument();
  });

  it('refreshes documents from polling interval', async () => {
    mockedListDocumentsClient.mockResolvedValue([
      {
        ...initialDocuments[0],
        id: 'doc-2',
        filename: 'fresh.md',
      },
    ]);

    render(<DocumentTable initialDocuments={[...initialDocuments]} />);
    expect(screen.getByText('lecture.pdf')).toBeInTheDocument();

    await act(async () => {
      await intervalCallback?.();
    });

    await waitFor(() => {
      expect(screen.getByText('fresh.md')).toBeInTheDocument();
    });
  });

  it('deletes selected document on confirm', async () => {
    const user = userEvent.setup();
    mockedDeleteDocumentClient.mockResolvedValue(undefined);

    render(<DocumentTable initialDocuments={[...initialDocuments]} />);
    await user.click(screen.getByRole('button', { name: 'Delete doc-1' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(mockedDeleteDocumentClient).toHaveBeenCalledWith('doc-1');
      expect(screen.queryByText('lecture.pdf')).not.toBeInTheDocument();
    });
  });

  it('shows error message when delete fails', async () => {
    const user = userEvent.setup();
    mockedDeleteDocumentClient.mockRejectedValue(new Error('delete failed'));

    render(<DocumentTable initialDocuments={[...initialDocuments]} />);
    await user.click(screen.getByRole('button', { name: 'Delete doc-1' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Failed to delete document. Please try again.')).toBeInTheDocument();
  });
});
