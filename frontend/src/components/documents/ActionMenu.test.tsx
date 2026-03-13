import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ActionMenu from './ActionMenu';
import { downloadDocumentClient, renameDocumentClient } from '@/backend/client';

jest.mock('@/backend/client', () => ({
  downloadDocumentClient: jest.fn(),
  renameDocumentClient: jest.fn(),
}));

const mockedDownloadDocumentClient = downloadDocumentClient as jest.Mock;
const mockedRenameDocumentClient = renameDocumentClient as jest.Mock;

describe('ActionMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls download handler for Download action', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    mockedDownloadDocumentClient.mockResolvedValue(undefined);

    render(
      <ActionMenu
        isOpen
        docId="doc-1"
        filename="lecture.pdf"
        onClose={onClose}
        onDelete={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /download/i }));

    await waitFor(() => {
      expect(mockedDownloadDocumentClient).toHaveBeenCalledWith('doc-1', 'lecture.pdf');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('opens rename modal and submits renamed filename with extension', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onRename = jest.fn();
    mockedRenameDocumentClient.mockResolvedValue(undefined);

    render(
      <ActionMenu
        isOpen
        docId="doc-1"
        filename="lecture.pdf"
        onClose={onClose}
        onDelete={jest.fn()}
        onRename={onRename}
      />,
    );

    await user.click(screen.getByRole('button', { name: /rename/i }));

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'lecture-updated');
    await user.click(screen.getByRole('button', { name: 'Rename' }));

    await waitFor(() => {
      expect(mockedRenameDocumentClient).toHaveBeenCalledWith('doc-1', 'lecture-updated.pdf');
      expect(onRename).toHaveBeenCalledWith('lecture-updated.pdf');
    });
  });

  it('calls onDelete with document id', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    render(
      <ActionMenu
        isOpen
        docId="doc-1"
        filename="lecture.pdf"
        onClose={jest.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith('doc-1');
  });
});
